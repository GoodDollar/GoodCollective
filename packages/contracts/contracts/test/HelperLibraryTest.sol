// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "../utils/HelperLibrary.sol";

contract HelperLibraryTest {
    function handleSwap(
        IV3SwapRouter swapRouter,
        HelperLibrary.SwapData memory _customData,
        address outTokenIfNoPath,
        address _sender
    ) external returns (uint256 amountOut) {
        return HelperLibrary.handleSwap(swapRouter, _customData, outTokenIfNoPath, _sender, _sender);
    }
}
