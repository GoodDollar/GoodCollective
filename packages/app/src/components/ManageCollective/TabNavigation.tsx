import React from 'react';
import { HStack, Text, VStack } from 'native-base';
import { Colors } from '../../utils/colors';

type Tab = {
  id: string;
  label: string;
};

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <HStack space={8} borderColor={Colors.gray[600]} alignItems="flex-end">
      {tabs.map((tab) => (
        <VStack key={tab.id} flexShrink={0}>
          <Text
            onPress={() => onTabChange(tab.id)}
            fontSize="lg"
            fontWeight={activeTab === tab.id ? '700' : '500'}
            color={activeTab === tab.id ? Colors.purple[400] : Colors.gray[500]}>
            {tab.label}
          </Text>
          <VStack
            marginTop={2}
            height={1}
            borderRadius={999}
            backgroundColor={activeTab === tab.id ? Colors.purple[400] : 'transparent'}
          />
        </VStack>
      ))}
    </HStack>
  );
};
