import { Box, FormControl, Input, Text, TextArea, VStack, WarningOutlineIcon } from 'native-base';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import { Colors } from '../../../utils/colors';
import NavigationButtons from '../NavigationButtons';
import InfoBox from '../../InfoBox';
import FileUpload from '../../FileUpload';
import { uploadFileToIPFS, validateLogoFile, getIPFSUrl } from '../../../lib/ipfsUpload';

type FormError = {
  projectName?: string;
  projectDescription?: string;
  tagline?: string;
  rewardDescription?: string;
  logo?: string;
  coverPhoto?: string;
};

const GetStarted = ({}: {}) => {
  const { form, nextStep, previousStep, submitPartial } = useCreatePool();

  const [projectName, setProjectName] = useState<string>(form.projectName ?? '');
  const [tagline, setTagline] = useState<string>(form.tagline ?? '');
  const [rewardDescription, setRewardDescription] = useState<string>(form.rewardDescription ?? '');
  const [projectDescription, setProjectDescription] = useState<string>(form.projectDescription ?? '');
  const [logo, setLogo] = useState<string>(form.logo ?? '');
  const [coverPhoto, setCoverPhoto] = useState<string>(form.coverPhoto ?? '');
  const [errors, setErrors] = useState<FormError>({});
  const [showWarning, setShowWarning] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [_isValidating, setIsValidating] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const submitForm = () => {
    // Only show warning after the form has been submitted
    setShowWarning(true);
    if (validate(true)) {
      submitPartial({
        projectName,
        tagline,
        rewardDescription,
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
      rewardDescription: '',
      logo: '',
      coverPhoto: '',
    };
    let pass = true;

    // Pool Name* - 100 character max
    // (Can have spaces, no special characters allowed, 0-9/a-z/A-Z)
    if (!projectName && checkEmpty) {
      currErrors.projectName = 'Project name is required';
      pass = false;
    } else if (projectName.length > 30) {
      currErrors.projectName = 'Project name length (max 30 characters)';
      pass = false;
    } else if (!/^[a-zA-Z0-9 ]*$/.test(projectName)) {
      currErrors.projectName = 'Project name cannot contain special characters';
      pass = false;
    }

    // Pool Description* - 500 character max
    if (!projectDescription && checkEmpty) {
      currErrors.projectDescription = 'Project description is required';
      pass = false;
    } else if (projectDescription.length > 500) {
      currErrors.projectDescription = 'Project description length (max 500 characteres)';
      pass = false;
    }

    // Reward Description - 200 character max
    if (rewardDescription && rewardDescription.length > 200) {
      currErrors.rewardDescription = 'Reward description length (max 200 characters)';
      pass = false;
    }

    if (!logo && checkEmpty) {
      currErrors.logo = 'Logo is required';
      pass = false;
    }

    if (!coverPhoto && checkEmpty) {
      currErrors.coverPhoto = 'Cover photo is required';
      pass = false;
    }

    setErrors({
      ...errors,
      ...currErrors,
    });
    setIsValidating(false);

    return pass;
  };

  const handleLogoFileUpload = async (file: File) => {
    setIsUploadingLogo(true);
    setErrors({ ...errors, logo: '' });

    try {
      // Validate file
      const validation = validateLogoFile(file, 1); // 1MB max for logo
      if (!validation.isValid) {
        setErrors({ ...errors, logo: validation.error });
        setIsUploadingLogo(false);
        return;
      }

      // Upload to IPFS
      const ipfsHash = await uploadFileToIPFS(file);
      const ipfsUrl = getIPFSUrl(ipfsHash);

      setLogo(ipfsUrl);
      setErrors({ ...errors, logo: '' });
    } catch (error) {
      console.error('Logo upload failed:', error);
      setErrors({ ...errors, logo: 'Failed to upload logo. Please try again.' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogo('');
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

        <FormControl mb="5" isRequired isInvalid={!!errors.projectName}>
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
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.projectName}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl mb="5" isInvalid={!!errors.tagline}>
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
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.tagline}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl mb="5" isInvalid={!!errors.rewardDescription}>
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Reward Description</Text>
          </FormControl.Label>
          <Input
            style={[styles.input, errors.rewardDescription ? styles.error : {}]}
            backgroundColor="white"
            value={rewardDescription}
            onChangeText={(val) => setRewardDescription(val)}
            onBlur={() => validate()}
            borderRadius={8}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.rewardDescription}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl mb="5" isRequired isInvalid={!!errors.projectDescription}>
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
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.projectDescription}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl mb="5" flex={1} isRequired isInvalid={!!errors.coverPhoto}>
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Cover Photo</Text>
          </FormControl.Label>
          <FormControl.HelperText>
            <Text style={styles.helperText}>Provide image URL for your cover photo.</Text>
          </FormControl.HelperText>

          <Input
            style={[styles.input, errors.coverPhoto ? styles.error : {}]}
            backgroundColor="white"
            value={coverPhoto}
            onChangeText={(val) => setCoverPhoto(val)}
            onBlur={() => validate()}
            placeholder="Enter image URL"
            borderRadius={8}
          />

          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.coverPhoto}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl flex={1} isRequired isInvalid={!!errors.logo}>
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Logo</Text>
          </FormControl.Label>
          <FormControl.HelperText>
            <Text style={styles.helperText}>
              JPG, PNG, GIF (max 1MB, 500x500px recommended). Upload directly or provide URL.
            </Text>
          </FormControl.HelperText>

          {logo ? (
            <View style={styles.uploadArea}>
              <View style={styles.uploadedContent}>
                <img src={logo} alt="Logo" style={styles.uploadedImage} />
                <Pressable onPress={removeLogo} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <VStack space={3}>
              {/* File Upload Option */}
              <FileUpload style={styles.uploadArea} onUpload={handleLogoFileUpload} />
              {isUploadingLogo && <Text style={styles.uploadText}>Uploading to IPFS...</Text>}
            </VStack>
          )}

          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>{errors.logo}</FormControl.ErrorMessage>
        </FormControl>

        <NavigationButtons
          onBack={() => previousStep()}
          onNext={submitForm}
          nextText="Details"
          containerStyle={styles.navigationContainer}
        />
        <Box flexDir="row-reverse" paddingY={2}>
          {showWarning && hasErrors && (
            <InfoBox type="warning" message="Please fill all required fields before proceeding to details section" />
          )}
        </Box>
      </VStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'goodGrey.50',
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
    overflow: 'hidden',
    resize: 'none',
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
  urlInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: Colors.white,
    width: '100%',
  },
  uploadButton: {
    backgroundColor: '#5B7AC6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 4,
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  uploadedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  uploadedImage: {
    maxWidth: '100%',
    maxHeight: 80,
    borderRadius: 4,
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  navigationContainer: {
    marginTop: 40,
  },
  error: {
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'red',
  },
  linkText: {
    color: '#5B7AC6',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default GetStarted;
