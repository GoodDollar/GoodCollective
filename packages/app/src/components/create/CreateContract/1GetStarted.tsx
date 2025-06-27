import { VStack, Text, FormControl, Input, WarningOutlineIcon, TextArea, HStack, Box, Center } from 'native-base';
import { DownloadIcon } from '../../../assets';

const GetStarted = () => {
  return (
    <VStack padding={2}>
      <Text fontSize="2xl" fontWeight="700">
        Get Started
      </Text>
      <Text mb={6} fontSize="xs" color="gray.500">
        Add basic information about your project, details can be edited later
      </Text>
      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
            Project Name
          </Text>
        </FormControl.Label>
        <FormControl.HelperText mt={0} mb={2}>
          Give a brief name to your project that it can be identified with.
        </FormControl.HelperText>
        <Input />
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>
      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
            Tagline
          </Text>
        </FormControl.Label>
        <Input />
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>
      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
            Project Description
          </Text>
        </FormControl.Label>
        <TextArea autoCompleteType={undefined} />
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>
      <HStack style={{ maxWidth: '100%' }} justifyContent="space-between">
        <div style={{ width: '40%' }}>
          <FormControl mb="5" isRequired>
            <FormControl.Label>
              <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
                Logo
              </Text>
            </FormControl.Label>

            <FormControl.HelperText mt={0} mb={2}>
              SVG, PNG, JPG or GIF (500x500px)
            </FormControl.HelperText>
            {/* TODO Separate into component */}
            <Box backgroundColor="white" mt={2} padding={6}>
              <Center>
                <img src={DownloadIcon} alt="" />
                <Text>Click to upload</Text>
              </Center>
            </Box>
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
              Something is wrong.
            </FormControl.ErrorMessage>
          </FormControl>
        </div>

        <div style={{ width: '55%' }}>
          <FormControl mb="5">
            <FormControl.Label>
              <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
                Cover Photo
              </Text>
            </FormControl.Label>

            <FormControl.HelperText mt={0} mb={2}>
              SVG, PNG, JPG or GIF (1400x256px)
            </FormControl.HelperText>
            {/* TODO Separate into component */}
            <Box backgroundColor="white" mt={2} padding={6}>
              <Center>
                <img src={DownloadIcon} alt="" />
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
