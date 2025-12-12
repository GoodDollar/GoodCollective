import React from 'react';
import { Box, Link, Pressable, Text, Spinner, useBreakpointValue } from 'native-base';

import { InterSemiBold } from '../utils/webFonts';

type ActionButtonProps = {
  href?: string;
  text: string | React.ReactNode;
  bg: string;
  textColor: string;
  onPress?: any;
  width?: string;
  borderRadius?: number;
  isDisabled?: boolean;
  isLoading?: boolean;
};

export const buttonStyles = {
  buttonContainer: {
    justifyContent: 'space-evenly',
    marginTop: 2,
  },
  button: {
    width: '100%',
    minHeight: 47,
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    paddingRight: 10,
    paddingLeft: 10,
    paddingBottom: 1,
    fontSize: 'md',
    fontWeight: 700,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 50,
  },
  buttonText: {
    ...InterSemiBold,
    fontSize: 'md',
    textAlign: 'center',
  },
};

const ActionButton = ({
  href,
  text,
  bg,
  textColor,
  onPress,
  width = '100%',
  borderRadius = 50,
  isDisabled = false,
  isLoading = false,
}: ActionButtonProps) => {
  const responsiveStyles = useBreakpointValue({
    base: {
      button: {
        ...buttonStyles.button,
        borderRadius,
        justifyContent: 'center',
      },
      buttonText: {
        ...buttonStyles.buttonText,
        minHeight: 47,
        display: 'flex',
        alignItems: 'center',
      },
      buttonContainer: {
        ...buttonStyles.buttonContainer,
        width,
      },
    },
    lg: {
      ...buttonStyles,
      button: {
        ...buttonStyles.button,
        borderRadius,
      },
    },
  });

  const { buttonContainer, button, buttonText } = responsiveStyles ?? {};

  const content = (
    <Pressable
      {...button}
      onPress={isDisabled || isLoading ? undefined : onPress}
      backgroundColor={isDisabled ? 'gray.300' : bg}
      opacity={isDisabled || isLoading ? 0.6 : 1}
      paddingBottom={0}>
      {isLoading ? (
        <Spinner size="sm" color={textColor} />
      ) : (
        <Text {...buttonText} color={textColor}>
          {text}
        </Text>
      )}
    </Pressable>
  );

  if (href) {
    return (
      <Link {...buttonContainer} href={href} isExternal={true}>
        {content}
      </Link>
    );
  }

  return <Box {...buttonContainer}>{content}</Box>;
};

export default ActionButton;
