// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/swap-router-contracts/contracts/interfaces/IV3SwapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SwapRouterMock {
    IERC20 private immutable _token;

    constructor(address token) {
        _token = IERC20(token);
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another along the specified path
    /// @param params The parameters necessary for the multi-hop swap, encoded as `ExactInputParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInput(IV3SwapRouter.ExactInputParams calldata params) external payable returns (uint256 amountOut) {
        amountOut = params.amountOutMinimum;

        // Transfer the output token to the recipient
        _token.transfer(params.recipient, amountOut);
    }

    function exactInputSingle(
        IV3SwapRouter.ExactInputSingleParams memory params
    ) external payable returns (uint256 amountOut) {
        amountOut = params.amountOutMinimum;

        // Transfer the output token to the recipient
        _token.transfer(params.recipient, amountOut);
    }
}
