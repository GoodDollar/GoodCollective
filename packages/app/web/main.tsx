import React from 'react';
import ReactDOM from 'react-dom';
import App from '../src/App';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { celo } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

const { publicClient, webSocketPublicClient } = configureChains(
  [celo],
  [infuraProvider({ apiKey: 'f566bb91f1fb4e788aa916bdb1b1b7f8' }), publicProvider()]
);

const connectors = [
  new MetaMaskConnector({
    chains: [celo],
  }),
  new WalletConnectConnector({
    chains: [celo],
    options: {
      projectId: 'f147afbc9ad50465eaedd3f56ad2ae87',
    },
  }),
];

const apolloClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/gooddollar/goodsubgraphs',
  cache: new InMemoryCache(),
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById('root')
);
