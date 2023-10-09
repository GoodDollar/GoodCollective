// SPDX-License-Identifier: MIT
pragma solidity >=0.8;
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { IERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import { IERC721ReceiverUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";

import { ProvableNFT } from "./ProvableNFT.sol";
import { DirectPaymentsFactory } from "./DirectPaymentsFactory.sol";
import "../GoodCollective/GoodCollectiveSuperApp.sol";

interface IMembersValidator {
    function isMemberValid(
        address pool,
        address operator,
        address member,
        bytes memory extraData
    ) external returns (bool);
}

interface IIdentityV2 {
    function getWhitelistedRoot(address member) external returns (address);
}

/**
 - optional members validator (but need atleast uniqueness or members)
 - anyone can claim an nfttype
 - project id at the registery?
 - factory -> register the pool, claim nfttype, deploy pool
 - events
 */
contract DirectPaymentsPool is
    IERC721ReceiverUpgradeable,
    AccessControlUpgradeable,
    GoodCollectiveSuperApp,
    UUPSUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;
    error NOT_MANAGER();
    error ALREADY_CLAIMED(uint256);
    error NFT_MISSING(uint256);
    error OVER_MEMBER_LIMITS(address);
    error OVER_GLOBAL_LIMITS();
    error UNSUPPORTED_NFT();
    error NO_BALANCE();
    error NFTTYPE_CHANGED();
    error EMPTY_MANAGER();

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");

    event PoolCreated(
        address indexed pool,
        string indexed projectId,
        string ipfs,
        uint32 indexed nftType,
        DirectPaymentsPool.PoolSettings poolSettings,
        DirectPaymentsPool.SafetyLimits poolLimits
    );

    event PoolSettingsChanged(PoolSettings settings);
    event PoolLimitsChanged(SafetyLimits limits);
    event EventRewardClaimed(
        uint256 indexed tokenId,
        uint16 eventType,
        uint32 eventTimestamp,
        uint256 eventQuantity,
        string eventUri,
        address[] contributers,
        uint256 rewardPerContributer
    );
    event NFTClaimed(uint256 indexed tokenId, uint256 totalRewards);
    event NOT_MEMBER_OR_WHITELISTED(address contributer);

    // Define functions
    struct PoolSettings {
        uint32 nftType;
        uint16[] validEvents;
        uint128[] rewardPerEvent;
        address manager;
        IMembersValidator membersValidator;
        IIdentityV2 uniquenessValidator;
        IERC20Upgradeable rewardToken;
        bool allowRewardOverride;
    }

    struct SafetyLimits {
        uint maxTotalPerMonth;
        uint256 maxMemberPerMonth;
        uint256 maxMemberPerDay;
    }

    struct LimitsData {
        uint128 daily;
        uint128 monthly;
        uint128 total;
        uint64 lastReward;
        uint64 lastMonth;
    }

    PoolSettings public settings;
    SafetyLimits public limits;
    ProvableNFT public nft;

    mapping(uint256 => bool) public claimedNfts;
    mapping(address => bool) private members_unused; // using access control instead
    mapping(address => LimitsData) public memberLimits;
    LimitsData public globalLimits;
    DirectPaymentsFactory public registry;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(ISuperfluid _host, ISwapRouter _swapRouter) GoodCollectiveSuperApp(_host, _swapRouter) {}

    /**
     * @dev Authorizes an upgrade for the implementation contract.
     * @param impl The address of the new implementation contract.
     */
    function _authorizeUpgrade(address impl) internal virtual override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function getRegistry() public view override returns (DirectPaymentsFactory) {
        return DirectPaymentsFactory(registry);
    }

    /**
     * @dev Initializes the contract with the given settings and limits.
     * @param _nft The ProvableNFT contract address.
     * @param _settings The PoolSettings struct containing pool settings.
     * @param _limits The SafetyLimits struct containing safety limits.
     */
    function initialize(
        ProvableNFT _nft,
        PoolSettings memory _settings,
        SafetyLimits memory _limits,
        DirectPaymentsFactory _registry
    ) external initializer {
        registry = _registry;
        settings = _settings;
        limits = _limits;
        nft = _nft;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _settings.manager);
        setSuperToken(ISuperToken(address(settings.rewardToken)));
    }

    function upgradeToLatest(bytes memory data) external payable virtual {
        address impl = address(DirectPaymentsFactory(registry).impl());
        _authorizeUpgrade(impl);
        _upgradeToAndCallUUPS(impl, data, false);
    }

    /**
     * @dev Claims rewards for the specified NFT ID.
     * @param _nftId The ID of the NFT to claim rewards for.
     */
    function claim(uint256 _nftId) external {
        claim(_nftId, nft.getNFTData(_nftId));
    }

    /**
     * @dev Claims rewards for a given NFT ID and its associated data.
     * @param _nftId The ID of the NFT to claim rewards for.
     * @param _data The associated data for the NFT.
     * Emits a {ALREADY_CLAIMED} error if the NFT has already been claimed.
     * Emits a {NFT_MISSING} error if the NFT is not owned by this contract.
     */

    function claim(uint256 _nftId, ProvableNFT.NFTData memory _data) public {
        nft.proveNFTData(_nftId, _data);
        if (claimedNfts[_nftId]) revert ALREADY_CLAIMED(_nftId);

        // TODO: should pool own the NFTs?
        // if (settings.collectNfts && nft.ownerOf(_nftId) != address(this)) revert NFT_MISSING(_nftId);

        _claim(_nftId, _data);
    }

    /**
     * @dev Claims rewards for the specified NFT ID.
     * @param _nftId The ID of the NFT to claim rewards for.
     * @param _data The NFTData struct containing data about the NFT.
     */
    function _claim(uint256 _nftId, ProvableNFT.NFTData memory _data) internal {
        claimedNfts[_nftId] = true;
        uint totalRewards;
        uint rewardsBalance = settings.rewardToken.balanceOf(address(this));

        bool allowRewardOverride = settings.allowRewardOverride;
        for (uint256 i = 0; i < _data.events.length; i++) {
            uint reward = (
                allowRewardOverride && _data.events[i].rewardOverride > 0
                    ? _data.events[i].rewardOverride
                    : _eventReward(_data.events[i].subtype)
            ) * _data.events[i].quantity;
            if (reward > 0) {
                totalRewards += reward;
                if (totalRewards > rewardsBalance) revert NO_BALANCE();
                rewardsBalance -= totalRewards;
                _sendReward(_data.events[i].contributers, uint128(reward));
                emit EventRewardClaimed(
                    _nftId,
                    _data.events[i].subtype,
                    _data.events[i].timestamp,
                    _data.events[i].quantity,
                    _data.events[i].eventUri,
                    _data.events[i].contributers,
                    uint128(reward / _data.events[i].contributers.length)
                );
            }
        }

        emit NFTClaimed(_nftId, totalRewards);
    }

    /**
     * @dev Returns the reward amount for the specified event type.
     * @param _eventType The type of the event to get the reward for.
     * @return reward amount for the specified event type.
     */
    function _eventReward(uint16 _eventType) internal view returns (uint128 reward) {
        for (uint i = 0; i < settings.validEvents.length; i++) {
            if (_eventType == settings.validEvents[i]) return settings.rewardPerEvent[i];
        }
        return 0;
    }

    /**
     * @dev Sends rewards to the specified recipients.
     * @param recipients The addresses of the recipients to send rewards to.
     * @param reward The total amount of rewards to send.
     */
    function _sendReward(address[] memory recipients, uint128 reward) internal {
        uint128 perReward = uint128(reward / recipients.length);
        uint128 totalSent;
        for (uint i = 0; i < recipients.length; i++) {
            bool valid = _enforceAndUpdateMemberLimits(recipients[i], perReward);
            if (valid) {
                settings.rewardToken.safeTransfer(recipients[i], perReward);
                totalSent += perReward;
            } else {
                emit NOT_MEMBER_OR_WHITELISTED(recipients[i]);
            }
        }
        _enforceAndUpdateGlobalLimits(totalSent);
    }

    /**
     * @dev Enforces and updates the reward limits for the specified member.
     * @param member The address of the member to enforce and update limits for.
     * @param reward The amount of rewards to enforce and update limits for.
     */
    function _enforceAndUpdateMemberLimits(address member, uint128 reward) internal returns (bool) {
        //dont revert on non valid members, just dont reward them (their reward is lost)
        if (_addMember(member, "") == false) {
            return false;
        }

        uint64 curMonth = _month();
        if (memberLimits[member].lastReward + 60 * 60 * 24 < block.timestamp) //more than a day passed since last reward
        {
            memberLimits[member].daily = reward;
        } else {
            memberLimits[member].daily += reward;
        }

        if (memberLimits[member].lastMonth < curMonth) //month switched
        {
            memberLimits[member].monthly = reward;
        } else {
            memberLimits[member].monthly += reward;
        }

        memberLimits[member].total += reward;
        memberLimits[member].lastReward = uint64(block.timestamp);
        memberLimits[member].lastMonth = curMonth;

        if (
            memberLimits[member].daily > limits.maxMemberPerDay ||
            memberLimits[member].monthly > limits.maxMemberPerMonth
        ) revert OVER_MEMBER_LIMITS(member);

        return true;
    }

    /**
     * @dev Enforces and updates the global reward limits.
     * @param reward The amount of rewards to enforce and update limits for.
     */
    function _enforceAndUpdateGlobalLimits(uint128 reward) internal {
        uint64 curMonth = _month();

        if (globalLimits.lastReward + 60 * 60 * 24 < block.timestamp) //more than a day passed since last reward
        {
            globalLimits.daily = reward;
        } else {
            globalLimits.daily += reward;
        }

        if (globalLimits.lastMonth < curMonth) //month switched
        {
            globalLimits.monthly = reward;
        } else {
            globalLimits.monthly += reward;
        }

        globalLimits.total += reward;
        globalLimits.lastReward = uint64(block.timestamp);
        globalLimits.lastMonth = curMonth;

        if (globalLimits.monthly > limits.maxTotalPerMonth) revert OVER_GLOBAL_LIMITS();
    }

    /**
     * @dev Returns the current month.
     * @return month current month as a uint64 value.
     */
    function _month() internal view returns (uint64 month) {
        return uint64(block.timestamp / (60 * 60 * 24 * 30));
    }

    /**
     * @dev Adds a member to the contract.
     * @param member The address of the member to add.
     * @param extraData Additional data to validate the member.
     */

    function _addMember(address member, bytes memory extraData) internal returns (bool isMember) {
        if (hasRole(MEMBER_ROLE, member)) return true;

        if (address(settings.uniquenessValidator) != address(0)) {
            address rootAddress = settings.uniquenessValidator.getWhitelistedRoot(member);
            if (rootAddress == address(0)) return false;
        }

        // if no members validator then anyone can join the pool
        if (address(settings.membersValidator) != address(0)) {
            if (settings.membersValidator.isMemberValid(address(this), msg.sender, member, extraData) == false) {
                return false;
            }
        }

        _setupRole(MEMBER_ROLE, member);
        return true;
    }

    function mintNFT(address _to, ProvableNFT.NFTData memory _nftData, bool withClaim) external onlyRole(MINTER_ROLE) {
        uint nftId = nft.mintPermissioned(_to, _nftData, true, "");
        if (withClaim) {
            claim(nftId, _nftData);
        }
    }

    /**
     * @dev Receives an ERC721 token
     * @param operator The address of the operator that sent the token.
     * @param from The address of the sender that sent the token.
     * @param tokenId The ID of the token received.
     * @param data Additional data to trigger a claim for rewards.
     * @return A bytes4 value indicating success or failure.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        // bool triggerClaim;
        // if (data.length > 0) (triggerClaim) = abi.decode(data, (bool));
        // if (triggerClaim) {
        //   ProvableNFT.NFTData memory nftData = nft.getNFTData(tokenId);
        //   if (nftData.nftType > 0) // check the nftData is actually stored on-chain, otherwise claim will not work
        //   {
        //     claim(tokenId, nftData);
        //   }
        // }
        ProvableNFT.NFTData memory nftData = nft.getNFTData(tokenId);
        if (nftData.nftType != settings.nftType) revert UNSUPPORTED_NFT();
        return DirectPaymentsPool.onERC721Received.selector;
    }

    /**
     * @dev Sets the safety limits for the pool.
     * @param _limits The new safety limits.
     */
    function setPoolLimits(SafetyLimits memory _limits) public onlyRole(DEFAULT_ADMIN_ROLE) {
        limits = _limits;
        emit PoolLimitsChanged(_limits);
    }

    /**
     * @dev Sets the settings for the pool.
     * @param _settings The new pool settings.
     */
    function setPoolSettings(PoolSettings memory _settings) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_settings.nftType != settings.nftType) revert NFTTYPE_CHANGED();
        if (_settings.manager == address(0)) revert EMPTY_MANAGER();

        _revokeRole(DEFAULT_ADMIN_ROLE, settings.manager);
        settings = _settings;
        _setupRole(DEFAULT_ADMIN_ROLE, _settings.manager);
        emit PoolSettingsChanged(_settings);
    }
}
