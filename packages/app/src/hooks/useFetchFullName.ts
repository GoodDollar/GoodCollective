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
  const [realm, setRealm] = useState<Realm.User | undefined>();
  const [nameView, setNameView] = useState<globalThis.Realm.Services.MongoDB.MongoDBCollection<NameView> | undefined>();
  const [name, setName] = useState<string | undefined>(undefined);

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
    if (!nameView || !address) return;
    const fetchName = async () => {
      const walletHash = ethers.utils.keccak256(address);
      const result: NameView | null = await nameView.findOne(
        { 'index.walletAddress.hash': walletHash },
        { projection: { 'fullName.display': 1 } }
      );

      setName(result?.fullName?.display ?? undefined);
    };
    fetchName();
  }, [address, nameView, realm]);

  return name;
}
