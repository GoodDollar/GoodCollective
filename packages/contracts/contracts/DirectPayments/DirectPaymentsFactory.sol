// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// import the DirectPayments contract
import "./DirectPaymentsPool.sol";
import "./ProvableNFT.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// import "hardhat/console.sol";

contract DirectPaymentsFactory is AccessControlUpgradeable, UUPSUpgradeable {
    error NOT_PROJECT_OWNER();
    error NOT_POOL();

    event PoolCreated(
        address indexed pool,
        string indexed projectId,
        string ipfs,
        uint32 indexed nftType,
        DirectPaymentsPool.PoolSettings poolSettings,
        DirectPaymentsPool.SafetyLimits poolLimits
    );

    event PoolDetailsChanged(address indexed pool, string ipfs);
    event PoolVerifiedChanged(address indexed pool, bool isVerified);
    event UpdatedImpl(address indexed impl);

    struct PoolRegistry {
        string ipfs;
        bool isVerified;
        string projectId;
    }

    UpgradeableBeacon public impl;
    ProvableNFT public nft;
    uint32 public nextNftType;

    mapping(address => PoolRegistry) public registry;
    mapping(bytes32 => DirectPaymentsPool) public projectIdToControlPool;

    address public feeRecipient;
    uint32 public feeBps;

    mapping(address => address[]) public memberPools;
    address[] public pools;

    modifier onlyProjectOwnerOrNon(string memory projectId) {
        DirectPaymentsPool controlPool = projectIdToControlPool[keccak256(bytes(projectId))];
        // console.log("result %s", controlPool.hasRole(controlPool.DEFAULT_ADMIN_ROLE(), msg.sender));
        if (address(controlPool) != address(0)) {
            if (controlPool.hasRole(controlPool.DEFAULT_ADMIN_ROLE(), msg.sender) == false) {
                revert NOT_PROJECT_OWNER();
            }
        }
        _;
    }

    modifier onlyPoolOwner(DirectPaymentsPool pool) {
        if (pool.hasRole(pool.DEFAULT_ADMIN_ROLE(), msg.sender) == false) {
            revert NOT_PROJECT_OWNER();
        }

        _;
    }

    modifier onlyPool() {
        if (bytes(registry[msg.sender].projectId).length == 0) {
            revert NOT_POOL();
        }
        _;
    }

    function _authorizeUpgrade(address _impl) internal virtual override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function initialize(
        address _owner,
        address _dpimpl,
        ProvableNFT _nft,
        address _feeRecipient,
        uint32 _feeBps
    ) external initializer {
        nextNftType = 1;
        impl = new UpgradeableBeacon(_dpimpl);
        nft = _nft;
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;

        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
    }

    //TODO: implement a pool that's auto upgradeable using beacon method
    function createBeaconPool(
        string memory _projectId,
        string memory _ipfs,
        DirectPaymentsPool.PoolSettings memory _settings,
        DirectPaymentsPool.SafetyLimits memory _limits
    ) external onlyProjectOwnerOrNon(_projectId) returns (DirectPaymentsPool pool) {
        return _createPool(_projectId, _ipfs, _settings, _limits, true);
    }

    function createPool(
        string memory _projectId,
        string memory _ipfs,
        DirectPaymentsPool.PoolSettings memory _settings,
        DirectPaymentsPool.SafetyLimits memory _limits
    ) external onlyProjectOwnerOrNon(_projectId) returns (DirectPaymentsPool pool) {
        return _createPool(_projectId, _ipfs, _settings, _limits, false);
    }

    function _createPool(
        string memory _projectId,
        string memory _ipfs,
        DirectPaymentsPool.PoolSettings memory _settings,
        DirectPaymentsPool.SafetyLimits memory _limits,
        bool useBeacon
    ) internal returns (DirectPaymentsPool pool) {
        //TODO: add check if msg.sender is whitelisted

        _settings.nftType = nextNftType;
        bytes memory initCall = abi.encodeCall(DirectPaymentsPool.initialize, (nft, _settings, _limits, this));

        if (useBeacon) {
            pool = DirectPaymentsPool(address(new BeaconProxy(address(impl), initCall)));
        } else {
            pool = DirectPaymentsPool(address(new ERC1967Proxy(impl.implementation(), initCall)));
        }

        nft.grantRole(nft.getManagerRole(nextNftType), address(pool));

        //access control to project is determinted by the first pool access control rules
        if (address(projectIdToControlPool[keccak256(bytes(_projectId))]) == address(0))
            projectIdToControlPool[keccak256(bytes(_projectId))] = pool;
        registry[address(pool)].ipfs = _ipfs;
        registry[address(pool)].projectId = _projectId;

        pool.grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        pool.renounceRole(DEFAULT_ADMIN_ROLE, address(this));
        pools.push(address(pool));

        emit PoolCreated(address(pool), _projectId, _ipfs, nextNftType, _settings, _limits);

        nextNftType++;
    }

    function changePoolDetails(DirectPaymentsPool _pool, string memory _ipfs) external onlyPoolOwner(_pool) {
        registry[address(_pool)].ipfs = _ipfs;
        emit PoolDetailsChanged(address(_pool), _ipfs);
    }

    function setVerified(DirectPaymentsPool _pool, bool _isVerified) external onlyRole(DEFAULT_ADMIN_ROLE) {
        registry[address(_pool)].isVerified = _isVerified;
        emit PoolVerifiedChanged(address(_pool), _isVerified);
    }

    function updateImpl(address _impl) external onlyRole(DEFAULT_ADMIN_ROLE) {
        impl.upgradeTo(_impl);
        emit UpdatedImpl(_impl);
    }

    function setFeeInfo(address _feeRecipient, uint32 _feeBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        feeBps = _feeBps;
        feeRecipient = _feeRecipient;
    }

    function addMember(address member) external onlyPool {
        memberPools[member].push(msg.sender);
    }

    function removeMember(address member) external onlyPool {
        for (uint i = 0; i < memberPools[member].length; i++) {
            if (memberPools[member][i] == msg.sender) {
                memberPools[member][i] = memberPools[member][memberPools[member].length - 1];
                memberPools[member].pop();
            }
        }
    }
}
