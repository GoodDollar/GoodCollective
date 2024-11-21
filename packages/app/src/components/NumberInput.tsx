import { useCallback } from 'react';
import { Box, HStack, Input, Text, VStack } from 'native-base';
import { noop } from 'lodash';

import Dropdown from './Dropdown';

const NumberInput = ({
  type,
  value,
  onSelect = noop,
  onChangeAmount,
  options = [],
  isWarning = false,
  defaultInput = undefined,
}: {
  type: string;
  value: string;
  onSelect?: (v: string) => void;
  onChangeAmount: (v: string) => void;
  options?: { value: string; label: string }[];
  isWarning?: boolean;
  defaultInput?: string | undefined;
}) => {
  const onChange = useCallback(
    (v: string) => {
      if (!/^\d+(\.\d{0,18})?$/.test(v)) {
        console.error('Invalid input', v);
        onChangeAmount(v);
        return;
      }

      onChangeAmount(v);
    },
    [onChangeAmount]
  );

  return (
    <VStack>
      <HStack
        justifyContent="space-between"
        flexShrink={1}
        borderColor={isWarning ? 'goodOrange.300' : 'goodPurple.500'}
        borderWidth="1"
        borderRadius="20"
        padding={2}
        paddingRight={4}
        space={4}>
        {type === 'token' ? <Dropdown value={value} onSelect={onSelect} options={options} /> : <Box />}
        <HStack alignItems="center" flexGrow={1} justifyContent="flex-end">
          <HStack justifyContent="flex-end">
            <Input
              defaultValue=""
              keyboardType="decimal-pad"
              multiline={false}
              placeholder={'0.00'}
              outlineStyle="none"
              borderColor="white"
              width="159"
              bgColor="blue"
              color={isWarning ? 'goodOrange.300' : 'goodPurple.400'}
              fontWeight={isWarning ? '700' : '400'}
              textAlign="right"
              paddingLeft={2.5}
              fontSize="l"
              _focus={{
                outlineStyle: 'none',
                borderColor: 'white',
                bgColor: 'white',
              }}
              value={defaultInput ?? ''}
              maxLength={9}
              onChangeText={onChange}
            />
          </HStack>
        </HStack>
        {type === 'duration' ? (
          <HStack backgroundColor="goodGrey.100" paddingX={2} paddingY={2.5} borderRadius={12}>
            <Text variant="bold" fontSize="md">
              / Month
            </Text>
          </HStack>
        ) : (
          <></>
        )}
      </HStack>
    </VStack>
  );
};

export default NumberInput;
