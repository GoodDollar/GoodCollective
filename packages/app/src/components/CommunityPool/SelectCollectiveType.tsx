import { Text, Checkbox, HStack, VStack, Box, Button, Pressable } from 'native-base';
import { CommunityFundsIcon, SegmentedAidIcon, ResultsBasedIcon } from '../../assets';
import { PoolType, useCreatePool } from '../../hooks/useCreatePool/useCreatePool';
import GetStarted from './CreatePool/GetStarted';
import ProjectDetails from './CreatePool/ProjectDetails';
import PoolConfiguration from './CreatePool/PoolConfiguration';
import ReviewLaunch from './CreatePool/ReviewLaunch';
import NavigationButtons from './NavigationButtons';
import { useScreenSize } from '../../theme/hooks';
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold } from '../../utils/webFonts';

const SelectType = () => {
  const STEPS = [
    { id: 2, Component: GetStarted },
    { id: 3, Component: ProjectDetails },
    { id: 4, Component: PoolConfiguration },
    { id: 5, Component: ReviewLaunch },
  ];

  const { step, form, submitPartial, nextStep, previousStep } = useCreatePool();
  const { isDesktopView } = useScreenSize();

  const poolTypes = [
    {
      id: 'community-funds' as PoolType,
      name: 'Community Funds',
      icon: CommunityFundsIcon,
      description: 'Facilitate money distribution to members of existing community organisations',
      interested: false,
      disabled: false,
    },
    {
      id: 'segmented-aid' as PoolType,
      name: 'Segmented Aid',
      icon: SegmentedAidIcon,
      description:
        'Self-sovereign, user-managed and encrypted digital demographic information allows access to specific funds via GoodOffers',
      interested: true,
      disabled: true,
    },
    {
      id: 'results-based' as PoolType,
      name: 'Results-based direct payments',
      icon: ResultsBasedIcon,
      description: 'Provides direct payments to stewards based on verified climate action',
      interested: true,
      disabled: true,
    },
  ];

  const handlePoolTypeSelect = (poolType: PoolType) => {
    submitPartial({ poolType });
  };

  const handleNext = () => {
    if (form.poolType) {
      nextStep();
    }
  };

  const handleBack = () => {
    previousStep();
  };

  return (
    <Box style={selectCollectiveTypeStyles.container}>
      <VStack space={6} style={selectCollectiveTypeStyles.content}>
        {/* Title Section */}
        <Box style={selectCollectiveTypeStyles.titleSection}>
          <Text
            style={[
              selectCollectiveTypeStyles.title,
              isDesktopView && selectCollectiveTypeStyles.titleDesktop,
              {
                background: 'linear-gradient(135deg, #6933FF 0%, #1A85FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: '#6933FF',
              },
            ]}>
            About Various Pools
          </Text>
          <Text style={selectCollectiveTypeStyles.subtitle}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos ipsa ab nemo fugiat expedita, facilis
            voluptatibus magni velit odio quis cumque quidem veniam fuga. Ea perferendis voluptas voluptatum in iste!
          </Text>
        </Box>

        {/* Pool Type Cards */}
        <VStack space={4}>
          {poolTypes.map((poolType, index) => (
            <Pressable key={index} disabled={poolType.disabled} onPress={() => handlePoolTypeSelect(poolType.id)}>
              <Box style={selectCollectiveTypeStyles.card}>
                <HStack space={4} alignItems="center" style={selectCollectiveTypeStyles.cardContent}>
                  {/* Icon */}
                  <Box style={selectCollectiveTypeStyles.iconContainer}>
                    <img width="60" height="60" src={poolType.icon} style={selectCollectiveTypeStyles.icon} />
                  </Box>

                  {/* Content */}
                  <VStack flex={1} space={2}>
                    <Text style={selectCollectiveTypeStyles.cardTitle}>{poolType.name}</Text>
                    <Text style={selectCollectiveTypeStyles.cardDescription}>{poolType.description}</Text>
                    {poolType.interested && (
                      <Button
                        size="sm"
                        style={selectCollectiveTypeStyles.interestedButton}
                        _text={selectCollectiveTypeStyles.interestedButtonText}>
                        Interested, Please reach out!
                      </Button>
                    )}
                  </VStack>

                  {/* Checkbox */}
                  <Box style={selectCollectiveTypeStyles.checkboxContainer}>
                    {!poolType.disabled && (
                      <Checkbox
                        value="true"
                        isChecked={form.poolType === poolType.id}
                        style={selectCollectiveTypeStyles.checkbox}
                        aria-label={`Select ${poolType.name} pool type`}
                        _checked={{
                          bg: '#1B7BEC',
                          borderColor: '#1B7BEC',
                        }}
                      />
                    )}
                  </Box>
                </HStack>
              </Box>
            </Pressable>
          ))}
        </VStack>

        {/* Navigation Buttons */}
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          nextDisabled={!form.poolType}
          containerStyle={selectCollectiveTypeStyles.navigationContainer}
        />
      </VStack>
      {STEPS.map(({ id, Component }) => step === id && <Component key={id} />)}
    </Box>
  );
};

export default SelectType;

const selectCollectiveTypeStyles = {
  container: {
    flex: 1,
    backgroundColor: Colors.gray[400],
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
    alignSelf: 'center' as const,
    width: '100%',
  },
  titleSection: {
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    textAlign: 'center' as const,
    marginBottom: 16,
    ...InterSemiBold,
  },
  titleBlue: {
    color: Colors.blue[200],
  },
  titlePurple: {
    color: Colors.purple[200],
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: 'center' as const,
    lineHeight: 24,
    maxWidth: '80%',
    ...InterRegular,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.blue[200],
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    alignItems: 'center' as const,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.purple[100],
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  icon: {
    borderRadius: 30,
  },
  cardTitle: {
    fontSize: 16,
    color: Colors.black,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    ...InterSemiBold,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.gray[500],
    lineHeight: 20,
    ...InterRegular,
  },
  interestedButton: {
    backgroundColor: Colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start' as const,
    marginTop: 8,
  },
  interestedButtonText: {
    color: Colors.white,
    fontSize: 12,
    ...InterSemiBold,
  },
  checkboxContainer: {
    width: 40,
    alignItems: 'center' as const,
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  navigationContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray[600],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 100,
  },
  backButtonText: {
    color: Colors.gray[500],
    fontSize: 16,
    ...InterSemiBold,
  },
  nextButton: {
    backgroundColor: Colors.purple[200],
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 100,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 16,
    ...InterSemiBold,
  },
  titleDesktop: {
    fontSize: 72,
    textAlign: 'center' as const,
    marginBottom: 16,
    ...InterSemiBold,
  },
};
