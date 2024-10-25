import { Box, Link, Pressable, Text, useBreakpointValue } from 'native-base';

import { InterSemiBold } from '../utils/webFonts';

type ActionButtonProps = {
  href?: string;
  text: string;
  bg: string;
  textColor: string;
  onPress?: any;
};

export const buttonStyles = {
  buttonContainer: {
    justifyContent: 'space-evenly',
    marginTop: 2,
  },
  button: {
    width: '100%',
    height: 47,
    flex: 1,
    justifyContent: 'space-between',
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
  },
};

const ActionButton = ({ href, text, bg, textColor, onPress }: ActionButtonProps) => {
  const responsiveStyles = useBreakpointValue({
    base: {
      button: {
        ...buttonStyles.button,
        justifyContent: 'center',
      },
      buttonText: {
        ...buttonStyles.buttonText,
        height: 47,
        display: 'flex',
        alignItems: 'center',
      },
      buttonContainer: {
        ...buttonStyles.buttonContainer,
        width: '100%',
      },
    },
    lg: buttonStyles,
  });

  const { buttonContainer, button, buttonText } = responsiveStyles ?? {};

  const content = (
    <Pressable {...button} onPress={onPress} backgroundColor={bg}>
      <Text {...buttonText} color={textColor}>
        {text}
      </Text>
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
