const defaults = {
  REACT_APP_CELO_EXPLORER: 'https://celoscan.io',
  REACT_APP_SUPERFLUID_EXPLORER: 'https://console.superfluid.finance/celo',
  REACT_APP_NETWORK: 'celo',
  REACT_APP_SUBGRAPH:
    'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/deployments/id/QmTLnjD81zfAH2AmFD9p1i61qLGX2qwHzBXUbwDG3hRP8T',
};
export default { ...defaults, ...process.env, ...import.meta.env };
