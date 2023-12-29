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
  cUSD: '0x765de816845861e75a25fca122bb6898b8b1282a',
  WBTC: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
  G$: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
  WETH: '0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207',
};

export type SupportedTokenSymbol = keyof typeof tokenMapping;

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
