import { G$ContractAddresses } from '@gooddollar/web3sdk-v2';
import { isAddress, zeroAddress } from 'viem';
import { useContractRead, useNetwork } from 'wagmi';

export const useIsStewardVerified = (address: string): boolean => {
  const chain = useNetwork();
  const idAddress = G$ContractAddresses('Identity', 'production-celo') as `0x{string}`;
  const result = useContractRead({
    chainId: chain.chain?.id,
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
        ],
        name: 'getWhitelistedRoot',
        outputs: [
          {
            internalType: 'address',
            name: 'whitelisted',
            type: 'address',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    address: idAddress,
    args: [address],
    functionName: 'getWhitelistedRoot',
  });
  return result.data !== zeroAddress && isAddress(result.data as any);
};
