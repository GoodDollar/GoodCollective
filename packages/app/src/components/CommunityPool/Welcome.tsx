import { Box, Checkbox, FormControl, HStack, Pressable, Radio, Text, VStack, WarningOutlineIcon } from 'native-base';
import { useState } from 'react';
import { useCreatePool } from '../../hooks/useCreatePool/useCreatePool';
import { useScreenSize } from '../../theme/hooks';
import { desktopWelcomeStyles, welcomeStyles } from './styles';
import { CreateCollectiveLogo } from '../../assets';
import { Colors } from '../../utils/colors';

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
