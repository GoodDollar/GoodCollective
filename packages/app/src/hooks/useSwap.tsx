// import { AlphaRouter } from '@uniswap/smart-order-router';
// import { Token, CurrencyAmount, TradeType, Percent, Currency } from '@uniswap/sdk-core';
// import { useAccount, usePublicClient } from 'wagmi';
// import * as hre from 'ethers';

// // eslint-disable-next-line react-hooks/rules-of-hooks
// const { chain } = useNetwork();
// // eslint-disable-next-line react-hooks/rules-of-hooks
// const { connector }: any = useConnect();

// const provider_ = connector.getProvider();

// const router = new AlphaRouter({ chainId: 42220, provider: provider_ });

// const tokenIn = new Token();

// export default async (userAddress: string, token: Currency) => {
//   const V3_ROUTER_ADDRESS = '0x5615CDAb10dc425a742d643d949a7F474C01abc4';
//   const publicClient = usePublicClient();
//   const { address, isConnected } = useAccount();
//   const router = new AlphaRouter({ chainId: 42220, provider: publicClient as any });
//   const inputAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(wei));
//   const route = await router.route(inputAmount, token, TradeType.EXACT_INPUT, {
//     recipient: userAddress,
//     slippageTolerance: new Percent(25, 100),
//     deadline: Math.floor(Date.now() / 1000 + 1800),
//   });
//   console.log(`Quote Exact In: ${route.quote.toFixed(10)}`);

//   const transaction = {
//     data: route.methodParameters.calldata,
//     to: V3_ROUTER_ADDRESS,
//     value: hre.BigNumber.from(route.methodParameters.value),
//     from: address,
//     gasPrice: hre.BigNumber.from(route.gasPriceWei),
//     gasLimit: hre.utils.hexlify(1000000),
//   };
// };
