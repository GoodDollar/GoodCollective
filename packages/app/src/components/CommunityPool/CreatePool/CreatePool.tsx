import { Box, HStack, Text, VStack, Progress } from 'native-base';

import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import { useScreenSize } from '../../../theme/hooks';
import GetStarted from './GetStarted';
import ProjectDetails from './ProjectDetails';
import PoolConfiguration from './PoolConfiguration';
import ReviewLaunch from './ReviewLaunch';

const CreatePool = ({}: {}) => {
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
          <Progress
            value={getProgressValue()}
            bg="rgba(255,255,255,0.2)"
            _filledTrack={{
              bg: '#FFFFFF',
            }}
            size="sm"
            rounded="full"
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

export default CreatePool;
