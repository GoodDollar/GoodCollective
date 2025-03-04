import { useContractRead } from 'wagmi';

export const useNetFlowRate = (token: `0x${string}`, account: `0x${string}`) => {
  const result = useContractRead({
    address: '0xcfA132E353cB4E398080B9700609bb008eceB125',
    abi: [
      {
        inputs: [
          {
            internalType: 'contract ISuperToken',
            name: 'token',
            type: 'address',
          },
          { internalType: 'address', name: 'account', type: 'address' },
        ],
        name: 'getAccountFlowrate',
        outputs: [{ internalType: 'int96', name: 'flowrate', type: 'int96' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    args: [token, account],
    functionName: 'getAccountFlowrate',
  });

  return result.data;
};
