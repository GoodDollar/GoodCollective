import { ethers, network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { deployTestFramework } from '@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework';
import { deploySuperGoodDollar } from '@gooddollar/goodprotocol';
import { FormatTypes } from 'ethers/lib/utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  let sfHost;
  let swapMock;
  if (hre.network.live === false) {
    const { frameworkDeployer } = await deployTestFramework();
    const sfFramework = await frameworkDeployer.getFramework();
    console.log("host", sfFramework.host)
    const signers = await ethers.getSigners();
    const gdframework = await deploySuperGoodDollar(signers[0], sfFramework, [
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
    ]);

    console.log("deployed gd host:", await gdframework.GoodDollar.getHost())
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
    console.log("deployed test gd and sf host", gdframework.GoodDollar.address, sfHost)
  }
};

export default func;
func.tags = ['Test'];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
