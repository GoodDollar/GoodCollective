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
    const { frameworkDeployer } = await deployTestFramework();
    const sfFramework = await frameworkDeployer.getFramework();

    const signers = await ethers.getSigners();
    const gdframework = await deploySuperGoodDollar(signers[0], sfFramework, [
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
    ]);

    swapMock = await deploy('SwapRouterMock', {
      from: deployer,
      log: true,
      args: [gdframework.GoodDollar.address],
    });
    await deployments.save('GoodDollar', {
      abi: (gdframework.GoodDollar.interface as any).format(FormatTypes.full),
      address: gdframework.GoodDollar.address,
    });
    await deployments.save('SuperFluidResolver', { abi: [], address: sfFramework.resolver });
    await gdframework.GoodDollar.mint(swapMock.address, ethers.constants.WeiPerEther.mul(100000));
    await gdframework.GoodDollar.mint(deployer, ethers.constants.WeiPerEther.mul(100000));
    sfHost = sfFramework.host;
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

  console.log('deploying pool impl', [sfHost, swapMock?.address || '0x5615CDAb10dc425a742d643d949a7F474C01abc4']);
  const pool = await deploy('UBIPool', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [sfHost, swapMock?.address || '0x5615CDAb10dc425a742d643d949a7F474C01abc4'], //uniswap on celo
    log: true,
    libraries: {
      HelperLibrary: helplib.address,
    },
  });


  const factory = await deploy('UBIPoolFactory', {
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
          args: [deployer, pool.address, feeRecipient, feeBps],
        },
      },
    },
    log: true,
  });

  if (pool.newlyDeployed && !factory.newlyDeployed) {
    console.log('upgrading factory with new pool implementation');
    await execute('UBIPoolFactory', { from: deployer }, 'updateImpl', pool.address);
  }
};

export default func;
func.tags = ['UBIPoolFactory', 'UBIPool'];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
