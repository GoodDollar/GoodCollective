// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

library SwapLibrary {
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
        ISwapRouter swapRouter,
        SwapData memory _customData,
        address outTokenIfNoPath,
        address _sender
    ) internal {
        // Transfer the tokens from the sender to this contract
        TransferHelper.safeTransferFrom(_customData.swapFrom, _sender, address(this), _customData.amount);

        // Approve the router to spend the tokens
        TransferHelper.safeApprove(_customData.swapFrom, address(swapRouter), _customData.amount);

        if (_customData.path.length > 0) {
            // If a path is provided, execute a multi-hop swap
            ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
                path: _customData.path,
                recipient: _sender,
                deadline: _customData.deadline,
                amountIn: _customData.amount,
                amountOutMinimum: _customData.minReturn
            });
            swapRouter.exactInput(params);
        } else {
            // If no path is provided, execute a single-hop swap
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: _customData.swapFrom,
                tokenOut: outTokenIfNoPath,
                fee: 10000,
                recipient: _sender,
                deadline: _customData.deadline,
                amountIn: _customData.amount,
                amountOutMinimum: _customData.minReturn,
                sqrtPriceLimitX96: 0
            });

            // Execute the swap using `exactInputSingle`
            swapRouter.exactInputSingle(params);
        }
    }
}
