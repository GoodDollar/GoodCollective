import { createContext, ReactNode, useState } from 'react';
import { Form } from './useCreatePool';
import { ExtendedUBISettings, GoodCollectiveSDK, UBIPoolSettings, UBISettings } from '@gooddollar/goodcollective-sdk';
import { ethers } from 'ethers';
import { SupportedNetwork, SupportedNetworkNames } from '../models/constants';
import { useAccount } from 'wagmi';
import { useEthersSigner } from './useEthers';
import { validateConnection } from './useContractCalls/util';

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
  createPool: () => void;
};

export const CreatePoolContext = createContext<CreatePoolContextType | undefined>(undefined);

export const CreatePoolProvider = ({ children }: { children: ReactNode }) => {
  const { address: maybeAddress } = useAccount();
  const { chain } = useAccount();
  const maybeSigner = useEthersSigner({ chainId: chain?.id });

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({});

  const submitPartial = (partialForm: Form) => {
    setForm((prev) => ({ ...prev, ...partialForm }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
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
      return;
    }
    const { chainId, signer } = validation;
    const chainIdString = chainId.toString() as `${SupportedNetwork}`;
    const network = SupportedNetworkNames[chainId as SupportedNetwork];

    const sdk = new GoodCollectiveSDK(chainIdString, signer.provider as ethers.providers.Provider, { network });

    // Form validation
    if (!form.projectName || !form.projectDescription) return;
    if (!form.logo || !form.coverPhoto) return;

    // TODO
    const projectId = 'redtent';
    const poolAttributes = {
      name: form.projectName,
      description: form.projectDescription,
      // TODO
      rewardDescription: 'Up to 500 women in Nigeria may claim G$ every day ',
      goodidDescription: 'Verified women from Nigeria',
      website: form.website,
      twitter: form.twitter,
      instagram: form.instagram,
      threads: form.threads,
      discord: form.discord,
      headerImage: form.coverPhoto,
      logo: form.logo,
    };

    // production identity/G$ token contracts are used here
    const poolSettings: UBIPoolSettings = {
      manager: signer.getAddress(),
      membersValidator: ethers.constants.AddressZero,
      uniquenessValidator: '0xC361A6E67822a0EDc17D899227dd9FC50BD62F42',
      rewardToken: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
    };

    // TODO
    const ubiSettings: UBISettings = {
      cycleLengthDays: ethers.BigNumber.from(7),
      claimPeriodDays: ethers.BigNumber.from(form.claimFrequency),
      minActiveUsers: ethers.BigNumber.from(500),
      claimForEnabled: false,
      maxClaimAmount: ethers.utils.parseEther('437'),
      maxMembers: 500,
      onlyMembers: true,
    };

    // example for fixed amount type of pool
    const extendedUBISettings: ExtendedUBISettings = {
      maxPeriodClaimers: 1,
      minClaimAmount: ubiSettings.maxClaimAmount,
      managerFeeBps: 1500, // 15%
    };

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
