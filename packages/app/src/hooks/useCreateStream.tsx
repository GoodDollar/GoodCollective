// import { Framework } from '@superfluid-finance/sdk-core';
// import { useConnect, useNetwork, useWalletClient } from 'wagmi';

// export function useCreateNewFlow() {
//   const SF_RESOLVERS: { [key: string]: string } = {
//     44787: '0x6e9CaBE4172344Db81a1E1D735a6AD763700064A',
//     31337: '0x41549B6C39A529EA574f35b745b00f716869D2a0',
//   };
//   const createNewFlow = async (flowRate: string, token: string, pool: string) => {
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     const { connector }: any = useConnect();

//     const provider = await connector.getProvider();
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     const { chain }: any = useNetwork();
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     const { data }: any = useWalletClient();

//     const opts = {
//       chainId: Number(chain),
//       provider: provider,
//       resolverAddress: SF_RESOLVERS[chain],
//       protocolReleaseVersion: chain === '31337' ? 'test' : undefined,
//     };

//     const sf = await Framework.create(opts);
//     const st = sf?.loadSuperToken(token);
//     try {
//       if (data.signer) {
//         console.log('flowrate', flowRate);

//         const createFlowOperation = sf.cfaV1.createFlow({
//           flowRate: flowRate,
//           receiver: pool,
//           superToken: st,
//         });

//         console.log('Creating your stream...');

//         const result = await createFlowOperation.exec(data.signer);
//         console.log(result);
//       }
//     } catch (error) {
//       console.log(
//         "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
//       );
//       console.error(error);
//     }
//   };

//   return { createNewFlow };
// }
