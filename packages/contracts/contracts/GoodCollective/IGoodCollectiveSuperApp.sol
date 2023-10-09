// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IGoodCollectiveSuperApp {
    struct Stats {
        uint256 netIncome; //without fees
        uint256 totalFees;
        uint256 lastUpdate;
        address lastFeeRecipient;
        int96 lastIncomeRate;
    }
}
