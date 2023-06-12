// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/StdJson.sol";
import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import { ProvableNFT } from "contracts/ProvableNFT.sol";

contract ProvableNFTDeploy is Script {
  function setUp() public {}

  function run() public {
    vm.startBroadcast();
    ProvableNFT c = new ProvableNFT();
    bytes4 selector = bytes4(keccak256(bytes("initialize(string,string)")));
    bytes memory data = abi.encodeWithSelector(selector, "Climate Collective Direct Payments NFT", "CCDP-NFT");
    ERC1967Proxy p = new ERC1967Proxy(address(c), data);
    // string memory releases = vm.readFile("./releases/deployment.json");
    // bytes memory releaseJson = vm.parseJson(releases);

    // string memory obj1 = "deployed";
    // string memory json = vm.serializeAddress(obj1, "ProvableNFT", address(c));
    // json = vm.serializeAddress(releaseJson,vm.toString(block.chainid)+".ProvableNFT");
    vm.writeJson(vm.toString(address(p)), "./releases/deployment.json", string(abi.encodePacked(".", vm.toString(block.chainid), ".ProvableNFT")));

    vm.stopBroadcast();
  }
}
