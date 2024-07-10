const defaults = {
  REACT_APP_CELO_EXPLORER: 'https://celoscan.io',
  REACT_APP_SUPERFLUID_EXPLORER: 'https://console.superfluid.finance/celo',
};
export default { ...defaults, ...process.env, ...import.meta.env };
