import { ProvableNftMinted } from '../../generated/ProvableNFT/ProvableNFT';
import { ProvableNFT, Steward } from '../../generated/schema';

export function handleNftMint(event: ProvableNftMinted): void {
  const tokenID = event.params.tokenId.toString();
  const to = event.params.to.toHexString();
  const nftHash = event.params.nftDataHash.toHexString();

  let provableNFT = ProvableNFT.load(tokenID);
  let steward = Steward.load(to);
  if (provableNFT === null) {
    provableNFT = new ProvableNFT(tokenID);
    steward = new Steward(to);
    steward.actions = steward.actions.plus(1);
    provableNFT.id = tokenID;
    provableNFT.steward = to;
    provableNFT.owner = provableNFT.hash = nftHash;
    provableNFT.save();
  }
}
