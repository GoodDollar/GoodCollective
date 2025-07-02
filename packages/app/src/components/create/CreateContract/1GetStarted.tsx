import { useEffect, useRef, useState } from 'react';
import {
  VStack,
  Text,
  FormControl,
  Input,
  WarningOutlineIcon,
  TextArea,
  HStack,
  Box,
  Center,
  Flex,
  Pressable,
  ChevronLeftIcon,
  WarningTwoIcon,
  ArrowForwardIcon,
} from 'native-base';
import { StyleSheet } from 'react-native';

import { DownloadIcon } from '../../../assets';
import ActionButton from '../../ActionButton';
import { useScreenSize } from '../../../theme/hooks';
import { useCreatePool } from '../../../hooks/useCreatePool';

// TODO Separate into component
const FileUpload = ({ style, onUpload }: { style: FieldError | {}; onUpload: Function }) => {
  const uploader = useRef(null);
  const [fileName, setFileName] = useState<string>('');

  return (
    <Pressable onPress={() => (uploader.current as unknown as HTMLInputElement)?.click()}>
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
          {!fileName && <Text>Click to upload</Text>}
          <Text overflow="hidden">{fileName}</Text>
        </Center>
      </Box>
      <input
        style={{ display: 'none' }}
        ref={uploader}
        type="file"
        name="myImage"
        accept="image/svg+xml,image/png,image/jpeg,image/gif"
        onChange={(event) => {
          if (!event.target.files) return;
          setFileName(event.target.files[0].name);
          onUpload(event.target.files[0]);
        }}
      />
    </Pressable>
  );
};

