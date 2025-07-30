import { useEffect, useState } from 'react';
import {
  VStack,
  Text,
  FormControl,
  Input,
  WarningOutlineIcon,
  TextArea,
  HStack,
  Box,
  Flex,
  ChevronLeftIcon,
  WarningTwoIcon,
  ArrowForwardIcon,
} from 'native-base';
import { StyleSheet } from 'react-native';

import ActionButton from '../../ActionButton';
import { useScreenSize } from '../../../theme/hooks';
import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import FileUpload from '../../FileUpload';
import { uploadImg } from '../../../hooks/useCreatePool/util';

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

type FormError = {
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

const GetStarted = ({}: {}) => {
  const { form, nextStep, previousStep, submitPartial } = useCreatePool();

  const { isDesktopView } = useScreenSize();

  const [projectName, setProjectName] = useState<string>(form.projectName ?? '');
  const [tagline, setTagline] = useState<string>(form.tagline ?? '');
  const [rewardDescription, setRewardDescription] = useState<string>(form.rewardDescription ?? '');
  const [projectDescription, setProjectDescription] = useState<string>(form.projectDescription ?? '');
  const [logo, setLogo] = useState<File | undefined>();
  const [coverPhoto, setCoverPhoto] = useState<File | undefined>();
  const [errors, setErrors] = useState<FormError>({});
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    (async () => {
      if (form.logo && !logo) {
        try {
          const resp = await fetchImageAsFile(form.logo, form.logo.split('/').pop());
          setLogo(resp);
        } catch (error) {
          const errorMsg = `Error fetching ${form.logo
            .split('/')
            .pop()}! Please reupload it or upload a different one.`;
          console.log(errorMsg);
          if (!errors.logo) setErrors({ ...errors, logo: errorMsg });
        }
      }
      if (form.coverPhoto && !coverPhoto) {
        try {
          const resp = await fetchImageAsFile(form.coverPhoto, form.coverPhoto.split('/').pop());
          setCoverPhoto(resp);
        } catch (error) {
          const errorMsg = `Error fetching ${form.coverPhoto
            .split('/')
            .pop()}! Please reupload it or upload a different one.`;
          console.log(errorMsg);
          if (!errors.logo) setErrors({ ...errors, logo: errorMsg });
        }
      }
    })();
  }, [coverPhoto, errors, form.coverPhoto, form.logo, logo]);

  useEffect(() => {
    if (!logo) return;
    (async () => {
      console.log('here');
      await uploadImg(logo, logo.name);
    })();
  }, [logo]);

  useEffect(() => {
    if (!coverPhoto) return;
    (async () => {
      await uploadImg(coverPhoto, coverPhoto.name);
    })();
  }, [coverPhoto]);

  const submitForm = () => {
    setShowWarning(true);
    if (validate(true)) {
      submitPartial({
        projectName,
        tagline,
        projectDescription,
        logo: logo?.name,
        coverPhoto: coverPhoto?.name,
      });
      nextStep();
    }
  };

  const validate = (checkEmpty = false) => {
    const currErrors: FormError = {
      projectName: '',
      projectDescription: '',
      tagline: '',
      logo: '',
      coverPhoto: '',
    };
    let pass = true;

    // Pool Name* - 100 character max
    // (Can have spaces, no special characters allowed, 0-9/a-z/A-Z)
    if (!projectName) {
      if (checkEmpty) {
        currErrors.projectName = 'Project name is required';
        pass = false;
      }
    } else if (projectName.length > 30) {
      currErrors.projectName = 'Project name length (max 30 characters)';
      pass = false;
    } else if (!/^[a-zA-Z0-9]*$/.test(projectName)) {
      currErrors.projectName = 'Project name cannot contain special characters';
      pass = false;
    }

    // Pool Description* - 500 character max
    if (!projectDescription) {
      console.log('here, ', showWarning);
      if (checkEmpty) {
        currErrors.projectDescription = 'Project description is required';
        pass = false;
      }
    } else if (projectDescription.length > 500) {
      currErrors.projectDescription = 'Project description length (max 500 characteres)';
      pass = false;
    }

    // Logo* - jpg, gif, png; max file size 1MB, (500x500px)
    if (!logo) {
      if (checkEmpty) {
        currErrors.logo = 'Logo is required';
        pass = false;
      }
    } else {
      if (logo.size > 1 * 1024 * 1024) {
        currErrors.logo = 'Logo size (max 1 MB)';
        pass = false;
      }
      const img = new Image();
      img.onload = function () {
        if (img.width > 500 || img.height > 500) {
          setErrors({
            ...errors,
            logo: 'Logo height, width wrong',
          });
        }
      };
      img.src = URL.createObjectURL(logo);
    }

    // Image* - jpg, gif, png; max file size 20MB, (1400x256px)
    if (coverPhoto) {
      if (coverPhoto.size > 20 * 1024 * 1024) {
        currErrors.coverPhoto = 'Cover photo size (max 20MB)';
        pass = false;
      }

      const img2 = new Image();
      img2.onload = function () {
        if (img2.width > 1400 || img2.height > 256) {
          setErrors({
            ...errors,
            coverPhoto: 'Cover photo height, width wrong',
          });
        }
      };
      img2.src = URL.createObjectURL(coverPhoto);
    }

    setErrors({
      ...errors,
      ...currErrors,
    });

    return pass;
  };

  return (
    <VStack
      padding={2}
      style={{ minWidth: isDesktopView ? '600px' : '150px' }}
      width={isDesktopView ? '1/2' : 'full'}
      marginX="auto">
      <Text fontSize="2xl" fontWeight="700">
        Get Started
      </Text>
      <Text mb={6} fontSize="xs" color="gray.500">
        Add basic information about your project, details can be edited later
      </Text>
      <FormControl mb="5" isRequired>
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
          onBlur={() => validate()}
          autoComplete={undefined}
          borderRadius={8}
        />
        {errors.projectName && (
          <HStack alignItems="center" space={1} marginTop={1}>
            <WarningOutlineIcon size="xs" color="red.500" />
            <Text fontSize="xs" color="red.500">
              {errors.projectName}
            </Text>
          </HStack>
        )}
      </FormControl>
      <FormControl mb="5">
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
          onBlur={() => validate()}
          borderRadius={8}
        />
        {errors.tagline && (
          <HStack alignItems="center" space={1} marginTop={1}>
            <WarningOutlineIcon size="xs" color="red.500" />
            <Text fontSize="xs" color="red.500">
              Something is wrong.
            </Text>
          </HStack>
        )}
      </FormControl>
      <FormControl mb="5">
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
            Reward Description
          </Text>
        </FormControl.Label>
        <Input
          style={errors.tagline ? styles.error : {}}
          backgroundColor="white"
          value={rewardDescription}
          onChangeText={(val) => setRewardDescription(val)}
          onBlur={() => validate()}
          borderRadius={8}
        />
        {errors.tagline && (
          <HStack alignItems="center" space={1} marginTop={1}>
            <WarningOutlineIcon size="xs" color="red.500" />
            <Text fontSize="xs" color="red.500">
              Something is wrong.
            </Text>
          </HStack>
        )}
      </FormControl>
      <FormControl mb="5" isRequired>
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
          onBlur={() => validate()}
          borderRadius={8}
        />
        {errors.projectDescription && (
          <HStack alignItems="center" space={1} marginTop={1}>
            <WarningOutlineIcon size="xs" color="red.500" />
            <Text fontSize="xs" color="red.500">
              {errors.projectDescription}
            </Text>
          </HStack>
        )}
      </FormControl>
      <Flex
        direction={isDesktopView ? 'row' : 'column'}
        style={{ maxWidth: '100%', gap: 32 }}
        justifyContent="space-between"
        alignItems="stretch">
        <FormControl width={isDesktopView ? '2/6' : '4/6'} isRequired>
          <FormControl.Label>
            <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
              Logo
            </Text>
          </FormControl.Label>

          <FormControl.HelperText mt={0} mb={2}>
            SVG, PNG, JPG or GIF(500x500px)
          </FormControl.HelperText>

          <Box marginTop="auto">
            <FileUpload
              style={errors.logo ? styles.error : {}}
              onUpload={(file: File) => {
                setLogo(file);
                validate();
              }}
            />
          </Box>
          {!!errors.coverPhoto && !errors.logo && <Box height={18} />}
          {errors.logo && (
            <HStack alignItems="center" space={1} marginTop={1}>
              <WarningOutlineIcon size="xs" color="red.500" />
              <Text fontSize="xs" color="red.500">
                {errors.logo}
              </Text>
            </HStack>
          )}
        </FormControl>

        <FormControl flex={1}>
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
          {errors.coverPhoto && (
            <HStack alignItems="center" space={1} marginTop={1}>
              <WarningOutlineIcon size="xs" color="red.500" />
              <Text fontSize="xs" color="red.500">
                {errors.coverPhoto}
              </Text>
            </HStack>
          )}
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
          onPress={submitForm}
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
        {showWarning && Object.values(errors).filter((value) => value).length !== 0 && <Warning width="1/2" />}
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
