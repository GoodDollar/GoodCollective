import * as Realm from 'realm-web';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

const mongoDbCredentials: 'mongodb+srv://goodcollective:5HYmfmGWppGneqlP@cluster0.i4pbp.mongodb.net/wallet_prod';
// TODO: use the mongoDbCredentials to create the following values:
const realmAppId = ''; // TODO
const dataSourceName = ''; // TODO
const databaseName = ''; // TODO
const collectionName = 'nameView';

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
  }, []);

  useEffect(() => {
    if (!nameView || !address) return;
    const fetchName = async () => {
      const walletHash = ethers.utils.keccak256(address);
      const result: NameView | null = await nameView.findOne(
        { 'index.walletAddress.hash': walletHash },
        { projection: { 'fullName.display': true } }
      );

      setName(result?.fullName?.display ?? undefined);
    };
    fetchName();

    return () => {
      realm?.logOut();
    };
  }, [address, nameView, realm]);

  return name;
}
