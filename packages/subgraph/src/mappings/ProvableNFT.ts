import { ProvableNftMinted } from '../../generated/ProvableNFT/ProvableNFT';
import { ProvableNFT, Steward } from '../../generated/schema';

export function handleNftMint(event: ProvableNftMinted): void {
  const tokenID = event.params.tokenId.toString();
  const to = event.params.to.toHexString();
  const nftHash = event.params.nftDataHash.toHexString();

  let provableNFT = ProvableNFT.load(tokenID);

  if (provableNFT === null) {
    provableNFT = new ProvableNFT(tokenID);
    provableNFT.id = tokenID;
    provableNFT.owner = to; // Fixed this line
    provableNFT.hash = nftHash;
    provableNFT.save();
  }
}
