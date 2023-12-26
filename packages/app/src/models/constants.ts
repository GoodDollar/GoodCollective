export const CELO_CHAIN_ID = 42220;

// TODO: are these token addresses correct?
export const tokenMapping: Record<string, `0x${string}`> = {
  CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  cUSD: '0x765de816845861e75a25fca122bb6898b8b1282a',
  WBTC: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
  G$: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
  // RECY: '0x',
  WETH: '0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207',
};

export const currencyOptions = [
  { value: 'G$', label: 'G$' },
  { value: 'CELO', label: 'CELO' },
  { value: 'cUSD', label: 'cUSD' },
  // { value: 'RECY', label: 'RECY' },
  { value: 'WBTC', label: 'WBTC' },
  { value: 'WETH', label: 'WETH' },
];

export const frequencyOptions = [
  { value: 'One-Time', label: 'One-Time' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Yearly', label: 'Yearly' },
];
