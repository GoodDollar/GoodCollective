// SPDX-License-Identifier: MIT

pragma solidity >=0.8;
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract Recover is UUPSUpgradeable {
    function _authorizeUpgrade(address _impl) internal virtual override {
        require(msg.sender == 0x564193644236F6D9f3D3a3209975E51D32050612, "not owner");
    }

    function end() external {
        IERC20Upgradeable gd = IERC20Upgradeable(0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A);
        gd.transfer(0xC1dCdf8E70acB44CDbB688C91A4883Cf9052Ea9c, gd.balanceOf(address(this)));
    }
}
