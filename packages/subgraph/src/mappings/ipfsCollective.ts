import { IpfsCollective } from '../../generated/schema';
import { Bytes, ipfs, json, JSONValueKind, log } from '@graphprotocol/graph-ts';

export function createOrUpdateIpfsCollective(poolAddress: string, ipfsHash: string): void {
  let ipfsCollective = IpfsCollective.load(poolAddress);
  if (ipfsCollective === null) {
    ipfsCollective = new IpfsCollective(poolAddress);
  }
  const data = fetchFromIpfsWithRetries(ipfsHash, 3);
  if (data === null) {
    log.error('Failed to fetch IPFS data using hash {} for collective {}', [ipfsHash, poolAddress]);
    return;
  }
  // mutates ipfsCollective
  parseIpfsData(data, ipfsCollective, ipfsHash, poolAddress);
  ipfsCollective.save();
}

// mutates ipfsCollective
function parseIpfsData(data: Bytes, ipfsCollective: IpfsCollective, ipfsHash: string, poolAddress: string): void {
  // parse bytes to json
  const jsonParseResult = json.try_fromBytes(data);
  if (jsonParseResult.isError) {
    log.error('Invalid JSON data found at IPFS hash {} for collective {}', [ipfsHash, poolAddress]);
    return;
  }
  const jsonValue = jsonParseResult.value;

  // make sure json is object
  if (jsonValue.kind != JSONValueKind.OBJECT) {
    log.error('Invalid JSON data found at IPFS hash {} for collective {}', [ipfsHash, poolAddress]);
    return;
  }
  const jsonObject = jsonValue.toObject();

  ipfsCollective.name = jsonObject.isSet('name') ? jsonObject.get('name')!!.toString() : '';
  ipfsCollective.description = jsonObject.isSet('description') ? jsonObject.get('description')!!.toString() : '';
  ipfsCollective.email = jsonObject.isSet('email') ? jsonObject.get('email')!!.toString() : null;
  ipfsCollective.website = jsonObject.isSet('website') ? jsonObject.get('website')!!.toString() : null;
  ipfsCollective.twitter = jsonObject.isSet('twitter') ? jsonObject.get('twitter')!!.toString() : null;
  ipfsCollective.instagram = jsonObject.isSet('instagram') ? jsonObject.get('instagram')!!.toString() : null;
  ipfsCollective.threads = jsonObject.isSet('threads') ? jsonObject.get('threads')!!.toString() : null;
  ipfsCollective.headerImage = jsonObject.isSet('headerImage') ? jsonObject.get('headerImage')!!.toString() : null;
  ipfsCollective.logo = jsonObject.isSet('logo') ? jsonObject.get('logo')!!.toString() : null;
  ipfsCollective.images = jsonObject.isSet('images')
    ? jsonObject
        .get('images')!!
        .toArray()
        .map<string>((value) => value.toString())
    : null;
}

function fetchFromIpfsWithRetries(ipfsHash: string, retries: i32): Bytes | null {
  let data = ipfs.cat(ipfsHash);
  let i = retries;
  while (i > 0 && data === null) {
    data = ipfs.cat(ipfsHash);
    i--;
  }
  return data;
}
