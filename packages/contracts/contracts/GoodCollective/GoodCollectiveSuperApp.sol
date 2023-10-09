// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import { SuperAppBaseFlow } from "./SuperAppBaseFlow.sol";
import { ISuperfluid, ISuperToken, SuperAppDefinitions } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { ISuperGoodDollar } from "@gooddollar/goodprotocol/contracts/token/superfluid/ISuperGoodDollar.sol";
import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import { CFAv1Library, IConstantFlowAgreementV1 } from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

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
    ISwapRouter public immutable swapRouter;

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

    uint256[48] private _reserved;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(ISuperfluid _host, ISwapRouter _swapRouter) SuperAppBaseFlow(_host) {
        if (address(_host) == address(0)) revert ZERO_ADDRESS();
        swapRouter = _swapRouter;
    }

    function getRegistry() public view virtual returns (DirectPaymentsFactory);

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
        returns (uint256 netIncome, uint256 totalFees, int96 incomeFlowRate, int96 feeRate)
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
        _updateStats(_isFlow ? 0 : uint256(_previousFlowRateOrAmount));
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
                uint96(int96(_previousFlowRateOrAmount)) *
                (block.timestamp - _lastUpdated);
            newCtx = _takeFeeFlow(flowRate - int96(_previousFlowRateOrAmount), _ctx);
            // we update the last rate after we do all changes to our own flows
            stats.lastIncomeRate = superToken.getNetFlowRate(address(this));
        } else {
            supporters[_supporter].contribution += uint256(_previousFlowRateOrAmount);
            _takeFeeSingle(uint256(_previousFlowRateOrAmount));
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

    // this should be called before any flow rate changes
    function _updateStats(uint256 _amount) internal {
        //use last rate before the current possible rate update
        stats.netIncome += uint96(stats.lastIncomeRate) * (block.timestamp - stats.lastUpdate);
        uint feeBps;
        if (address(getRegistry()) != address(0)) {
            feeBps = getRegistry().feeBps();
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

    function _takeFeeFlow(int96 _diffRate, bytes memory _ctx) internal returns (bytes memory newCtx) {
        newCtx = _ctx;
        if (address(getRegistry()) == address(0)) return newCtx;
        address recipient = getRegistry().feeRecipient();
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

        int96 feeRateChange = (_diffRate * int32(getRegistry().feeBps())) / 10000;
        int96 newFeeRate = curFeeRate + feeRateChange;
        if (newFeeRate <= 0 && newRecipient == false) {
            newCtx = cfaV1.deleteFlowWithCtx(newCtx, address(this), recipient, superToken); //passing in the ctx which is sent to the callback here
        } else if (curFeeRate > 0 && newRecipient == false) {
            newCtx = cfaV1.updateFlowWithCtx(newCtx, recipient, superToken, newFeeRate); //passing in the ctx which is sent to the callback here
        } else if (newFeeRate > 0) newCtx = cfaV1.createFlowWithCtx(newCtx, recipient, superToken, newFeeRate); //passing in the ctx which is sent to the callback here
    }

    function _takeFeeSingle(uint256 _amount) internal {
        if (address(getRegistry()) == address(0)) return;
        address recipient = getRegistry().feeRecipient();
        if (recipient == address(0)) return;

        uint256 fee = (_amount * getRegistry().feeBps()) / 10000;
        TransferHelper.safeTransfer(address(superToken), recipient, fee);
    }

    /**
     * for methods that can be called via superfluid batch or directly
     */
    modifier onlyHostOrSender(address _sender) {
        if (msg.sender != _sender && msg.sender != address(host)) revert ONLY_HOST_OR_SENDER(msg.sender);
        _;
    }
}
