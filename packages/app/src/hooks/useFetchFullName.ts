import * as Realm from 'realm-web';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

const realmAppId = 'wallet_prod-obclo';
const dataSourceName = 'mongodb-atlas';
const databaseName = 'wallet_prod';
const collectionName = 'user_profiles';

interface NameView {
  _id: string;
  walletAddress: { hash: string };
  fullName: { display: string };
}

const inMemoryFullNameCache: Map<string, string> = new Map();

export function useFetchFullName(address?: string): string | undefined {
  const names = useFetchFullNames(address ? [address] : []);
  if (names.length === 0) return undefined;
  return names[0];
}

export function useFetchFullNames(addresses: string[]): (string | undefined)[] {
  const [realm, setRealm] = useState<Realm.User | undefined>();
  const [nameView, setNameView] = useState<globalThis.Realm.Services.MongoDB.MongoDBCollection<NameView> | undefined>();
  const [names, setNames] = useState<(string | undefined)[]>([]);

  useEffect(() => {
    const connect = async () => {
      const app = new Realm.App({ id: realmAppId });
      const credentials = Realm.Credentials.anonymous();
      const newRealm = await app.logIn(credentials);
      setRealm(newRealm);
      const mongo = newRealm.mongoClient(dataSourceName);
      const collection = mongo.db(databaseName).collection(collectionName);
      setNameView(collection);
    };
    if (!nameView) {
      connect();
    }

    return () => {
      realm?.logOut();
    };
  }, [realm, nameView]);

  useEffect(() => {
    if (!nameView || addresses.length === 0) return;
    const fetchName = async (address: string): Promise<string | undefined> => {
      const lowerCaseAddress = address.toLowerCase();
      // check cache
      const cachedName = inMemoryFullNameCache.get(lowerCaseAddress);
      if (cachedName) {
        return cachedName;
      }
      // fetch from database
      const walletHash = ethers.utils.keccak256(address);
      const response = await nameView.findOne(
        { 'index.walletAddress.hash': walletHash },
        { projection: { 'fullName.display': 1 } }
      );
      if (!response) return undefined;
      // cache and return
      const fullName = response.fullName.display;
      inMemoryFullNameCache.set(lowerCaseAddress, fullName);
      return fullName;
    };

    const promises = addresses.map((address) => fetchName(address).catch((_) => undefined));
    Promise.all(promises).then((fullNames) => {
      setNames(fullNames);
    });
  }, [addresses, nameView, realm]);

  return names;
}
