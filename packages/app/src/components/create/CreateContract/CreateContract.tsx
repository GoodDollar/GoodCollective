import { Box, HStack, Text, VStack } from 'native-base';
import { StyleSheet, View } from 'react-native';

import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import { useScreenSize } from '../../../theme/hooks';
import GetStarted from './1GetStarted';
import ProjectDetails from './2ProjectDetails';
import PoolConfiguration from './3PoolConfiguration';
import ReviewLaunch from './4ReviewLaunch';

const CreateContract = ({}: {}) => {
  const STEPS = [
    { id: 2, Component: GetStarted, label: 'Get Started (1/4)' },
    { id: 3, Component: ProjectDetails, label: 'Project Details (2/4)' },
    { id: 4, Component: PoolConfiguration, label: 'Pool Configuration (3/4)' },
    { id: 5, Component: ReviewLaunch, label: 'Review & Launch (4/4)' },
  ];

  const { step } = useCreatePool();
  const { isDesktopView } = useScreenSize();

  const getProgressValue = () => {
    const stepIndex = STEPS.findIndex((s) => s.id === step);
    return ((stepIndex + 1) / STEPS.length) * 100;
  };

  return (
    <VStack width="full" flex={1}>
      <Box backgroundColor="#5B7AC6" paddingX={6} paddingY={8} position="relative">
        <Box position="relative" mb={6}>
          <Box height="6px" backgroundColor="rgba(255,255,255,0.2)" borderRadius="full" position="relative" />

          <Box
            height="6px"
            backgroundColor="#FFFFFF"
            borderRadius="full"
            width={`${getProgressValue()}%`}
            position="absolute"
            top={0}
            left={0}
          />

          <View
            style={[
              styles.progressDot,
              {
                left: `${getProgressValue()}%`,
              },
            ]}
          />
        </Box>

        <HStack justifyContent="space-between" alignItems="flex-start" position="relative">
          {STEPS.map(({ id, label }, index) => {
            const isActive = step === id;
            const isCompleted = step > id;

            return (
              <Box
                key={id}
                flex={1}
                alignItems={index === 0 ? 'flex-start' : index === STEPS.length - 1 ? 'flex-end' : 'center'}>
                <Text
                  fontSize={isDesktopView ? 'sm' : 'xs'}
                  fontWeight={isActive ? '700' : '500'}
                  color={isActive || isCompleted ? 'white' : 'rgba(255,255,255,0.7)'}
                  textAlign={index === 0 ? 'left' : index === STEPS.length - 1 ? 'right' : 'center'}
                  lineHeight="tight"
                  maxWidth="120px">
                  {label}
                </Text>
              </Box>
            );
          })}
        </HStack>
      </Box>

      <Box flex={1} backgroundColor="gray.50">
        {STEPS.map(({ id, Component }) => step === id && <Component key={id} />)}
      </Box>
    </VStack>
  );
};

const styles = StyleSheet.create({
  progressDot: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    backgroundColor: '#ffff',
    borderRadius: 9,
    borderWidth: 3,
    borderColor: 'white',
    transform: [{ translateX: -9 }],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mobileStep: {
    fontSize: 10,
  },
  desktopStep: {
    fontSize: 14,
  },
});

export default CreateContract;
