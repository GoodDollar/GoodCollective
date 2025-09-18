import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { Box, FormControl, Input, InputGroup, InputLeftAddon, Text, VStack, WarningOutlineIcon } from 'native-base';
import { useEffect, useState } from 'react';
import { formatSocialUrls, validateSocial } from '../../../lib/formatSocialUrls';

import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import ActionButton from '../../ActionButton';
import InfoBox from '../../InfoBox';
import { SocialField } from '../../SocialField';
import NavigationButtons from '../NavigationButtons';

// Social field configuration
const SOCIAL_FIELDS = [
  { key: 'twitter', label: 'Twitter (X) Handle', addon: '@', placeholder: '@Gooddollar' },
  { key: 'discord', label: 'Discord', addon: 'https://', placeholder: 'discord.gg/gooddollar' },
  { key: 'telegram', label: 'Telegram', addon: 'https://', placeholder: 't.me/gooddollar' },
  { key: 'facebook', label: 'Facebook', addon: 'https://', placeholder: 'facebook.com/gooddollar' },
  { key: 'threads', label: 'Threads', addon: 'https://', placeholder: 'threads.net/gooddollar' },
] as const;

type SocialFieldKey = (typeof SOCIAL_FIELDS)[number]['key'];
type FormData = Record<SocialFieldKey | 'website' | 'adminWalletAddress', string>;
type FormError = Partial<Record<keyof FormData | 'social', string>>;

