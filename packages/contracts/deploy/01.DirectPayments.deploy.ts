import { ethers, network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { Framework } from '@superfluid-finance/sdk-core';

import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import GDContracts from '@gooddollar/goodprotocol/releases/deployment.json';
import { FormatTypes } from 'ethers/lib/utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  let sfHost;
  let swapMock;
  let feeRecipient = GDContracts[hre.network.name]?.UBIScheme || deployer;
  let feeBps = 1000;
  if (hre.network.live === false) {
    swapMock = (await deployments.get("SwapRouterMock")).address
    const gd = await ethers.getContractAt("ISuperGoodDollar", (await deployments.get("GoodDollar")).address)
    sfHost = await gd.getHost()
    console.log("deployed test gd and sf host", gd.address, sfHost, swapMock)
  } else {
    const sfFramework = await Framework.create({
      chainId: network.config.chainId || 0,
      provider: ethers.provider,
      resolverAddress: network.config.chainId === 44787 ? '0x6e9CaBE4172344Db81a1E1D735a6AD763700064A' : undefined,
    });
    sfHost = sfFramework.host.contract.address;
  }

  const helplib = await deploy('HelperLibrary', {
    from: deployer,
    log: true,
  });

  console.log('deploying pool impl', [sfHost, swapMock || '0x5615CDAb10dc425a742d643d949a7F474C01abc4']);
  const pool = await deploy('DirectPaymentsPool', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [sfHost, swapMock || '0x5615CDAb10dc425a742d643d949a7F474C01abc4'], //uniswap on celo
    log: true,
    libraries: {
      HelperLibrary: helplib.address,
    },
  });

  const nft = await deploy('ProvableNFT', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    proxy: {
      proxyContract: 'UUPS',
      execute: {
        init: {
          methodName: 'initialize',
          args: ['GoodCollective NFT', 'GC-NFT'],
        },
      },
    },
    log: true,
  });

  const factory = await deploy('DirectPaymentsFactory', {
    from: deployer,
    proxy: {
      proxyContract: 'UUPS',
      execute: {
        onUpgrade: {
          methodName: 'updateImpl',
          args: [pool.address],
        },
        init: {
          methodName: 'initialize',
          args: [deployer, pool.address, nft.address, feeRecipient, feeBps],
        },
      },
    },
    log: true,
  });

  if (factory.newlyDeployed) {
    console.log('granting nft admin rights to factory');
    await execute('ProvableNFT', { from: deployer }, 'grantRole', ethers.constants.HashZero, factory.address);
  }

  if (pool.newlyDeployed && !factory.newlyDeployed) {
    console.log('upgrading factory with new pool implementation');
    await execute('DirectPaymentsFactory', { from: deployer }, 'updateImpl', pool.address);
  }
};

export default func;
func.tags = ['DirectPaymentsPool', 'ProvableNFT', 'DirectPaymentsFactory'];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
