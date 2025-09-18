import { HStack, Text } from 'native-base';
import { ArrowRightIcon, ArrowLeftIcon } from '../../assets';
import ActionButton from '../ActionButton';

interface NavigationButtonsProps {
  onBack: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextText?: string;
  backText?: string;
  containerStyle?: any;
  buttonWidth?: string;
  marginTop?: number;
}

const NavigationButtons = ({
  onBack,
  onNext,
  nextDisabled = false,
  nextText = 'Next',
  backText = 'Back',
  containerStyle,
  buttonWidth = '120px',
  marginTop,
}: NavigationButtonsProps) => {
  return (
    <HStack space={4} justifyContent="space-between" style={containerStyle} mt={marginTop}>
      <ActionButton
        borderRadius={8}
        text={
          <HStack space={2} alignItems="center">
            <img src={ArrowLeftIcon} width={20} height={20} alt="Back" />
            <Text color="black" fontSize="md" fontWeight="600">
              {backText}
            </Text>
          </HStack>
        }
        bg="goodGrey.200"
        textColor="white"
        onPress={onBack}
        width={buttonWidth}
      />
      <ActionButton
        borderRadius={8}
        text={
          <HStack space={2} alignItems="center">
            <Text color="white" fontSize="md" fontWeight="600">
              {nextText}
            </Text>
            <img src={ArrowRightIcon} color="white" width={20} height={20} alt="Forward" />
          </HStack>
        }
        bg={nextDisabled ? 'goodGrey.200' : 'goodPurple.400'}
        textColor="white"
        onPress={nextDisabled ? undefined : onNext}
        width={buttonWidth}
      />
    </HStack>
  );
};

export default NavigationButtons;
