// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import { SuperAppBaseFlow } from "./SuperAppBaseFlow.sol";
import { ISuperfluid, ISuperToken, SuperAppDefinitions, ISuperApp } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { ISuperGoodDollar } from "@gooddollar/goodprotocol/contracts/token/superfluid/ISuperGoodDollar.sol";
import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import { CFAv1Library, IConstantFlowAgreementV1 } from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/swap-router-contracts/contracts/interfaces/IV3SwapRouter.sol";

import "../DirectPayments/DirectPaymentsFactory.sol";
import "../utils/HelperLibrary.sol";

// import "hardhat/console.sol";

abstract contract GoodCollectiveSuperApp is SuperAppBaseFlow {
    int96 public constant MIN_FLOW_RATE = 386e9;

    using SuperTokenV1Library for ISuperToken;
    using CFAv1Library for CFAv1Library.InitData;

    error ZERO_ADDRESS();
    error ZERO_AMOUNT();
    error UNSUPPORTED_TOKEN();
    error ONLY_HOST_OR_SENDER(address);
    error FEE_FLOW_FAILED(int96 curFeeRate, int96 newFeeRate);
    error MIN_FLOWRATE(int96 flowRate);

    /**
     * @dev Emitted when a supporter's contribution or flow rate is updated
     * @param supporter The address of the supporter
     * @param previousContribution The previous total contribution amount
     * @param contribution The new total contribution amount
     * @param previousFlowRate The previous flow rate if isFlowUpdate otherwise 0
     * @param flowRate The new flow rate
     * @param isFlowUpdate True if the update was a flow rate update, false if it was a single contribution update
     */
    event SupporterUpdated(
        address indexed supporter,
        uint256 previousContribution,
        uint256 contribution,
        int96 previousFlowRate,
        int96 flowRate,
        bool isFlowUpdate
    );

    //TODO:
    // ask about "receiver" can it be different then app?

    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    IV3SwapRouter public immutable swapRouter;

    struct SupporterData {
        uint256 contribution;
        int96 flowRate;
        uint128 lastUpdated;
    }

    ISuperToken public superToken;

    mapping(address => SupporterData) public supporters;

    //initialize cfaV1 variable
    CFAv1Library.InitData public cfaV1;

    IGoodCollectiveSuperApp.Stats public stats;

    uint256[45] private _reserved;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(ISuperfluid _host, IV3SwapRouter _swapRouter) SuperAppBaseFlow(_host) {
        if (address(_host) == address(0)) revert ZERO_ADDRESS();
        swapRouter = _swapRouter;
    }

    function getRegistry() public view virtual returns (IRegistry);

    function getManagerFee() public view virtual returns (address admin, uint32 feeBps);

    /**
     * @dev Sets the address of the super token and registers the app with the host
     * @param _superToken The address of the super token contract
     */
    function setSuperToken(ISuperToken _superToken) internal {
        if (address(_superToken) == address(0)) revert ZERO_ADDRESS();

        // Set the super token address
        superToken = _superToken;

        // // try to register the app with the host, required for backward compatability with unit tests
        if (host.isApp(this) == false) try host.registerApp(SuperAppDefinitions.APP_LEVEL_FINAL) {} catch {}

        //initialize InitData struct, and set equal to cfaV1
        cfaV1 = CFAv1Library.InitData(
            host,
            IConstantFlowAgreementV1(
                address(host.getAgreementClass(keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")))
            )
        );
    }

    function isAcceptedSuperToken(ISuperToken _superToken) public view override returns (bool) {
        return address(superToken) == address(_superToken);
    }

    function getRealtimeContribution(address _user) public view returns (uint256) {
        SupporterData memory supporter = supporters[_user];
        if (supporter.flowRate == 0) return supporter.contribution;
        return supporter.contribution + uint96(supporter.flowRate) * (block.timestamp - supporter.lastUpdated);
    }

    function getRealtimeStats()
        public
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
        return HelperLibrary.getRealtimeStats(stats, superToken);
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
        _updateSupporter(_sender, int256(_amount), 0, "");

        return true;
    }

    /**
     * @dev allow single contribution. user needs to approve tokens first. can be used in superfluid batch actions.
     * @param _sender The address of the sender who is contributing tokens.
     * @param _amount The amount of tokens being contributed.
     * @param _ctx The context of the transaction for superfluid in case this was used in superfluid batch. otherwise can be empty.
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
        _updateSupporter(_sender, int256(_amount), 0, ""); //we pass empty ctx since this is not a flow but a single donation

        return _ctx;
    }

    /**
     * @dev allow single contribution. user needs to approve tokens first. can be used in superfluid batch actions.
     * @param _sender The address of the sender who is contributing tokens.
     * @param _customData The SwapData struct containing information about the swap
     * @param _ctx The context of the transaction for superfluid in case this was used in superfluid batch. otherwise can be empty.
     * @return Returns the context of the transaction.
     */
    function supportWithSwap(
        address _sender,
        HelperLibrary.SwapData memory _customData,
        bytes memory _ctx
    ) external onlyHostOrSender(_sender) returns (bytes memory) {
        uint256 balance = superToken.balanceOf(address(this));
        HelperLibrary.handleSwap(swapRouter, _customData, address(superToken), _sender, address(this));
        uint256 amountReceived = superToken.balanceOf(address(this)) - balance;
        if (amountReceived == 0) revert ZERO_AMOUNT();

        // Update the contribution amount for the sender in the supporters mapping
        _updateSupporter(_sender, int256(amountReceived), 0, ""); //we pass empty ctx since this is not a flow but a single donation
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
        HelperLibrary.SwapData memory _customData,
        address _sender,
        bytes memory _ctx
    ) external onlyHostOrSender(_sender) returns (bytes memory) {
        HelperLibrary.handleSwap(swapRouter, _customData, address(superToken), _sender);

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
        return _updateSupporter(_sender, 0, 0, _ctx);
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
        return _updateSupporter(_sender, _previousFlowRate, _lastUpdated, _ctx);
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

        return _updateSupporter(_sender, _previousFlowRate, _lastUpdated, _ctx);
    }

    /**
     * @dev Updates the information for a supporter
     * @param _supporter The address of the supporter
     * @param _previousFlowRateOrAmount The previous flow rate of the stream or single donation amount
     * @param _lastUpdated The timestamp of the last update to the stream
     * @param _ctx flow context
     */
    function _updateSupporter(
        address _supporter,
        int256 _previousFlowRateOrAmount,
        uint256 _lastUpdated,
        bytes memory _ctx
    ) internal returns (bytes memory newCtx) {
        newCtx = _ctx;
        bool _isFlow = _ctx.length > 0;
        (address feeRecipient, uint32 feeBps) = getManagerFee();
        HelperLibrary.updateStats(
            stats,
            superToken,
            getRegistry(),
            feeBps,
            _isFlow ? 0 : uint256(_previousFlowRateOrAmount)
        );
        // Get the current flow rate for the supporter
        int96 flowRate = superToken.getFlowRate(_supporter, address(this));
        uint256 prevContribution = supporters[_supporter].contribution;

        if (_isFlow) {
            //enforce minimal flow rate
            if (flowRate > 0 && flowRate < MIN_FLOW_RATE) revert MIN_FLOWRATE(flowRate);
            // Update the supporter's information
            supporters[_supporter].lastUpdated = uint128(block.timestamp);
            supporters[_supporter].flowRate = flowRate;
            supporters[_supporter].contribution +=
                uint256(_previousFlowRateOrAmount) *
                (block.timestamp - _lastUpdated);

            // address feeRecipient;
            // uint32 feeBps;
            if (address(getRegistry()) != address(0)) {
                feeRecipient = getRegistry().feeRecipient();
                feeBps = getRegistry().feeBps();
                // console.log("taking fees %s %s", feeRecipient, feeBps);

                newCtx = HelperLibrary.takeFeeFlow(
                    cfaV1,
                    superToken,
                    stats.lastFeeRecipient,
                    feeRecipient,
                    feeBps,
                    flowRate - int96(_previousFlowRateOrAmount), // we use diff, because manager takes fee from many streams not just this one
                    newCtx
                );
                stats.lastFeeRecipient = feeRecipient;
            }
            // console.log("protocol fee stream ok");
            (feeRecipient, feeBps) = getManagerFee();

            newCtx = HelperLibrary.takeFeeFlow(
                cfaV1,
                superToken,
                stats.lastManagerFeeRecipient,
                feeRecipient,
                feeBps,
                flowRate - int96(_previousFlowRateOrAmount), // we use diff, because manager takes fee from many streams not just this one
                newCtx
            );

            stats.lastManagerFeeRecipient = feeRecipient;
            // console.log("admin fee stream ok");
            // we update the last rate after we do all changes to our own flows
            stats.lastIncomeRate = superToken.getNetFlowRate(address(this));
        } else {
            if (address(getRegistry()) != address(0)) {
                feeRecipient = getRegistry().feeRecipient();
                feeBps = getRegistry().feeBps();
                _takeFeeSingle(feeRecipient, feeBps, uint256(_previousFlowRateOrAmount));
            }
            (feeRecipient, feeBps) = getManagerFee();
            _takeFeeSingle(feeRecipient, feeBps, uint256(_previousFlowRateOrAmount));

            supporters[_supporter].contribution += uint256(_previousFlowRateOrAmount);
        }

        emit SupporterUpdated(
            _supporter,
            prevContribution,
            supporters[_supporter].contribution,
            _isFlow ? int96(int256(_previousFlowRateOrAmount)) : int96(0),
            flowRate,
            _isFlow
        );
    }

    function _takeFeeSingle(address recipient, uint32 feeBps, uint256 _amount) internal {
        if (recipient == address(0)) return;

        uint256 fee = (_amount * feeBps) / 10000;
        TransferHelper.safeTransfer(address(superToken), recipient, fee);
    }

    function recoverFunds(address _recipient, uint256 amount) external {
        HelperLibrary.recoverFunds(superToken, _recipient, amount);
    }

    /**
     * for methods that can be called via superfluid batch or directly
     */
    modifier onlyHostOrSender(address _sender) {
        if (msg.sender != _sender && msg.sender != address(host)) revert ONLY_HOST_OR_SENDER(msg.sender);
        _;
    }
}
