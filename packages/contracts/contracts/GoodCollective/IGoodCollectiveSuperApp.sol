// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IRegistry {
    function feeRecipient() external view returns (address);

    function feeBps() external view returns (uint32);
}

interface IGoodCollectiveSuperApp {
    struct Stats {
        uint256 netIncome; //without fees
        uint256 totalFees;
        uint256 lastUpdate;
        address lastFeeRecipient;
        int96 lastIncomeRate;
        address lastManagerFeeRecipient;
        uint256 protocolFees;
        uint256 managerFees;
        // adding fields MUST update GoodCollectiveSuperApp storage layout
    }

    function getAdminFee() external view returns (address admin, uint32 feeBps);
}
