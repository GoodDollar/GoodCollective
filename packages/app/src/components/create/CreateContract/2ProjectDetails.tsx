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
} from 'native-base';

import ActionButton from '../../ActionButton';
import { Form } from '../CreateGoodCollective';

type FieldError = {
  social?: string;
  adminWalletAddress?: string;
};

const ProjectDetails = ({
  form,
  onStepForward,
  onStepBackward,
}: {
  form: Form;
  onStepForward: Function;
  onStepBackward: () => {};
}) => {
  const [website, setWebsite] = useState<string>(form.website ?? '');
  const [twitter, setTwitter] = useState<string>(form.twitter ?? '');
  const [telegram, setTelegram] = useState<string>(form.telegram ?? '');
  const [discord, setDiscord] = useState<string>(form.discord ?? '');
  const [facebook, setFacebook] = useState<string>(form.facebook ?? '');
  // TODO Set current wallet
  const [adminWalletAddredss, setAdminWalletAddress] = useState<string>(form.adminWalletAddress ?? '');
  const [additionalInfo, setAdditionalInfo] = useState<string>(form.additionalInfo ?? '');

  const onSubmit = () => {
    if (validate())
      onStepForward({
        website,
        twitter,
        telegram,
        discord,
        facebook,
        adminWalletAddredss,
        additionalInfo,
      });
  };

  const validate = () => {
    const currErrors = errors;
    if (!website && !twitter && !telegram && !discord && !facebook) {
      currErrors.social = 'One social channel is required';
    }

    if (!adminWalletAddredss) {
      currErrors.adminWalletAddress = 'Admin wallet address is required!';
    }

    setErrors({
      ...currErrors,
    });

    return Object.keys(currErrors);
  };

  const [errors, setErrors] = useState<FieldError>({});

  return (
    <VStack padding={2}>
      <Text fontSize="2xl" fontWeight="700">
        Project Details
      </Text>
      <Text mb={6} fontSize="xs" color="gray.500">
        Add a detalied description, project links and disclaimer to help educate contributors about your project and
        it's goals
      </Text>
      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
            Website
          </Text>
        </FormControl.Label>
        <InputGroup width="full">
          <InputLeftAddon children={'https://'} />
          <Input value={website} onChangeText={(value) => setWebsite(value)} />
        </InputGroup>
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>

      <FormControl mb="5">
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
            Twitter (X) Handle
          </Text>
        </FormControl.Label>

        <InputGroup width="full">
          <InputLeftAddon children={'@'} />
          <Input value={twitter} onChangeText={(value) => setTwitter(value)} />
        </InputGroup>
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>

      <FormControl mb="5">
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
            Telegram
          </Text>
        </FormControl.Label>
        <InputGroup width="full">
          <InputLeftAddon children={'@'} />
          <Input value={telegram} onChangeText={(value) => setTelegram(value)} />
        </InputGroup>
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>

      <FormControl mb="5">
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
            Discord
          </Text>
        </FormControl.Label>
        <InputGroup width="full">
          <InputLeftAddon children={'@'} />
          <Input value={discord} onChangeText={(value) => setDiscord(value)} />
        </InputGroup>
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>

      <FormControl mb="5">
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
            Facebook
          </Text>
        </FormControl.Label>
        <InputGroup width="full">
          <InputLeftAddon children={'@'} />
          <Input value={facebook} onChangeText={(value) => setFacebook(value)} />
        </InputGroup>
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>

      <Text textTransform="uppercase" fontSize="md" fontWeight="600" mt={2}>
        Project Owner Details
      </Text>
      <Divider mb={8} />

      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
            Admin Wallet Address
          </Text>
        </FormControl.Label>
        <FormControl.HelperText mt={0} mb={2}>
          Fill this out with an Ethereum address to make that address this project's owner.
        </FormControl.HelperText>
        <Input
          style={errors.adminWalletAddress ? styles.error : {}}
          value={adminWalletAddredss}
          onChangeText={(value) => setAdminWalletAddress(value)}
        />
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>

      <FormControl mb="5" isRequired>
        <FormControl.Label>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
            Please provide any additional information about your project that you would like us to know (optional)
          </Text>
        </FormControl.Label>
        <Input value={additionalInfo} onChangeText={(value) => setAdditionalInfo(value)} />
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Something is wrong.
        </FormControl.ErrorMessage>
      </FormControl>
      <HStack w="full" justifyContent="space-between">
        <ActionButton onPress={() => onStepBackward()} text={'Back'} bg="white" textColor="black" />
        <ActionButton onPress={onSubmit} text="Next: Configure Pool" bg="goodPurple.400" textColor="white" />
      </HStack>
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
