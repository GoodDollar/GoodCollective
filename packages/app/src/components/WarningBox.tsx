import React from 'react';
import { Text, Image, HStack, Link, VStack } from 'native-base';
import { InfoIconOrange } from '../assets';

interface WarningBoxContent {
  title?: string;
  Explanation?: React.ComponentType<any>;
  suggestion?: string[];
  href?: string;
}

interface WarningBoxProps {
  content?: WarningBoxContent;
  explanationProps?: any;
  type?: 'info' | 'warning';
  children?: React.ReactNode;
}

const WarningBox: React.FC<WarningBoxProps> = ({ content, explanationProps = {}, type = 'warning', children }) => {
  // If children are provided, render simple info/warning box (replaces InfoCallout)
  if (children) {
    const bgColor = type === 'warning' ? 'goodOrange.200' : 'blue.50';
    const borderColor = type === 'warning' ? 'goodOrange.300' : 'blue.200';
    const textColor = type === 'warning' ? 'goodOrange.500' : 'blue.700';

    return (
      <HStack
        space={3}
        backgroundColor={bgColor}
        borderRadius={8}
        borderWidth={1}
        borderColor={borderColor}
        paddingY={3}
        paddingX={3}
        alignItems="flex-start"
        marginTop={3}>
        {type === 'warning' && (
          <Image source={{ uri: InfoIconOrange }} alt="Warning icon" style={{ width: 16, height: 16 }} />
        )}
        <VStack flex={1}>
          <Text color={textColor} fontSize="sm">
            {children}
          </Text>
        </VStack>
      </HStack>
    );
  }

  // Original complex content structure (for DonateComponent)
  if (!content) return null;

  const { Explanation } = content;

  return (
    <HStack
      space={3}
      backgroundColor="goodOrange.200"
      borderRadius={12}
      borderWidth="1"
      borderColor="goodOrange.300"
      paddingY={3}
      paddingX={3}
      alignItems="flex-start"
      shadow="1">
      <Image source={{ uri: InfoIconOrange }} alt="Warning icon" style={{ width: 20, height: 20 }} />
      <VStack space={4} maxWidth="100%">
        <VStack space={1}>
          {content.title && (
            <Text variant="bold" color="goodOrange.500">
              {content.title}
            </Text>
          )}

          {Explanation ? <Explanation {...explanationProps} /> : null}
        </VStack>
        {content.suggestion ? (
          <VStack space={2}>
            <Text variant="bold" color="goodOrange.500">
              You may:
            </Text>
            <VStack space={0}>
              <Text color="goodOrange.500" flexDir="column" display="flex">
                {content.suggestion.map((suggestion: string, index: number) => (
                  <Text key={index}>
                    {index + 1}. {suggestion}
                  </Text>
                ))}
                {content.href && (
                  <Link color="goodOrange.500" href={content.href} isExternal>
                    <Text>{content.suggestion.length + 1}. </Text>
                    <Text textDecorationLine="underline">Purchase and use GoodDollar</Text>
                  </Link>
                )}
              </Text>
            </VStack>
          </VStack>
        ) : null}
      </VStack>
    </HStack>
  );
};

export default WarningBox;
