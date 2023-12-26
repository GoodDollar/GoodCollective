import { IpfsCollective } from '../../generated/schema';
import { Bytes, json, JSONValueKind, log, dataSource } from '@graphprotocol/graph-ts';

export function handleCreateIpfsCollective(data: Bytes): void {
  const ipfsHash = dataSource.stringParam();
  const ipfsCollective = new IpfsCollective(ipfsHash);

  // parse bytes to json
  const jsonParseResult = json.try_fromBytes(data);
  if (jsonParseResult.isError) {
    log.error('Invalid JSON data found at IPFS hash {}', [ipfsHash]);
    return;
  }
  const jsonValue = jsonParseResult.value;

  // make sure json is object
  if (jsonValue.kind != JSONValueKind.OBJECT) {
    log.error('Invalid JSON data found at IPFS hash {}', [ipfsHash]);
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

  ipfsCollective.save();
}
