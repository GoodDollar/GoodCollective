// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import { SuperAppBaseFlow } from "./SuperAppBaseFlow.sol";
import { ISuperfluid, ISuperToken, SuperAppDefinitions } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { ISuperGoodDollar } from "@gooddollar/goodprotocol/contracts/token/superfluid/ISuperGoodDollar.sol";
import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

// import "hardhat/console.sol";

abstract contract GoodCollectiveSuperApp is SuperAppBaseFlow {
    using SuperTokenV1Library for ISuperToken;

    error ZERO_ADDRESS();
    error ZERO_AMOUNT();
    error UNSUPPORTED_TOKEN();
    error ONLY_HOST_OR_SENDER(address);

    event SupporterUpdated(address indexed supporter, uint256 contribution, int96 flowRate, uint256 lastUpdated);

    //TODO: ask about "view" for beforeagreement functions
    // ask about "receiver" can it be different then app?

    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    ISwapRouter public immutable swapRouter;

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
        uint256 timestamp;
        bytes path;
    }

    struct SupporterData {
        uint256 contribution;
        int96 flowRate;
        uint128 lastUpdated;
    }

    ISuperToken public superToken;

    mapping(address => SupporterData) public supporters;

    uint256[50] private _reserved;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(ISuperfluid _host, ISwapRouter _swapRouter) SuperAppBaseFlow(_host) {
        if (address(_host) == address(0)) revert ZERO_ADDRESS();
        swapRouter = _swapRouter;
    }

    /**
     * @dev Sets the address of the super token and registers the app with the host
     * @param _superToken The address of the super token contract
     */
    function setSuperToken(ISuperToken _superToken) internal {
        if (address(_superToken) == address(0)) revert ZERO_ADDRESS();

        // Set the super token address
        superToken = _superToken;

        // Define the callback definitions for the app
        uint256 callBackDefinitions = SuperAppDefinitions.APP_LEVEL_FINAL;

        // Register the app with the host
        host.registerApp(callBackDefinitions);
    }

    function isAcceptedSuperToken(ISuperToken _superToken) public view override returns (bool) {
        return address(superToken) == address(_superToken);
    }

    function getRealtimeContribution(address _user) public view returns (uint256) {
        SupporterData memory supporter = supporters[_user];
        if (supporter.flowRate == 0) return supporter.contribution;
        return supporter.contribution + uint96(supporter.flowRate) * (block.timestamp - supporter.lastUpdated);
    }

    /**
     * @dev This function is called when a token transfer occurs
     * @param _sender The address of the sender
     * @param _amount The amount of tokens being transferred
     * @return bool Returns true to indicate that the transfer was successful
     */
    function onTokenTransfer(address _sender, uint256 _amount, bytes calldata /*_data*/) external returns (bool) {
        if (msg.sender != address(superToken)) revert UNSUPPORTED_TOKEN();
        if (_amount == 0) revert ZERO_AMOUNT();

        // Update the contribution amount for the sender in the supporters mapping
        _updateSupporter(_sender, int96(int256(_amount / 1000)), block.timestamp - 1000);

        return true;
    }

    /**
     * @dev This function supports the Superfluid protocol by allowing a sender to contribute tokens to the network.
     * @param _sender The address of the sender who is contributing tokens.
     * @param _amount The amount of tokens being contributed.
     * @param _ctx The context of the transaction for superfluid
     * @return Returns the context of the transaction.
     */
    function support(
        address _sender,
        uint256 _amount,
        bytes memory _ctx
    ) external onlyHostOrSender(_sender) returns (bytes memory) {
        if (_amount == 0) revert ZERO_AMOUNT();

        // Transfer the tokens from the sender to this contract
        TransferHelper.safeTransferFrom(address(superToken), _sender, address(this), _amount);

        // Update the contribution amount for the sender in the supporters mapping
        _updateSupporter(_sender, int96(int256(_amount / 1000)), block.timestamp - 1000);

        return _ctx;
    }

    /**
     * @dev Handles the swap of tokens using the SwapData struct
     * @param _customData The SwapData struct containing information about the swap
     * @param _sender The address of the sender of the transaction
     * @param _ctx The context of the transaction for superfluid
     * @return Returns the context of the transaction
     */
    function handleSwap(
        SwapData memory _customData,
        address _sender,
        bytes memory _ctx
    ) external onlyHostOrSender(_sender) returns (bytes memory) {
        // Transfer the tokens from the sender to this contract
        TransferHelper.safeTransferFrom(_customData.swapFrom, _sender, address(this), _customData.amount);

        // Approve the router to spend the tokens
        TransferHelper.safeApprove(_customData.swapFrom, address(swapRouter), _customData.amount);

        if (_customData.path.length > 0) {
            // If a path is provided, execute a multi-hop swap
            ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
                path: _customData.path,
                recipient: _sender,
                deadline: _customData.timestamp,
                amountIn: _customData.amount,
                amountOutMinimum: _customData.minReturn
            });
            swapRouter.exactInput(params);
        } else {
            // If no path is provided, execute a single-hop swap
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: _customData.swapFrom,
                tokenOut: address(superToken),
                fee: 10000,
                recipient: _sender,
                deadline: _customData.timestamp,
                amountIn: _customData.amount,
                amountOutMinimum: _customData.minReturn,
                sqrtPriceLimitX96: 0
            });

            // Execute the swap using `exactInputSingle`
            swapRouter.exactInputSingle(params);
        }

        // Return the context of the transaction
        return _ctx;
    }

    /**
     * @dev Called when a new flow is created
     * @param _sender The address of the sender of the transaction
     * @param _ctx The context of the transaction
     * @return Returns the new context of the transaction
     */
    function onFlowCreated(
        ISuperToken /*superToken*/,
        address _sender,
        bytes calldata _ctx
    ) internal virtual override returns (bytes memory /*newCtx*/) {
        // Update the supporter's information
        _updateSupporter(_sender, 0, 0);

        // Return the context of the transaction
        return _ctx;
    }

    /**
     * @dev Called when an existing flow is updated
     * @param _sender The address of the sender of the transaction
     * @param _previousFlowRate The previous flow rate of the stream
     * @param _lastUpdated The timestamp of the last update to the stream
     * @param _ctx The context of the transaction
     * @return Returns the new context of the transaction
     */
    function onFlowUpdated(
        ISuperToken /*superToken*/,
        address _sender,
        int96 _previousFlowRate,
        uint256 _lastUpdated,
        bytes calldata _ctx
    ) internal virtual override returns (bytes memory /*newCtx*/) {
        // Update the supporter's information
        _updateSupporter(_sender, _previousFlowRate, _lastUpdated);

        // Return the context of the transaction
        return _ctx;
    }

    /**
     * @dev Called when an existing flow is deleted
     * @param _sender The address of the sender of the transaction
     * @param _previousFlowRate The previous flow rate of the stream
     * @param _lastUpdated The timestamp of the last update to the stream
     * @param _ctx The context of the transaction
     * @return Returns the new context of the transaction
     */
    function onFlowDeleted(
        ISuperToken /*superToken*/,
        address _sender,
        address /*receiver*/,
        int96 _previousFlowRate,
        uint256 _lastUpdated,
        bytes calldata _ctx
    ) internal virtual override returns (bytes memory /*newCtx*/) {
        // Update the supporter's information
        _updateSupporter(_sender, _previousFlowRate, _lastUpdated);

        // Return the context of the transaction
        return _ctx;
    }

    /**
     * @dev Updates the information for a supporter
     * @param _supporter The address of the supporter
     * @param _previousFlowRate The previous flow rate of the stream
     * @param _lastUpdated The timestamp of the last update to the stream
     */
    function _updateSupporter(address _supporter, int96 _previousFlowRate, uint256 _lastUpdated) internal {
        // Get the current flow rate for the supporter
        (, int96 flowRate, , ) = superToken.getFlowInfo(_supporter, address(this));

        // Update the supporter's information
        supporters[_supporter].lastUpdated = uint128(block.timestamp);
        supporters[_supporter].flowRate = flowRate;
        supporters[_supporter].contribution += uint96(_previousFlowRate) * (block.timestamp - _lastUpdated);
        emit SupporterUpdated(_supporter, supporters[_supporter].contribution, flowRate, block.timestamp);
    }

    modifier onlyHostOrSender(address _sender) {
        if (msg.sender != _sender && msg.sender != address(host)) revert ONLY_HOST_OR_SENDER(msg.sender);
        _;
    }
}
