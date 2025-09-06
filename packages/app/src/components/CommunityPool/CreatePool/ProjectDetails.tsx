import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import {
  FormControl,
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  TextArea,
  VStack,
  WarningOutlineIcon,
} from 'native-base';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import { useEnsName } from '../../../hooks/useEnsName';
import { Colors } from '../../../utils/colors';
import ActionButton from '../../ActionButton';
import NavigationButtons from '../NavigationButtons';
import InfoBox from '../../InfoBox';
import { SocialField } from '../../SocialField';

type FormError = {
  social?: string;
  adminWalletAddress?: string;
  website?: string;
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
  const [additionalInfo, setAdditionalInfo] = useState<string>(form.additionalInfo ?? '');
  const [errors, setErrors] = useState<FormError>({});
  const [showWarning, setShowWarning] = useState(false);

  const ensName = useEnsName(adminWalletAddress);

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
      submitPartial({
        website,
        twitter,
        telegram,
        discord,
        facebook,
        threads,
        adminWalletAddress,
        additionalInfo,
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

    const pattern = new RegExp(
      '^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$',
      'i'
    );
    if (website && !pattern.test(website)) {
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
    <View style={styles.container}>
      <VStack style={styles.content}>
        <Text style={styles.title}>Project Details</Text>
        <Text style={styles.subtitle}>
          Add a detailed description, project links and disclaimer to help educate contributors about your project and
          it's goals.
        </Text>

        <FormControl mb="5" isRequired isInvalid={!!errors.website}>
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Website</Text>
          </FormControl.Label>
          <InputGroup width="full" backgroundColor="white" style={styles.inputGroup}>
            <InputLeftAddon children={'https://'} style={styles.inputAddon} />
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

        <Text style={styles.sectionTitle}>Project Owner Details</Text>

        <FormControl mb="1" isRequired isInvalid={!!errors.adminWalletAddress}>
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Admin Wallet Address*</Text>
          </FormControl.Label>
          <View style={styles.walletAddressBox}>
            <Text style={styles.walletAddressText}>{adminWalletAddress}</Text>
          </View>
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.adminWalletAddress}
          </FormControl.ErrorMessage>
        </FormControl>

        <InfoBox
          type="info"
          message="Make sure the wallet that is connected is the wallet that you want to manage the pool with."
        />

        <ActionButton text="Change Wallet" bg="#5B7AC6" textColor="white" onPress={changeWallet} width="150px" />

        <FormControl mt="5">
          <FormControl.Label>
            <Text style={styles.fieldLabel}>
              Please provide any additional information about your project that you would like us to know (Optional)
            </Text>
          </FormControl.Label>
          <TextArea
            style={styles.textArea}
            value={additionalInfo}
            onChangeText={(value) => setAdditionalInfo(value)}
            onBlur={() => validate()}
            placeholder="Enter additional information..."
            autoCompleteType="off"
            multiline={true}
            numberOfLines={3}
            scrollEnabled={true}
          />
        </FormControl>

        <NavigationButtons
          onBack={() => previousStep()}
          onNext={submitForm}
          nextText="Configure Pool"
          containerStyle={styles.navigationContainer}
        />

        {showWarning && Object.keys(errors).length > 0 && (
          <InfoBox type="warning" message="Please fill all required fields before proceeding to the details section" />
        )}
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  inputGroup: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  inputAddon: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderRightWidth: 1,
    paddingHorizontal: 12,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    marginBottom: 16,
  },
  walletAddressBox: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  walletAddressText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  textArea: {
    height: 100,
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
  navigationContainer: {
    marginTop: 40,
  },
  error: {
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'red',
  },
});

export default ProjectDetails;
