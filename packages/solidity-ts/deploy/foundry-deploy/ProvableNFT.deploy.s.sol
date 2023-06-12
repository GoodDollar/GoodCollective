// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/External.sol";

import { ProvableNFT } from "contracts/ProvableNFT.sol";

contract ProvableNFTDeploy is Script {
  function setUp() public {}

  function run() public {
    vm.startBroadcast();
    ProvableNFT c = new ProvableNFT();
    string memory obj1 = "deployed";
    string memory json = vm.serializeAddress(obj1, "ProvableNFT", address(c));
    vm.writeJson("./releases/deployment.json", json);

    vm.stopBroadcast();
  }
}
