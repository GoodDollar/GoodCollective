// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {StringsUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
    An NFT that can store data related to actions, the data is stored on-chain or as hash of the content that can later be proved.
 */
contract ProvableNFT is ERC721Upgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    error BAD_DATAHASH(bytes32 dataHash, bytes32 tokenId);
    error NOT_MINTER();
    error NOT_MANAGER(uint32);
    error BAD_NFTTYPE();

    bytes32 public constant MINTER_ROLE = keccak256(abi.encodePacked("MINTER"));
    bytes16 private constant _SYMBOLS = "0123456789abcdef";

    struct EventData {
        uint16 subtype;
        uint32 timestamp;
        uint256 quantity;
        string eventUri; //extra data related to event
        address[] contributers;
    }

    struct NFTData {
        uint32 nftType; //should be non zero
        uint16 version;
        string nftUri; //extra data related to nft
        EventData[] events;
    }

    mapping(uint256 => NFTData) internal nftDatas;

    function initialize(string memory _name, string memory _symbol) external initializer {
        __ERC721_init(_name, _symbol);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function _authorizeUpgrade(address newimpl) internal virtual override onlyManager(0) {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControlUpgradeable, ERC721Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    modifier onlyManager(uint32 nftType) {
        if (
            ((nftType > 0 && hasRole(getManagerRole(nftType), msg.sender)) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) == false
        ) {
            revert NOT_MANAGER(nftType);
        }
        _;
    }

    /**
     * @dev Mint a new NFT with the given URI and data hash.
     *
     * Requirements:
     * - The caller must have the `Manager` role.
     *
     * Emits a {Transfer} event and a {URI} event.
     *
     * @param _to The address that will receive the minted NFT.
     * @param _uri The URI for the NFT's metadata.
     * @param _nftDataHash The hash of the NFT's data.
     * @return tokenId ID of the newly minted NFT.
     */
    function mint(
        address _to,
        string memory _uri,
        bytes32 _nftDataHash
    ) public onlyManager(0) returns (uint256 tokenId) {
        return _mint(_to, _uri, _nftDataHash, ""); //send false in calldata, assuming default receiver is a directpaymentspool. without nft data on chain it will fail.
    }

    function _mint(
        address _to,
        string memory _uri,
        bytes32 _nftDataHash,
        bytes memory _callData
    ) internal returns (uint256 tokenId) {
        tokenId = uint256(_nftDataHash);
        nftDatas[tokenId].nftUri = _uri;
        _safeMint(_to, tokenId, _callData);
    }

    /**
     * @dev Mint a new permissioned NFT with the given data.
     *
     * This function is only accessible to users with the `Manager` role for the given NFT type.
     *
     * Stores nftData in contract storage if `_withStore` is true.
     *
     * @param _to The address that will receive the minted NFT.
     * @param _nftData The data for the NFT.
     * @param _withStore Whether or not to store the NFT data in the contract.
     * @param _callData call data to pass to erc721receiver
     * @return tokenId ID of the newly minted NFT.
     */
    function mintPermissioned(
        address _to,
        NFTData memory _nftData,
        bool _withStore,
        bytes memory _callData
    ) external onlyManager(_nftData.nftType) returns (uint256 tokenId) {
        if (_nftData.nftType == 0) revert BAD_NFTTYPE();

        bytes32 dataHash = keccak256(abi.encode(_nftData));
        tokenId = uint256(dataHash);
        if (_withStore) {
            NFTData storage store = nftDatas[tokenId];
            store.nftUri = _nftData.nftUri;
            store.nftType = _nftData.nftType;
            store.version = _nftData.version;
            for (uint256 i = 0; i < _nftData.events.length; i++) {
                store.events.push(_nftData.events[i]);
            }
        }
        _mint(_to, _nftData.nftUri, dataHash, _callData);
    }

    function proveNFTData(uint256 _tokenId, NFTData memory _nftData) public view returns (NFTData memory data) {
        _requireMinted(_tokenId);
        if (keccak256(abi.encode(_nftData)) != bytes32(_tokenId))
            revert BAD_DATAHASH(keccak256(abi.encode(_nftData)), bytes32(_tokenId));

        return _nftData;
    }

    function getNFTData(uint256 _tokenId) external view returns (NFTData memory) {
        return nftDatas[_tokenId];
    }

    function getNFTEvent(uint256 _tokenId, uint256 _index) external view returns (EventData memory) {
        return nftDatas[_tokenId].events[_index];
    }

    function getNFTEvents(uint256 _tokenId) external view returns (EventData[] memory) {
        return nftDatas[_tokenId].events;
    }

    function addManager(address _manager, uint32 _nftType) external {
        grantRole(getManagerRole(_nftType), _manager);
    }

    function getManagerRole(uint32 _nftType) public pure returns (bytes32 roleHash) {
        return keccak256(abi.encodePacked("MANAGER_", _nftType));
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, nftDatas[tokenId].nftUri))
                : nftDatas[tokenId].nftUri;
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return "";
    }
}
