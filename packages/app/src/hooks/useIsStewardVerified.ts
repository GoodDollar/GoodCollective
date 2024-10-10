import { G$ContractAddresses, CONTRACT_TO_ABI } from '@gooddollar/web3sdk-v2';
import { useContractRead, useNetwork } from 'wagmi';

export const useIsStewardVerified = (address: string): boolean => {
  const chain = useNetwork();
  const idAddress = G$ContractAddresses('Identity', 'production-celo') as `0x{string}`;
  const abi = CONTRACT_TO_ABI.Identity.abi;
  const result = useContractRead({
    chainId: chain.chain?.id,
    abi,
    address: idAddress,
    args: [address],
    functionName: 'isWhitelisted',
  });

  return result.data as any as boolean;
};
