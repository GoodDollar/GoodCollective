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
import { DirectPaymentsLibrary } from "./DirectPaymentsLibrary.sol";
import "../GoodCollective/GoodCollectiveSuperApp.sol";

interface IMembersValidator {
    function isMemberValid(
        address pool,
        address operator,
        address member,
        bytes memory extraData
    ) external view returns (bool);
}

interface IIdentityV2 {
    function getWhitelistedRoot(address member) external view returns (address);
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
    error BATCH_TOO_LARGE();

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");
    uint256 public constant MAX_BATCH_SIZE = 200;

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
    event NOT_MEMBER_OR_WHITELISTED_OR_LIMITS(address contributer);
    event MemberAdded(address indexed member);

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

    uint32 public managerFeeBps;

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
        return (settings.manager, managerFeeBps);
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
        uint32 _managerFeeBps,
        DirectPaymentsFactory _registry
    ) external initializer {
        registry = _registry;
        settings = _settings;
        limits = _limits;
        nft = _nft;
        managerFeeBps = _managerFeeBps;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); // when using factory this gives factory role which then set role to the real msg.sender
        _setupRole(MANAGER_ROLE, _settings.manager);
        _setupRole(MINTER_ROLE, _settings.manager);

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
        claimedNfts[_nftId] = true;
        // TODO: should pool own the NFTs?
        // if (settings.collectNfts && nft.ownerOf(_nftId) != address(this)) revert NFT_MISSING(_nftId);

        // Loop through the events in the NFT data and add members
        for (uint256 i = 0; i < _data.events.length; i++) {
            for (uint j = 0; j < _data.events[i].contributers.length; j++) {
                //dont revert on non valid members, just dont reward them (their reward is lost)
                _addMember(_data.events[i].contributers[j], "");
            }
        }
        DirectPaymentsLibrary._claim(globalLimits, limits, memberLimits, settings, _nftId, _data);
    }

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

        _grantRole(MEMBER_ROLE, member);
        return true;
    }

    /**
     * @dev Adds multiple members to the pool in a single transaction.
     * @param members Array of member addresses to add.
     * @param extraData Array of additional validation data for each member.
     */
    function addMembers(address[] calldata members, bytes[] calldata extraData) external {
        if (members.length > MAX_BATCH_SIZE) revert BATCH_TOO_LARGE();
        if (members.length != extraData.length) revert("Length mismatch");

        for (uint i = 0; i < members.length; ) {
            // Skip if already a member
            if (!hasRole(MEMBER_ROLE, members[i])) {
                // Validate uniqueness if validator is set
                bool isValid = true;
                if (address(settings.uniquenessValidator) != address(0)) {
                    address rootAddress = settings.uniquenessValidator.getWhitelistedRoot(members[i]);
                    if (rootAddress == address(0)) {
                        isValid = false;
                    }
                }

                // Validate with members validator if set
                if (isValid && address(settings.membersValidator) != address(0)) {
                    if (!settings.membersValidator.isMemberValid(address(this), msg.sender, members[i], extraData[i])) {
                        isValid = false;
                    }
                }

                // Grant role if valid (this triggers factory registry update)
                if (isValid) {
                    _grantRole(MEMBER_ROLE, members[i]);
                    emit MemberAdded(members[i]);
                }
            }
            
            unchecked { ++i; }
        }
    }

    function _grantRole(bytes32 role, address account) internal virtual override {
        if (role == MEMBER_ROLE) {
            registry.addMember(account);
        }
        super._grantRole(role, account);
    }

    function _revokeRole(bytes32 role, address account) internal virtual override {
        if (role == MEMBER_ROLE) {
            registry.removeMember(account);
        }
        super._revokeRole(role, account);
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
    function setPoolLimits(SafetyLimits memory _limits) public onlyRole(MANAGER_ROLE) {
        limits = _limits;
        emit PoolLimitsChanged(_limits);
    }

    /**
     * @dev Sets the settings for the pool.
     * @param _settings The new pool settings.
     */
    function setPoolSettings(PoolSettings memory _settings, uint32 _managerFeeBps) public onlyRole(MANAGER_ROLE) {
        managerFeeBps = _managerFeeBps;
        if (_settings.nftType != settings.nftType) revert NFTTYPE_CHANGED();
        if (_settings.manager == address(0)) revert EMPTY_MANAGER();

        _revokeRole(DEFAULT_ADMIN_ROLE, settings.manager);
        settings = _settings;
        _setupRole(DEFAULT_ADMIN_ROLE, _settings.manager);
        emit PoolSettingsChanged(_settings);
    }
}
