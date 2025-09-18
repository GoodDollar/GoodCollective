import { Box, HStack, InfoIcon, Text, WarningTwoIcon } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

export type InfoBoxType = 'info' | 'warning' | 'error';

export interface InfoBoxProps {
  type?: InfoBoxType;
  message: string;
  icon?: React.ReactNode;
  hideIcon?: boolean;
  width?: string;
  style?: any;
}

const InfoBox: React.FC<InfoBoxProps> = ({ type = 'info', message, icon, hideIcon = false, width = 'full', style }) => {
  const getIcon = () => {
    if (hideIcon) return null;
    if (icon) return icon;

    switch (type) {
      case 'warning':
      case 'error':
        return <WarningTwoIcon color="#EF4444" size="md" />;
      case 'info':
      default:
        return <InfoIcon color="#5B7AC6" size="md" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
      case 'error':
        return '#FEF2F2'; // Light red background
      case 'info':
      default:
        return '#EBF4FF'; // Light blue background
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'warning':
      case 'error':
        return '#DC2626'; // Red text
      case 'info':
      default:
        return '#1E40AF'; // Blue text
    }
  };

  return (
    <Box
      backgroundColor={getBackgroundColor()}
      padding={4}
      borderRadius={8}
      width={width}
      style={[styles.container, style]}>
      <HStack space={2} alignItems="center">
        {getIcon()}
        <Text style={[styles.text, { color: getTextColor() }]} flex={1}>
          {message}
        </Text>
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  text: {
    fontSize: 14,
    flex: 1,
  },
});

export default InfoBox;
