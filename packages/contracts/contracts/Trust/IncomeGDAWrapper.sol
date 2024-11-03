// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;
import { ISuperfluid, ISuperToken, SuperAppDefinitions } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { IGeneralDistributionAgreementV1, PoolConfig } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/gdav1/IGeneralDistributionAgreementV1.sol";
import { IConstantFlowAgreementV1 } from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";
import { ISuperfluidPool } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/gdav1/ISuperfluidPool.sol";
import { ISuperfluidToken, ISuperToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

import "hardhat/console.sol";

contract IncomeGDAWrapper {
    error NOT_MEMBER(address member);

    using SuperTokenV1Library for ISuperToken;
    ISuperfluidPool public pool;
    ISuperToken public token;
    address public owner;
    address public mainRecipient;
    bool public isVerifiedMember;

    function initialize(ISuperToken _token, address _recipient, address _owner) public {
        owner = _owner;
        token = _token;
        mainRecipient = _recipient;
        PoolConfig memory poolConfig;
        pool = token.createPool(address(this), poolConfig);
        token.updateMemberUnits(pool, _recipient, 1);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT OWNER");
        _;
    }

    function sync() public returns (int96 flowChange, int256 balanceAvailable) {
        if (isVerifiedMember == false) {
            require(token.distributeFlow(address(this), pool, 0), "stop distribute flow failed");
            return (0, 0);
        }

        int96 incoming = token.getGDANetFlowRate(address(this));
        // int96 incoming = token.getNetFlowRate(address(this));
        int96 flowRate = token.getFlowDistributionFlowRate(address(this), pool);

        if (incoming >= 0) {
            // increase or decrease flow rate to the gda pool
            flowRate += incoming;
            require(token.distributeFlow(address(this), pool, flowRate), "distribute flow failed");
        }
        console.log("distribute to income gda: %s %s", uint256(int256(flowRate)), uint256(int256(incoming)));

        (int256 balance, , , ) = token.realtimeBalanceOfNow(address(this));
        console.log("distribute to income gda balance of wrapper: %$", uint256(balance));

        if (balance > 0) token.distributeToPool(address(this), pool, uint256(balance));
        return (incoming, balance);
    }

    function setVerifiedMember(bool isVerified) external onlyOwner {
        isVerifiedMember = isVerified;
        sync();
    }

    function connectPool(ISuperfluidPool incomePool) external onlyOwner {
        if (token.isMemberConnected(address(incomePool), address(this))) return;
        token.connectPool(incomePool);
    }

    function updateShares(address[] memory members, uint128[] memory shares) external onlyOwner {
        for (uint256 i; i < members.length; i++) {
            token.updateMemberUnits(pool, members[i], shares[i]);
        }
    }
}
