import { Box, Divider, HStack, Input, NumberInput, Pressable, Progress, Radio, VStack } from 'native-base';
import ActionButton from '../../ActionButton';
import { Text } from 'native-base';
import { ReactNode, useState } from 'react';
import { Form } from '../CreateGoodCollective';

const Disclaimer = ({ hideIcon, text }: { hideIcon?: boolean; text: string | ReactNode }) => {
  return (
    <Box borderWidth={1} backgroundColor="goodPurple.100" padding={2}>
      <HStack>
        {!hideIcon && <>Icon</>}
        <Text>{text}</Text>
      </HStack>
    </Box>
  );
};

const PoolConfiguration = ({
  form,
  onStepForward,
  onStepBackward,
}: {
  form: Form;
  onStepForward: Function;
  onStepBackward: () => {};
}) => {
  const [poolManagerFeeType, setPoolManagerFeeType] = useState<'default' | 'custom'>(
    form.poolManagerFeeType ?? 'default'
  );
  const [claimFrequency, setClaimFrequency] = useState<'day' | 'week' | '14days' | '30days' | 'custom'>(
    form.claimFrequency ?? 'day'
  );
  const [joinStatus, setJoinStatus] = useState<'closed' | 'open'>(form.joinStatus ?? 'closed');

  // TODO
  const validate = () => {
    return true;
  };

  const baseFrequencies = [
    {
      name: 'Every day',
      value: 'day',
    },
  ];

  const claimFrequencies = baseFrequencies.concat([
    {
      name: 'Every week',
      value: 'week',
    },
    {
      name: 'Every 14 days',
      value: '14days',
    },
    {
      name: 'Every 30 days',
      value: '30days',
    },
  ]);

  return (
    <VStack>
      <Text fontSize="2xl" fontWeight="700">
        Project Configuration
      </Text>
      <Text mb={6} fontSize="xs" color="gray.500">
        Add a detalied description, project links and disclaimer to help educate contributors about your project and
        it's goals
      </Text>
      <Text>Pool Manager</Text>
      <Text>Wallet address(es) that can change pool configuration, add and remove members</Text>
      <Disclaimer text="Make sure your wallet that is connected is the wallet that you want to manage your pool with." />
      <ActionButton text="Change Wallet" bg="goodPurple.400" textColor="white" />
      <Box borderWidth={2} borderColor="gray.200" backgroundColor="white" padding={4}>
        <Text fontSize="md" fontWeight="400" color="gray.400">
          Fortified.eth
        </Text>
        <Text fontSize="sm" fontWeight="500" color="gray.400">
          0xasd
        </Text>
      </Box>
      <Box backgroundColor="white" padding={4}>
        <VStack space={2}>
          <Text fontWeight="600">Maximum amount of members</Text>
          <Text fontSize="xs" color="gray.500">
            Total amount of members that can be recipients of this pool.
          </Text>
          <Input value="1" />
          <Text fontSize="xs" color="gray.600">
            Make sure the total amount of recipients, tallies with the number of addresses in the pool recipients.
          </Text>
        </VStack>
      </Box>
      <Box backgroundColor="white" padding={2}>
        <Text textTransform="uppercase" fontWeight="700">
          Pool Recipients
        </Text>
        <Text color="gray.500">
          Wallet address(es) of all pool recipients, Split the confirmed addresses of recipients in the form field with
          ','
        </Text>
        <Input value="0x1,0x2" color="gray.400" backgroundColor="white" fontWeight="500" />
        <Text>New members after launch</Text>
        <Radio.Group
          name="myRadioGroup"
          accessibilityLabel="favorite number"
          value={joinStatus}
          onChange={(nextValue) => {
            setJoinStatus(nextValue as 'closed' | 'open');
          }}>
          <Radio value="closed" my={1}>
            Closed for new members
          </Radio>
          <Radio value="open" my={1}>
            New members can join
          </Radio>
        </Radio.Group>
      </Box>
      <Box>
        <Text textTransform="uppercase" fontWeight="700">
          Pool Manager Fee
        </Text>
        <Text color="gray.500">
          Pool manager can take a certain percentage by setting up the Pool which is optional
        </Text>
        <Disclaimer text="Pool manager can take fee payout for setting up the pool in custom mode or prefer not to take any manager fee in the default mode" />
        <Radio.Group
          name="myRadioGroup"
          accessibilityLabel="favorite number"
          value={poolManagerFeeType}
          onChange={(nextValue) => {
            setPoolManagerFeeType(nextValue as 'default' | 'custom');
          }}>
          <HStack>
            {/* TODO Use different checkbox icon */}
            <Pressable
              padding={4}
              my={1}
              borderWidth={1}
              borderColor="goodPurple.400"
              flexDirection="row"
              onPress={() => setPoolManagerFeeType('default')}>
              defaultIcon Default
              <Radio value="default">{}</Radio>
            </Pressable>
            <Pressable
              padding={4}
              my={1}
              borderWidth={1}
              borderColor="goodPurple.400"
              flexDirection="row"
              onPress={() => setPoolManagerFeeType('custom')}>
              customIcon Custom
              <Radio value="custom">{}</Radio>
            </Pressable>
          </HStack>
        </Radio.Group>
      </Box>
      {poolManagerFeeType === 'custom' && (
        <Box>
          <Disclaimer
            hideIcon
            text="Pool manager takes a payout from the pool for setting it up, which the maximum is 30% which is charged from the pool"
          />
          <Box backgroundColor="white" padding={4}>
            <Text>Manager Fee Percentage</Text>
            <HStack alignItems="center" space={4}>
              <Progress width="1/2" value={10} colorScheme="blueGray" />
              {/* TODO Add percentage */}
              <Input value="10" maxWidth="16" />
            </HStack>
          </Box>
        </Box>
      )}
      <Box>
        <Text>Claim Frequency</Text>
        <Text>Note that all claims will happen based on GoodDollar UBI clock which resets at 12 UTC</Text>
        <Radio.Group
          name="myRadioGroup"
          accessibilityLabel="favorite number"
          value={claimFrequency}
          onChange={(nextValue) => {
            setClaimFrequency(nextValue as 'day' | 'week' | '14days' | '30days' | 'custom');
          }}>
          {poolManagerFeeType === 'default' &&
            baseFrequencies.map((fq) => (
              <Radio value={fq.value} my={1}>
                {fq.name}
              </Radio>
            ))}
          {poolManagerFeeType === 'custom' && (
            <>
              {claimFrequencies.map((fq) => (
                <Radio value={fq.value} my={1}>
                  {fq.name}
                </Radio>
              ))}
              <Box borderWidth={1}>
                <Radio value="custom" my={1}>
                  <VStack>
                    <Text>Custom (per days)</Text>
                    <Text>Customize the days for the pool payouts</Text>
                    <HStack>
                      <Input value="1" />
                      <Text>Day</Text>
                    </HStack>
                  </VStack>
                </Radio>
              </Box>
            </>
          )}
        </Radio.Group>
      </Box>
      <Box>
        <Text>Payout Settings</Text>
        <Divider />

        <Disclaimer
          text={
            <VStack space={4}>
              <Text>
                For a fixed amount per claimFrequency the pool needs to be funded with a minimum amount to sustain
                expected amount of members in one cycle. The pool will be paused if you choose to fund less money then
                this minimum and more members then you expect to join.
              </Text>
              <Text>
                Use the widget below to configure this settings.  It will also show you the minimum amount of funding
                needed to sustain the pool with your chosen settings
              </Text>
            </VStack>
          }
        />

        <Box backgroundColor="goodPurple.100">
          <Text>Claim Amount Per Week</Text>
          <Input value="10" maxWidth="16" />
          <Text>Expected Members</Text>
          <Progress width="1/2" value={10} colorScheme="blueGray" />
          <Box backgroundColor="goodPurple.200">
            <Text>
              For a fixed amount of <Text bold> XG$ per week</Text>, your pool needs at least <Text bold>XG$</Text> to
              support <Text bold>X members</Text> per cycle.
            </Text>
            <HStack>
              icon
              <Text>Funding below this may pause the pool if more members join.</Text>
            </HStack>
          </Box>
        </Box>
      </Box>
      <HStack w="full" justifyContent="space-between">
        <ActionButton onPress={() => onStepBackward()} text={'Back'} bg="white" textColor="black" />
        <ActionButton
          onPress={() => {
            if (validate()) onStepForward();
          }}
          text="Next: Review"
          bg="goodPurple.400"
          textColor="white"
        />
      </HStack>
    </VStack>
  );
};

export default PoolConfiguration;
