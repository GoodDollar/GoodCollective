# GoodCollective Monorepo – AI Agent Reference

## Monorepo Layout

| Path                | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| packages/contracts/ | Hardhat Solidity contracts: pool factories, pools, ProvableNFT |
| packages/sdk-js/    | TypeScript SDK: wraps contracts, loads from deployment.json    |
| packages/app/       | React Native Web app using NativeBase, G$ support              |
| packages/subgraph/  | TheGraph schema and mappings: pools, claims                    |
| packages/services/  | Docker setup for devnet/Subgraph infra                         |
| releases/           | deployment.json: contract addresses by network                 |
| scripts/            | Utility scripts (migrations, transforms)                       |
| test/               | Cross-package integration tests                                |

## Smart Contracts - Essential Concepts

- **DirectPaymentsFactory & DirectPaymentsPool**

  - Factory deploys pools; links each to a ProvableNFT.
  - Uses a UUPS proxy. Updates via `updateImpl`.
  - Holds/verifies pool metadata (IPFS).
  - Minting NFT triggers reward distribution (optional on mint).

- **UBIPool & UBIPoolFactory**

  - Creates and manages UBI pools by project ID.
  - Uses UpgradeableBeacon (`updateImpl` affects all).
  - Tracks which pool controls a project.
  - Small fee (bps) sent to feeRecipient.

- **ProvableNFT**

  - ERC-721 (UUPS) for proof-of-action NFTs (linked per pool).
  - `mintNFT` may also trigger reward claim.

- **GoodDollar Integration**
  - **G$ Token:** All rewards in GoodDollar (ISuperToken).
  - **feeRecipient:** Defaults to GoodDollar UBIScheme if available.

## SDK Usage: Always Prefer these Methods!

**Do NOT hardcode contract addresses.** Use the SDK, which loads addresses and ABIs from deployment.json by chainId.

### Key SDK Methods

- `sdk.createPool(...)` – Deploy DirectPaymentsPool via factory.
- `sdk.mintNft(...)` – Mint/generate proof-of-action NFT (optionally claim reward).
- `sdk.supportFlow(...)` – Start Superfluid G$ stream to a pool.
- `sdk.supportSingleTransferAndCall(...)` – One-time donation via ERC677.
- `sdk.supportSingleBatch(...)` – Batch donation via Superfluid.

**Best Practice:**  
Let the SDK resolve all addresses. Always load addresses/ABIs by network via the SDK.

## App UI Coding Guide

**Always prefer NativeBase for UI in `packages/app`!**

- Use `<Box>`, `<Text>`, `<HStack>`, etc.
- Style using NativeBase props (e.g. `p={4}`, `bg="goodPurple.400"`).
- Use theme variables (see `app/src/theme`).
- Avoid `StyleSheet.create` for new components; use prop-based styling.
- If necessary, compute style objects _and spread into NativeBase components_.

**Example:**

```tsx
<Box p={4} bg={value === option ? 'goodPurple.400' : 'white'} alignItems="center">
  <Text fontSize="lg" color="goodPurple.700">
    ...
  </Text>
</Box>
```

- Responsive props (`w={8} h={8}` etc.) preferred over fixed styles.

## Testing & Workflow

1. **Deploy Local Contracts:**  
   `yarn test:setup` (sets up contracts, generates latest deployment.json)

2. **Run Tests:**  
   `yarn test` (executes contract & SDK tests; all must pass)

3. **Lint & Format:**  
   Follow Prettier/ESLint (2-space, single quotes, <=120 chars).
   Make sure typescript compiles by running `tsc` in the affected packages or apps.

4. **Build related packages/apps**
   Run build script for the affected package or app.

5. **Pull Requests:**
   - Clear description of changes.
   - All tests AND lint must pass.

## Agent Coding Principles

- Use SDK for all contract interactions.
- Never hardcode contract addresses; always resolve via deployment.json.
- Style React components with NativeBase/theming, not CSS or StyleSheet for new code.
- Follow existing conventions for file locations, imports, and naming.
- Ensure all relevant tests pass after changes.

---
