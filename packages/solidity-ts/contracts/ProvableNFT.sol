// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {StringsUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";

/**
    AN NFT that expects the matching IPFS data to be stored in abi encoded format, matching an array of EventData structs.
    The tokenid should equal the digest of the IPFS data in base 16
    The ipfs data is expected to be encoded in raw binary format and the hash of the digest is expected to be sha-256
    The full ipfs token uri is then f055120 + toHex(tokenId)


 */
contract ProvableNFT is ERC721Upgradeable, AccessControlUpgradeable {
    error BAD_MULTIHASH(bytes cidv1);
    error BAD_DATAHASH(bytes32 dataHash, bytes32 tokenId);
    error NOT_MINTER();
    error NOT_MANAGER(uint16);

    bytes32 public constant MINTER_ROLE = keccak256(abi.encodePacked("MINTER"));
    bytes16 private constant _SYMBOLS = "0123456789abcdef";

    struct EventData {
        uint16 eventType;
        uint16 subtype;
        uint256 quantity;
        address[] contributers;
    }

    mapping(uint256 => EventData[]) internal nftDatas;

    function initialize(
        string memory _name,
        string memory _symbol
    ) external initializer {
        __ERC721_init(_name, _symbol);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlUpgradeable, ERC721Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    modifier onlyMinter() {
        if (
            (hasRole(MINTER_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) == false
        ) {
            revert NOT_MINTER();
        }
        _;
    }

    modifier onlyManager(EventData[] memory _data) {
        for (uint i = 0; i < _data.length; i++) {
            if (
                hasRole(getManagerRole(_data[i].eventType), msg.sender) == false
            ) {
                revert NOT_MANAGER(_data[i].eventType);
            }
        }
        _;
    }

    /// @param _cidv1Base16 the CIDv1 of the ipfs data of the nft. expected cid first 5 bytes 0f01551220, prefix '0' to expand to length 37 bytes, f0 = base16, 55 = raw codec, 12 = sha2-256, 20 = len 34
    function mint(
        address _to,
        bytes memory _cidv1Base16
    ) public onlyMinter returns (uint256 tokenId) {
        if (
            _cidv1Base16.length != 37 ||
            _cidv1Base16[0] != 0x0f ||
            _cidv1Base16[1] != 0x01 ||
            _cidv1Base16[2] != 0x55 ||
            _cidv1Base16[3] != 0x12 ||
            _cidv1Base16[4] != 0x20
        ) revert BAD_MULTIHASH(_cidv1Base16);
        tokenId = toUint256(_cidv1Base16, 5);
        _safeMint(_to, tokenId);
    }

    /// @dev allows permissioned minting based on eventTypes. Requires the event data to be supplied so event type can be verified
    /// @param _cidv1Base16 the CIDv1 of the ipfs data of the nft. expected cid first 5 bytes 0f01551220, prefix '0' to expand to length 37 bytes, f0 = base16, 55 = raw codec, 12 = sha2-256, 20 = len 34
    /// @param _nftData the EventData[] struct
    function mintPermissioned(
        address _to,
        bytes memory _cidv1Base16,
        EventData[] memory _nftData,
        bool _withStore
    ) external onlyManager(_nftData) returns (uint256 tokenId) {
        tokenId = mint(_to, _cidv1Base16);
        proveNFTData(tokenId, _nftData); //this will verify the data matches the hash/tokenId
        if (_withStore) {
            EventData[] storage store = nftDatas[tokenId];
            // EventData[] storage store = nftDatas[tokenId];
            for (uint i = 0; i < _nftData.length; i++) {
                store.push(_nftData[i]);
            }
        }
    }

    function proveNFTData(
        uint256 _tokenId,
        EventData[] memory _nftData
    ) public view returns (EventData[] memory data) {
        _requireMinted(_tokenId);
        if (sha256(abi.encode(_nftData)) != bytes32(_tokenId))
            revert BAD_DATAHASH(
                sha256(abi.encode(_nftData)),
                bytes32(_tokenId)
            );

        return _nftData;
    }

    function getNFTData(
        uint256 _tokenId,
        uint256 _index
    ) external view returns (EventData memory) {
        return nftDatas[_tokenId][_index];
    }

    function addManager(address _manager, uint16 _eventType) external {
        grantRole(getManagerRole(_eventType), _manager);
    }

    function getManagerRole(
        uint16 _eventType
    ) public pure returns (bytes32 roleHash) {
        return keccak256(abi.encodePacked("MANAGER_", _eventType));
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, toHexString(tokenId, 32)))
                : "";
    }

    function toUint256(
        bytes memory _bytes,
        uint256 _start
    ) internal pure returns (uint256) {
        require(_bytes.length >= _start + 32, "toUint256_outOfBounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }

        return tempUint;
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(
        uint256 value,
        uint256 length
    ) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length);
        for (uint256 i = 2 * length; i > 0; --i) {
            buffer[i - 1] = _SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     *
     * fixed prefix for raw codec format with sha256 hash
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return "ipfs://f01551220";
    }
}
