import { Box, Checkbox, FormControl, HStack, Pressable, Radio, Text, VStack, WarningOutlineIcon } from 'native-base';
import { useState } from 'react';
import { useCreatePool } from '../../hooks/useCreatePool/useCreatePool';
import { useScreenSize } from '../../theme/hooks';
import { CreateCollectiveLogo } from '../../assets';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold, InterSmall } from '../../utils/webFonts';

const Welcome = () => {
  const [value, setValue] = useState<string>('one');
  const [acknowledged, setAcknowledged] = useState<string>('');
  const [pressed, setPressed] = useState<boolean>(false);
  const { isDesktopView } = useScreenSize();

  const { nextStep } = useCreatePool();

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
          textAlign="center"
          fontWeight="600">
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
      <Box style={[welcomeStyles.infoBlock, isDesktopView && desktopWelcomeStyles.infoBlock]}>
        <Text style={[welcomeStyles.infoText, isDesktopView && desktopWelcomeStyles.infoText]} textAlign="justify">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam totam, tempore saepe beatae et quidem provident
          aperiam esse recusandae rem fugiat laboriosam est rerum enim at magni suscipit amet qui. Lorem ipsum dolor,
          sit amet consectetur adipisicing elit. Totam similique vel odio incidunt enim officiis, quo dignissimos
          quaerat officia omnis at dolorem itaque dolore pariatur tempora? Quo ratione sequi dolorem. Lorem ipsum dolor
          sit amet consectetur adipisicing elit. Repellendus eum similique culpa dolore quos doloremque. Nostrum quo rem
          deserunt, sit sint hic itaque? Cumque incidunt facilis repellendus vero magnam dolorem.
        </Text>
        <Text
          style={[welcomeStyles.infoText, isDesktopView && desktopWelcomeStyles.infoText]}
          textAlign="justify"
          marginTop={4}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione cupiditate, labore ducimus quae suscipit
          tempora minus non nihil inventore ipsa dignissimos ex corrupti adipisci impedit autem repudiandae
          reprehenderit eum in!
        </Text>
      </Box>

      {/* Radio Options Block */}
      <Box style={[welcomeStyles.radioBlock, isDesktopView && desktopWelcomeStyles.radioBlock]}>
        <Radio.Group
          name="donationFrequency"
          value={value}
          onChange={(v) => {
            setValue(v);
            console.log(v);
          }}
          flexDir="column">
          <HStack style={welcomeStyles.radioOption} alignItems="flex-start">
            <Radio value="one" style={welcomeStyles.radioButton} size="sm" />
            <Text style={[welcomeStyles.radioText, isDesktopView && desktopWelcomeStyles.radioText]} flex={1}>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Animi, dignissimos fugit adipisci, ex libero
              laborum praesentium officiis
            </Text>
          </HStack>
          <HStack style={welcomeStyles.radioOption} alignItems="flex-start">
            <Radio value="two" style={welcomeStyles.radioButton} size="sm" />
            <Text style={[welcomeStyles.radioText, isDesktopView && desktopWelcomeStyles.radioText]} flex={1}>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates maiores ab dicta vero veritatis omnis
              natus ration
            </Text>
          </HStack>
        </Radio.Group>
      </Box>

      {/* Checkbox Section */}
      <FormControl isInvalid={!acknowledged && pressed}>
        <Box style={[welcomeStyles.checkboxSection, isDesktopView && desktopWelcomeStyles.checkboxSection]}>
          <HStack style={welcomeStyles.checkboxRow} alignItems="flex-start">
            <Checkbox
              style={welcomeStyles.checkbox}
              borderWidth={2}
              borderRadius={4}
              borderColor={Colors.gray[400]}
              colorScheme="blue"
              value={String(acknowledged)}
              onChange={(v) => setAcknowledged(String(v))}
              accessibilityLabel="I understand"
              size="md"
            />
            <Text style={[welcomeStyles.checkboxText, isDesktopView && desktopWelcomeStyles.checkboxText]} flex={1}>
              I understand Vitae morbi dolor tellus in tincidunt est ac cursus. Habitasse viverra lectus integer posuere
              fermentum.
            </Text>
          </HStack>
          <FormControl.ErrorMessage
            style={welcomeStyles.errorMessage}
            leftIcon={<WarningOutlineIcon size="xs" mt={1} />}>
            You must acknowledge the terms to continue
          </FormControl.ErrorMessage>
        </Box>
      </FormControl>

      {/* CTA Button */}
      <Pressable style={[welcomeStyles.ctaButton, isDesktopView && desktopWelcomeStyles.ctaButton]} onPress={onSubmit}>
        <Text style={[welcomeStyles.ctaButtonText, isDesktopView && desktopWelcomeStyles.ctaButtonText]}>
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
    marginBottom: 4,
    ...InterSemiBold,
  },
  logoImage: {
    width: 365,
    height: 50,
    resizeMode: 'contain',
  },
  infoBlock: {
    backgroundColor: Colors.blue[100],
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.purple[100],
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.black,
    textAlign: 'justify',
    ...InterRegular,
  },
  radioBlock: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray[1000],
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  radioOption: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  radioButton: {
    marginRight: 12,
    marginTop: 2,
  },
  radioText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.black,
    flex: 1,
    ...InterRegular,
  },
  checkboxSection: {
    backgroundColor: Colors.blue[100],
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkboxRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.black,
    flex: 1,
    ...InterRegular,
  },
  ctaButton: {
    backgroundColor: Colors.purple[200],
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: Colors.purple[200],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 16,
    ...InterSemiBold,
  },
  errorMessage: {
    color: Colors.orange[300],
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
    ...InterSmall,
  },
};

const desktopWelcomeStyles = {
  container: {
    marginHorizontal: 'auto',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 60,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 96,
    marginBottom: 2,
    ...InterSemiBold,
  },
  logoImage: {
    width: 1088,
    height: 145,
    resizeMode: 'contain',
  },
  infoBlock: {
    backgroundColor: Colors.blue[100],
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.purple[100],
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    ...InterRegular,
  },
  radioBlock: {
    padding: 32,
    marginBottom: 24,
  },
  radioText: {
    fontSize: 16,
    lineHeight: 24,
    ...InterRegular,
  },
  checkboxSection: {
    padding: 32,
    marginBottom: 32,
  },
  checkboxText: {
    fontSize: 16,
    lineHeight: 24,
    ...InterRegular,
  },
  ctaButton: {
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  ctaButtonText: {
    fontSize: 18,
    ...InterSemiBold,
  },
};
