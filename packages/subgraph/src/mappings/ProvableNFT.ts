import { ProvableNftMinted } from '../../generated/ProvableNFT/ProvableNFT';
import { ProvableNFT, Steward } from '../../generated/schema';

export function handleNftMint(event: ProvableNftMinted): void {
  const tokenID = event.params.tokenId.toString();
  const to = event.params.to.toHexString();
  const nftHash = event.params.nftDataHash.toHexString();

  let provableNFT = ProvableNFT.load(tokenID);
  let steward = Steward.load(to + event.params.pool.toHexString());
  if (provableNFT === null) {
    provableNFT = new ProvableNFT(tokenID);
    steward = new Steward(to + event.params.pool.toHexString());
    provableNFT.id = tokenID;
    provableNFT.steward = to + event.params.pool.toHexString();
    provableNFT.owner = provableNFT.hash = nftHash;
    provableNFT.save();
  }
}
