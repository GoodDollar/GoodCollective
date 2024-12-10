import { useState } from 'react';
import { Box, HStack, Radio } from 'native-base';

import { useScreenSize } from '../theme/hooks';

interface DropdownProps {
  onSelect: (value: string) => void;
  options?: string[];
}

const WhiteDot = () => <Box color="blue" backgroundColor="white" width={3} height={3} borderRadius="50" />;

const FrequencySelector = ({ onSelect, options = ['One-Time', 'Monthly'] }: DropdownProps) => {
  const [value, setValue] = useState('One-Time');
  const { isDesktopView, isTabletView } = useScreenSize();

  return (
    <HStack justifyContent={'space-between'} w={isTabletView ? '100%' : '90%'} m="auto">
      <Radio.Group
        name="donationFrequency"
        value={value}
        onChange={(v) => {
          setValue(v);
          onSelect(v);
        }}
        style={{ flexDirection: 'row' }}
        width="100%"
        flexDir="row"
        justifyContent="space-between"
        flexBasis={isDesktopView ? '50%' : '100%'}
        flexShrink={1}
        flexGrow={0}>
        {options.map((option) => (
          <Radio
            key={option}
            w={8}
            h={8}
            backgroundColor={value === option ? 'goodPurple.400' : 'white'}
            padding={2.5}
            icon={<WhiteDot />}
            value={option}>
            {option === 'Monthly' ? 'Streaming' : option}
          </Radio>
        ))}
      </Radio.Group>
    </HStack>
  );
};

export default FrequencySelector;
