import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
import 'hardhat-abi-exporter';
import 'hardhat-contract-sizer';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-deploy';
import 'hardhat-celo';
import { HardhatUserConfig } from 'hardhat/config';

dotenv.config();

const mnemonic = process.env.MNEMONIC || '';
const privateKey = process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';

const config: HardhatUserConfig = {
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  gasReporter: {
    enabled: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: 'USD',
  },
  abiExporter: {
    path: './abi',
    runOnCompile: false,
    clear: true,
    spacing: 2,
    only: [
      /**
       * List of specific contract names for exporting ABI
       */
      // ":ERC20",
    ],
    format: 'minimal',
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  networks: {
    hardhat: {
      chainId: 42220,
    },
    localhost: {},
    mainnet: {
      chainId: 1,
      url: 'https://cloudflare-eth.com',
    },
    alfajores: {
      chainId: 44787,
      url: `https://alfajores-forno.celo-testnet.org`,
      gasPrice: 5000000000,
      accounts: {
        mnemonic,
      },
      verify: {
        etherscan: {
          apiKey: process.env.CELOSCAN_KEY,
          apiUrl: 'https://api-alfajores.celoscan.io/',
        },
      },
    },
    celo: {
      chainId: 42220,
      url: `https://forno.celo.org`,
      gasPrice: 5000000000,
      accounts: {
        mnemonic,
      },
      verify: {
        etherscan: {
          apiKey: process.env.CELOSCAN_KEY,
          apiUrl: 'https://api.celoscan.io/',
        },
      },
    },
    'production-celo': {
      chainId: 42220,
      url: `https://forno.celo.org`,
      gasPrice: 5000000000,
      accounts: [privateKey],
      verify: {
        etherscan: {
          apiKey: process.env.CELOSCAN_KEY,
          apiUrl: 'https://api.celoscan.io/',
        },
      },
    },
    'development-celo': {
      chainId: 42220,
      url: `https://forno.celo.org`,
      gasPrice: 5000000000,
      accounts: {
        mnemonic,
      },
      verify: {
        etherscan: {
          apiKey: process.env.CELOSCAN_KEY,
          apiUrl: 'https://api.celoscan.io/',
        },
      },
    },
    fuse: {
      chainId: 122,
      url: `https://rpc.fuse.io`,
      gasPrice: 10000000000,
      accounts: {
        mnemonic,
      },
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_KEY || '',
      celo: process.env.CELOSCAN_KEY || '',
      alfajores: process.env.CELOSCAN_KEY || '',
    },
    customChains: [
      {
        network: 'alfajores',
        chainId: 44787,
        urls: { browserURL: 'https://alfajores.celoscan.io/', apiURL: 'https://api-alfajores.celoscan.io/' },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          optimizer: {
            enabled: true,
            runs: 0,
          },
        },
      },
    ],
  },
};

export default config;
