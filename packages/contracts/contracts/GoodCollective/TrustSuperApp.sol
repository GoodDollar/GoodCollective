// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import { SuperAppBaseFlow } from "./SuperAppBaseFlow.sol";
import { ISuperfluid, ISuperToken, SuperAppDefinitions } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { ISuperGoodDollar } from "@gooddollar/goodprotocol/contracts/token/superfluid/ISuperGoodDollar.sol";
import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import { CFAv1Library, IConstantFlowAgreementV1 } from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";
import { ISuperfluidPool } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/gdav1/ISuperfluidPool.sol";
import { IGeneralDistributionAgreementV1, PoolConfig } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/gdav1/IGeneralDistributionAgreementV1.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

import { IncomeGDAWrapper } from "../Trust/IncomeGDAWrapper.sol";
import "./IGoodCollectiveSuperApp.sol";

import "hardhat/console.sol";

abstract contract TrustSuperApp is SuperAppBaseFlow {
    int96 public constant MIN_FLOW_RATE = 386e9;

    using SuperTokenV1Library for ISuperToken;

    error ZERO_ADDRESS();
    error ZERO_AMOUNT();
    error UNSUPPORTED_TOKEN();
    error ONLY_HOST_OR_SENDER(address);
    error NOT_WHITELISTED(address);
    error FEE_FLOW_FAILED(int96 curFeeRate, int96 newFeeRate);
    error MIN_FLOWRATE(int96 flowRate);
    error NOT_MEMBER(address member);
    error NOT_MANAGER(address member);

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

    ISuperToken public superToken;
    //initialize cfaV1 variable

    UpgradeableBeacon public incomePoolBeacon;

    mapping(address => ISuperfluidPool) public outputPools;
    mapping(address => IncomeGDAWrapper) public incomePools;

    uint256[48] private _reserved;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(ISuperfluid _host) SuperAppBaseFlow(_host) {
        if (address(_host) == address(0)) revert ZERO_ADDRESS();
    }

    function isAcceptedSuperToken(ISuperToken _superToken) public view override returns (bool) {
        return address(superToken) == address(_superToken);
    }

    function getRegistry() public view virtual returns (IRegistry);

    /**
     * @dev Sets the address of the super token and registers the app with the host
     * @param _superToken The address of the super token contract
     */
    function initialize(ISuperToken _superToken, UpgradeableBeacon _incomePoolBeacon) internal {
        if (address(_incomePoolBeacon) == address(0)) revert ZERO_ADDRESS();

        if (address(_superToken) == address(0)) revert ZERO_ADDRESS();

        incomePoolBeacon = _incomePoolBeacon;
        // Set the super token address
        superToken = _superToken;

        // Define the callback definitions for the app
        uint256 callBackDefinitions = SuperAppDefinitions.APP_LEVEL_FINAL;

        // Register the app with the host
        host.registerApp(callBackDefinitions);
    }

    function requireWhitelisted(address account) internal view virtual;

    function getIncomePool(address _member) public view returns (ISuperfluidPool) {
        return incomePools[_member].pool();
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
        return _ctx;
    }

    function _createOutputPool(address _user) internal returns (ISuperfluidPool pool) {
        PoolConfig memory poolConfig;
        pool = superToken.createPool(address(this), poolConfig);
        outputPools[_user] = pool;
    }

    function _createIncomePool(address _user) internal returns (IncomeGDAWrapper pool) {
        console.log("incomePoolBeacon: %s", address(incomePoolBeacon));
        bytes memory initCall = abi.encodeCall(IncomeGDAWrapper.initialize, (superToken, _user, address(this)));
        pool = IncomeGDAWrapper(address(new BeaconProxy(address(incomePoolBeacon), initCall)));
        incomePools[_user] = pool;
    }
}
