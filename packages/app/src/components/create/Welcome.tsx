import { Text, Box, Checkbox, HStack, Radio, VStack } from 'native-base';
import { useState } from 'react';
import { CreateCollectiveLogo } from '../../assets';
import ActionButton from '../ActionButton';
import { useScreenSize } from '../../theme/hooks';

const Welcome = ({ onStepForward }: { onStepForward: () => {} }) => {
  const [value, setValue] = useState<string>();
  const [acknowledged, setAcknowledged] = useState<string>('');
  const { isDesktopView } = useScreenSize();

  const onSubmit = () => {
    if (!acknowledged) {
      // Show error
      return;
    }
    onStepForward();
  };

  return (
    <VStack space={4} padding={2}>
      <Text fontSize="3xl" textAlign="center" fontWeight="600" color="goodPurple.500">
        Welcome to
      </Text>
      <img src={CreateCollectiveLogo} />
      <Box backgroundColor={isDesktopView ? 'white' : 'goodPurple.300'} borderRadius={8} padding={8}>
        <Text textAlign="center" marginBottom={4}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam totam, tempore saepe beatae et quidem provident
          aperiam esse recusandae rem fugiat laboriosam est rerum enim at magni suscipit amet qui. Lorem ipsum dolor,
          sit amet consectetur adipisicing elit. Totam similique vel odio incidunt enim officiis, quo dignissimos
          quaerat officia omnis at dolorem itaque dolore pariatur tempora? Quo ratione sequi dolorem. Lorem ipsum dolor
          sit amet consectetur adipisicing elit. Repellendus eum similique culpa dolore quos doloremque. Nostrum quo rem
          deserunt, sit sint hic itaque? Cumque incidunt facilis repellendus vero magnam dolorem.
        </Text>
        <Text textAlign="center">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione cupiditate, labore ducimus quae suscipit
          tempora minus non nihil inventore ipsa dignissimos ex corrupti adipisci impedit autem repudiandae
          reprehenderit eum in!
        </Text>
      </Box>
      <Box
        borderWidth={isDesktopView ? 0 : 2}
        borderColor="goodPurple.400"
        background="white"
        borderRadius={8}
        padding={8}>
        <Radio.Group
          name="donationFrequency"
          value={value}
          onChange={(v) => {
            setValue(v);
            console.log(v);
          }}
          flexDir="column"
          justifyContent="space-between"
          flexBasis={{ lg: '100%', md: '70%', sm: '100%', base: '100%' }}>
          <Radio value="one" my={4}>
            <Text fontSize="xs">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Animi, dignissimos fugit adipisci, ex libero
              laborum praesentium officiis
            </Text>
          </Radio>
          <Radio value="two">
            <Text fontSize="xs">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates maiores ab dicta vero veritatis omnis
              natus ration
            </Text>
          </Radio>
        </Radio.Group>
      </Box>
      <HStack backgroundColor={isDesktopView ? 'white' : 'goodPurple.300'} borderRadius={8} padding={8} space={4}>
        <Checkbox
          colorScheme="danger"
          value={String(acknowledged)}
          onChange={(v) => setAcknowledged(String(v))}
          accessibilityLabel="TODO"
        />
        <Text fontSize="sm">I understand</Text>
      </HStack>
      {/* TODO Color */}
      <ActionButton onPress={onSubmit} text="Get Started" bg="goodPurple.400" textColor="white" />
    </VStack>
  );
};

export default Welcome;
