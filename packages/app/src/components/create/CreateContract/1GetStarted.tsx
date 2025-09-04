import {
  ArrowForwardIcon,
  Box,
  ChevronLeftIcon,
  FormControl,
  HStack,
  Input,
  Text,
  TextArea,
  VStack,
  WarningOutlineIcon,
  WarningTwoIcon,
} from 'native-base';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import { Colors } from '../../../utils/colors';
import ActionButton from '../../ActionButton';

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

  const [projectName, setProjectName] = useState<string>(form.projectName ?? '');
  const [tagline, setTagline] = useState<string>(form.tagline ?? '');
  const [rewardDescription, setRewardDescription] = useState<string>(form.rewardDescription ?? '');
  const [projectDescription, setProjectDescription] = useState<string>(form.projectDescription ?? '');
  const [logo, _setLogo] = useState<string>(form.logo ?? '');
  const [coverPhoto, _setCoverPhoto] = useState<string>(form.coverPhoto ?? '');
  const [errors, setErrors] = useState<FormError>({});
  const [showWarning, setShowWarning] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [_logoInput, _setLogoInput] = useState<string>();
  const [_coverPhotoInput, _setCoverPhotoInput] = useState<string>();
  const [_isValidating, _setIsValidating] = useState(false);

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
    _setIsValidating(true);
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
    _setIsValidating(false);

    return pass;
  };

  useEffect(() => {
    setHasErrors(Object.values(errors).filter((value) => value).length !== 0);
  }, [errors]);

  return (
    <VStack style={styles.container}>
      <VStack style={styles.content}>
        <Text style={styles.title}>Get Started</Text>
        <Text style={styles.subtitle}>
          Add basic information about your project, these details can be edited later.
        </Text>
        <FormControl mb="5" isRequired>
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Project Name</Text>
          </FormControl.Label>
          <Input
            style={[styles.input, errors.projectName ? styles.error : {}]}
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
            <Text style={styles.fieldLabel}>Tagline</Text>
          </FormControl.Label>
          <Input
            style={[styles.input, errors.tagline ? styles.error : {}]}
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
            <Text style={styles.fieldLabel}>Reward Description</Text>
          </FormControl.Label>
          <Input
            style={[styles.input, errors.tagline ? styles.error : {}]}
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
            <Text style={styles.fieldLabel}>Project Description</Text>
          </FormControl.Label>
          <TextArea
            style={[styles.textArea, errors.projectDescription ? styles.error : {}]}
            backgroundColor="white"
            value={projectDescription}
            autoCompleteType={undefined}
            onChangeText={(val) => setProjectDescription(val)}
            onBlur={() => validate()}
            borderRadius={8}
            placeholder="Enter project description..."
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
        <HStack space={6} alignItems="flex-start">
          <FormControl flex={1} isRequired>
            <FormControl.Label>
              <Text style={styles.fieldLabel}>Logo</Text>
            </FormControl.Label>
            <Text style={styles.helperText}>SVG, PNG, JPG Or GIF (500x500px)</Text>
            <View style={styles.uploadArea}>
              <View style={styles.uploadContent}>
                <Text style={styles.uploadIcon}>☁️</Text>
                <Text style={styles.uploadText}>Click to upload</Text>
              </View>
            </View>
            {errors.logo && (
              <HStack alignItems="center" space={1} marginTop={1}>
                <WarningOutlineIcon size="xs" color="red.500" />
                <Text fontSize="xs" color="red.500">
                  {errors.logo}
                </Text>
              </HStack>
            )}
          </FormControl>

          <FormControl flex={1} isRequired>
            <FormControl.Label>
              <Text style={styles.fieldLabel}>Cover Photo</Text>
            </FormControl.Label>
            <Text style={styles.helperText}>SVG, PNG, JPG or GIF (1400x256px)</Text>
            <View style={styles.uploadArea}>
              <View style={styles.uploadContent}>
                <Text style={styles.uploadIcon}>☁️</Text>
                <Text style={styles.uploadText}>Click to upload</Text>
              </View>
            </View>
            {errors.coverPhoto && (
              <HStack alignItems="center" space={1} marginTop={1}>
                <WarningOutlineIcon size="xs" color="red.500" />
                <Text fontSize="xs" color="red.500">
                  {errors.coverPhoto}
                </Text>
              </HStack>
            )}
          </FormControl>
        </HStack>
        <HStack width="full" justifyContent="space-between" style={styles.navigationContainer}>
          <ActionButton
            onPress={() => previousStep()}
            width="120px"
            text={
              <HStack alignItems="center" space={2}>
                <ChevronLeftIcon size="4" color="black" />
                <Text color="black" fontSize="md" fontWeight="600">
                  Back
                </Text>
              </HStack>
            }
            bg="#D6D6D6"
            textColor="black"
          />
          <ActionButton
            onPress={submitForm}
            width="120px"
            text={
              <HStack alignItems="center" space={2}>
                <Text color="white" fontSize="md" fontWeight="600">
                  Details
                </Text>
                <ArrowForwardIcon size="4" color="white" />
              </HStack>
            }
            bg="#5B7AC6"
            textColor="white"
          />
        </HStack>
        <Box flexDir="row-reverse" paddingY={2}>
          {showWarning && hasErrors && <Warning width="1/2" />}
        </Box>
      </VStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    backgroundColor: '#6933FF',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  progressBar: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '25%',
    backgroundColor: '#1A85FF',
    borderRadius: 4,
  },
  stepIndicator: {
    position: 'absolute',
    left: '25%',
    top: -8,
    transform: [{ translateX: -12 }],
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: '#1A85FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  stepText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  activeStepText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[200],
    marginBottom: 32,
    lineHeight: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: Colors.gray[200],
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 80,
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: Colors.white,
  },
  uploadArea: {
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#000000',
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  navigationContainer: {
    marginTop: 40,
  },
  error: {
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'red',
  },
});

export default GetStarted;
