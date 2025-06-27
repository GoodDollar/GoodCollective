import { Box, Checkbox, HStack, Radio, VStack } from 'native-base';
import { useState } from 'react';
import RoundedButton from '../RoundedButton';

// TODO All components wrap a component that has a step forward and backward callback
const Welcome = ({ onStepForward }: { onStepForward: () => {} }) => {
  const [value, setValue] = useState<string>();
  const [acknowledged, setAcknowledged] = useState<string>('');

  const onSubmit = () => {
    if (!acknowledged) {
      // Show error
      // return;
    }
    onStepForward();
  };

  return (
    <VStack space={8}>
      <div>Welcome to Good Collective</div>
      <Box backgroundColor="white" padding={8}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam totam, tempore saepe beatae et quidem provident
        aperiam esse recusandae rem fugiat laboriosam est rerum enim at magni suscipit amet qui. Lorem ipsum dolor, sit
        amet consectetur adipisicing elit. Totam similique vel odio incidunt enim officiis, quo dignissimos quaerat
        officia omnis at dolorem itaque dolore pariatur tempora? Quo ratione sequi dolorem. Lorem ipsum dolor sit amet
        consectetur adipisicing elit. Ratione cupiditate, labore ducimus quae suscipit tempora minus non nihil inventore
        ipsa dignissimos ex corrupti adipisci impedit autem repudiandae reprehenderit eum in!
      </Box>
      <Box background="white" padding={8}>
        <Radio.Group
          name="donationFrequency"
          value={value}
          onChange={(v) => {
            setValue(v);
            console.log(v);
          }}
          style={{ flexDirection: 'column' }}
          flexDir="column"
          justifyContent="space-between"
          flexBasis={{ lg: '100%', md: '70%', sm: '100%', base: '100%' }}>
          <div>
            <Radio value="one" my={1}>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Animi, dignissimos fugit adipisci, ex libero
              laborum praesentium officiis
            </Radio>
          </div>
          <div>
            <Radio value="two">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates maiores ab dicta vero veritatis omnis
              natus ration
            </Radio>
          </div>
        </Radio.Group>
      </Box>
      <HStack background="white" padding={8} space={4}>
        <Checkbox value={String(acknowledged)} onChange={(v) => setAcknowledged(String(v))} accessibilityLabel="TODO" />
        <div>I understand</div>
      </HStack>
      {/* TODO Color */}
      <RoundedButton onPress={onSubmit} title={'Get Started'} backgroundColor={'blue'} color={'white'} />
    </VStack>
  );
};

export default Welcome;
