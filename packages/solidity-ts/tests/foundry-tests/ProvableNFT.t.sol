// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../../contracts/ProvableNFT.sol";

contract ProvableNFTTest is Test {
  ProvableNFT public nft;

  function setUp() public {
    nft = new ProvableNFT();
    nft.initialize("Test", "T");
  }

  function sampleData1() internal pure returns (ProvableNFT.NFTData memory sampleData) {
    sampleData.nftUri = "uri";
    sampleData.nftType = 2;
    sampleData.version = 2;
    sampleData.events = new ProvableNFT.EventData[](1);
    address[] memory contributers = new address[](1);
    contributers[0] = 0xdA030751FF448Cf127911f0518a2B9b012f72424;
    sampleData.events[0].subtype = 1;
    sampleData.events[0].quantity = 1;
    sampleData.events[0].timestamp = 1;
    sampleData.events[0].eventUri = "uri2";
    sampleData.events[0].contributers = contributers;
  }

  function test_correct_uri_and_owner() public {
    ProvableNFT.NFTData memory sample = sampleData1();
    bytes32 dh = keccak256(abi.encode(sample));
    nft.mint(msg.sender, "ipfs://1243", dh);
    assertEq(nft.tokenURI(uint256(dh)), "ipfs://1243");
    assertEq(nft.ownerOf(uint256(uint256(dh))), msg.sender);
  }

  function test_proveNFTData_should_fail() public {
    nft.mint(msg.sender, "", hex"5041bf1f713df204784353e82f6a4a535931cb64f1f4b4a5aeaffcb720918b22");

    ProvableNFT.NFTData memory sample = sampleData1();
    vm.expectRevert();

    nft.proveNFTData(0x5041bf1f713df204784353e82f6a4a535931cb64f1f4b4a5aeaffcb720918b22, sample);
  }

  function test_proveNFTData_should_pass() public {
    ProvableNFT.NFTData memory sample = sampleData1();
    bytes32 dh = keccak256(abi.encode(sample));

    nft.mint(msg.sender, "", dh);

    ProvableNFT.NFTData memory data = nft.proveNFTData(uint256(dh), sample);
    assertEq(data.nftUri, "uri");
    assertEq(data.nftType, 2);
    assertEq(data.version, 2);
    assertEq(data.events[0].subtype, 1);
    assertEq(data.events[0].quantity, 1);
    assertEq(data.events[0].timestamp, 1);
    assertEq(data.events[0].eventUri, "uri2");
    assertEq(data.events[0].contributers[0], 0xdA030751FF448Cf127911f0518a2B9b012f72424);
  }

  function test_mintPermissioned_non_manager_should_fail() public {
    ProvableNFT.NFTData memory sample = sampleData1();
    vm.expectRevert();
    hoax(0xd1891dD9DFF0784baa1dEb361dDFCAa5aE49cc6F);

    nft.mintPermissioned(msg.sender, sample, false);
  }

  function test_mintPermissioned_manager_should_pass() public {
    ProvableNFT.NFTData memory sample = sampleData1();

    nft.grantRole(keccak256(abi.encodePacked("MANAGER_", sample.nftType)), 0xd1891dD9DFF0784baa1dEb361dDFCAa5aE49cc6F);

    hoax(address(0xd1891dD9DFF0784baa1dEb361dDFCAa5aE49cc6F), 100);

    nft.mintPermissioned(msg.sender, sample, false);
  }

  function test_mintPermissioned_manager_should_store_data() public {
    ProvableNFT.NFTData memory sample = sampleData1();

    uint256 tokenId = nft.mintPermissioned(msg.sender, sample, true);
    ProvableNFT.NFTData memory nftData = nft.getNFTData(tokenId);
    ProvableNFT.EventData memory data = nft.getNFTEvent(tokenId, 0);
    ProvableNFT.EventData[] memory datas = nft.getNFTEvents(tokenId);

    assertEq(nftData.nftUri, "uri", "uri");
    assertEq(nftData.nftType, 2, "type");
    assertEq(nftData.version, 2, "version");
    assertEq(abi.encode(nftData.events), abi.encode(datas));

    assertEq(abi.encode(data), abi.encode(datas[0]));
    assertEq(datas[0].subtype, 1);
    assertEq(datas[0].quantity, 1);
    assertEq(datas[0].timestamp, 1);
    assertEq(datas[0].eventUri, "uri2");
    assertEq(datas[0].contributers[0], 0xdA030751FF448Cf127911f0518a2B9b012f72424);
  }
}
