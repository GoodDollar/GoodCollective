import React from 'react';
import { Text, VStack } from 'native-base';

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, description, children }) => {
  return (
    <VStack space={4} backgroundColor="white" padding={6} borderRadius={16} shadow={1}>
      <VStack space={1}>
        <Text variant="2xl-grey" fontWeight="700">
          {title}
        </Text>
        {description && <Text color="gray.500">{description}</Text>}
      </VStack>
      {children}
    </VStack>
  );
};
