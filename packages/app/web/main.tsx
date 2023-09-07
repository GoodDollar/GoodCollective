import React from 'react';
import ReactDOM from 'react-dom';
import App from '../src/App';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { celo } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

const { publicClient, webSocketPublicClient } = configureChains(
  [celo],
  [infuraProvider({ apiKey: 'f566bb91f1fb4e788aa916bdb1b1b7f8' }), publicProvider()]
);

const connectors = [
  new MetaMaskConnector({
    chains: [celo],
  }),
];

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <App />
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById('root')
);
