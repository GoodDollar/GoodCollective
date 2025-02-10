import { http, createConfig } from '@wagmi/core'
import { celo } from '@wagmi/core/chains'

export const config  = createConfig({
    chains: [celo],
    transports: {
      [celo.id]: http("https://rpc.ankr.com/celo"),
    },
  });