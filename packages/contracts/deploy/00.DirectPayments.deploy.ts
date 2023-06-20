import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log('deployer', deployer);
  const pool = await deploy('DirectPaymentsPool', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: ["Hello"],
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
