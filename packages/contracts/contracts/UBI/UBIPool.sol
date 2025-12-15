// SPDX-License-Identifier: MIT
pragma solidity >=0.8;
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { IERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {
    IERC721ReceiverUpgradeable
} from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";

import "../GoodCollective/GoodCollectiveSuperApp.sol";
import "./UBIPoolFactory.sol";
import "../Interfaces.sol";

contract UBIPool is AccessControlUpgradeable, GoodCollectiveSuperApp, UUPSUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    error CLAIMFOR_DISABLED();
    error NOT_MEMBER(address claimer);
    error NOT_MANAGER(address manager);
    error NOT_WHITELISTED(address whitelistedRoot);
    error ALREADY_CLAIMED(address whitelistedRoot);
    error INVALID_0_VALUE();
    error EMPTY_MANAGER();
    error MAX_MEMBERS_REACHED();
    error MAX_PERIOD_CLAIMERS_REACHED(uint256 claimers);
    error LENGTH_MISMATCH();

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    event PoolSettingsChanged(PoolSettings settings);
    event UBISettingsChanged(UBISettings settings);
    // Emits when daily ubi is calculated
    event UBICalculated(
        uint256 day,
        uint256 dailyUbi,
        uint256 blockNumber,
        uint256 periodClaimers,
        uint256 periodDistributed
    );

    //Emits whenever a new multi day cycle starts
    event UBICycleCalculated(uint256 day, uint256 pool, uint256 cycleLength, uint256 dailyUBIPool);

    event UBIClaimed(address indexed whitelistedRoot, address indexed claimer, uint256 amount);
    event MemberAdded(address indexed member);

    struct UBISettings {
        //number of days of each UBI pool cycle
        uint32 cycleLengthDays;
        //how often can someone claim their UBI
        uint32 claimPeriodDays;
        //minimum amount of users to divide the pool for, renamed from defaultDailyUbi
        uint32 minActiveUsers;
        // can you trigger claim for someone else
        bool claimForEnabled;
        // max daily claim amount
        uint maxClaimAmount;
        // max number of members in a pool
        uint32 maxMembers;
        bool onlyMembers;
    }

    struct PoolStatus {
        //current day of distribution
        uint256 currentDay;
        // Result of distribution formula
        // calculated each day
        uint256 dailyUbi;
        //the amount of G$ UBI pool for each day in the cycle to be divided by active users
        uint256 dailyCyclePool;
        //timestamp of current cycle start
        uint256 startOfCycle;
        //should be 0 for starters so distributionFormula detects new cycle on first day claim
        uint256 currentCycleLength;
        uint256 periodClaimers;
        uint256 periodDistributed;
        mapping(address => uint256) lastClaimed;
        uint32 membersCount;
    }

    struct ExtendedSettings {
        // max number of members that can claim in a day maxPeriodClaimers <= maxMembers
        uint32 maxPeriodClaimers;
        // min daily claim amount, daily amount will be 0 if <minClaimAmount
        uint minClaimAmount;
        // fees taken from income to the pool manager
        uint32 managerFeeBps;
    }

    PoolSettings public settings;
    UBISettings public ubiSettings;
    PoolStatus public status;

    UBIPoolFactory public registry;
    ExtendedSettings public extendedSettings;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(ISuperfluid _host, IV3SwapRouter _swapRouter) GoodCollectiveSuperApp(_host, _swapRouter) {}

    /**
     * @dev Authorizes an upgrade for the implementation contract.
     * @param impl The address of the new implementation contract.
     */
    function _authorizeUpgrade(address impl) internal virtual override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function getRegistry() public view override returns (IRegistry) {
        return IRegistry(address(registry));
    }

    function getManagerFee() public view override returns (address feeRecipient, uint32 feeBps) {
        return (settings.manager, extendedSettings.managerFeeBps);
    }

    /**
     * @dev Initializes the contract with the given settings and limits.
     * @param _settings The PoolSettings struct containing pool settings.
     * @param _ubiSettings The UBISettings struct containing safety limits.
     */
    function initialize(
        PoolSettings memory _settings,
        UBISettings memory _ubiSettings,
        ExtendedSettings memory _extendedSettings,
        UBIPoolFactory _registry
    ) external initializer {
        registry = _registry;
        settings = _settings;
        ubiSettings = _ubiSettings;
        extendedSettings = _extendedSettings;
        _verifyPoolSettings(_settings);
        _verifyUBISettings(_ubiSettings);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); // when using factory this gives factory role which then set role to the real msg.sender
        _setupRole(MANAGER_ROLE, _settings.manager);
        setSuperToken(ISuperToken(address(settings.rewardToken)));
    }

    function upgradeToLatest(bytes memory data) external payable virtual {
        address impl = address(UBIPoolFactory(address(registry)).impl());
        _authorizeUpgrade(impl);
        _upgradeToAndCallUUPS(impl, data, false);
    }

    function getCurrentDay() public view returns (uint256) {
        return (block.timestamp - 12 hours) / (1 days); //make day start at 12:00pm
    }

    /**
     * @dev The claim calculation formula. Divide the daily pool with
     * the sum of the active users.
     * the daily balance is determined by dividing current pool by the cycle length
     * @return The amount of GoodDollar the user can claim
     */
    function distributionFormula() public returns (uint256) {
        // once every claim cycle
        uint256 currentDay = getCurrentDay();
        if (currentDay >= status.currentDay + ubiSettings.claimPeriodDays) {
            (uint256 nextDailyPool, uint256 nextDailyUbi, bool newCycle) = _calcNextDailyUBI();
            if (newCycle) {
                uint256 currentBalance = settings.rewardToken.balanceOf(address(this));
                status.dailyCyclePool = nextDailyPool;
                status.currentCycleLength = ubiSettings.cycleLengthDays;
                status.startOfCycle = currentDay;
                emit UBICycleCalculated(currentDay, currentBalance, ubiSettings.cycleLengthDays, nextDailyPool);
            }

            status.currentDay = currentDay;
            status.dailyUbi = nextDailyUbi;
            if (status.dailyUbi <= extendedSettings.minClaimAmount) status.dailyUbi = 0;

            emit UBICalculated(
                currentDay,
                status.dailyUbi,
                block.number,
                status.periodClaimers,
                status.periodDistributed
            );
            status.periodClaimers = 0;
            status.periodDistributed = 0;
        }

        return status.dailyUbi;
    }

    function _calcNextDailyUBI() internal view returns (uint256 nextPeriodPool, uint256 nextDailyUbi, bool newCycle) {
        uint256 currentBalance = settings.rewardToken.balanceOf(address(this));
        //start early cycle if we can increase the daily UBI pool
        uint256 nextDailyPool = currentBalance / ubiSettings.cycleLengthDays;
        bool shouldStartEarlyCycle = nextDailyPool > (status.dailyCyclePool * 105) / 100 ||
            (currentDayInCycle() <= status.currentCycleLength &&
                currentBalance < (status.dailyCyclePool * (status.currentCycleLength - currentDayInCycle())));

        nextPeriodPool = status.dailyCyclePool;
        nextDailyUbi;
        if ((currentDayInCycle() + 1) >= status.currentCycleLength || shouldStartEarlyCycle) {
            //start of cycle or first time
            nextPeriodPool = currentBalance / ubiSettings.cycleLengthDays;
            newCycle = true;
        }

        nextDailyUbi = min(
            ubiSettings.maxClaimAmount,
            nextPeriodPool / max((status.periodClaimers * 10500) / 10000, ubiSettings.minActiveUsers)
        );

        if (nextDailyUbi < extendedSettings.minClaimAmount) nextDailyUbi = 0;
    }

    /**
     * @dev returns the day count since start of current cycle
     */
    function currentDayInCycle() public view returns (uint256) {
        return getCurrentDay() - status.startOfCycle;
    }

    function max(uint256 a, uint256 b) private pure returns (uint256) {
        return a >= b ? a : b;
    }

    function min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Claims UBI
     */
    function claim() external {
        _claim(msg.sender, true);
    }

    function claimFor(address claimer, bool sendToWhitelistedRoot) external {
        if (!ubiSettings.claimForEnabled) revert CLAIMFOR_DISABLED();

        _claim(claimer, sendToWhitelistedRoot);
    }

    /**
     * @dev Claims UBI
     * @param claimer the address of the claimer.
     */

    function _claim(address claimer, bool sendToWhitelistedRoot) internal {
        address whitelistedRoot = IIdentityV2(settings.uniquenessValidator).getWhitelistedRoot(claimer);
        if (whitelistedRoot == address(0)) revert NOT_WHITELISTED(claimer);

        // if open for anyone but has limits, we add the first claimers as members to handle the max claimers
        if ((ubiSettings.maxMembers > 0 && ubiSettings.onlyMembers == false)) _grantRole(MEMBER_ROLE, claimer);

        // check membership if has claimers limits or limited to members only
        if ((ubiSettings.maxMembers > 0 || ubiSettings.onlyMembers) && hasRole(MEMBER_ROLE, claimer) == false)
            revert NOT_MEMBER(claimer);

        if (extendedSettings.maxPeriodClaimers > 0 && status.periodClaimers >= extendedSettings.maxPeriodClaimers)
            revert MAX_PERIOD_CLAIMERS_REACHED(status.periodClaimers);

        // calculats the formula up today ie on day 0 there are no active users, on day 1 any user
        // (new or active) will trigger the calculation with the active users count of the day before
        // and so on. the new or inactive users that will become active today, will not take into account
        // within the calculation.
        uint256 dailyUbi = distributionFormula();

        // active user which has not claimed today yet, ie user last claimed < today
        if (status.lastClaimed[whitelistedRoot] == status.currentDay) revert ALREADY_CLAIMED(whitelistedRoot);

        status.lastClaimed[whitelistedRoot] = status.currentDay;
        status.periodClaimers += 1;
        status.periodDistributed += dailyUbi;

        settings.rewardToken.safeTransfer(sendToWhitelistedRoot ? whitelistedRoot : claimer, dailyUbi);

        emit UBIClaimed(whitelistedRoot, claimer, dailyUbi);
    }

    /**
     * @dev Adds a member to the contract.
     * @param member The address of the member to add.
     * @param extraData Additional data to validate the member.
     */

    function addMember(address member, bytes memory extraData) external returns (bool isMember) {
        if (address(settings.uniquenessValidator) != address(0)) {
            address rootAddress = settings.uniquenessValidator.getWhitelistedRoot(member);
            if (rootAddress == address(0)) revert NOT_WHITELISTED(member);
        }

        if (address(settings.membersValidator) != address(0) && hasRole(MANAGER_ROLE, msg.sender) == false) {
            if (settings.membersValidator.isMemberValid(address(this), msg.sender, member, extraData) == false) {
                revert NOT_MEMBER(member);
            }
        }
        // if no members validator then if members only only manager can add members
        else if (ubiSettings.onlyMembers && hasRole(MANAGER_ROLE, msg.sender) == false) {
            revert NOT_MANAGER(member);
        }

        _grantRole(MEMBER_ROLE, member);
        return true;
    }

    /**
     * @dev Adds multiple members to the pool in a single transaction.
     * @param members Array of member addresses to add.
     * @param extraData Array of additional validation data for each member.
     */
    function addMembers(address[] calldata members, bytes[] calldata extraData) external onlyRole(MANAGER_ROLE) {
        if (members.length != extraData.length) revert LENGTH_MISMATCH();

        for (uint i = 0; i < members.length; ) {
            address member = members[i];
            
            // Validate uniqueness if validator is set
            if (address(settings.uniquenessValidator) != address(0)) {
                address rootAddress = settings.uniquenessValidator.getWhitelistedRoot(member);
                if (rootAddress == address(0)) revert NOT_WHITELISTED(member);
            }

            // Validate with members validator if set (manager can bypass)
            if (address(settings.membersValidator) != address(0)) {
                if (!settings.membersValidator.isMemberValid(address(this), msg.sender, member, extraData[i])) {
                    revert NOT_MEMBER(member);
                }
            }

            _grantRole(MEMBER_ROLE, member);
            
            unchecked {
                ++i;
            }
        }
    }

    function removeMember(address member) external onlyRole(MANAGER_ROLE) {
        _revokeRole(MEMBER_ROLE, member);
    }



    function _grantRole(bytes32 role, address account) internal virtual override {
        if (role == MEMBER_ROLE && hasRole(MEMBER_ROLE, account) == false) {
            if (ubiSettings.maxMembers > 0 && status.membersCount > ubiSettings.maxMembers)
                revert MAX_MEMBERS_REACHED();
            registry.addMember(account);
            status.membersCount += 1;
        }
        super._grantRole(role, account);
    }

    function _revokeRole(bytes32 role, address account) internal virtual override {
        if (role == MEMBER_ROLE && hasRole(MEMBER_ROLE, account)) {
            status.membersCount -= 1;
            registry.removeMember(account);
        }
        super._revokeRole(role, account);
    }

    /**
     * @dev Sets the safety limits for the pool.
     * @param _ubiSettings The new safety limits.
     */
    function setUBISettings(
        UBISettings memory _ubiSettings,
        ExtendedSettings memory _extendedSettings
    ) public onlyRole(MANAGER_ROLE) {
        _verifyUBISettings(_ubiSettings);
        ubiSettings = _ubiSettings;
        extendedSettings = _extendedSettings;
        emit UBISettingsChanged(_ubiSettings);
    }

    function _verifyUBISettings(UBISettings memory _ubiSettings) internal pure {
        if (
            _ubiSettings.claimPeriodDays == 0 ||
            _ubiSettings.cycleLengthDays == 0 ||
            _ubiSettings.minActiveUsers == 0 ||
            _ubiSettings.maxClaimAmount == 0
        ) revert INVALID_0_VALUE();
    }

    /**
     * @dev Sets the settings for the pool.
     * @param _settings The new pool settings.
     */
    function setPoolSettings(PoolSettings memory _settings) public onlyRole(MANAGER_ROLE) {
        _verifyPoolSettings(_settings);

        if (_settings.manager != settings.manager) {
            _revokeRole(MANAGER_ROLE, settings.manager);
            _setupRole(MANAGER_ROLE, _settings.manager);
        }
        settings = _settings;
        emit PoolSettingsChanged(_settings);
    }

    function _verifyPoolSettings(PoolSettings memory _poolSettings) internal pure {
        if (
            _poolSettings.manager == address(0) ||
            address(_poolSettings.uniquenessValidator) == address(0) ||
            address(_poolSettings.rewardToken) == address(0)
        ) revert INVALID_0_VALUE();
    }

    function estimateNextDailyUBI() public view returns (uint256 nextDailyUbi) {
        (, nextDailyUbi, ) = _calcNextDailyUBI();
    }

    function checkEntitlement() public view returns (uint256) {
        return checkEntitlement(msg.sender);
    }

    /**
     * @dev Checks the amount which the sender address is eligible to claim for,
     * regardless if they have been whitelisted or not. In case the user is
     * active, then the current day must be equal to the actual day, i.e. claim
     * or fish has already been executed today.
     * @return The amount of GD tokens the address can claim.
     */
    function checkEntitlement(address _member) public view returns (uint256) {
        // current day has already been updated which means
        // that the dailyUbi has been updated
        if (status.currentDay == getCurrentDay() && status.dailyUbi > 0) {
            if (extendedSettings.maxPeriodClaimers > 0 && status.periodClaimers >= extendedSettings.maxPeriodClaimers)
                return 0;
            return hasClaimed(_member) ? 0 : status.dailyUbi;
        }
        return estimateNextDailyUBI();
    }

    function hasClaimed(address _member) public view returns (bool) {
        address whitelistedRoot = IIdentityV2(settings.uniquenessValidator).getWhitelistedRoot(_member);
        return status.lastClaimed[whitelistedRoot] == getCurrentDay();
    }

    function nextClaimTime() public view returns (uint256) {
        return (getCurrentDay() + ubiSettings.claimPeriodDays) * (1 days) + 12 hours;
    }
}
