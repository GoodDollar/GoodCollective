import { createContext, ReactNode, useState } from 'react';
import { Form } from './useCreatePool';
import { ExtendedUBISettings, GoodCollectiveSDK, UBIPoolSettings, UBISettings } from '@gooddollar/goodcollective-sdk';
import { ethers } from 'ethers';
import { SupportedNetwork, SupportedNetworkNames } from '../../models/constants';
import { useAccount } from 'wagmi';
import { useEthersSigner } from '../useEthers';
import { validateConnection } from '../useContractCalls/util';
import { UBIPool } from '../../../../contracts/typechain-types/contracts/UBI/UBIPool';
import { useAppKitAccount } from '@reown/appkit/react';
import useCrossNavigate from '../../routes/useCrossNavigate';

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
  const { address: maybeAddress } = useAccount();
  const { chain } = useAccount();
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
    if (!form.projectName || !form.projectDescription) return false;
    if (!form.logo) return false;
    if (
      !form.maximumMembers ||
      !form.claimAmountPerWeek ||
      !form.claimFrequency ||
      typeof form.managerFeePercentage !== 'number'
    )
      return false;

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

    const poolSettings: UBIPoolSettings = {
      manager: signer.getAddress(),
      membersValidator: ethers.constants.AddressZero,
      uniquenessValidator: '0xC361A6E67822a0EDc17D899227dd9FC50BD62F42',
      rewardToken: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
    };

    const ubiSettings: UBISettings = {
      claimPeriodDays: ethers.BigNumber.from(form.claimFrequency),
      minActiveUsers: ethers.BigNumber.from(1),
      maxClaimAmount: ethers.utils.parseEther(String(form.claimAmountPerWeek)),
      maxMembers: form.maximumMembers,
      onlyMembers: form.canNewMembersJoin ?? false,
      cycleLengthDays: ethers.BigNumber.from(form.claimFrequency <= 7 ? 7 : form.claimFrequency),
      claimForEnabled: false,
    };

    const extendedUBISettings: ExtendedUBISettings = {
      maxPeriodClaimers: 0,
      minClaimAmount: ubiSettings.maxClaimAmount,
      managerFeeBps: form.managerFeePercentage * 100,
    };

    try {
      const pool = await sdk.createUbiPoolWithAttributes(
        signer,
        projectId,
        poolAttributes,
        poolSettings,
        ubiSettings,
        extendedUBISettings,
        false
      );
      console.log('pool:', pool.address);
      return pool;
    } catch (error) {
      return false;
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
