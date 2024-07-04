// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/swap-router-contracts/contracts/interfaces/IV3SwapRouter.sol";
import { ISuperToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import { CFAv1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

import "../GoodCollective/IGoodCollectiveSuperApp.sol";

library HelperLibrary {
    using SuperTokenV1Library for ISuperToken;
    using CFAv1Library for CFAv1Library.InitData;

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
    ) external view returns (uint256 netIncome, uint256 totalFees, int96 incomeFlowRate, int96 feeRate) {
        incomeFlowRate = stats.lastIncomeRate;
        netIncome = stats.netIncome + uint96(stats.lastIncomeRate) * (block.timestamp - stats.lastUpdate);
        feeRate = superToken.getFlowRate(address(this), stats.lastFeeRecipient);
        totalFees =
            stats.totalFees +
            uint96(superToken.getFlowRate(address(this), stats.lastFeeRecipient)) *
            (block.timestamp - stats.lastUpdate);
    }

    // this should be called before any flow rate changes
    function updateStats(
        IGoodCollectiveSuperApp.Stats storage stats,
        ISuperToken superToken,
        IRegistry registry,
        uint256 _amount
    ) external {
        //use last rate before the current possible rate update
        stats.netIncome += uint96(stats.lastIncomeRate) * (block.timestamp - stats.lastUpdate);
        uint feeBps;
        if (address(registry) != address(0)) {
            feeBps = registry.feeBps();
            //fees sent to last recipient, the flowRate to recipient still wasnt updated.
            stats.totalFees +=
                uint96(superToken.getFlowRate(address(this), stats.lastFeeRecipient)) *
                (block.timestamp - stats.lastUpdate);
        }
        if (_amount > 0) {
            stats.netIncome += (_amount * (10000 - feeBps)) / 10000;
            stats.totalFees += (_amount * feeBps) / 10000;
        }
        stats.lastUpdate = block.timestamp;
    }

    function takeFeeFlow(
        CFAv1Library.InitData storage cfaV1,
        IGoodCollectiveSuperApp.Stats storage stats,
        ISuperToken superToken,
        IRegistry registry,
        int96 _diffRate,
        bytes memory _ctx
    ) public returns (bytes memory newCtx) {
        newCtx = _ctx;
        if (address(registry) == address(0)) return newCtx;
        address recipient = registry.feeRecipient();
        int96 curFeeRate = superToken.getFlowRate(address(this), stats.lastFeeRecipient);
        bool newRecipient;
        if (recipient != stats.lastFeeRecipient) {
            newRecipient = true;
            if (stats.lastFeeRecipient != address(0)) {
                //delete old recipient flow
                if (curFeeRate > 0)
                    newCtx = cfaV1.deleteFlowWithCtx(newCtx, address(this), stats.lastFeeRecipient, superToken); //passing in the ctx which is sent to the callback here
            }
            stats.lastFeeRecipient = recipient;
        }
        if (recipient == address(0)) return newCtx;

        int96 newFeeRate = curFeeRate + (_diffRate * int32(registry.feeBps())) / 10000;
        if (newFeeRate <= 0 && newRecipient == false) {
            newCtx = cfaV1.deleteFlowWithCtx(newCtx, address(this), recipient, superToken); //passing in the ctx which is sent to the callback here
        } else if (curFeeRate > 0 && newRecipient == false) {
            newCtx = cfaV1.updateFlowWithCtx(newCtx, recipient, superToken, newFeeRate); //passing in the ctx which is sent to the callback here
        } else if (newFeeRate > 0) newCtx = cfaV1.createFlowWithCtx(newCtx, recipient, superToken, newFeeRate); //passing in the ctx which is sent to the callback here
    }
}