const Warning = ({ width }: { width: string }) => {
  return (
    <HStack backgroundColor="goodPurple.100" padding={6} alignItems="center" space={2} width={width}>
      <WarningTwoIcon color="red.600" size="md" />
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

async function fetchImageAsFile(url: string, filename = 'image.jpg') {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const blob = await response.blob();
  const contentType = response.headers.get('Content-Type') || 'image/jpeg';
  const file = new File([blob], filename, { type: contentType });

  return file;
}

// TODO
const uploadImg = async (img: File, name: string) => {};

const GetStarted = ({}: {}) => {
  const { form, nextStep, previousStep, submitPartial } = useCreatePool();

  const { isDesktopView } = useScreenSize();

  const [projectName, setProjectName] = useState<string>(form.projectName ?? '');
  const [tagline, setTagline] = useState<string>(form.tagline ?? '');
  const [projectDescription, setProjectDescription] = useState<string>(form.projectDescription ?? '');
  const [logo, setLogo] = useState<File | undefined>();
  const [coverPhoto, setCoverPhoto] = useState<File | undefined>();
  const [errors, setErrors] = useState<FieldError>({});

  // Display already uploaded images
  useEffect(() => {
    (async () => {
      if (form.logo) {
        setLogo(await fetchImageAsFile(form.logo, form.logo.split('/').pop()));
      }
      if (form.coverPhoto) {
        setCoverPhoto(await fetchImageAsFile(form.coverPhoto, form.coverPhoto.split('/').pop()));
      }
    })();
  }, [form.coverPhoto, form.logo]);

  useEffect(() => {
    if (!logo) return;
    (async () => {
      await uploadImg(logo, logo.name);
    })();
  }, [logo]);

  useEffect(() => {
    if (!coverPhoto) return;
    (async () => {
      await uploadImg(coverPhoto, coverPhoto.name);
    })();
  }, [coverPhoto]);

  const onSubmit = () => {
    if (validate()) {
      submitPartial({
        projectName,
        tagline,
        projectDescription,
        logo: 'TODO',
        coverPhoto: 'TODO',
      });
      nextStep();
    }
  };

  const validate = () => {
    const currErrors: FieldError = {
      projectName: '',
      projectDescription: '',
      tagline: '',
      logo: '',
      coverPhoto: '',
    };
    let pass = true;

    if (!projectName) {
      currErrors.projectName = 'Project name is required';
      pass = false;
    } else if (projectName.length > 100) {
      currErrors.projectName = 'Project name length (max 100 characteres)';
      pass = false;
    }

    if (!projectDescription) {
      currErrors.projectDescription = 'Project name is required';
      pass = false;
    } else if (projectDescription.length > 500) {
      currErrors.projectDescription = 'Project description length (max 500 characteres)';
      pass = false;
    }

    if (!logo) {
      currErrors.logo = 'Logo is required';
      pass = false;
    } else if (logo.size > 1 * 1024 * 1024) {
      currErrors.logo = 'Logo size (max 1 MB)';
      pass = false;
    }

    if (coverPhoto && coverPhoto.size > 20) {
      currErrors.coverPhoto = 'Cover photo size (max 20MB)';
      pass = false;
    }

    setErrors({
      ...errors,
      ...currErrors,
    });

    return pass;
  };

  return (
    <VStack padding={2} style={{ minWidth: '600px' }} width="1/2" marginX="auto">
      <Text fontSize="2xl" fontWeight="700">
        Get Started
      </Text>
      <Text mb={6} fontSize="xs" color="gray.500">
        Add basic information about your project, details can be edited later
      </Text>
      <FormControl mb="5" isRequired isInvalid={!!errors.projectName}>
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
            Project Name
          </Text>
        </FormControl.Label>
        {isDesktopView && (
          <FormControl.HelperText mt={0} mb={2}>
            Give a brief name to your project that it can be identified with.
          </FormControl.HelperText>
        )}
        <Input
          style={errors.projectName ? styles.error : {}}
          backgroundColor="white"
          value={projectName}
          onChangeText={(val) => setProjectName(val)}
          autoComplete={undefined}
          borderRadius={8}
        />
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          {errors.projectName}
        </FormControl.ErrorMessage>
      </FormControl>
      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
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
      <FormControl mb="5" isRequired isInvalid={!!errors.projectDescription}>
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
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
          {errors.projectDescription}
        </FormControl.ErrorMessage>
      </FormControl>
      <Flex
        direction={isDesktopView ? 'row' : 'column'}
        style={{ maxWidth: '100%', gap: 32 }}
        justifyContent="space-between"
        alignItems="stretch">
        <FormControl width={isDesktopView ? '2/6' : '4/6'} isRequired isInvalid={!!errors.logo}>
          <FormControl.Label>
            <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
              Logo
            </Text>
          </FormControl.Label>

          <FormControl.HelperText mt={0} mb={2}>
            SVG, PNG, JPG or GIF(500x500px)
          </FormControl.HelperText>

          <Box marginTop="auto">
            <FileUpload style={errors.logo ? styles.error : {}} onUpload={setLogo} />
          </Box>
          {!!errors.coverPhoto && !errors.logo && <Box height={18} />}
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>{errors.logo}</FormControl.ErrorMessage>
        </FormControl>

        <FormControl flex={1} isInvalid={!!errors.coverPhoto}>
          <FormControl.Label>
            <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
              Cover Photo
            </Text>
          </FormControl.Label>

          <FormControl.HelperText mt={0} mb={2}>
            SVG, PNG, JPG or GIF (1400x256px)
          </FormControl.HelperText>
          <Box marginTop="auto">
            <FileUpload style={errors.coverPhoto ? styles.error : {}} onUpload={setCoverPhoto} />
          </Box>
          {!errors.coverPhoto && !!errors.logo && <Box height={26} />}
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.coverPhoto}
          </FormControl.ErrorMessage>
        </FormControl>
      </Flex>
      <HStack maxWidth="full" justifyContent="space-between">
        <ActionButton
          onPress={() => previousStep()}
          text={
            <HStack alignItems="center" space={1}>
              <ChevronLeftIcon /> <Text>Back</Text>
            </HStack>
          }
          bg="white"
          textColor="black"
        />
        <ActionButton
          onPress={onSubmit}
          text={
            <HStack alignItems="center" space={1}>
              <Text>Next: Details</Text>
              <ArrowForwardIcon />
            </HStack>
          }
          bg="goodPurple.400"
          textColor="white"
        />
      </HStack>
      <Box flexDir="row-reverse" paddingY={2}>
        {Object.keys(errors).length > 0 && <Warning width="1/2" />}
      </Box>
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
