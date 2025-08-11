// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "./DirectPaymentsPool.sol";
import "./ProvableNFT.sol";

library DirectPaymentsLibrary {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    event NOT_MEMBER_OR_WHITELISTED_OR_LIMITS(address contributer);
    event EventRewardClaimed(
        uint256 indexed tokenId,
        uint16 eventType,
        uint32 eventTimestamp,
        uint256 eventQuantity,
        string eventUri,
        address[] contributers,
        uint256 rewardPerContributer
    );
    event NFTClaimed(uint256 indexed tokenId, uint256 totalRewards);
    error OVER_MEMBER_LIMITS(address);
    error OVER_GLOBAL_LIMITS();
    error NO_BALANCE();

    function _updateMemberLimits(DirectPaymentsPool.LimitsData storage memberStats, uint128 reward) public {
        if (memberStats.lastReward + 60 * 60 * 24 < block.timestamp) //more than a day passed since last reward
        {
            memberStats.daily = reward;
        } else {
            memberStats.daily += reward;
        }

        if (memberStats.lastMonth < _month()) //month switched
        {
            memberStats.monthly = reward;
        } else {
            memberStats.monthly += reward;
        }

        memberStats.total += reward;
        memberStats.lastReward = uint64(block.timestamp);
        memberStats.lastMonth = _month();
    }

    /**
     * @dev Updates the global limits with the new reward.
     * @param globalLimits The global limits data to update.
     * @param limits The safety limits to check against.
     * @param reward The amount of rewards to update.
     */
    function _enforceAndUpdateGlobalLimits(
        DirectPaymentsPool.LimitsData storage globalLimits,
        DirectPaymentsPool.SafetyLimits memory limits,
        uint128 reward
    ) public {
        if (globalLimits.lastReward + 60 * 60 * 24 < block.timestamp) //more than a day passed since last reward
        {
            globalLimits.daily = reward;
        } else {
            globalLimits.daily += reward;
        }

        if (globalLimits.lastMonth < _month()) //month switched
        {
            globalLimits.monthly = reward;
        } else {
            globalLimits.monthly += reward;
        }

        globalLimits.total += reward;
        globalLimits.lastReward = uint64(block.timestamp);
        globalLimits.lastMonth = _month();

        if (globalLimits.monthly > limits.maxTotalPerMonth) revert OVER_GLOBAL_LIMITS();
    }

    /**
     * @dev Enforces and updates the reward limits for the specified member. if the member is not a valid member, or past limit it returns false and member will not get rewards.
     * @param memberStats The member's limits data to update.
     * @param limits The safety limits to check against.
     * @param member The address of the member to enforce and update limits for.
     * @param reward The amount of rewards to enforce and update limits for.
     */
    function _enforceAndUpdateMemberLimits(
        DirectPaymentsPool.LimitsData storage memberStats,
        DirectPaymentsPool.SafetyLimits memory limits,
        address member,
        uint128 reward
    ) public returns (bool) {
        if (
            DirectPaymentsPool(address(this)).hasRole(DirectPaymentsPool(address(this)).MEMBER_ROLE(), member) == false
        ) {
            return false;
        }
        _updateMemberLimits(memberStats, reward);

        if (memberStats.daily > limits.maxMemberPerDay || memberStats.monthly > limits.maxMemberPerMonth) return false;

        return true;
    }

    /**
     * @dev Sends rewards to the specified recipients.
     * @param recipients The addresses of the recipients to send rewards to.
     * @param reward The total amount of rewards to send.
     */
    function _sendReward(
        DirectPaymentsPool.LimitsData storage globalLimits,
        DirectPaymentsPool.SafetyLimits memory limits,
        mapping(address => DirectPaymentsPool.LimitsData) storage memberLimits,
        DirectPaymentsPool.PoolSettings memory settings,
        address[] memory recipients,
        uint128 reward
    ) public {
        uint128 perReward = uint128(reward / recipients.length);
        uint128 totalSent;
        for (uint i = 0; i < recipients.length; i++) {
            bool valid = _enforceAndUpdateMemberLimits(memberLimits[recipients[i]], limits, recipients[i], perReward);
            if (valid) {
                settings.rewardToken.safeTransfer(recipients[i], perReward);
                totalSent += perReward;
            } else {
                emit NOT_MEMBER_OR_WHITELISTED_OR_LIMITS(recipients[i]);
            }
        }
        _enforceAndUpdateGlobalLimits(globalLimits, limits, totalSent);
    }

    /**
     * @dev Claims rewards for the specified NFT ID.
     * @param globalLimits The global limits data to check against.
     * @param limits The safety limits to check against.
     * @param memberLimits The mapping of member limits to check against.
     * @param settings The pool settings containing the reward token and other configurations.
     * @param _nftId The ID of the NFT to claim rewards for.
     * @param _data The NFTData struct containing data about the NFT.
     */
    function _claim(
        DirectPaymentsPool.LimitsData storage globalLimits,
        DirectPaymentsPool.SafetyLimits memory limits,
        mapping(address => DirectPaymentsPool.LimitsData) storage memberLimits,
        DirectPaymentsPool.PoolSettings memory settings,
        uint256 _nftId,
        ProvableNFT.NFTData memory _data
    ) public {
        uint totalRewards;
        uint rewardsBalance = settings.rewardToken.balanceOf(address(this));

        bool allowRewardOverride = settings.allowRewardOverride;
        for (uint256 i = 0; i < _data.events.length; i++) {
            uint reward = (
                allowRewardOverride && _data.events[i].rewardOverride > 0
                    ? _data.events[i].rewardOverride
                    : _eventReward(settings, _data.events[i].subtype)
            ) * _data.events[i].quantity;
            if (reward > 0) {
                totalRewards += reward;
                if (totalRewards > rewardsBalance) revert NO_BALANCE();
                rewardsBalance -= totalRewards;

                _sendReward(
                    globalLimits,
                    limits,
                    memberLimits,
                    settings,
                    _data.events[i].contributers,
                    uint128(reward)
                );
                emit EventRewardClaimed(
                    _nftId,
                    _data.events[i].subtype,
                    _data.events[i].timestamp,
                    _data.events[i].quantity,
                    _data.events[i].eventUri,
                    _data.events[i].contributers,
                    uint128(reward / _data.events[i].contributers.length)
                );
            }
        }

        emit NFTClaimed(_nftId, totalRewards);
    }

    /**
     * @dev Returns the reward amount for the specified event type.
     * @param _eventType The type of the event to get the reward for.
     * @return reward amount for the specified event type.
     */
    function _eventReward(
        DirectPaymentsPool.PoolSettings memory settings,
        uint16 _eventType
    ) internal pure returns (uint128 reward) {
        for (uint i = 0; i < settings.validEvents.length; i++) {
            if (_eventType == settings.validEvents[i]) return settings.rewardPerEvent[i];
        }
        return 0;
    }

    /**
     * @dev Returns the current month.
     * @return month current month as a uint64 value.
     */
    function _month() internal view returns (uint64 month) {
        return uint64(block.timestamp / (60 * 60 * 24 * 30));
    }
}
