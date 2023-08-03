// import { useState, useEffect } from 'react';
// import { EthereumProvider } from '@walletconnect/ethereum-provider';
// import { IEthereumProvider } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';
// const projectId = '2d923a8a66e396445ba00cd8b882450b';
//
// export const useWeb3Modal = () => {
//   const [provider, setProvider] = useState<IEthereumProvider>();
//
//   useEffect(() => {
//     EthereumProvider.init({
//       projectId, // REQUIRED your projectId
//       chains: [122, 42220], // REQUIRED chain ids
//       showQrModal: true, // REQUIRED set to "true" to use @walletconnect/modal
//     }).then((_) => setProvider(_));
//   }, []);
//
//   return provider;
// };
