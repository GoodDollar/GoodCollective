import { Text, Badge, Checkbox, HStack, VStack, Center, Box } from 'native-base';
import { Pressable } from 'react-native';
import { CommunityFundsIcon, SegmentedAidIcon, ResultsBasedIcon } from '../../assets';
import { useScreenSize } from '../../theme/hooks';
import { PoolType, useCreatePool } from '../../hooks/useCreatePool';

const SelectType = () => {
  const { isDesktopView } = useScreenSize();
  const { submitPartial, nextStep } = useCreatePool();

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

  return (
    <VStack space={8} padding={2} style={{ minWidth: '600px' }} width="1/2" marginX="auto">
      <Text fontSize={isDesktopView ? '3xl' : '2xl'} textAlign="center" fontWeight="600" color="#1B7BEC">
        About Various Pools
      </Text>
      <Center>
        <Text maxW="2/3">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos ipsa ab nemo fugiat expedita, facilis
          voluptatibus magni velit odio quis cumque quidem veniam fuga. Ea perferendis voluptas voluptatum in iste!
        </Text>
      </Center>
      {poolTypes.map((poolType, index) => (
        <Pressable
          key={index}
          disabled={poolType.disabled}
          onPress={() => {
            submitPartial({ poolType: poolType.id });
            nextStep();
          }}>
          <HStack
            minH={130}
            borderRadius={16}
            borderWidth={isDesktopView ? 0 : 2}
            borderColor="goodPurple.400"
            backgroundColor="white"
            space={4}
            alignItems="center"
            justifyContent="center"
            padding={4}
            style={{ maxWidth: '100%' }}>
            <Box width="1/6" alignItems="center">
              <img width="40" src={poolType.icon} />
            </Box>
            <VStack w="4/6" space={2}>
              <Text textTransform="uppercase" color="goodPurple.500" fontWeight="600">
                {poolType.name}
              </Text>
              <Text fontSize="xs">{poolType.description}</Text>
              {poolType.interested && (
                <Badge maxW="48" rounded="full" backgroundColor="gray.300">
                  'Interested? Please reach out!'
                </Badge>
              )}
            </VStack>
            <Box w="1/6">{!poolType.disabled && <Checkbox value={'true'} />}</Box>
          </HStack>
        </Pressable>
      ))}
    </VStack>
  );
};

export default SelectType;
