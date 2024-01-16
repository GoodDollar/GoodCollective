import { SupportedNetwork } from '../../models/constants';
import { ethers } from 'ethers';

type Connection = {
  address: `0x${string}`;
  chainId: number;
  signer: ethers.providers.JsonRpcSigner;
};

export const validateConnection = (
  address?: `0x${string}`,
  chainId?: number,
  signer?: ethers.providers.JsonRpcSigner
): string | Connection => {
  if (!address) {
    return 'No address found. Please connect your wallet.';
  }
  if (!chainId || !(chainId in SupportedNetwork)) {
    return 'Unsupported network. Please connect to Celo Mainnet or Celo Alfajores.';
  }
  if (!signer) {
    return 'Failed to get signer.';
  }
  return { address, chainId, signer };
};

export const printAndParseSupportError = (error: any): string => {
  console.error(error);
  const errObj = error as Record<string, any>;
  return errObj.reason || errObj.code ? `${errObj.reason} (Code: ${errObj.code})` : errObj.message ?? 'unknown reason';
};
