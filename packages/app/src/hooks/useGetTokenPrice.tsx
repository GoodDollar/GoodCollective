import { useToken } from './useTokenList';
import { useCoinGeckoQuery } from './apollo/useCreateCoinGeckoApolloClient';
import { gql } from '@apollo/client';

const priceQuery = gql`
  query TokenPrice($tokenAddress: string) {
    priceSearch(contract_addresses: $tokenAddress, vs_currencies: usd)
      @rest(type: "TokenPrice", path: "/?{args}", endpoint: "byAddress") {
      id
      usd
    }
  }
`;

const altPriceQuery = gql`
  query TokenPrice($symbol: string) {
    priceSearch(ids: $symbol, vs_currencies: usd) @rest(type: "TokenPrice", path: "/?{args}", endpoint: "bySymbol") {
      id
      usd
    }
  }
`;
export const useGetTokenPrice = (currency: string): { price?: number; isLoading: boolean } => {
  const token = useToken(currency);

  const response = useCoinGeckoQuery(priceQuery, { variables: { tokenAddress: token.address } });
  const fallbackResponse = useCoinGeckoQuery(altPriceQuery, {
    disabled: !!(response.loading || response.data),
    variables: { symbol: currency },
  });

  const finalResponse = response.data ? response : fallbackResponse;
  return { price: Number(finalResponse.data?.priceSearch?.[0]?.usd), isLoading: finalResponse.loading };
};
