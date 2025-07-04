import { useState } from 'react';
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
} from 'native-base';
import { useAccount } from 'wagmi';

import ActionButton from '../../ActionButton';
import { useScreenSize } from '../../../theme/hooks';
import { useCreatePool } from '../../../hooks/useCreatePool';

type FieldError = {
  social?: string;
  adminWalletAddress?: string;
  website?: string;
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
  const { address } = useAccount();

  const [website, setWebsite] = useState<string>(form.website ?? '');
  const [twitter, setTwitter] = useState<string>(form.twitter ?? '');
  const [telegram, setTelegram] = useState<string>(form.telegram ?? '');
  const [discord, setDiscord] = useState<string>(form.discord ?? '');
  const [facebook, setFacebook] = useState<string>(form.facebook ?? '');
  const [adminWalletAddress, setAdminWalletAddress] = useState<string>(form.adminWalletAddress ?? address ?? '');
  const [additionalInfo, setAdditionalInfo] = useState<string>(form.additionalInfo ?? '');

  const onSubmit = () => {
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
    const currErrors = errors;
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

  const [errors, setErrors] = useState<FieldError>({});

  return (
    <VStack padding={2} style={{ minWidth: '600px' }} width="1/2" marginX="auto">
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

      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform={isDesktopView ? 'uppercase' : 'none'}>
            Admin Wallet Address
          </Text>
        </FormControl.Label>
        <FormControl.HelperText mt={0} mb={2}>
          Fill this out with an Ethereum address to make that address this project's owner.
        </FormControl.HelperText>
        <Input
          backgroundColor="white"
          style={errors.adminWalletAddress ? styles.error : {}}
          value={adminWalletAddress}
          onChangeText={(value) => {
            setAdminWalletAddress(value);
            validate();
          }}
        />
        {errors.adminWalletAddress && (
          <HStack alignItems="center" space={1} marginTop={1}>
            <WarningOutlineIcon size="xs" color="red.500" />
            <Text fontSize="xs" color="red.500">
              {errors.adminWalletAddress}
            </Text>
          </HStack>
        )}
      </FormControl>

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
              <Text>Next: Configure Pool</Text>
              <ArrowForwardIcon />
            </HStack>
          }
          bg="goodPurple.400"
          textColor="white"
        />
      </HStack>
      <Box flexDir="row-reverse" paddingY={2}>
        {Object.keys(errors).length > 0 && <Warning width="1/2" message={errors.social} />}
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
