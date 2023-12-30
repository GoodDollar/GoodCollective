export enum SupportedNetwork {
  celo = 42220,
  alfajores = 44787,
}

export const SupportedNetworkNames: Record<SupportedNetwork, keyof typeof SupportedNetwork> = {
  [SupportedNetwork.celo]: 'celo',
  [SupportedNetwork.alfajores]: 'alfajores',
};

export const tokenMapping: Record<string, `0x${string}`> = {
  CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  USDC: '0x37f750B7cC259A2f741AF45294f6a16572CF5cAd',
  WBTC: '0xd71Ffd0940c920786eC4DbB5A12306669b5b81EF',
  G$: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
  WETH: '0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207',
};

export type SupportedTokenSymbol = keyof typeof tokenMapping;

export const coingeckoTokenMapping: Record<SupportedTokenSymbol, `0x${string}`> = {
  ...tokenMapping,
  WBTC: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
  WETH: '0x2def4285787d58a2f811af24755a8150622f4361',
};

// constructed from tokenMapping
export const currencyOptions: { value: SupportedTokenSymbol; label: SupportedTokenSymbol }[] = Object.keys(
  tokenMapping
).map((key) => ({
  value: key as SupportedTokenSymbol,
  label: key as SupportedTokenSymbol,
}));

export enum Frequency {
  OneTime = 'One-Time',
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Yearly = 'Yearly',
}

// constructed from Frequency
export const frequencyOptions: { value: Frequency; label: Frequency }[] = Object.values(Frequency).map((value) => ({
  value,
  label: value,
}));
