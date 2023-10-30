import { ProvableNftMinted } from '../../generated/ProvableNFT/ProvableNFT';
import { ProvableNFT, Steward } from '../../generated/schema';

export function handleNftMint(event: ProvableNftMinted): void {
  const tokenID = event.params.tokenId.toString();
  const to = event.params.to.toHexString();
  const nftHash = event.params.nftDataHash.toHexString();

  let provableNFT = ProvableNFT.load(tokenID);
  let stewardId = to + event.address.toHexString();
  let steward = Steward.load(stewardId);

  if (provableNFT === null) {
    provableNFT = new ProvableNFT(tokenID);
    provableNFT.id = tokenID;
    provableNFT.owner = to; // Fixed this line
    provableNFT.hash = nftHash;

    if (steward === null) {
      steward = new Steward(stewardId);
      // Set or update any fields of the Steward entity if needed
      // Example: steward.someField = someValue;
      steward.save();
    }

    provableNFT.steward = steward.id; // Assign the Steward entity to the steward field
    provableNFT.save();
  }
}
