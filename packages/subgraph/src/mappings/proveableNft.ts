export function handleNftMint(event: ProvableNftMinted): void {
  const tokenID = event.params.tokenId;
  const to = event.params.to;
  const nftHash = event.params.nftDataHash;
  const nftData = event.params.nftData;

  let proveableNFT = ProvableNFT.load(tokenID);
  if (proveableNFT === null) {
    proveableNFT = new ProvableNFT(tokenID);
    proveableNFT.owner = to.toHexString();
    proveableNFT.hash = nftHash;
    proveableNFT.nftType = nftData.nftType;
    proveableNFT.version = nftData.version;
    proveableNFT.nftUri = nftData.nftUri;
    proveableNFT.events = [nftData.events];
    proveableNFT.save();
  }
}
