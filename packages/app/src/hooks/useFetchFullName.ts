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
    connect();

    return () => {
      realm?.logOut();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!nameView || addresses.length === 0) return;
    const fetchName = async (address: string): Promise<NameView | null> => {
      const walletHash = ethers.utils.keccak256(address);
      return await nameView.findOne(
        { 'index.walletAddress.hash': walletHash },
        { projection: { 'fullName.display': 1 } }
      );
    };

    const promises = addresses.map((address) => fetchName(address));
    Promise.all(promises).then((responses) => {
      const fullNames = responses.map((nameViewResponse) => {
        if (!nameViewResponse) return undefined;
        return nameViewResponse.fullName.display;
      });
      setNames(fullNames);
    });
  }, [addresses, nameView, realm]);

  return names;
}
