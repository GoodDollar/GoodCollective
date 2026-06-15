import { Token } from '@uniswap/sdk-core';
import GdContracts from '@gooddollar/goodprotocol/releases/deployment.json';
import GoodCollectiveContracts from '../../../contracts/releases/deployment.json';
import { ethers } from 'ethers';

import env from '../lib/env';

// 5%
export const acceptablePriceImpact = 5;

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

/**
 * Map of chainId -> the goodprotocol deployment name whose IdentityV2 contract
 * is the canonical uniqueness validator for pools on that chain.
 *
 * IdentityV2 is a chain-level singleton: even though goodprotocol ships
 * multiple GoodDollar deployments per chain (production / staging / dev /
 * pre-production for Celo mainnet), they all read whitelist state off the
 * production IdentityV2 in practice. Pools created against any of the
 * GoodCollective factory variants are gated on the production registry, so
 * the validator we embed in pool settings should be the production one.
 */
const IDENTITY_DEPLOYMENT_NAME_BY_CHAIN: Record<number, string> = {
  42220: 'production-celo',
  44787: 'alfajores',
};

/**
 * Returns the IdentityV2 (uniqueness validator) address for the given chainId,
 * read from the @gooddollar/goodprotocol deployment manifest. Replaces the
 * hardcoded literal that used to live at the call sites.
 *
 * Returns ethers.constants.AddressZero when no deployment is found - callers
 * treat AddressZero as "no uniqueness check" (see isZeroAddress in
 * poolMemberEligibility).
 */
export function getUniquenessValidatorAddress(chainId?: number): string {
  if (!chainId) return ethers.constants.AddressZero;

  const deploymentName = IDENTITY_DEPLOYMENT_NAME_BY_CHAIN[chainId];
  if (!deploymentName) return ethers.constants.AddressZero;

  const deployments = GdContracts as unknown as Record<string, { Identity?: string } | undefined>;
  const address = deployments[deploymentName]?.Identity;
  if (address && address !== ethers.constants.AddressZero) {
    return address;
  }

  return ethers.constants.AddressZero;
}

/**
 * Returns the optional IMembersValidator address for the given chainId.
 *
 * Pools treat address(0) as "no extra membership rule" - the contracts only
 * call isMemberValid(...) when a non-zero validator is configured. The MVP
 * does not expose a custom validator, so this returns AddressZero today.
 * The intent is to swap this out for a form field on the create-pool flow
 * later, falling back to AddressZero when the user leaves it blank.
 *
 * Keeping the indirection in one helper means the eligibility preview in
 * PoolConfiguration and the deploy-time settings in CreatePoolContext share
 * a single source instead of repeating the literal at both call sites.
 */
export function getMembersValidatorAddress(_chainId?: number): string {
  return ethers.constants.AddressZero;
}

/**
 * Returns the ProvableNFT contract address for the given network name.
 * @param networkName - The network name
 */
export function getProvableNFTAddress(networkName: string): string {
  const networkEntry = Object.values(GoodCollectiveContracts)
    .flat()
    .find((entry: any) => entry?.name === networkName);

  if (!networkEntry || !networkEntry.contracts) {
    return '';
  }

  const contracts = networkEntry.contracts as any;

  if (contracts.ProvableNFT?.address) {
    return contracts.ProvableNFT.address;
  }

  if (contracts.MultiClaimModule?.address) {
    return contracts.MultiClaimModule.address;
  }

  return '';
}
