import { Box, Checkbox, FormControl, HStack, Link, Pressable, Text, VStack, WarningOutlineIcon } from 'native-base';
import { useState } from 'react';
import { useCreatePool } from '../../hooks/useCreatePool/useCreatePool';
import { useScreenSize } from '../../theme/hooks';
import { CreateCollectiveLogo } from '../../assets';
// Colors are sourced from NativeBase theme tokens via component props
import { InterRegular, InterSemiBold, InterSmall } from '../../utils/webFonts';

const Welcome = () => {
  const [acknowledged, setAcknowledged] = useState<boolean>(false);
  const [pressed, setPressed] = useState<boolean>(false);
  const { isDesktopView } = useScreenSize();

  const { nextStep } = useCreatePool();
  const termsUrl = 'https://www.gooddollar.org/terms-of-use';

  const onSubmit = () => {
    if (!acknowledged) {
      setPressed(true);
      return;
    }
    nextStep();
  };

  return (
    <VStack style={[welcomeStyles.container, isDesktopView && desktopWelcomeStyles.container]} space={0}>
      {/* Welcome Section */}
      <VStack
        style={[welcomeStyles.welcomeSection, isDesktopView && desktopWelcomeStyles.welcomeSection]}
        alignItems="center">
        <Text
          style={[
            welcomeStyles.welcomeText,
            isDesktopView && desktopWelcomeStyles.welcomeText,
            {
              background: 'linear-gradient(135deg, #6933FF 0%, #1A85FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: '#6933FF',
            },
          ]}
          textAlign="center">
          Welcome to
        </Text>
        <Box style={[welcomeStyles.logoImage, isDesktopView && desktopWelcomeStyles.logoImage]}>
          <img
            src={CreateCollectiveLogo}
            alt="GoodCollective"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      </VStack>

      {/* Information Block */}
      <Box
        style={[welcomeStyles.infoBlock, isDesktopView && desktopWelcomeStyles.infoBlock]}
        backgroundColor="goodPurple.100"
        borderColor="goodPurple.200">
        <Text
          variant="body-text"
          style={[welcomeStyles.infoTitle, isDesktopView && desktopWelcomeStyles.infoTitle]}
          color="black">
          GoodCollective helps you turn funding into real, verifiable impact.
        </Text>
        <Text variant="body-text" style={welcomeStyles.infoBody} color="black">
          Create a pool, define who's eligible, and automate distributions with ease.
        </Text>
        <Text variant="body-text" style={[welcomeStyles.infoBody, welcomeStyles.infoBodySpacing]} color="black">
          Whether you're supporting a community, rewarding actions, or reaching a specific group, everything is simple
          and fully auditable on-chain.
        </Text>
      </Box>

      {/* Checkbox Section */}
      <FormControl isInvalid={!acknowledged && pressed}>
        <Box
          style={[welcomeStyles.checkboxSection, isDesktopView && desktopWelcomeStyles.checkboxSection]}
          backgroundColor="goodPurple.100">
          <HStack style={welcomeStyles.checkboxRow} alignItems="flex-start">
            <Checkbox
              style={welcomeStyles.checkbox}
              borderWidth={2}
              borderRadius={4}
              borderColor="goodGrey.400"
              _checked={{ bg: 'goodPurple.400', borderColor: 'goodPurple.400' }}
              value="acknowledge"
              isChecked={acknowledged}
              onChange={(v) => setAcknowledged(v)}
              accessibilityLabel="I understand"
              size="md"
            />
            <Text style={welcomeStyles.checkboxText} flex={1} color="black">
              All on-chain transactions are final and non-reversible. GoodCollective is a non-custodial interface
              provided as-is.{'\n'}
              <Link href={termsUrl} isExternal _text={welcomeStyles.linkText}>
                Terms of Use
              </Link>
            </Text>
          </HStack>
          <FormControl.ErrorMessage
            style={welcomeStyles.errorMessage}
            leftIcon={<WarningOutlineIcon size="xs" mt={1} />}
            _text={{ color: 'goodOrange.300' }}>
            You must acknowledge the terms to continue
          </FormControl.ErrorMessage>
        </Box>
      </FormControl>

      {/* CTA Button */}
      <Pressable
        style={[
          welcomeStyles.ctaButton,
          isDesktopView && desktopWelcomeStyles.ctaButton,
          { opacity: acknowledged ? 1 : 0.5 },
        ]}
        bg="goodPurple.400"
        disabled={!acknowledged}
        onPress={onSubmit}>
        <Text style={[welcomeStyles.ctaButtonText, isDesktopView && desktopWelcomeStyles.ctaButtonText]} color="white">
          Get Started
        </Text>
      </Pressable>
    </VStack>
  );
};

export default Welcome;

const welcomeStyles = {
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 48,
    lineHeight: 56,
    marginBottom: 4,
    ...InterSemiBold,
  },
  logoImage: {
    width: '100%',
    maxWidth: 320,
    height: 50,
    resizeMode: 'contain',
  },
  infoBlock: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    textAlign: 'center',
    marginBottom: 12,
    ...InterSemiBold,
  },
  infoBody: {
    textAlign: 'center',
  },
  infoBodySpacing: {
    marginTop: 12,
  },
  radioBlock: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  radioButton: {
    marginRight: 12,
    marginTop: 2,
  },
  radioText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    ...InterRegular,
  },
  checkboxSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    ...InterRegular,
  },
  linkText: {
    color: 'goodPurple.400',
    textDecorationLine: 'underline',
    cursor: 'pointer',
    ...InterSemiBold,
  },
  ctaButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#5B7AC6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    ...InterSemiBold,
  },
  errorMessage: {
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
    ...InterSmall,
  },
} as const;

const desktopWelcomeStyles = {
  container: {
    maxWidth: 760,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 56,
    lineHeight: 64,
    marginBottom: 4,
    ...InterSemiBold,
  },
  logoImage: {
    width: '100%',
    maxWidth: 520,
    height: 64,
    resizeMode: 'contain',
  },
  infoBlock: {
    padding: 24,
    marginBottom: 20,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  infoTitle: {
    marginBottom: 12,
  },
  radioBlock: {
    padding: 24,
    marginBottom: 20,
  },
  checkboxSection: {
    padding: 24,
    marginBottom: 24,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  ctaButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  ctaButtonText: {
    fontSize: 16,
    ...InterSemiBold,
  },
};
