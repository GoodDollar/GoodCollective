import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-solhint';
import * as dotenv from 'dotenv';
import 'hardhat-abi-exporter';
import 'hardhat-contract-sizer';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-deploy';
import { HardhatUserConfig } from 'hardhat/config';

dotenv.config();

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
    localhost: {
      chainId: 31337,
    },
    mainnet: {
      chainId: 1,
      url: 'https://cloudflare-eth.com',
    },
    alfajores: {
      url: `https://alfajores-forno.celo-testnet.org`,
      gasPrice: 5000000000,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    celo: {
      url: `https://forno.celo.org`,
      gasPrice: 5000000000,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_KEY || '',
      celo: process.env.CELOSCAN_KEY || '',
      alfajores: process.env.CELOSCAN_KEY || '',
    },
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

export default config;
