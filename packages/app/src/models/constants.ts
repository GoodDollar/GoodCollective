import { Token } from '@uniswap/sdk-core';
import GdContracts from '@gooddollar/goodprotocol/releases/deployment.json';
import env from '../lib/env';

// 5%
export const acceptablePriceImpact = 2;

export enum SupportedNetwork {
  CELO = 42220,
}

export const SupportedNetworkNames: Record<SupportedNetwork, string> = {
  [SupportedNetwork.CELO]: env.REACT_APP_NETWORK,
};

// Uniswap V3 Router on Celo
export const UNISWAP_V3_ROUTER_ADDRESS = '0x5615CDAb10dc425a742d643d949a7F474C01abc4';

export const GDToken: Token = new Token(SupportedNetwork.CELO, GdContracts['production-celo'].GoodDollar, 18, 'G$');
export const GDDevToken: Token = new Token(
  SupportedNetwork.CELO,
  GdContracts['development-celo'].GoodDollar,
  18,
  'G$-Dev'
);
export const GDQAToken: Token = new Token(SupportedNetwork.CELO, GdContracts['staging-celo'].GoodDollar, 18, 'G$-QA');

export const GDEnvTokens: { [key: string]: Token } = {
  'G$-Dev': GDDevToken,
  'G$-QA': GDQAToken,
  G$: GDToken,
};
// if a token is not in this list, the address from the Celo Token List is used
export const coingeckoTokenMapping: Record<string, `0x${string}`> = {
  WBTC: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
  WETH: '0x2def4285787d58a2f811af24755a8150622f4361',
};

export enum Frequency {
  OneTime = 'One-Time',
  Monthly = 'Monthly', // streaming
}

// constructed from Frequency
export const frequencyOptions: { value: Frequency; label: Frequency }[] = Object.values(Frequency).map((value) => ({
  value,
  label: value,
}));

export const defaultInfoLabel = 'Please see the smart contract for information regarding payment logic.';

export const SUBGRAPH_POLL_INTERVAL = parseInt(process.env.IS_DONATING_POLL_INTERVAL ?? '30000', 10);
