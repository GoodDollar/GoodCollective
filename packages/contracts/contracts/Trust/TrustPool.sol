// SPDX-License-Identifier: MIT
pragma solidity >=0.8;
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { IERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "../GoodCollective/TrustSuperApp.sol";
import "./TrustPoolFactory.sol";
import "../GoodCollective/IGoodCollectiveSuperApp.sol";
import "../Interfaces.sol";

contract TrustPool is AccessControlUpgradeable, TrustSuperApp, UUPSUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    using SuperTokenV1Library for ISuperToken;
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    TrustPoolFactory public registry;

    PoolSettings public settings;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(ISuperfluid _host) TrustSuperApp(_host) {}

    /**
     * @dev Authorizes an upgrade for the implementation contract.
     * @param impl The address of the new implementation contract.
     */
    function _authorizeUpgrade(address impl) internal virtual override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function getRegistry() public view override returns (IRegistry) {
        return IRegistry(address(registry));
    }

    /**
     * @dev Initializes the contract with the given settings and limits.
     * @param _registry The registy of trustpools (factory)
     * @param _settings pool settings
     * @param _incomePoolBeacon the implementation for the GDA incomePools
     */

    function initialize(
        TrustPoolFactory _registry,
        PoolSettings memory _settings,
        UpgradeableBeacon _incomePoolBeacon
    ) external initializer {
        registry = _registry;
        settings = _settings;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); // when using factory this gives factory role which then set role to the real msg.sender

        TrustSuperApp.initialize(ISuperToken(address(settings.rewardToken)), _incomePoolBeacon);
    }

    function requireWhitelisted(address account) internal view override {
        if (
            address(settings.uniquenessValidator) != address(0) &&
            settings.uniquenessValidator.getWhitelistedRoot(account) == address(0)
        ) revert NOT_WHITELISTED(account);
    }

    function updateTrust(address[] memory trusting, uint128[] memory shares) external {
        requireWhitelisted(msg.sender);
        address _truster = msg.sender;
        console.log("updateTrust after decoding input %s %s %s", trusting[0], shares[0]);
        // Get the current flow rate for the user
        int96 flowRate = superToken.getFlowRate(_truster, address(this));
        uint256 buffer = superToken.getBufferAmountByFlowRate(flowRate);

        ISuperfluidPool outputPool = outputPools[_truster];
        if (address(outputPool) == address(0)) {
            outputPool = _createOutputPool(_truster);
        }
        console.log("created output pool %s", address(outputPool));

        (, , uint256 prevBuffer, ) = superToken.getFlowInfo(address(this), address(outputPool));

        if (buffer > prevBuffer) {
            superToken.transferFrom(_truster, address(this), buffer - prevBuffer);
        }

        uint256[] memory prevBuffers = new uint256[](trusting.length);
        console.log("after updating flow, creating/updating income pools:");
        for (uint i; i < trusting.length; i++) {
            address trustee = trusting[i];
            requireWhitelisted(trustee);
            if (trustee == _truster) continue;
            IncomeGDAWrapper incomePool = incomePools[trustee];
            if (address(incomePool) == address(0)) {
                incomePool = _createIncomePool(trustee);
            }

            console.log("income pool %s", address(incomePool));
            prevBuffers[i] = superToken.getBufferAmountByFlowRate(outputPool.getMemberFlowRate(address(incomePool)));

            superToken.updateMemberUnits(outputPool, address(incomePool), shares[i]);
            console.log("updated members income pool %s", address(incomePool));

            incomePool.connectPool(outputPool);
            // uint256 buffer = superToken.getBufferAmountByFlowRate(outputPool.getMemberFlowRate(address(incomePool)));
            // console.log("connected income pool to output pool %s required buffer: %$s", address(incomePool), buffer);
            // incomePool.sync();
            // console.log("performd sync on income pool%s", address(incomePool));
        }
        console.log("distributing to output pool %s", address(outputPool));
        superToken.distributeFlow(address(this), outputPool, flowRate);

        // TODO: is this really important? refund buffer from flow to outputpool
        // TODO: maybe give user option if he no longer uses the superapp
        // if (prevBuffer > buffer) {
        //     superToken.transfer(_truster, prevBuffer - buffer);
        // }

        // after flow started, sync the pools
        for (uint i; i < trusting.length; i++) {
            address trustee = trusting[i];
            if (trustee == _truster) continue;
            IncomeGDAWrapper incomePool = incomePools[trustee];
            prevBuffer = prevBuffers[i];
            buffer = superToken.getBufferAmountByFlowRate(outputPool.getMemberFlowRate(address(incomePool)));
            int256 bufferDiff = int256(buffer) - int256(prevBuffer);
            if (bufferDiff > 0) superToken.transferFrom(_truster, address(incomePool), uint256(bufferDiff));
            console.log("connected income pool to output pool %s required buffer: %$s", address(incomePool), buffer);

            //sets the status of the member and perform sync
            incomePool.setVerifiedMember(hasRole(MEMBER_ROLE, trustee));

            console.log("performd sync on income pool%s", address(incomePool));
            // TODO: is this really important? refund buffer from flow to outputpool
            // TODO: maybe give user option if he no longer uses the superapp
            // if (bufferDiff < 0) incomePool.refundBuffer(uint256(bufferDiff * -1));
        }

        // newCtx = HelperLibrary.takeFeeFlow(
        //     cfaV1,
        //     stats,
        //     superToken,
        //     getRegistry(),
        //     flowRate - int96(_previousFlowRateOrAmount),
        //     _ctx
        // );

        // emit TrustUpdated(
        //     _truster,
        //     prevContribution,
        //     supporters[_truster].contribution,
        //     _isFlow ? int96(int256(_previousFlowRateOrAmount)) : int96(0),
        //     flowRate,
        //     _isFlow
        // );
    }

    /**
     * @dev Adds a member to the contract.
     * @param member The address of the member to add.
     * @param extraData Additional data to validate the member.
     */

    function addMember(address member, bytes memory extraData) external returns (bool isMember) {
        requireWhitelisted(member);

        if (address(settings.membersValidator) != address(0) && hasRole(MANAGER_ROLE, msg.sender) == false) {
            if (settings.membersValidator.isMemberValid(address(this), msg.sender, member, extraData) == false) {
                revert NOT_MEMBER(member);
            }
        }
        // if no members validator then if members only only manager can add members
        else if (hasRole(MANAGER_ROLE, msg.sender) == false) {
            revert NOT_MANAGER(member);
        }

        _grantRole(MEMBER_ROLE, member);
        return true;
    }

    function removeMember(address member) external onlyRole(MANAGER_ROLE) {
        _revokeRole(MEMBER_ROLE, member);
    }

    function _grantRole(bytes32 role, address account) internal virtual override {
        if (role == MEMBER_ROLE && hasRole(MEMBER_ROLE, account) == false) {
            registry.addMember(account);
            //sets the status of the member and perform sync
            IncomeGDAWrapper incomePool = incomePools[account];
            if (address(incomePool) != address(0)) incomePool.setVerifiedMember(true);
        }
        super._grantRole(role, account);
    }

    function _revokeRole(bytes32 role, address account) internal virtual override {
        if (role == MEMBER_ROLE && hasRole(MEMBER_ROLE, account)) {
            registry.removeMember(account);
            //sets the status of the member and perform sync
            IncomeGDAWrapper incomePool = incomePools[account];
            if (address(incomePool) != address(0)) incomePool.setVerifiedMember(false);
        }
        super._revokeRole(role, account);
    }
}
