import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { backIconUri } from './assets';
import { Colors } from '../../utils/colors';

interface RotatingArrowIconProps {
  openDropdown: boolean;
}

export const RotatingArrowIcon = (props: RotatingArrowIconProps) => {
  const { openDropdown } = props;

  const rotationAnim = useRef(new Animated.Value(0)).current;

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-90deg'],
  });

  const startRotation = () => {
    Animated.timing(rotationAnim, {
      toValue: openDropdown ? 1 : 0,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    startRotation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDropdown]);

  return (
    <Animated.Image
      source={{ uri: backIconUri }}
      resizeMode="contain"
      style={[styles.arrowIcon, { transform: [{ rotate: rotation }] }]}
    />
  );
};

const styles = {
  arrowIcon: {
    width: 15,
    height: 15,
    tintColor: Colors.white,
  },
};
