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
 * Map of chainId -> goodprotocol deployment names that live on that chain.
 * For Celo mainnet (42220) the actual deployment used depends on the configured
 * env (production / staging / development / pre-production), so we keep an
 * ordered list and pick the one that matches REACT_APP_NETWORK first.
 */
const IDENTITY_DEPLOYMENT_NAMES_BY_CHAIN: Record<number, string[]> = {
  42220: ['production-celo', 'staging-celo', 'development-celo', 'pre-production-celo'],
  44787: ['alfajores'],
};

/**
 * Returns the IdentityV2 (uniqueness validator) address for the given chainId.
 * Reads from the @gooddollar/goodprotocol deployment manifest so the address
 * follows whatever the goodprotocol package ships, and falls back to the
 * env-configured network name on Celo mainnet so dev/QA builds resolve to the
 * matching IdentityV2 instead of the production one.
 *
 * Returns ethers.constants.AddressZero when no deployment is found for the
 * given chain - callers should treat AddressZero as "no uniqueness check"
 * (consistent with the existing isZeroAddress checks in poolMemberEligibility).
 */
export function getUniquenessValidatorAddress(chainId?: number): string {
  if (!chainId) return ethers.constants.AddressZero;

  const candidates = IDENTITY_DEPLOYMENT_NAMES_BY_CHAIN[chainId];
  if (!candidates || candidates.length === 0) return ethers.constants.AddressZero;

  const envNetwork = env.REACT_APP_NETWORK;
  const ordered =
    envNetwork && candidates.includes(envNetwork)
      ? [envNetwork, ...candidates.filter((name) => name !== envNetwork)]
      : candidates;

  const deployments = GdContracts as unknown as Record<string, { Identity?: string } | undefined>;
  for (const name of ordered) {
    const address = deployments[name]?.Identity;
    if (address && address !== ethers.constants.AddressZero) {
      return address;
    }
  }

  return ethers.constants.AddressZero;
}

/**
 * Returns the optional IMembersValidator address for the given chainId.
 *
 * Unlike uniquenessValidator (a protocol singleton with one canonical IdentityV2
 * per chain), membersValidator is an optional, deployment-specific hook. The
 * pool contracts treat address(0) as "no extra membership rule" and only call
 * the validator's isMemberValid(...) when a non-zero address is configured
 * (see UBIPool.sol:286-288, DirectPaymentsPool.sol:216-218).
 *
 * There is no canonical members-validator deployment in either the
 * @gooddollar/goodprotocol or contracts deployment manifests, so the default
 * for every chain is AddressZero. The address is exposed here as a chain-aware
 * helper so:
 *   1. Both the pre-deploy eligibility preview (PoolConfiguration) and the
 *      deploy-time pool settings (CreatePoolContext) read from a single source
 *      and stay in sync.
 *   2. A future deployment can plug in a custom validator per chain by setting
 *      REACT_APP_MEMBERS_VALIDATOR_<chainId> in the build env, without code
 *      changes at the call sites.
 *
 * Returns AddressZero when no override is set or the chain is not recognized.
 */
export function getMembersValidatorAddress(chainId?: number): string {
  if (!chainId) return ethers.constants.AddressZero;

  // Allow per-chain override via env so a deployment can wire in a custom
  // validator without touching the create-pool flow. Names follow the existing
  // REACT_APP_* convention used elsewhere in this file.
  const envKey = `REACT_APP_MEMBERS_VALIDATOR_${chainId}` as const;
  const overrides = env as unknown as Record<string, string | undefined>;
  const override = overrides[envKey];
  if (override && ethers.utils.isAddress(override)) {
    return ethers.utils.getAddress(override);
  }

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
