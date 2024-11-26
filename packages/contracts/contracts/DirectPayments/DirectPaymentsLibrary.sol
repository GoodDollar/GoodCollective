// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./DirectPaymentsPool.sol";

library DirectPayemntsLibrary {
    function _updateMemberLimits(
        DirectPaymentsPool.LimitsData storage memberStats,
        uint128 reward,
        uint64 curMonth
    ) internal {
        if (memberStats.lastReward + 60 * 60 * 24 < block.timestamp) //more than a day passed since last reward
        {
            memberStats.daily = reward;
        } else {
            memberStats.daily += reward;
        }

        if (memberStats.lastMonth < curMonth) //month switched
        {
            memberStats.monthly = reward;
        } else {
            memberStats.monthly += reward;
        }

        memberStats.total += reward;
        memberStats.lastReward = uint64(block.timestamp);
        memberStats.lastMonth = curMonth;
    }

    function _updateGlobalLimits(
        DirectPaymentsPool.LimitsData storage globalLimits,
        uint128 reward,
        uint64 curMonth
    ) internal {
        if (globalLimits.lastReward + 60 * 60 * 24 < block.timestamp) //more than a day passed since last reward
        {
            globalLimits.daily = reward;
        } else {
            globalLimits.daily += reward;
        }

        if (globalLimits.lastMonth < curMonth) //month switched
        {
            globalLimits.monthly = reward;
        } else {
            globalLimits.monthly += reward;
        }

        globalLimits.total += reward;
        globalLimits.lastReward = uint64(block.timestamp);
        globalLimits.lastMonth = curMonth;
    }
}
