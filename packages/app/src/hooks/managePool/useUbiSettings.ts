import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEthersProvider, useEthersSigner } from '../useEthers';
import { validateConnection, printAndParseSupportError } from '../useContractCalls/util';

interface UseUbiSettingsParams {
  poolAddress?: string;
  pooltype?: string;
  contractsForChain: any;
  chainId: number;
}

export const useUbiSettings = ({ poolAddress, pooltype, contractsForChain, chainId }: UseUbiSettingsParams) => {
  const { address } = useAccount();
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });

  const [ubiCycleLengthDays, setUbiCycleLengthDays] = useState('');
  const [ubiClaimPeriodDays, setUbiClaimPeriodDays] = useState('');
  const [ubiMinActiveUsers, setUbiMinActiveUsers] = useState('');
  const [ubiMaxMembers, setUbiMaxMembers] = useState('');
  const [ubiMaxClaimAmountWei, setUbiMaxClaimAmountWei] = useState('');
  const [ubiAllowClaimFor, setUbiAllowClaimFor] = useState(false);
  const [ubiOnlyMembersCanClaim, setUbiOnlyMembersCanClaim] = useState(false);
  const [extendedMinClaimAmountWei, setExtendedMinClaimAmountWei] = useState('');
  const [extendedMaxPeriodClaimers, setExtendedMaxPeriodClaimers] = useState('');
  const [extendedManagerFeeBps, setExtendedManagerFeeBps] = useState<number | null>(null);
  const [isSavingUbiSettings, setIsSavingUbiSettings] = useState(false);
  const [ubiSettingsError, setUbiSettingsError] = useState<string | null>(null);
  const [ubiSettingsSuccess, setUbiSettingsSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadUbiSettings = async () => {
      if (!poolAddress || pooltype !== 'UBI' || !provider) return;

      const poolAbi = contractsForChain?.UBIPool?.abi || [];
      if (!poolAbi.length) return;

      try {
        const contract = new ethers.Contract(poolAddress, poolAbi, provider);
        const currentUbi: any = await contract.ubiSettings();
        const currentExtended: any = await contract.extendedSettings();

        setUbiCycleLengthDays(currentUbi.cycleLengthDays?.toString() ?? '');
        setUbiClaimPeriodDays(currentUbi.claimPeriodDays?.toString() ?? '');
        setUbiMinActiveUsers(currentUbi.minActiveUsers?.toString() ?? '');
        setUbiMaxMembers(currentUbi.maxMembers?.toString() ?? '');
        setUbiMaxClaimAmountWei(currentUbi.maxClaimAmount?.toString() ?? '');
        setUbiAllowClaimFor(Boolean(currentUbi.claimForEnabled));
        setUbiOnlyMembersCanClaim(Boolean(currentUbi.onlyMembers));

        setExtendedMaxPeriodClaimers(currentExtended.maxPeriodClaimers?.toString() ?? '');
        setExtendedMinClaimAmountWei(currentExtended.minClaimAmount?.toString() ?? '');
        setExtendedManagerFeeBps(
          typeof currentExtended.managerFeeBps === 'number'
            ? currentExtended.managerFeeBps
            : Number(currentExtended.managerFeeBps?.toString?.() ?? '0')
        );
      } catch (e) {
        console.error('Failed to load UBI settings', e);
      }
    };

    loadUbiSettings();
  }, [poolAddress, pooltype, provider, contractsForChain]);

  const handleSaveUbiSettings = async () => {
    setUbiSettingsError(null);
    setUbiSettingsSuccess(null);

    if (!poolAddress || pooltype !== 'UBI') {
      setUbiSettingsError('UBI settings can only be updated for UBI pools.');
      return;
    }

    if (!extendedManagerFeeBps && extendedManagerFeeBps !== 0) {
      setUbiSettingsError('Failed to read existing manager fee. Please reload the page and try again.');
      return;
    }

    const validation = validateConnection(address as `0x${string}` | undefined, chainId, signer);
    if (typeof validation === 'string') {
      setUbiSettingsError(validation);
      return;
    }

    const toNumber = (value: string, field: string): number | null => {
      const n = Number(value);
      if (!Number.isFinite(n) || n <= 0) {
        setUbiSettingsError(`${field} must be a positive number.`);
        return null;
      }
      return n;
    };

    const cycleLengthDays = toNumber(ubiCycleLengthDays, 'Cycle Length (Days)');
    if (cycleLengthDays === null) return;
    const claimPeriodDays = toNumber(ubiClaimPeriodDays, 'Claim Period (Days)');
    if (claimPeriodDays === null) return;
    const minActiveUsers = toNumber(ubiMinActiveUsers, 'Min Active Users');
    if (minActiveUsers === null) return;
    const maxMembers = toNumber(ubiMaxMembers || '0', 'Max Members');
    if (maxMembers === null) return;

    const maxClaimAmount = ubiMaxClaimAmountWei.trim();
    if (!maxClaimAmount) {
      setUbiSettingsError('Max Claim Amount (in wei) is required.');
      return;
    }

    const maxPeriodClaimers = Number(extendedMaxPeriodClaimers || '0');
    const minClaimAmount = extendedMinClaimAmountWei.trim() || '0';

    try {
      setIsSavingUbiSettings(true);

      const poolAbi = contractsForChain?.UBIPool?.abi || [];
      if (!poolAbi.length) {
        setUbiSettingsError('Unable to load pool contract ABI for UBI settings.');
        return;
      }

      const contract = new ethers.Contract(poolAddress, poolAbi, signer);

      const ubiSettingsPayload = {
        cycleLengthDays,
        claimPeriodDays,
        minActiveUsers,
        claimForEnabled: ubiAllowClaimFor,
        maxClaimAmount,
        maxMembers,
        onlyMembers: ubiOnlyMembersCanClaim,
      };

      const extendedSettingsPayload = {
        maxPeriodClaimers,
        minClaimAmount,
        managerFeeBps: extendedManagerFeeBps,
      };

      const tx = await contract.setUBISettings(ubiSettingsPayload, extendedSettingsPayload);
      await tx.wait();

      setUbiSettingsSuccess('UBI parameters updated successfully.');
    } catch (error) {
      const message = printAndParseSupportError(error);
      setUbiSettingsError(message);
    } finally {
      setIsSavingUbiSettings(false);
    }
  };

  return {
    ubiCycleLengthDays,
    setUbiCycleLengthDays,
    ubiClaimPeriodDays,
    setUbiClaimPeriodDays,
    ubiMinActiveUsers,
    setUbiMinActiveUsers,
    ubiMaxMembers,
    setUbiMaxMembers,
    ubiMaxClaimAmountWei,
    setUbiMaxClaimAmountWei,
    ubiAllowClaimFor,
    setUbiAllowClaimFor,
    ubiOnlyMembersCanClaim,
    setUbiOnlyMembersCanClaim,
    extendedMinClaimAmountWei,
    setExtendedMinClaimAmountWei,
    extendedMaxPeriodClaimers,
    setExtendedMaxPeriodClaimers,
    extendedManagerFeeBps,
    isSavingUbiSettings,
    ubiSettingsError,
    ubiSettingsSuccess,
    handleSaveUbiSettings,
  };
};
