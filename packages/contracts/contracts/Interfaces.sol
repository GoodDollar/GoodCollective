// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

interface IMembersValidator {
    function isMemberValid(
        address pool,
        address operator,
        address member,
        bytes memory extraData
    ) external returns (bool);
}

interface IIdentityV2 {
    function getWhitelistedRoot(address member) external view returns (address);
}

struct PoolSettings {
    address manager;
    IMembersValidator membersValidator;
    IIdentityV2 uniquenessValidator;
    IERC20Upgradeable rewardToken;
}
