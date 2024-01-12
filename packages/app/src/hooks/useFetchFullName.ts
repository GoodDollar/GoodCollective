import { Collection, MongoClient } from 'mongodb';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

const mongoDbCredentials = 'mongodb+srv://goodcollective:5HYmfmGWppGneqlP@cluster0.i4pbp.mongodb.net/wallet_prod';

export function useFetchFullName(address?: string): string | undefined {
  const [mongoClient, setMongoClient] = useState<MongoClient | undefined>();
  const [nameView, setNameView] = useState<Collection | undefined>();
  const [name, setName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const connect = async () => {
      const client = new MongoClient(mongoDbCredentials);
      setMongoClient(client);
      await client.connect();
      const db = client.db();
      const collection = db.collection('nameView');
      setNameView(collection);
    };
    connect();
  }, []);

  useEffect(() => {
    if (!nameView || !address) return;
    const fetchName = async () => {
      const walletHash = ethers.utils.keccak256(address);
      const result = await nameView.findOne(
        { 'index.walletAddress.hash': walletHash },
        { projection: { 'fullName.display': true } }
      );

      setName(result?.fullName?.display ?? undefined);
    };
    fetchName();

    return () => {
      mongoClient?.close();
    };
  }, [address, mongoClient, nameView]);

  return name;
}
