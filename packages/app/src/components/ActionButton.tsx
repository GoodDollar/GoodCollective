import { Box, Link, Pressable, Text } from 'native-base';

type ActionButtonProps = {
  href?: string;
  text: string;
  bg: string;
  textColor: string;
  onPress?: any;
  buttonStyles?: any;
};

const ActionButton = ({ href, text, bg, textColor, onPress, buttonStyles }: ActionButtonProps) => {
  const { buttonContainer, button, buttonText } = buttonStyles ?? {};

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
