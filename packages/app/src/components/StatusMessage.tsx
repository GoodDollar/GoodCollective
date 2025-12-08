import React from 'react';
import { Text } from 'native-base';

interface StatusMessageProps {
  type: 'error' | 'success';
  message: string | null;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ type, message }) => {
  if (!message) return null;

  const color = type === 'error' ? 'red.500' : 'green.600';

  return (
    <Text marginTop={2} color={color} fontSize="sm">
      {message}
    </Text>
  );
};
