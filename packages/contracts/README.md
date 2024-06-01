# Contracts

## Structs

### Pool Settings

-   `nftType`: 1, // when you update the settings with setPoolSettings, `nftType` should always match what has been set when creating the pool
-   `uniquenessValidator`: `ethers.constants.AddressZero`,
-   `rewardPerEvent`: `[100, 300]`,
-   `validEvents`: `[1, 2]`, // to be defined
-   `manager`: `<address of the owner/creator of the pool>`,
-   `membersValidator`: `ethers.constants.AddressZero`, // used to only accept certain members (address zero for anyone can join)
-   `rewardToken`: `'0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A'`, // what token will a steward/member receive. currently only supports production G$'s
-   `allowRewardOverride`: `false`,