const ProjectDetails = () => {
  const { form, nextStep, submitPartial, previousStep } = useCreatePool();
  const { address } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  // Initialize form state
  const [formData, setFormData] = useState<FormData>({
    website: form.website ?? '',
    twitter: form.twitter ?? '',
    telegram: form.telegram ?? '',
    discord: form.discord ?? '',
    facebook: form.facebook ?? '',
    threads: form.threads ?? '',
    adminWalletAddress: form.adminWalletAddress ?? address ?? '',
  });

  const [errors, setErrors] = useState<FormError>({});
  const [showWarning, setShowWarning] = useState(false);

  const changeWallet = async () => {
    await disconnect();
    open({ view: 'Connect' });
  };

  useEffect(() => {
    if (address) {
      setFormData((prev) => ({ ...prev, adminWalletAddress: address }));
    }
  }, [address]);

  // Generic field update handler
  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validate();
  };

  const validate = (checkEmpty = false): boolean => {
    const currErrors: FormError = {};
    let pass = true;

    // Check if at least one social channel is provided
    const socialFields = SOCIAL_FIELDS.map((field) => field.key);
    const hasSocialChannel = socialFields.some((field) => formData[field]);

    if (!hasSocialChannel && checkEmpty) {
      currErrors.social = 'One social channel is required';
      pass = false;
    }

    // Website validation
    if (!formData.website && checkEmpty) {
      currErrors.website = 'Website is required';
      pass = false;
    } else if (formData.website) {
      const msg = validateSocial.website(formData.website);
      if (msg) {
        currErrors.website = msg;
        pass = false;
      }
    }

    // Social field validations
    for (const field of SOCIAL_FIELDS) {
      const value = formData[field.key];
      if (value) {
        const msg = validateSocial[field.key](value);
        if (msg) {
          currErrors[field.key] = msg;
          pass = false;
        }
      }
    }

    // Admin wallet validation
    if (!formData.adminWalletAddress && checkEmpty) {
      currErrors.adminWalletAddress = 'Admin wallet address is required!';
      pass = false;
    } else if (formData.adminWalletAddress) {
      const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethereumAddressRegex.test(formData.adminWalletAddress)) {
        currErrors.adminWalletAddress = 'Admin wallet address is not valid!';
        pass = false;
      }
    }

    setErrors(currErrors);
    return pass;
  };

  const submitForm = () => {
    setShowWarning(true);
    if (validate(true)) {
      const normalizedWebsite = formatSocialUrls.website(formData.website) ?? '';
      const cleanTwitter = formData.twitter.trim().replace(/^@+/, '');

      submitPartial({
        website: normalizedWebsite,
        twitter: cleanTwitter,
        telegram: formData.telegram,
        discord: formData.discord,
        facebook: formData.facebook,
        threads: formData.threads,
        adminWalletAddress: formData.adminWalletAddress,
      });
      nextStep();
    }
  };

  return (
    <Box style={styles.container} backgroundColor="goodGrey.50">
      <VStack style={styles.content} paddingX={5} paddingY={10}>
        <Text style={styles.title} color="black" fontWeight="700" mb={4}>
          Project Details
        </Text>
        <Text style={styles.subtitle} color="goodGrey.400" mb={8}>
          Add a detailed description, project links and disclaimer to help educate contributors about your project and
          it's goals.
        </Text>

        {/* Website Field */}
        <FormControl mb="5" isRequired isInvalid={!!errors.website}>
          <FormControl.Label>
            <Text style={styles.fieldLabel} color="black" fontWeight="600" mb={2}>
              Website
            </Text>
          </FormControl.Label>
          <InputGroup width="full" backgroundColor="white">
            <InputLeftAddon children={'https://'} px={3} />
            <Input
              variant={errors.website ? 'form-input-error' : undefined}
              flex={1}
              value={formData.website}
              onChangeText={(value) => updateField('website', value)}
              onBlur={() => validate()}
              placeholder="www.gooddollar.org"
            />
          </InputGroup>
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.website}
          </FormControl.ErrorMessage>
        </FormControl>

        {/* Dynamic Social Fields */}
        {SOCIAL_FIELDS.map((field) => (
          <SocialField
            key={field.key}
            label={field.label}
            addon={field.addon}
            value={formData[field.key]}
            onChange={(value) => updateField(field.key, value)}
            onBlur={() => validate()}
            placeholder={field.placeholder}
            isInvalid={!!errors[field.key]}
            errorMessage={errors[field.key]}
          />
        ))}

        {showWarning && !!errors.social && (
          <FormControl isInvalid>
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
              {errors.social}
            </FormControl.ErrorMessage>
          </FormControl>
        )}

        <Text style={styles.sectionTitle} mt={6} mb={2}>
          Project Owner Details
        </Text>

        <FormControl mb="1" isRequired isInvalid={!!errors.adminWalletAddress}>
          <FormControl.Label>
            <Text style={styles.fieldLabel} color="black" fontWeight="600" mb={2}>
              Admin Wallet Address*
            </Text>
          </FormControl.Label>
          <Box style={styles.walletAddressBox} backgroundColor="goodGrey.100" p={4} mt={4}>
            <Text style={styles.walletAddressText} color="goodGrey.400">
              {formData.adminWalletAddress}
            </Text>
          </Box>
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.adminWalletAddress}
          </FormControl.ErrorMessage>
        </FormControl>

        <InfoBox
          type="info"
          message="Make sure the wallet that is connected is the wallet that you want to manage the pool with."
        />

        <ActionButton text="Change Wallet" bg="goodPurple.400" textColor="white" onPress={changeWallet} width="150px" />

        <NavigationButtons onBack={() => previousStep()} onNext={submitForm} nextText="Configure Pool" marginTop={10} />

        {showWarning && Object.keys(errors).length > 0 && (
          <InfoBox type="warning" message="Please fill all required fields before proceeding to the details section" />
        )}
      </VStack>
    </Box>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'goodGrey.50',
  },
  content: {
    flex: 1,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'black',
  },
  subtitle: {
    fontSize: 16,
    color: 'goodGrey.400',
    lineHeight: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    marginBottom: 16,
  },
  walletAddressBox: {
    backgroundColor: 'goodGrey.100',
    borderRadius: 8,
  },
  walletAddressText: {
    fontSize: 14,
    color: 'goodGrey.400',
    fontFamily: 'monospace',
  },
} as const;

export default ProjectDetails;
