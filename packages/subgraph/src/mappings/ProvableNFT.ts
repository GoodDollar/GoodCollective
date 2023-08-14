import { ProvableNftMinted } from '../../generated/ProvableNFT/ProvableNFT';
import { EventData, ProvableNFT } from '../../generated/schema';

export function handleNftMint(event: ProvableNftMinted): void {
  const tokenID = event.params.tokenId.toString();
  const to = event.params.to.toHexString();
  const nftHash = event.params.nftDataHash.toHexString();
  const nftData = event.params.nftData;

  let provableNFT = ProvableNFT.load(tokenID);
  let eventData = EventData.load(tokenID);
  if (provableNFT === null) {
    provableNFT = new ProvableNFT(tokenID);
    provableNFT.id = tokenID;
    provableNFT.owner = to;
    provableNFT.hash = nftHash;
    provableNFT.nftType = nftData.nftType;
    provableNFT.version = nftData.version;
    provableNFT.nftUri = nftData.nftUri;
    provableNFT.save();
  }

  if (eventData === null) {
    const events: EventData[] = [];
    nftData.events.forEach((event) => {
      const eventData = new EventData(tokenID);
      eventData.subtype = event.subtype;
      eventData.timestamp = event.timestamp;
      eventData.quantity = event.quantity;
      eventData.eventUri = event.eventUri;
      eventData.contributors = event.contributers.map((contributor) => contributor.toHexString());
      eventData.save();
      eventData.provableNFT = tokenID;
      events.push(eventData);
    });
  }
}
