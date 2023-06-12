// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import { ProvableNFTDeploy } from "./ProvableNFT.deploy.s.sol";

contract DeployContracts is Script {
  function setUp() public {}

  function run() public {
    ProvableNFTDeploy yourContractDeploy = new ProvableNFTDeploy();
    yourContractDeploy.setUp();
    yourContractDeploy.run();
  }
}
