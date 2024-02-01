import { ProvableNftMinted } from '../../generated/ProvableNFT/ProvableNFT';
import { ProvableNFT } from '../../generated/schema';

// Note that ProvableNFT.collective is set by steward reward event
export function handleNftMint(event: ProvableNftMinted): void {
  const tokenID = event.params.tokenId.toString();
  const to = event.params.to.toHexString();
  const nftHash = event.params.nftDataHash.toHexString();

  let provableNFT = ProvableNFT.load(tokenID);
  if (provableNFT === null) {
    provableNFT = new ProvableNFT(tokenID);
    provableNFT.stewards = new Array<string>();
  }
  provableNFT.owner = to;
  provableNFT.hash = nftHash;
  provableNFT.save();
}
