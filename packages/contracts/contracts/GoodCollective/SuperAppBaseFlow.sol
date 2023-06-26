// SPDX-License-Identifier: AGPLv3
pragma solidity >=0.8.0;

import { ISuperfluid, ISuperToken, ISuperApp, SuperAppDefinitions } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

// import "hardhat/console.sol";

abstract contract SuperAppBaseFlow is ISuperApp {
    using SuperTokenV1Library for ISuperToken;

    bytes32 public constant CFAV1_TYPE = keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");

    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    ISuperfluid public immutable host;

    /// @dev Thrown when the callback caller is not the host.
    error UnauthorizedHost();

    /// @dev Thrown if a required callback wasn't implemented (overridden by the SuperApp)
    error NotImplemented();

    /// @dev Thrown when SuperTokens not accepted by the SuperApp are streamed to it
    error NotAcceptedSuperToken();

    /**
     * @dev Initializes the contract by setting the expected Superfluid Host.
     *      and register which callbacks the Host can engage when appropriate.
     */
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(ISuperfluid host_) {
        host = host_;
    }

    /**
     * @dev Optional (positive) filter for accepting only specific SuperTokens.
     *      The default implementation accepts all SuperTokens.
     *      Can be overridden by the SuperApp in order to apply arbitrary filters.
     */
    function isAcceptedSuperToken(ISuperToken /*superToken*/) public view virtual returns (bool);

    // ---------------------------------------------------------------------------------------------
    // CFA specific convenience callbacks
    // to be overridden and implemented by inheriting SuperApps

    /// @dev override if the SuperApp shall have custom logic invoked when a new flow
    ///      to it is created.
    function onFlowCreated(
        ISuperToken /*superToken*/,
        address /*sender*/,
        bytes calldata ctx
    ) internal virtual returns (bytes memory /*newCtx*/) {
        return ctx;
    }

    /// @dev override if the SuperApp shall have custom logic invoked when an existing flow
    ///      to it is updated (flowrate change).
    function onFlowUpdated(
        ISuperToken /*superToken*/,
        address /*sender*/,
        int96 /*previousFlowRate*/,
        uint256 /*lastUpdated*/,
        bytes calldata ctx
    ) internal virtual returns (bytes memory /*newCtx*/) {
        return ctx;
    }

    /// @dev override if the SuperApp shall have custom logic invoked when an existing flow
    ///      to it is deleted (flowrate set to 0).
    ///      Unlike the other callbacks, this method is NOT allowed to revert.
    ///      Failing to satisfy that requirement leads to jailing (defunct SuperApp).
    function onFlowDeleted(
        ISuperToken /*superToken*/,
        address /*sender*/,
        address /*receiver*/,
        int96 /*previousFlowRate*/,
        uint256 /*lastUpdated*/,
        bytes calldata ctx
    ) internal virtual returns (bytes memory /*newCtx*/) {
        return ctx;
    }

    function beforeAgreementCreated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata /*ctx*/
    ) external view returns (bytes memory /*beforeData*/) {
        if (msg.sender != address(host)) revert UnauthorizedHost();
        if (!isAcceptedAgreement(agreementClass)) return "0x";
        if (!isAcceptedSuperToken(superToken)) revert NotAcceptedSuperToken();
        return "0x";
    }

    function afterAgreementCreated(
        ISuperToken superToken,
        address /*agreementClass*/,
        bytes32 /*agreementId*/,
        bytes calldata agreementData,
        bytes calldata /*cbdata*/,
        bytes calldata ctx
    ) external returns (bytes memory newCtx) {
        (address sender, ) = abi.decode(agreementData, (address, address));

        return
            onFlowCreated(
                superToken,
                sender,
                ctx // userData can be acquired with `host.decodeCtx(ctx).userData`
            );
    }

    // UPDATED callbacks

    function beforeAgreementUpdated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 /*agreementId*/,
        bytes calldata agreementData,
        bytes calldata /*ctx*/
    ) external view returns (bytes memory /*beforeData*/) {
        if (msg.sender != address(host)) revert UnauthorizedHost();
        if (!isAcceptedAgreement(agreementClass)) return "0x";
        if (!isAcceptedSuperToken(superToken)) revert NotAcceptedSuperToken();

        (address sender, ) = abi.decode(agreementData, (address, address));
        (uint256 lastUpdated, int96 flowRate, , ) = superToken.getFlowInfo(sender, address(this));

        return abi.encode(flowRate, lastUpdated);
    }

    function afterAgreementUpdated(
        ISuperToken superToken,
        address /*agreementClass*/,
        bytes32 /*agreementId*/,
        bytes calldata agreementData,
        bytes calldata cbdata,
        bytes calldata ctx
    ) external returns (bytes memory newCtx) {
        (address sender, ) = abi.decode(agreementData, (address, address));
        (int96 previousFlowRate, uint256 lastUpdated) = abi.decode(cbdata, (int96, uint256));

        return
            onFlowUpdated(
                superToken,
                sender,
                previousFlowRate,
                lastUpdated,
                ctx // userData can be acquired with `host.decodeCtx(ctx).userData`
            );
    }

    // DELETED callbacks

    function beforeAgreementTerminated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 /*agreementId*/,
        bytes calldata agreementData,
        bytes calldata /*ctx*/
    ) external view returns (bytes memory /*beforeData*/) {
        // we're not allowed to revert in this callback, thus just return empty beforeData on failing checks
        if (msg.sender != address(host) || !isAcceptedAgreement(agreementClass) || !isAcceptedSuperToken(superToken)) {
            return "0x";
        }

        (address sender, address receiver) = abi.decode(agreementData, (address, address));
        (uint256 lastUpdated, int96 flowRate, , ) = superToken.getFlowInfo(sender, receiver);

        return abi.encode(lastUpdated, flowRate);
    }

    function afterAgreementTerminated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 /*agreementId*/,
        bytes calldata agreementData,
        bytes calldata cbdata,
        bytes calldata ctx
    ) external returns (bytes memory newCtx) {
        // we're not allowed to revert in this callback, thus just return ctx on failing checks
        if (msg.sender != address(host) || !isAcceptedAgreement(agreementClass) || !isAcceptedSuperToken(superToken)) {
            return ctx;
        }

        (address sender, address receiver) = abi.decode(agreementData, (address, address));
        (uint256 lastUpdated, int96 previousFlowRate) = abi.decode(cbdata, (uint256, int96));

        return onFlowDeleted(superToken, sender, receiver, previousFlowRate, lastUpdated, ctx);
    }

    // ---------------------------------------------------------------------------------------------
    // HELPERS

    /**
     * @dev Expect Super Agreement involved in callback to be an accepted one
     *      This function can be overridden with custom logic and to revert if desired
     *      Current implementation expects ConstantFlowAgreement
     */
    function isAcceptedAgreement(address agreementClass) internal view virtual returns (bool) {
        return agreementClass == address(host.getAgreementClass(CFAV1_TYPE));
    }
}
