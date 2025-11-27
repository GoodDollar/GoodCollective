import React from 'react';
import { Text, VStack } from 'native-base';

interface InfoCalloutProps {
  type?: 'info' | 'warning';
  children: React.ReactNode;
}

export const InfoCallout: React.FC<InfoCalloutProps> = ({ type = 'info', children }) => {
  const bgColor = type === 'warning' ? 'yellow.50' : 'blue.50';
  const borderColor = type === 'warning' ? 'yellow.200' : 'blue.200';
  const textColor = type === 'warning' ? 'yellow.800' : 'blue.700';

  return (
    <VStack
      space={2}
      marginTop={3}
      padding={3}
      borderRadius={8}
      backgroundColor={bgColor}
      borderWidth={1}
      borderColor={borderColor}>
      <Text color={textColor} fontSize="sm">
        {children}
      </Text>
    </VStack>
  );
};
