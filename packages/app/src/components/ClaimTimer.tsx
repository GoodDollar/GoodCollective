import React, { useState, useEffect } from 'react';
import { View, Text, VStack } from 'native-base';
import { formatTime } from '../lib/formatTime';

interface ClaimTimerProps {
  nextClaimTime: number;
}

export const ClaimTimer: React.FC<ClaimTimerProps> = ({ nextClaimTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, nextClaimTime - now);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextClaimTime]);

  if (timeRemaining === 0) {
    return (
      <View>
        <Text fontSize="sm" color="gray.500">
          You can claim again now
        </Text>
      </View>
    );
  }

  const days = Math.floor(timeRemaining / 86400);
  const hours = Math.floor((timeRemaining % 86400) / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  return (
    <VStack space={2} alignItems="center" padding={4} backgroundColor="gray.50" borderRadius={8}>
      <Text fontSize="md" fontWeight="bold" textAlign="center">
        Already Claimed
      </Text>
      <Text fontSize="sm" color="gray.600" textAlign="center">
        You can claim again in:
      </Text>
      <Text fontSize="lg" fontWeight="bold" color="orange.500" textAlign="center">
        {days > 0 && `${days}d `}
        {hours > 0 && `${hours}h `}
        {minutes > 0 && `${minutes}m `}
        {seconds}s
      </Text>
      <Text fontSize="xs" color="gray.500" textAlign="center">
        Next claim: {formatTime(nextClaimTime)}
      </Text>
    </VStack>
  );
};
