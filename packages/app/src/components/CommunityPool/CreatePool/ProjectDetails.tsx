import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { mainnet } from '@wagmi/core/chains';
import {
  FormControl,
  HStack,
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

import { createConfig, getEnsName, http } from '@wagmi/core';
import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import { Colors } from '../../../utils/colors';
import ActionButton from '../../ActionButton';
import NavigationButtons from '../NavigationButtons';
import InfoBox from '../../InfoBox';

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
  const [ensName, setEnsName] = useState('');

  useEffect(() => {
    (async () => {
      if (!adminWalletAddress || ensName) return;
      const resp = await getEnsName(
        createConfig({
          chains: [mainnet],
          transports: {
            [mainnet.id]: http(),
          },
        }),
        {
          address: adminWalletAddress as `0x${string}`,
        }
      );
      if (typeof resp === 'string') setEnsName(resp);
    })();
  }, [ensName, adminWalletAddress]);

  const changeWallet = async () => {
    await disconnect();
    open({ view: 'Connect' });
  };

  useEffect(() => {
    if (address) setAdminWalletAddress(address);
  }, [address]);

  const submitForm = () => {
    setShowWarning(true);
    if (validate()) {
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

  const validate = () => {
    const currErrors: FormError = {
      social: '',
      adminWalletAddress: '',
      website: '',
    };
    let pass = true;
    if (!website && !twitter && !telegram && !discord && !facebook && !threads) {
      currErrors.social = 'One social channel is required';
      pass = false;
    }

    if (!website) {
      currErrors.website = 'Website is required';
      pass = false;
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
      currErrors.adminWalletAddress = 'Admin wallet address is required!';
      pass = false;
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
        <FormControl mb="5" isRequired>
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Website*</Text>
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
              placeholder="www.gooddollar.org"
            />
          </InputGroup>
          {errors.website && (
            <HStack alignItems="center" space={1} marginTop={1}>
              <WarningOutlineIcon size="xs" color="red.500" />
              <Text fontSize="xs" color="red.500">
                {errors.website}
              </Text>
            </HStack>
          )}
        </FormControl>

        <FormControl mb="5">
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Twitter (X) Handle</Text>
          </FormControl.Label>
          <InputGroup width="full" backgroundColor="white" style={styles.inputGroup}>
            <InputLeftAddon children={'@'} style={styles.inputAddon} />
            <Input
              style={styles.input}
              flex={1}
              value={twitter}
              onChangeText={(value) => setTwitter(value)}
              placeholder="@Gooddollar"
            />
          </InputGroup>
        </FormControl>

        <FormControl mb="5">
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Discord</Text>
          </FormControl.Label>
          <InputGroup width="full" backgroundColor="white" style={styles.inputGroup}>
            <InputLeftAddon children={'https://'} style={styles.inputAddon} />
            <Input
              style={styles.input}
              flex={1}
              value={discord}
              onChangeText={(value) => setDiscord(value)}
              placeholder="www.gooddollar.org"
            />
          </InputGroup>
        </FormControl>

        <FormControl mb="5">
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Telegram</Text>
          </FormControl.Label>
          <InputGroup width="full" backgroundColor="white" style={styles.inputGroup}>
            <InputLeftAddon children={'https://'} style={styles.inputAddon} />
            <Input
              style={styles.input}
              flex={1}
              value={telegram}
              onChangeText={(value) => setTelegram(value)}
              placeholder="www.gooddollar.org"
            />
          </InputGroup>
        </FormControl>

        <FormControl mb="5">
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Facebook</Text>
          </FormControl.Label>
          <InputGroup width="full" backgroundColor="white" style={styles.inputGroup}>
            <InputLeftAddon children={'https://'} style={styles.inputAddon} />
            <Input
              style={styles.input}
              flex={1}
              value={facebook}
              onChangeText={(value) => setFacebook(value)}
              placeholder="www.gooddollar.org"
            />
          </InputGroup>
        </FormControl>

        <FormControl mb="5">
          <FormControl.Label>
            <Text style={styles.fieldLabel}>Threads</Text>
          </FormControl.Label>
          <InputGroup width="full" backgroundColor="white" style={styles.inputGroup}>
            <InputLeftAddon children={'https://'} style={styles.inputAddon} />
            <Input
              style={styles.input}
              flex={1}
              value={threads}
              onChangeText={(value) => setThreads(value)}
              placeholder="www.gooddollar.org"
            />
          </InputGroup>
        </FormControl>

        <Text style={styles.sectionTitle}>Project Owner Details</Text>
        <Text style={styles.sectionSubtitle}>Admin Wallet Address</Text>

        <InfoBox
          type="info"
          message="Make sure the wallet that is connected is the wallet that you want to manage the pool with."
        />

        <ActionButton text="Change Wallet" bg="#5B7AC6" textColor="white" onPress={changeWallet} width="150px" />

        <View style={styles.walletAddressBox}>
          <Text style={styles.walletAddressText}>{adminWalletAddress}</Text>
        </View>

        <FormControl mb="5">
          <FormControl.Label>
            <Text style={styles.fieldLabel}>
              Please provide any additional information about your project that you would like us to know (Optional)
            </Text>
          </FormControl.Label>
          <TextArea
            style={styles.textArea}
            value={additionalInfo}
            onChangeText={(value) => setAdditionalInfo(value)}
            placeholder="Enter additional information..."
            autoCompleteType="off"
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
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: Colors.white,
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
