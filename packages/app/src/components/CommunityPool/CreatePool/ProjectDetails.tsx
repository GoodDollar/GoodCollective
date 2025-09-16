import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { Box, FormControl, Input, InputGroup, InputLeftAddon, Text, VStack, WarningOutlineIcon } from 'native-base';
import { useEffect, useState } from 'react';

import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import ActionButton from '../../ActionButton';
import InfoBox from '../../InfoBox';
import { SocialField } from '../../SocialField';
import NavigationButtons from '../NavigationButtons';

type FormError = {
  social?: string;
  adminWalletAddress?: string;
  website?: string;
};

const normalizeUrlForValidation = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const isValidUrl = (url: string) => {
  try {
    const candidate = normalizeUrlForValidation(url);
    return URL.canParse ? URL.canParse(candidate) : Boolean(new URL(candidate));
  } catch {
    return false;
  }
};

const ProjectDetails = () => {
  const { form, nextStep, submitPartial, previousStep } = useCreatePool();
  const { address } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  const [website, setWebsite] = useState<string>(form.website ?? '');
  const [twitter, setTwitter] = useState<string>(form.twitter ?? '');
  const [telegram, setTelegram] = useState<string>(form.telegram ?? '');
  const [discord, setDiscord] = useState<string>(form.discord ?? '');
  const [facebook, setFacebook] = useState<string>(form.facebook ?? '');
  const [threads, setThreads] = useState<string>(form.threads ?? '');
  const [adminWalletAddress, setAdminWalletAddress] = useState<string>(form.adminWalletAddress ?? address ?? '');
  const [errors, setErrors] = useState<FormError>({});
  const [showWarning, setShowWarning] = useState(false);

  const changeWallet = async () => {
    await disconnect();
    open({ view: 'Connect' });
  };

  useEffect(() => {
    if (address) setAdminWalletAddress(address);
  }, [address]);

  const submitForm = () => {
    setShowWarning(true);
    if (validate(true)) {
      const normalizedWebsite = normalizeUrlForValidation(website);
      submitPartial({
        website: normalizedWebsite,
        twitter,
        telegram,
        discord,
        facebook,
        threads,
        adminWalletAddress,
      });
      nextStep();
    }
  };

  const validate = (checkEmpty = false) => {
    const currErrors: FormError = {
      social: '',
      adminWalletAddress: '',
      website: '',
    };
    let pass = true;
    if (!website && !twitter && !telegram && !discord && !facebook && !threads) {
      if (checkEmpty) {
        currErrors.social = 'One social channel is required';
        pass = false;
      }
    }

    if (!website) {
      if (checkEmpty) {
        currErrors.website = 'Website is required';
        pass = false;
      }
    }

    if (website && !isValidUrl(website)) {
      currErrors.website = 'Website invalid format!';
      pass = false;
    }

    if (!adminWalletAddress) {
      if (checkEmpty) {
        currErrors.adminWalletAddress = 'Admin wallet address is required!';
        pass = false;
      }
    } else {
      const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethereumAddressRegex.test(adminWalletAddress)) {
        currErrors.adminWalletAddress = 'Admin wallet address is not valid!';
        pass = false;
      }
    }

    setErrors({
      ...errors,
      ...currErrors,
    });

    return pass;
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

        <FormControl mb="5" isRequired isInvalid={!!errors.website}>
          <FormControl.Label>
            <Text style={styles.fieldLabel} color="black" fontWeight="600" mb={2}>
              Website
            </Text>
          </FormControl.Label>
          <InputGroup width="full" backgroundColor="white" style={styles.inputGroup}>
            <InputLeftAddon children={'https://'} style={styles.inputAddon} px={3} />
            <Input
              style={[styles.input, errors.website ? styles.error : {}]}
              flex={1}
              value={website}
              onChangeText={(value) => {
                setWebsite(value);
                validate();
              }}
              onBlur={() => validate()}
              placeholder="www.gooddollar.org"
            />
          </InputGroup>
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.website}
          </FormControl.ErrorMessage>
        </FormControl>

        <SocialField
          label="Twitter (X) Handle"
          addon="@"
          value={twitter}
          onChange={setTwitter}
          onBlur={() => validate()}
          placeholder="@Gooddollar"
        />

        <SocialField
          label="Discord"
          addon="https://"
          value={discord}
          onChange={setDiscord}
          onBlur={() => validate()}
          placeholder="discord.gg/gooddollar"
        />

        <SocialField
          label="Telegram"
          addon="https://"
          value={telegram}
          onChange={setTelegram}
          onBlur={() => validate()}
          placeholder="t.me/gooddollar"
        />

        <SocialField
          label="Facebook"
          addon="https://"
          value={facebook}
          onChange={setFacebook}
          onBlur={() => validate()}
          placeholder="facebook.com/gooddollar"
        />

        <SocialField
          label="Threads"
          addon="https://"
          value={threads}
          onChange={setThreads}
          onBlur={() => validate()}
          placeholder="threads.net/gooddollar"
        />

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
              {adminWalletAddress}
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
  inputGroup: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'goodGrey.200',
  },
  inputAddon: {
    borderRightWidth: 1,
  },
  input: {
    height: 48,
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
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
  error: {
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'goodRed.800',
  },
} as const;

export default ProjectDetails;
