import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { FormatTypes } from 'ethers/lib/utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let sfFramework;
  let swapMock;
  if (hre.network.live === false) {
    const { frameworkDeployer } = await deployTestFramework();
    sfFramework = await frameworkDeployer.getFramework();

    const signers = await ethers.getSigners();
    const gdframework = await deploySuperGoodDollar(signers[0], sfFramework);

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
  }
  const pool = await deploy('DirectPaymentsPool', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [sfFramework.host, swapMock?.address],
    log: true,
  });

  const nft = await deploy('ProvableNFT', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    log: true,
  });

  const nftimpl = await ethers.getContractAt('ProvableNFT', nft.address);
  const poolimpl = await ethers.getContractAt('DirectPaymentsPool', pool.address);

  await deploy('DirectPaymentsFactory', {
    from: deployer,
    proxy: {
      proxyContract: 'UUPS',
      execute: {
        init: {
          methodName: 'initialize',
          args: [deployer, poolimpl.address, nftimpl.address],
        },
      },
    },
    log: true,
  });
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
