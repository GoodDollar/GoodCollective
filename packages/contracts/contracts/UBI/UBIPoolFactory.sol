// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// import the DirectPayments contract
import "./UBIPool.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "hardhat/console.sol";

contract UBIPoolFactory is AccessControlUpgradeable, UUPSUpgradeable {
    error NOT_PROJECT_OWNER();
    error NOT_POOL();

    event PoolCreated(
        address indexed pool,
        string indexed projectId,
        string ipfs,
        UBIPool.PoolSettings poolSettings,
        UBIPool.UBISettings poolLimits
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

    mapping(address => PoolRegistry) public registry;
    mapping(bytes32 => UBIPool) public projectIdToControlPool;

    address public feeRecipient;
    uint32 public feeBps;

    mapping(address => address[]) public memberPools;
    address[] public pools;

    modifier onlyProjectOwnerOrNon(string memory projectId) {
        UBIPool controlPool = projectIdToControlPool[keccak256(bytes(projectId))];
        // console.log("result %s", controlPool.hasRole(controlPool.DEFAULT_ADMIN_ROLE(), msg.sender));
        if (address(controlPool) != address(0)) {
            if (controlPool.hasRole(controlPool.DEFAULT_ADMIN_ROLE(), msg.sender) == false) {
                revert NOT_PROJECT_OWNER();
            }
        }
        _;
    }

    modifier onlyPoolOwner(UBIPool pool) {
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

    function initialize(address _owner, address _impl, address _feeRecipient, uint32 _feeBps) external initializer {
        impl = new UpgradeableBeacon(_impl);
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;

        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
    }

    function createManagedPool(
        string memory _projectId,
        string memory _ipfs,
        UBIPool.PoolSettings memory _settings,
        UBIPool.UBISettings memory _limits
    ) external onlyProjectOwnerOrNon(_projectId) returns (UBIPool pool) {
        return _createPool(_projectId, _ipfs, _settings, _limits, true);
    }

    function createPool(
        string memory _projectId,
        string memory _ipfs,
        UBIPool.PoolSettings memory _settings,
        UBIPool.UBISettings memory _limits
    ) external onlyProjectOwnerOrNon(_projectId) returns (UBIPool pool) {
        return _createPool(_projectId, _ipfs, _settings, _limits, false);
    }

    function _createPool(
        string memory _projectId,
        string memory _ipfs,
        UBIPool.PoolSettings memory _settings,
        UBIPool.UBISettings memory _limits,
        bool useBeacon
    ) internal returns (UBIPool pool) {
        //TODO: add check if msg.sender is whitelisted

        bytes memory initCall = abi.encodeWithSelector(UBIPool.initialize.selector, _settings, _limits, address(this));

        if (useBeacon) {
            pool = UBIPool(address(new BeaconProxy(address(impl), initCall)));
        } else {
            pool = UBIPool(address(new ERC1967Proxy(impl.implementation(), initCall)));
        }

        //access control to project is determinted by the first pool access control rules
        if (address(projectIdToControlPool[keccak256(bytes(_projectId))]) == address(0))
            projectIdToControlPool[keccak256(bytes(_projectId))] = pool;
        registry[address(pool)].ipfs = _ipfs;
        registry[address(pool)].projectId = _projectId;

        // restore creator ownership
        pool.grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        pool.renounceRole(DEFAULT_ADMIN_ROLE, address(this));
        pools.push(address(pool));
        emit PoolCreated(address(pool), _projectId, _ipfs, _settings, _limits);
    }

    function changePoolDetails(UBIPool _pool, string memory _ipfs) external onlyPoolOwner(_pool) {
        registry[address(_pool)].ipfs = _ipfs;
        emit PoolDetailsChanged(address(_pool), _ipfs);
    }

    function setVerified(UBIPool _pool, bool _isVerified) external onlyRole(DEFAULT_ADMIN_ROLE) {
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

    function addMember(address account) external onlyPool {
        memberPools[account].push(msg.sender);
    }

    function removeMember(address member) external onlyPool {
        for (uint i = 0; i < memberPools[member].length; i++) {
            if (memberPools[member][i] == msg.sender) {
                memberPools[member][i] = memberPools[member][memberPools[member].length - 1];
                memberPools[member].pop();
            }
        }
    }

    function getMemberPools(address member) external view returns (address[] memory) {
        return memberPools[member];
    }
}
