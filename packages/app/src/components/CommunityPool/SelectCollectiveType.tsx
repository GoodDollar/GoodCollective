import { Text, Checkbox, HStack, VStack, Box, Button } from 'native-base';
import { Pressable, View } from 'react-native';
import { CommunityFundsIcon, SegmentedAidIcon, ResultsBasedIcon } from '../../assets';
import { PoolType, useCreatePool } from '../../hooks/useCreatePool/useCreatePool';
import { selectCollectiveTypeStyles as styles } from './styles';
import GetStarted from './CreatePool/GetStarted';
import ProjectDetails from './CreatePool/ProjectDetails';
import PoolConfiguration from './CreatePool/PoolConfiguration';
import ReviewLaunch from './CreatePool/ReviewLaunch';
import NavigationButtons from './NavigationButtons';
import { useScreenSize } from '../../theme/hooks';

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
    <View style={styles.container}>
      <VStack space={6} style={styles.content}>
        {/* Title Section */}
        <Box style={styles.titleSection}>
          <Text
            style={[
              styles.title,
              isDesktopView && styles.titleDesktop,
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
          <Text style={styles.subtitle}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos ipsa ab nemo fugiat expedita, facilis
            voluptatibus magni velit odio quis cumque quidem veniam fuga. Ea perferendis voluptas voluptatum in iste!
          </Text>
        </Box>

        {/* Pool Type Cards */}
        <VStack space={4}>
          {poolTypes.map((poolType, index) => (
            <Pressable key={index} disabled={poolType.disabled} onPress={() => handlePoolTypeSelect(poolType.id)}>
              <View style={styles.card}>
                <HStack space={4} alignItems="center" style={styles.cardContent}>
                  {/* Icon */}
                  <View style={styles.iconContainer}>
                    <img width="60" height="60" src={poolType.icon} style={styles.icon} />
                  </View>

                  {/* Content */}
                  <VStack flex={1} space={2}>
                    <Text style={styles.cardTitle}>{poolType.name}</Text>
                    <Text style={styles.cardDescription}>{poolType.description}</Text>
                    {poolType.interested && (
                      <Button size="sm" style={styles.interestedButton} _text={styles.interestedButtonText}>
                        Interested, Please reach out!
                      </Button>
                    )}
                  </VStack>

                  {/* Checkbox */}
                  <View style={styles.checkboxContainer}>
                    {!poolType.disabled && (
                      <Checkbox
                        value="true"
                        isChecked={form.poolType === poolType.id}
                        style={styles.checkbox}
                        aria-label={`Select ${poolType.name} pool type`}
                        _checked={{
                          bg: '#1B7BEC',
                          borderColor: '#1B7BEC',
                        }}
                      />
                    )}
                  </View>
                </HStack>
              </View>
            </Pressable>
          ))}
        </VStack>

        {/* Navigation Buttons */}
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          nextDisabled={!form.poolType}
          containerStyle={styles.navigationContainer}
        />
      </VStack>
      {STEPS.map(({ id, Component }) => step === id && <Component key={id} />)}
    </View>
  );
};

export default SelectType;
