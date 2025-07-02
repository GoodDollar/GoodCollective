import { useContext } from 'react';
import { CreatePoolContext } from './CreatePoolContext';

export type PoolType = 'community-funds' | 'segmented-aid' | 'results-based';

export type Form = {
  poolType?: PoolType;
  projectName?: string;
  projectDescription?: string;
  tagline?: string;
  logo?: string;
  coverPhoto?: string;
  adminWalletAddress?: string;
  additionalInfo?: string;
  poolManagerFeeType?: 'default' | 'custom';
  claimFrequency?: 1 | 7 | 14 | 30 | number;
  joinStatus?: 'closed' | 'open';
  website?: string;
  twitter?: string;
  telegram?: string;
  instagram?: string;
  threads?: string;
  discord?: string;
  facebook?: string;
  canNewMembersJoin?: boolean;
  maximumMembers?: number;
  managerAddress?: string;
  poolRecipients?: string;
  managerFeePercentage?: number;
  claimAmountPerWeek?: number;
  expectedMembers?: number;
  customClaimFrequency?: number;
};

export const useCreatePool = () => {
  const context = useContext(CreatePoolContext);
  if (!context) {
    throw new Error('useCreatePool must be used within a CreatePoolProvider');
  }
  return context;
};

// export const useCreatePool = () => {
//   const CREATION_STEP = 5;

//   const [step, setStep] = useState(0);
//   const [form, setForm] = useState<Form>({});

//   const { address: maybeAddress } = useAccount();
//   const { chain } = useAccount();
//   const maybeSigner = useEthersSigner({ chainId: chain?.id });

//   const submitPartial = (partialForm: Form) => {
//     console.log(partialForm);
//     setForm({
//       ...form,
//       ...partialForm,
//     });
//   };

//   const startOver = () => {
//     setStep(2);
//     setForm({});
//   };

//   const previousStep = async () => setStep(step - 1);

//   const nextStep = () => {
//     // if (step === CREATION_STEP) {
//     //   createPool();
//     // }
//     // if (step > 5) return;
//     console.log('here');
//     setStep(step + 1);
//   };

//   const goToBasics = () => {
//     if (step !== 5) return;
//     setStep(2);
//   };

//   const goToProjectDetails = () => {
//     if (step !== 5) return;
//     setStep(3);
//   };

//   const goToPoolConfiguration = () => {
//     if (step !== 5) return;
//     setStep(4);
//   };

//   const createPool = async () => {
//     const validation = validateConnection(maybeAddress, chain?.id, maybeSigner);
//     if (typeof validation === 'string') {
//       return;
//     }
//     const { chainId, signer } = validation;
//     const chainIdString = chainId.toString() as `${SupportedNetwork}`;
//     const network = SupportedNetworkNames[chainId as SupportedNetwork];

//     const sdk = new GoodCollectiveSDK(chainIdString, signer.provider as ethers.providers.Provider, { network });

//     // Form validation
//     if (!form.projectName || !form.projectDescription) return;
//     if (!form.logo || !form.coverPhoto) return;

//     // TODO
//     const projectId = 'redtent';
//     const poolAttributes = {
//       name: form.projectName,
//       description: form.projectDescription,
//       // TODO
//       rewardDescription: 'Up to 500 women in Nigeria may claim G$ every day ',
//       goodidDescription: 'Verified women from Nigeria',
//       website: form.website,
//       twitter: form.twitter,
//       instagram: form.instagram,
//       threads: form.threads,
//       discord: form.discord,
//       headerImage: form.coverPhoto,
//       logo: form.logo,
//     };

//     // production identity/G$ token contracts are used here
//     const poolSettings: UBIPoolSettings = {
//       manager: signer.getAddress(),
//       membersValidator: ethers.constants.AddressZero,
//       uniquenessValidator: '0xC361A6E67822a0EDc17D899227dd9FC50BD62F42',
//       rewardToken: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
//     };

//     // TODO
//     const ubiSettings: UBISettings = {
//       cycleLengthDays: ethers.BigNumber.from(7),
//       claimPeriodDays: ethers.BigNumber.from(form.claimFrequency),
//       minActiveUsers: ethers.BigNumber.from(500),
//       claimForEnabled: false,
//       maxClaimAmount: ethers.utils.parseEther('437'),
//       maxMembers: 500,
//       onlyMembers: true,
//     };

//     // example for fixed amount type of pool
//     const extendedUBISettings: ExtendedUBISettings = {
//       maxPeriodClaimers: 1,
//       minClaimAmount: ubiSettings.maxClaimAmount,
//       managerFeeBps: 1500, // 15%
//     };

//     const pool = await sdk.createUbiPoolWithAttributes(
//       signer,
//       projectId,
//       poolAttributes,
//       poolSettings,
//       ubiSettings,
//       extendedUBISettings,
//       false
//     );
//     console.log('pool:', pool.address);
//   };

//   return {
//     step,
//     form,
//     CREATION_STEP,
//     createPool,
//     submitPartial,
//     nextStep,
//     startOver,
//     previousStep,
//     goToBasics,
//     goToProjectDetails,
//     goToPoolConfiguration,
//   };
// };
