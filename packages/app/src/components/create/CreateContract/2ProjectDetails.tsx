import { ReactNode, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  VStack,
  Text,
  FormControl,
  Input,
  WarningOutlineIcon,
  Divider,
  HStack,
  InputLeftAddon,
  InputGroup,
  ChevronLeftIcon,
  ArrowForwardIcon,
  Box,
  WarningTwoIcon,
  InfoIcon,
} from 'native-base';
import { mainnet } from '@wagmi/core/chains';
import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';

import ActionButton from '../../ActionButton';
import { useScreenSize } from '../../../theme/hooks';
import { useCreatePool } from '../../../hooks/useCreatePool/useCreatePool';
import { createConfig, getEnsName, http } from '@wagmi/core';

type FormError = {
  social?: string;
  adminWalletAddress?: string;
  website?: string;
};

const Disclaimer = ({ hideIcon, text }: { hideIcon?: boolean; text: string | ReactNode }) => {
  return (
    <Box backgroundColor="goodPurple.100" padding={4}>
      <HStack space={2} alignItems="center">
        {!hideIcon && <InfoIcon color="goodPurple.400" style={{ width: 40 }} />}
        <Text fontSize="xs">{text}</Text>
      </HStack>
    </Box>
  );
};

const Warning = ({ width, message }: { width: string; message?: string }) => {
  return (
    <HStack backgroundColor="goodPurple.100" padding={6} alignItems="center" space={2} width={width}>
      <WarningTwoIcon color="red.600" size="md" />
      <Text fontSize="md" color="goodPurple.400">
        Please fill out all required fields before proceeding:
        <br />
        <Text fontWeight="700">{message}</Text>
      </Text>
    </HStack>
  );
};

const ProjectDetails = () => {
  const { form, nextStep, submitPartial, previousStep } = useCreatePool();
  const { isDesktopView } = useScreenSize();
  const { address } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  const [website, setWebsite] = useState<string>(form.website ?? '');
  const [twitter, setTwitter] = useState<string>(form.twitter ?? '');
  const [telegram, setTelegram] = useState<string>(form.telegram ?? '');
  const [discord, setDiscord] = useState<string>(form.discord ?? '');
  const [facebook, setFacebook] = useState<string>(form.facebook ?? '');
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
    if (!website && !twitter && !telegram && !discord && !facebook) {
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
    <VStack
      padding={2}
      style={{ minWidth: isDesktopView ? '600px' : '150px' }}
      width={isDesktopView ? '1/2' : 'full'}
      marginX="auto">
      <Text fontSize={isDesktopView ? '2xl' : 'lg'} fontWeight="700">
        Project Details
      </Text>
      <Text mb={6} fontSize="xs" color="gray.500">
        Add a detalied description, project links and disclaimer to help educate contributors about your project and
        it's goals
      </Text>
      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
            Website
          </Text>
        </FormControl.Label>
        <InputGroup width="full" backgroundColor="white">
          <InputLeftAddon children={'https://'} />
          <Input
            style={errors.website ? styles.error : {}}
            flex={1}
            value={website}
            onChangeText={(value) => {
              setWebsite(value);
              validate();
            }}
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
          <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
            Twitter (X) Handle
          </Text>
        </FormControl.Label>

        <InputGroup width="full" backgroundColor="white">
          <InputLeftAddon children={'@'} />
          <Input flex={1} value={twitter} onChangeText={(value) => setTwitter(value)} />
        </InputGroup>
      </FormControl>

      <FormControl mb="5">
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
            Telegram
          </Text>
        </FormControl.Label>

        <InputGroup width="full" backgroundColor="white">
          <InputLeftAddon children={'@'} />
          <Input flex={1} value={telegram} onChangeText={(value) => setTelegram(value)} />
        </InputGroup>
      </FormControl>

      <FormControl mb="5">
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
            Discord
          </Text>
        </FormControl.Label>
        <InputGroup width="full" backgroundColor="white">
          <InputLeftAddon children={'@'} />
          <Input flex={1} value={discord} onChangeText={(value) => setDiscord(value)} />
        </InputGroup>
      </FormControl>

      <FormControl mb="5">
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
            Facebook
          </Text>
        </FormControl.Label>
        <InputGroup width="full" backgroundColor="white">
          <InputLeftAddon children={'@'} />
          <Input flex={1} value={facebook} onChangeText={(value) => setFacebook(value)} />
        </InputGroup>
      </FormControl>

      <Text textTransform={isDesktopView ? 'uppercase' : 'none'} fontSize="md" fontWeight="600" mt={2}>
        Project Owner Details
      </Text>
      <Divider mb={8} />

      <VStack space="4">
        <Text fontSize="lg" fontWeight="500">
          Admin Wallet Address
        </Text>

        <Disclaimer text="Make sure your wallet that is connected is the wallet that you want to manage your pool with." />
        <ActionButton text="Change Wallet" bg="goodPurple.400" textColor="white" onPress={changeWallet} />
        <Box borderWidth={2} borderColor="gray.200" backgroundColor="white" padding={4} borderRadius={4}>
          <Text fontSize="md" fontWeight="400" color="gray.400">
            {ensName}
          </Text>
          <Text fontSize="sm" fontWeight="500" color="gray.400">
            {adminWalletAddress}
          </Text>
        </Box>
      </VStack>

      <FormControl mb="5">
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
            Please provide any additional information about your project that you would like us to know (optional)
          </Text>
        </FormControl.Label>
        <Input backgroundColor="white" value={additionalInfo} onChangeText={(value) => setAdditionalInfo(value)} />
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>
      <HStack w="full" justifyContent="space-between">
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
              <Text>Next: Configure Pool</Text>
              <ArrowForwardIcon />
            </HStack>
          }
          bg="goodPurple.400"
          textColor="white"
        />
      </HStack>
      <Box flexDir="row-reverse" paddingY={2}>
        {showWarning && Object.keys(errors).length > 0 && <Warning width="1/2" message={errors.social} />}
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

export default ProjectDetails;
