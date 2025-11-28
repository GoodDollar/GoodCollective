import React from 'react';
import { Button as NBButton } from 'native-base';
import { Colors } from '../../utils/colors';

interface PrimaryButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onPress,
  isLoading = false,
  isDisabled = false,
  children,
}) => {
  return (
    <NBButton
      marginTop={4}
      onPress={onPress}
      isDisabled={isDisabled}
      isLoading={isLoading}
      alignSelf="stretch"
      borderRadius={12}
      backgroundColor={Colors.purple[400]}
      _text={{ fontWeight: '700', color: 'white' }}
      _pressed={{ backgroundColor: Colors.purple[400] }}
      _disabled={{ backgroundColor: Colors.purple[400], opacity: 0.6 }}>
      {children}
    </NBButton>
  );
};
