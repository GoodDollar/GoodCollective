import { useState } from 'react';
import { VStack, Text, FormControl, Input, WarningOutlineIcon, TextArea, HStack, Box, Center } from 'native-base';
import { StyleSheet } from 'react-native';

import { DownloadIcon } from '../../../assets';
import ActionButton from '../../ActionButton';
import { Form } from '../CreateGoodCollective';

// TODO Separate into component
// TODO Handle upload
const FileUpload = ({ style, onUpload }: { style: FieldError | {}; onUpload: Function }) => {
  return (
    <Box
      style={style as {}}
      borderWidth={2}
      borderRadius={8}
      borderStyle="dotted"
      borderColor="gray.300"
      backgroundColor="white"
      mt={2}
      padding={6}>
      <Center>
        <img src={DownloadIcon} alt="" />
        <Text>Click to upload</Text>
      </Center>
    </Box>
  );
};

const Warning = () => {
  return (
    <HStack backgroundColor="goodPurple.100" padding={6} maxW="2/3">
      icon
      <Text fontSize="md" color="goodPurple.400">
        Please fill all required fields before proceedings to details section
      </Text>
    </HStack>
  );
};

type FieldError = {
  projectName?: string;
  projectDescription?: string;
  tagline?: string;
  logo?: string;
  coverPhoto?: string;
};

const GetStarted = ({
  form,
  onStepForward,
  onStepBackward,
}: {
  form: Form;
  onStepForward: Function;
  onStepBackward: () => {};
}) => {
  const [projectName, setProjectName] = useState<string>(form.projectName ?? '');
  const [tagline, setTagline] = useState<string>(form.tagline ?? '');
  const [projectDescription, setProjectDescription] = useState<string>(form.projectDescription ?? '');
  const [logo, setLogo] = useState<string>(form.logo ?? '');
  const [coverPhoto, setCoverPhoto] = useState<string>(form.coverPhoto ?? '');
  const [errors, setErrors] = useState<FieldError>({});

  const onSubmit = () => {
    if (validate())
      onStepForward({
        projectName,
        tagline,
        projectDescription,
        logo,
        coverPhoto,
      });
  };

  const validate = () => {
    const currErrors: FieldError = {};

    if (!projectName) {
      currErrors.projectName = 'Project name is required';
    } else if (projectName.length > 100) {
      currErrors.projectName = 'Project name length (max 100 characteres)';
    }

    if (!projectDescription) {
      currErrors.projectDescription = 'Project name is required';
    } else if (projectDescription.length > 500) {
      currErrors.projectDescription = 'Project description length (max 500 characteres)';
    }

    if (!logo) {
      currErrors.logo = 'Logo is required';
    } else if (logo.length > 1) {
      currErrors.logo = 'Logo size (max 1 MB)';
    }

    if (coverPhoto && coverPhoto.length > 20) {
      currErrors.logo = 'Cover photo size (max 20MB)';
    }

    setErrors({
      ...errors,
      ...currErrors,
    });

    return Object.keys(currErrors).length;
  };

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
        <Input
          style={errors.projectName ? styles.error : {}}
          backgroundColor="white"
          value={projectName}
          onChangeText={(val) => setProjectName(val)}
          borderRadius={8}
        />
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
        <Input
          style={errors.tagline ? styles.error : {}}
          backgroundColor="white"
          value={tagline}
          onChangeText={(val) => setTagline(val)}
          borderRadius={8}
        />
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
        <TextArea
          style={errors.projectDescription ? styles.error : {}}
          backgroundColor="white"
          value={projectDescription}
          autoCompleteType={undefined}
          onChangeText={(val) => setProjectDescription(val)}
          borderRadius={8}
        />
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
            <FileUpload style={errors.logo ? styles.error : {}} onUpload={setLogo} />
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
            <FileUpload style={errors.coverPhoto ? styles.error : {}} onUpload={setCoverPhoto} />
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
              Something is wrong.
            </FormControl.ErrorMessage>
          </FormControl>
        </div>
      </HStack>
      <HStack w="full" justifyContent="space-between">
        <ActionButton onPress={() => onStepBackward()} text={'Back'} bg="white" textColor="black" />
        <ActionButton onPress={onSubmit} text="Next: Details" bg="goodPurple.400" textColor="white" />
      </HStack>
      {Object.keys(errors).length > 0 && <Warning />}
    </VStack>
  );
};

const styles = StyleSheet.create({
  error: {
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'red',
  },
});

export default GetStarted;
