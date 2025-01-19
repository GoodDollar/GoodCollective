import './shim';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/App';

// import { configureChains, createConfig, WagmiConfig } from 'wagmi';
// import { celo } from 'wagmi/chains';
// import { publicProvider } from 'wagmi/providers/public';
// import { infuraProvider } from 'wagmi/providers/infura';
// import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
// import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

// const { publicClient, webSocketPublicClient, chains } = configureChains(
//   [celo],
//   [infuraProvider({ apiKey: 'f566bb91f1fb4e788aa916bdb1b1b7f8' }), publicProvider()]
// );

// const { chains, publicClient, webSocketPublicClient } = configureChains(
//   [celo],
//   [infuraProvider({ apiKey: 'f566bb91f1fb4e788aa916bdb1b1b7f8' }), publicProvider()]
// );

// const connectors = [
//   new MetaMaskConnector({
//     chains: chains,
//   }),
// ];

// const apolloClient = new ApolloClient({
//   uri: 'https://api.studio.thegraph.com/query/50925/goodcollective/version/latest',
//   cache: new InMemoryCache(),
// });

// const config = createConfig({
//   autoConnect: true,
//   connectors,
//   publicClient,
//   webSocketPublicClient,
// });

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);