// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// import the DirectPayments contract
import "./DirectPaymentsPool.sol";
import "./ProvableNFT.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "hardhat/console.sol";

contract DirectPaymentsFactory is AccessControlUpgradeable, UUPSUpgradeable {
  error NOT_PROJECT_OWNER();

  event PoolCreated(address indexed pool, string indexed projectId, string ipfs, uint32 indexed nftType);
  event PoolDetailsChanged(address indexed pool, string ipfs);
  event PoolVerifiedChanged(address indexed pool, bool isVerified);
  event UpdatedImpl(address indexed impl);

  struct PoolRegistry {
    string ipfs;
    bool isVerified;
    string projectId;
  }

  address public impl;
  ProvableNFT public nft;
  uint32 public nextNftType;

  mapping(address => PoolRegistry) public registry;
  mapping(bytes32 => DirectPaymentsPool) public projectIdToControlPool;

  modifier onlyProjectOwnerOrNon(string memory projectId) {
    DirectPaymentsPool controlPool = projectIdToControlPool[keccak256(bytes(projectId))];
    console.log("control:%s sender:%s %s", address(controlPool), msg.sender);
    // console.log("result %s", controlPool.hasRole(controlPool.DEFAULT_ADMIN_ROLE(), msg.sender));
    if (address(controlPool) != address(0)) {
      if (controlPool.hasRole(controlPool.DEFAULT_ADMIN_ROLE(), msg.sender) == false) {
        revert NOT_PROJECT_OWNER();
      }
    }
    _;
  }

  modifier onlyProjectOwnerByPool(DirectPaymentsPool pool) {
    string memory projectId = registry[address(pool)].projectId;
    DirectPaymentsPool controlPool = projectIdToControlPool[keccak256(bytes(projectId))];
    if (controlPool.hasRole(controlPool.DEFAULT_ADMIN_ROLE(), msg.sender) == false) {
      revert NOT_PROJECT_OWNER();
    }

    _;
  }

  function _authorizeUpgrade(address _impl) internal virtual override onlyRole(DEFAULT_ADMIN_ROLE) {}

  function initialize(address _owner, address _dpimpl, address _nftimpl) external initializer {
    nextNftType = 1;
    impl = _dpimpl;
    bytes memory initCall = abi.encodeWithSelector(ProvableNFT.initialize.selector, "DirectPayments NFT", "DPNFT");
    nft = ProvableNFT(address(new ERC1967Proxy(_nftimpl, initCall)));

    nft.grantRole(DEFAULT_ADMIN_ROLE, _owner);
    _setupRole(DEFAULT_ADMIN_ROLE, _owner);
  }

  function createPool(
    string memory _projectId,
    string memory _ipfs,
    DirectPaymentsPool.PoolSettings memory _settings,
    DirectPaymentsPool.SafetyLimits memory _limits
  ) external onlyProjectOwnerOrNon(_projectId) returns (DirectPaymentsPool pool) {
    //TODO: add check if msg.sender is whitelisted

    _settings.nftType = nextNftType;
    bytes memory initCall = abi.encodeWithSelector(DirectPaymentsPool.initialize.selector, nft, _settings, _limits);
    pool = DirectPaymentsPool(address(new ERC1967Proxy(impl, initCall)));

    nft.grantRole(nft.getManagerRole(nextNftType), _settings.manager);
    nft.grantRole(nft.getManagerRole(nextNftType), address(pool));
    pool.grantRole(pool.MINTER_ROLE(), _settings.manager);

    projectIdToControlPool[keccak256(bytes(_projectId))] = pool;
    registry[address(pool)].ipfs = _ipfs;
    registry[address(pool)].projectId = _projectId;

    pool.renounceRole(DEFAULT_ADMIN_ROLE, address(this));
    emit PoolCreated(address(pool), _projectId, _ipfs, nextNftType);

    nextNftType++;
  }

  function changePoolDetails(DirectPaymentsPool _pool, string memory _ipfs) external onlyProjectOwnerByPool(_pool) {
    registry[address(_pool)].ipfs = _ipfs;
    emit PoolDetailsChanged(address(_pool), _ipfs);
  }

  function setVerified(DirectPaymentsPool _pool, bool _isVerified) external onlyRole(DEFAULT_ADMIN_ROLE) {
    registry[address(_pool)].isVerified = _isVerified;
    emit PoolVerifiedChanged(address(_pool), _isVerified);
  }

  function updateImpl(address _impl) external onlyRole(DEFAULT_ADMIN_ROLE) {
    impl = _impl;
    emit UpdatedImpl(_impl);
  }
}
