import { Token } from '@uniswap/sdk-core';
import GdContracts from '@gooddollar/goodprotocol/releases/deployment.json';

// 5%
export const acceptablePriceImpact = 5;

export enum SupportedNetwork {
  CELO = 42220,
}

export const SupportedNetworkNames: Record<SupportedNetwork, string> = {
  [SupportedNetwork.CELO]: 'celo',
};

// Uniswap V3 Router on Celo
export const UNISWAP_V3_ROUTER_ADDRESS = '0x5615CDAb10dc425a742d643d949a7F474C01abc4';

export const GDToken: Token = new Token(SupportedNetwork.CELO, GdContracts['production-celo'].GoodDollar, 18, 'G$');

// if a token is not in this list, the address from the Celo Token List is used
export const coingeckoTokenMapping: Record<string, `0x${string}`> = {
  WBTC: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
  WETH: '0x2def4285787d58a2f811af24755a8150622f4361',
};

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

export const IS_DONATING_POLL_INTERVAL = parseInt(process.env.IS_DONATING_POLL_INTERVAL ?? '30000', 10);
