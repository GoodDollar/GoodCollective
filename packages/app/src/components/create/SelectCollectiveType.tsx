import { Text, Badge, Checkbox, HStack, VStack } from 'native-base';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { CommunityFundsIcon, SegmentedAidIcon, ResultsBasedIcon } from '../../assets';

// TODO All components wrap a component that has a step forward and backward callback
const SelectType = ({ onStepForward }: { onStepForward: () => {} }) => {
  type PoolType = 'community-funds' | 'segmented-aid' | 'results-based';
  const [type, setType] = useState<PoolType>();

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
    <VStack space={8}>
      <div>About Various Pools</div>
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos ipsa ab nemo fugiat expedita, facilis
      voluptatibus magni velit odio quis cumque quidem veniam fuga. Ea perferendis voluptas voluptatum in iste!
      {poolTypes.map((poolType) => (
        <Pressable
          disabled={poolType.disabled}
          onPress={() => {
            setType(poolType.id);
            onStepForward();
          }}>
          <HStack backgroundColor="white" space={8} alignItems="center" justifyContent="center" paddingY={4}>
            <img src={poolType.icon} />
            <VStack w="4/6">
              <Text textTransform="uppercase">{poolType.name}</Text>
              <div>{poolType.description}</div>
              <div>
                {poolType.interested && (
                  <Badge maxW="48" rounded="full">
                    'Interested? Please reach out!'
                  </Badge>
                )}
              </div>
            </VStack>
            <div>{!poolType.disabled && <Checkbox value={'true'} />}</div>
          </HStack>
        </Pressable>
      ))}
    </VStack>
  );
};

export default SelectType;
