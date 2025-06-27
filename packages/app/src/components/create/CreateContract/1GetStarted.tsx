import { VStack, Text, FormControl, Input, WarningOutlineIcon, TextArea, HStack, Box, Center } from 'native-base';

const GetStarted = () => {
  return (
    <VStack>
      <h2>Get Started</h2>
      <p>Add basic information about your project, details can be edited later</p>
      <Text bold fontSize="xl" mb="4">
        Default
      </Text>
      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text textTransform="uppercase">Project Name</Text>
        </FormControl.Label>
        <FormControl.HelperText>
          Give a brief name to your project that it can be identified with.
        </FormControl.HelperText>
        <Input />
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>
      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text textTransform="uppercase">Tagline</Text>
        </FormControl.Label>
        <Input />
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>
      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text textTransform="uppercase">Project Description</Text>
        </FormControl.Label>
        <TextArea autoCompleteType={undefined} />
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>
      <HStack style={{ maxWidth: '100%' }} justifyContent="space-between">
        <div>
          <FormControl mb="5" isRequired>
            <FormControl.Label>
              <Text textTransform="uppercase">Logo</Text>
            </FormControl.Label>

            <FormControl.HelperText>SVG, PNG, JPG or GIF (500x500px)</FormControl.HelperText>
            {/* TODO Separate into component */}
            <Box backgroundColor="white">
              <Center>
                icon
                <Text>Click to upload</Text>
              </Center>
            </Box>
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
              Something is wrong.
            </FormControl.ErrorMessage>
          </FormControl>
        </div>

        <div>
          <FormControl mb="5">
            <FormControl.Label>
              <Text textTransform="uppercase">Cover Photo</Text>
            </FormControl.Label>

            <FormControl.HelperText>SVG, PNG, JPG or GIF (1400x256px)</FormControl.HelperText>
            {/* TODO Separate into component */}
            <Box backgroundColor="white">
              <Center>
                icon
                <Text>Click to upload</Text>
              </Center>
            </Box>
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
              Something is wrong.
            </FormControl.ErrorMessage>
          </FormControl>
        </div>
      </HStack>
    </VStack>
  );
};

export default GetStarted;
