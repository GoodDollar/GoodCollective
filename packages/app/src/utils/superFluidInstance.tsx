import { Framework } from '@superfluid-finance/sdk-core';
import { useConnect, useNetwork } from 'wagmi';

export const getSFFramework = async () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { connector }: any = useConnect();

  const provider = await connector.getProvider();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { chain }: any = useNetwork();

  const framework = await Framework.create({
    provider,
    chainId: chain.id,
  });
  return framework;
};
