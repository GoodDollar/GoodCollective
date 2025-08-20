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
  Button,
} from 'native-base';
import { StyleSheet } from 'react-native';

import ActionButton from '../../ActionButton';
import { useScreenSize } from '../../../theme/hooks';
import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';

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

const GetStarted = ({}: {}) => {
  const { form, nextStep, previousStep, submitPartial } = useCreatePool();

  const { isDesktopView } = useScreenSize();

  const [projectName, setProjectName] = useState<string>(form.projectName ?? '');
  const [tagline, setTagline] = useState<string>(form.tagline ?? '');
  const [rewardDescription, setRewardDescription] = useState<string>(form.rewardDescription ?? '');
  const [projectDescription, setProjectDescription] = useState<string>(form.projectDescription ?? '');
  const [logo, setLogo] = useState<string>(form.logo ?? '');
  const [coverPhoto, setCoverPhoto] = useState<string>(form.coverPhoto ?? '');
  const [errors, setErrors] = useState<FormError>({});
  const [showWarning, setShowWarning] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [logoInput, setLogoInput] = useState<string>();
  const [coverPhotoInput, setCoverPhotoInput] = useState<string>();
  const [isValidating, setIsValidating] = useState(false);

  const submitForm = () => {
    // Only show warning after the form has been submitted
    setShowWarning(true);
    if (validate(true)) {
      submitPartial({
        projectName,
        tagline,
        projectDescription,
        logo,
        coverPhoto,
      });
      nextStep();
    }
  };

  const validate = (checkEmpty = false) => {
    setIsValidating(true);
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
      if (checkEmpty) {
        currErrors.projectDescription = 'Project description is required';
        pass = false;
      }
    } else if (projectDescription.length > 500) {
      currErrors.projectDescription = 'Project description length (max 500 characteres)';
      pass = false;
    }

    if (!logo) {
      if (checkEmpty) {
        currErrors.logo = 'Logo is required';
        pass = false;
      }
    }

    setErrors({
      ...errors,
      ...currErrors,
    });
    setIsValidating(false);

    return pass;
  };

  const validateImg = async (
    imgUrl: string,
    maxSize: number,
    maxWidth: number,
    maxHeight: number,
    imgType: 'logo' | 'coverPhoto'
  ) => {
    const response = await fetch(imgUrl, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    const size = contentLength ? parseInt(contentLength, 10) : null;
    if (!size) throw new Error('Error: Image size 0');
    if (size > maxSize * 1024 * 1024) {
      throw new Error("'Image size (max ${maxSize} MB)'");
    }

    const img = new Image();
    img.onload = function () {
      if (img.width > maxWidth || img.height > maxHeight) {
        setErrors({
          ...errors,
          [imgType]: 'Logo height, width wrong',
        });
        if (imgType === 'logo') {
          setLogo('');
        } else setCoverPhoto('');
      }
    };
    img.src = imgUrl;
    if (img.complete && img.naturalWidth !== 0) {
      console.log(img);
    }
  };

  const onSubmitLogo = async () => {
    try {
      validateImg(logoInput!, 1, 500, 500, 'logo');
      setLogo(logoInput!);
    } catch (error: Error | any) {
      setErrors({
        ...errors,
        logo: error.message,
      });
    }
  };

  const onSubmitCoverPhoto = async () => {
    try {
      validateImg(coverPhotoInput!, 20, 1400, 256, 'coverPhoto');
      setCoverPhoto(coverPhotoInput!);
    } catch (error: Error | any) {
      setErrors({
        ...errors,
        coverPhoto: error.message,
      });
    }
  };

  useEffect(() => {
    setHasErrors(Object.values(errors).filter((value) => value).length !== 0);
  }, [errors]);

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

          <FormControl.HelperText mt={0} mb={2}>
            Upload your logo to IPFS or a CDN provider. Only submit a publicly accessible link to your logo.
          </FormControl.HelperText>

          <Box marginTop="auto" backgroundColor="white" alignItems="center" height="200px" padding={2}>
            <Box alignItems="center">
              <Input
                placeholder="URL"
                type="text"
                w="100%"
                py="0"
                style={errors.logo ? styles.error : {}}
                backgroundColor="white"
                value={logoInput}
                onChangeText={(val) => setLogoInput(val)}
                borderRadius={8}
                InputRightElement={
                  <Button
                    size="xs"
                    rounded="none"
                    w="2/6"
                    h="full"
                    disabled={!logoInput}
                    backgroundColor="gray.200"
                    onPress={onSubmitLogo}>
                    <Text color="black" style={{ fontSize: 8 }}>
                      Submit
                    </Text>
                  </Button>
                }
              />
            </Box>
            {logo && !errors.logo && !isValidating && (
              <img src={logo} alt="Logo" style={{ margin: 'auto', maxWidth: '100%', maxHeight: '120px' }} />
            )}
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
          <FormControl.HelperText mt={0} mb={2}>
            Upload your cover photo to IPFS or a CDN provider. Only submit a publicly accessible link to your cover
            photo.
          </FormControl.HelperText>
          <Box marginTop="auto" backgroundColor="white" alignItems="center" height="200px" padding={2}>
            <Input
              placeholder="URL"
              type="text"
              minW="100%"
              py="0"
              style={errors.coverPhoto ? styles.error : {}}
              backgroundColor="white"
              value={coverPhotoInput}
              onChangeText={(val) => setCoverPhotoInput(val)}
              borderRadius={8}
              InputRightElement={
                <Button
                  size="xs"
                  rounded="none"
                  w="2/6"
                  h="full"
                  disabled={!coverPhotoInput}
                  backgroundColor="gray.200"
                  onPress={onSubmitCoverPhoto}>
                  <Text color="black" style={{ fontSize: 8 }}>
                    Submit
                  </Text>
                </Button>
              }
            />
            {coverPhoto && !errors.coverPhoto && !isValidating && (
              <img
                src={coverPhoto}
                style={{ margin: 'auto', maxWidth: '100%', maxHeight: '120px' }}
                alt="Cover photo"
              />
            )}
          </Box>
          {!errors.coverPhoto && !!errors.logo && <Box height={10} />}
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
      <HStack width="full" justifyContent="space-between">
        <ActionButton
          onPress={() => previousStep()}
          width=""
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
          width=""
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
        {showWarning && hasErrors && <Warning width="1/2" />}
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
