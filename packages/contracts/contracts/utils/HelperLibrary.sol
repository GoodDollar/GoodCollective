// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/swap-router-contracts/contracts/interfaces/IV3SwapRouter.sol";
import { ISuperToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import { CFAv1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

import "../GoodCollective/IGoodCollectiveSuperApp.sol";

// import "hardhat/console.sol";

library HelperLibrary {
    using SuperTokenV1Library for ISuperToken;
    using CFAv1Library for CFAv1Library.InitData;

    error ZERO_AMOUNT();
    error ZERO_ADDRESS();

    /**
     * @dev A struct containing information about a token swap
     * @param swapFrom The address of the token being swapped
     * @param amount The amount of tokens being swapped
     * @param minReturn The minimum amount of tokens to be received in the swap
     * @param timestamp The deadline for the swap to occur
     * @param path The path of tokens to take in a uniswap v3 multi-hop swap, encoded as bytes
     */
    struct SwapData {
        address swapFrom;
        uint256 amount;
        uint256 minReturn;
        uint256 deadline;
        bytes path;
    }

    function handleSwap(
        IV3SwapRouter swapRouter,
        SwapData memory _customData,
        address outTokenIfNoPath,
        address _sender
    ) external returns (uint256 amountOut) {
        return handleSwap(swapRouter, _customData, outTokenIfNoPath, _sender, _sender);
    }

    function handleSwap(
        IV3SwapRouter swapRouter,
        SwapData memory _customData,
        address outTokenIfNoPath,
        address _sender,
        address _recipient
    ) public returns (uint256 amountOut) {
        // Transfer the tokens from the sender to this contract
        TransferHelper.safeTransferFrom(_customData.swapFrom, _sender, address(this), _customData.amount);

        // Approve the router to spend the tokens
        TransferHelper.safeApprove(_customData.swapFrom, address(swapRouter), _customData.amount);

        if (_customData.path.length > 0) {
            // If a path is provided, execute a multi-hop swap
            IV3SwapRouter.ExactInputParams memory params = IV3SwapRouter.ExactInputParams({
                path: _customData.path,
                recipient: _recipient,
                amountIn: _customData.amount,
                amountOutMinimum: _customData.minReturn
            });
            return swapRouter.exactInput(params);
        } else {
            // If no path is provided, execute a single-hop swap
            IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter.ExactInputSingleParams({
                tokenIn: _customData.swapFrom,
                tokenOut: outTokenIfNoPath,
                fee: 10000,
                recipient: _recipient,
                amountIn: _customData.amount,
                amountOutMinimum: _customData.minReturn,
                sqrtPriceLimitX96: 0
            });

            // Execute the swap using `exactInputSingle`
            return swapRouter.exactInputSingle(params);
        }
    }

    function getRealtimeStats(
        IGoodCollectiveSuperApp.Stats memory stats,
        ISuperToken superToken
    )
        external
        view
        returns (
            uint256 netIncome,
            uint256 totalFees,
            uint256 protocolFees,
            uint256 managerFees,
            int96 incomeFlowRate,
            int96 feeRate,
            int96 managerFeeRate
        )
    {
        incomeFlowRate = stats.lastIncomeRate;
        netIncome = stats.netIncome + uint96(stats.lastIncomeRate) * (block.timestamp - stats.lastUpdate);
        feeRate = superToken.getFlowRate(address(this), stats.lastFeeRecipient);
        managerFeeRate = superToken.getFlowRate(address(this), stats.lastManagerFeeRecipient);

        protocolFees =
            stats.protocolFees +
            uint96(superToken.getFlowRate(address(this), stats.lastFeeRecipient)) *
            (block.timestamp - stats.lastUpdate);
        managerFees =
            stats.managerFees +
            uint96(superToken.getFlowRate(address(this), stats.lastManagerFeeRecipient)) *
            (block.timestamp - stats.lastUpdate);
        totalFees = protocolFees + managerFees;
    }

    // this should be called before any flow rate changes
    function updateStats(
        IGoodCollectiveSuperApp.Stats storage stats,
        ISuperToken superToken,
        IRegistry registry,
        uint32 managerFeeBps,
        uint256 _amount
    ) external {
        uint feeBps;
        if (address(registry) != address(0)) {
            feeBps = registry.feeBps();
        }
        //use last rate before the current possible rate update
        stats.netIncome += uint96(stats.lastIncomeRate) * (block.timestamp - stats.lastUpdate);
        if (stats.lastFeeRecipient != address(0)) {
            //fees sent to last recipient, the flowRate to recipient still wasnt updated.
            stats.protocolFees +=
                uint96(superToken.getFlowRate(address(this), stats.lastFeeRecipient)) *
                (block.timestamp - stats.lastUpdate);
        }
        if (stats.lastManagerFeeRecipient != address(0)) {
            //fees sent to last recipient, the flowRate to recipient still wasnt updated.
            stats.managerFees +=
                uint96(superToken.getFlowRate(address(this), stats.lastManagerFeeRecipient)) *
                (block.timestamp - stats.lastUpdate);
        }

        if (_amount > 0) {
            stats.netIncome += (_amount * (10000 - feeBps - managerFeeBps)) / 10000;
            stats.protocolFees += (_amount * feeBps) / 10000;
            stats.managerFees += (_amount * managerFeeBps) / 10000;
        }
        stats.totalFees = stats.managerFees + stats.protocolFees;
        stats.lastUpdate = block.timestamp;
    }

    function takeFeeFlow(
        CFAv1Library.InitData storage cfaV1,
        ISuperToken superToken,
        address prevRecipient,
        address recipient,
        uint32 feeBps,
        int96 _diffRate,
        bytes memory _ctx
    ) public returns (bytes memory newCtx) {
        newCtx = _ctx;
        if (address(recipient) == address(0)) return newCtx;
        int96 curFeeRate = superToken.getFlowRate(address(this), prevRecipient);
        bool newRecipient;
        if (recipient != prevRecipient) {
            newRecipient = true;
            if (prevRecipient != address(0)) {
                //delete old recipient flow
                if (curFeeRate > 0) newCtx = cfaV1.deleteFlowWithCtx(newCtx, address(this), prevRecipient, superToken); //passing in the ctx which is sent to the callback here
            }
        }
        if (recipient == address(0)) return newCtx;

        int96 newFeeRate = curFeeRate + (_diffRate * int32(feeBps)) / 10000;
        if (newRecipient == false && curFeeRate > 0) {
            if (newFeeRate <= 0) {
                newCtx = cfaV1.deleteFlowWithCtx(newCtx, address(this), recipient, superToken); //passing in the ctx which is sent to the callback here
            } else {
                newCtx = cfaV1.updateFlowWithCtx(newCtx, recipient, superToken, newFeeRate); //passing in the ctx which is sent to the callback here
            }
        } else if (newFeeRate > 0) newCtx = cfaV1.createFlowWithCtx(newCtx, recipient, superToken, newFeeRate); //passing in the ctx which is sent to the callback here
    }

    function recoverFunds(ISuperToken superToken, address recipient, uint256 amount) external {
        require(IGoodCollectiveSuperApp(address(this)).getRegistry().hasRole(0x00, msg.sender), "not owner");
        if (amount == 0) revert ZERO_AMOUNT();
        if (recipient == address(0)) revert ZERO_ADDRESS();
        superToken.transfer(recipient, amount);
    }
}
