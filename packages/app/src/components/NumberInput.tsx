import { useCallback } from 'react';
import { Box, HStack, Input, Text, VStack } from 'native-base';
import { noop } from 'lodash';

import Dropdown from './Dropdown';
import { useScreenSize } from '../theme/hooks';

const NumberInput = ({
  type,
  dropdownValue,
  onSelect = noop,
  onChangeAmount,
  options = [],
  isWarning = false,
  inputValue = undefined,
  withDuration = false,
}: {
  type: string;
  dropdownValue: string;
  onSelect?: (v: string) => void;
  onChangeAmount: (v: string) => void;
  options?: { value: string; label: string }[];
  isWarning?: boolean;
  inputValue?: string | undefined;
  withDuration?: boolean;
}) => {
  const { isMobileView } = useScreenSize();
  const onChange = useCallback(
    (v: string) => {
      if (!/^\d+(\.\d{0,18})?$/.test(v)) {
        console.error('Invalid input', v);
        if (v !== '') {
          return;
        }
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
        {type === 'token' ? <Dropdown value={dropdownValue} onSelect={onSelect} options={options} /> : <Box />}
        <HStack alignItems="center" flexShrink={3} justifyContent="flex-end">
          <HStack justifyContent="flex-end" flexShrink={1}>
            <Input
              flexShrink={1}
              defaultValue=""
              keyboardType="decimal-pad"
              multiline={false}
              placeholder={'0.00'}
              outlineStyle="none"
              borderColor="white"
              bgColor="blue"
              color={isWarning ? 'goodOrange.300' : 'goodPurple.400'}
              fontWeight={isWarning ? '700' : '400'}
              textAlign="right"
              paddingLeft={2.5}
              fontSize={isMobileView ? 'md' : 'l'} // todo: apply font-size as per design
              _focus={{
                outlineStyle: 'none',
                borderColor: 'white',
                bgColor: 'white',
              }}
              value={inputValue ?? ''}
              maxLength={20}
              onChangeText={onChange}
            />
          </HStack>
        </HStack>
        {type === 'duration' || withDuration ? (
          <HStack backgroundColor="goodGrey.100" paddingX={2} paddingY={2.5} borderRadius={12}>
            <Text variant="bold" fontSize="sm">
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
