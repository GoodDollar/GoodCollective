import { Text, Image, HStack, Link, VStack } from 'native-base';
import { InfoIconOrange } from '../assets';

const WarningBox = ({ content, explanationProps = {} }: any) => {
  const Explanation = content.Explanation;

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
          <Text variant="bold" color="goodOrange.500">
            {content.title}
          </Text>

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
