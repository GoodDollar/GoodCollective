import { ExtendedUBISettings, GoodCollectiveSDK, UBIPoolSettings, UBISettings } from '@gooddollar/goodcollective-sdk';
import { useAppKitAccount } from '@reown/appkit/react';
import { ethers } from 'ethers';
import { createContext, ReactNode, useState } from 'react';
import { useAccount } from 'wagmi';
import { UBIPool } from '../../../../contracts/typechain-types/contracts/UBI/UBIPool';
import { GDEnvTokens, SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import useCrossNavigate from '../../routes/useCrossNavigate';
import { validateConnection } from '../useContractCalls/util';
import { useEthersSigner } from '../useEthers';
import { Form } from './useCreatePool';

type CreatePoolContextType = {
  step: number;
  form: Form;
  nextStep: () => void;
  previousStep: () => void;
  startOver: () => void;
  submitPartial: (partialForm: Form) => void;
  setStep: (step: number) => void;
  goToBasics: () => void;
  goToPoolConfiguration: () => void;
  goToProjectDetails: () => void;
  createPool: () => Promise<UBIPool | false>;
};

export const CreatePoolContext = createContext<CreatePoolContextType | undefined>(undefined);

export const CreatePoolProvider = ({ children }: { children: ReactNode }) => {
  const { address: maybeAddress, chain } = useAccount();

  const maybeSigner = useEthersSigner({ chainId: chain?.id });
  const { isConnected } = useAppKitAccount();
  const { navigate } = useCrossNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({});

  const submitPartial = (partialForm: Form) => {
    setForm((prev) => ({ ...prev, ...partialForm }));
  };

  const nextStep = () => {
    if (isConnected) {
      setStep((prev) => prev + 1);
    } else {
      navigate(`/create`);
    }
  };
  const previousStep = () => setStep((prev) => prev - 1);
  const startOver = () => {
    setStep(2);
    setForm({});
  };

  const goToBasics = () => {
    if (step !== 5) return;
    setStep(2);
  };

  const goToProjectDetails = () => {
    if (step !== 5) return;
    setStep(3);
  };

  const goToPoolConfiguration = () => {
    if (step !== 5) return;
    setStep(4);
  };

  const createPool = async () => {
    const validation = validateConnection(maybeAddress, chain?.id, maybeSigner);
    if (typeof validation === 'string') {
      return false;
    }
    const { chainId, signer } = validation;
    const chainIdString = chainId.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chainId as SupportedNetwork];

    const sdk = new GoodCollectiveSDK(chainIdString, signer.provider as ethers.providers.Provider, { network });

    // Final form validation
    if (!form.projectName || !form.projectDescription) {
      console.error('Missing required project details');
      return false;
    }
    if (!form.logo) {
      console.error('Missing required logo');
      return false;
    }
    if (
      !form.maximumMembers ||
      !form.claimAmountPerWeek ||
      !form.claimFrequency ||
      typeof form.managerFeePercentage !== 'number'
    ) {
      console.error('Missing required pool configuration');
      return false;
    }

    const projectId =
      form.projectName.replace(' ', '/').toLowerCase() + (Math.random() * 1e32).toString(36).substring(0, 6);
    const poolAttributes = {
      name: form.projectName,
      description: form.projectDescription,
      rewardDescription: form.rewardDescription ?? '',
      website: form.website,
      twitter: form.twitter,
      instagram: form.instagram,
      threads: form.threads,
      discord: form.discord,
      headerImage: form.coverPhoto ?? '',
      logo: form.logo,
    };

    // Get the correct reward token based on environment (following DonateComponent pattern)
    const gdEnvSymbol = network === 'production-celo' ? 'G$' : 'G$-Dev';
    const GDToken = GDEnvTokens[gdEnvSymbol];
    const rewardToken = GDToken?.address || '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A';

    const poolSettings: UBIPoolSettings = {
      manager: await signer.getAddress(),
      membersValidator: ethers.constants.AddressZero,
      uniquenessValidator: '0xC361A6E67822a0EDc17D899227dd9FC50BD62F42',
      rewardToken: rewardToken,
    };

    // Calculate cycle length based on claim frequency
    const cycleLengthDays = form.claimFrequency && form.claimFrequency <= 7 ? 7 : form.claimFrequency || 1;

    const ubiSettings: UBISettings = {
      claimPeriodDays: ethers.BigNumber.from(form.claimFrequency || 1),
      minActiveUsers: ethers.BigNumber.from(1),
      maxClaimAmount: ethers.utils.parseEther(String(form.claimAmountPerWeek || 0)),
      maxMembers: form.maximumMembers || form.expectedMembers || 100,
      onlyMembers: form.poolRecipients ? form.canNewMembersJoin ?? false : false,
      cycleLengthDays: ethers.BigNumber.from(cycleLengthDays),
      claimForEnabled: false,
    };

    const extendedUBISettings: ExtendedUBISettings = {
      maxPeriodClaimers: 0,
      minClaimAmount: ubiSettings.maxClaimAmount,
      managerFeeBps: (form.managerFeePercentage || 0) * 100,
    };

    try {
      console.log('Creating UBI pool with settings:', {
        projectId,
        poolSettings,
        ubiSettings,
        extendedUBISettings,
        network,
      });

      const pool = await sdk.createUbiPoolWithAttributes(
        signer,
        projectId,
        poolAttributes,
        poolSettings,
        ubiSettings,
        extendedUBISettings,
        false // isBeacon should always be false as per requirements
      );
      console.log('Pool created successfully:', pool.address);
      setStep(6); // Move to success step
      return pool;
    } catch (error) {
      console.error('Pool creation failed:', error);
      throw error;
    }
  };

  return (
    <CreatePoolContext.Provider
      value={{
        step,
        form,
        nextStep,
        previousStep,
        startOver,
        submitPartial,
        setStep,
        goToBasics,
        goToPoolConfiguration,
        goToProjectDetails,
        createPool,
      }}>
      {children}
    </CreatePoolContext.Provider>
  );
};
