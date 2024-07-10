import hre, { ethers } from 'hardhat';
import fetch from 'node-fetch';

const verifyUbi = async () => {
  const poolImpl = await hre.deployments.get('UBIPool');
  const contract = await hre.deployments.get('UBIPoolFactory');
  const factoryImpl = await hre.deployments.get('UBIPoolFactory_Implementation');

  const factory = await ethers.getContractAt('UBIPoolFactory', contract.address);

  //verify beacon which is internal to the factory
  const beacon = await factory.impl();
  console.log({ beacon, poolImpl: poolImpl.address, factoryImpl: factoryImpl.address, factory: contract.address });
  const verifyBecon = await hre.run('verify', {
    address: beacon,
    constructorArgsParams: [poolImpl.address],
    contract: '@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol:UpgradeableBeacon',
  });

  // hardhat deployments plugin doesnt verify pool on etherscan
  const verifyPool = await hre.run('verify', {
    address: poolImpl.address,
    constructorArgsParams: poolImpl.args,
  });

  await Promise.all([hre.run('sourcify'), hre.run('etherscan-verify')]);

  for (let c of [{ address: beacon }, poolImpl]) {
    //copy beacon to sourcify
    const res = await fetch('https://sourcify.dev/server/session/verify/etherscan', {
      method: 'POST',
      body: JSON.stringify({ address: c.address, chainId: String(hre.network.config.chainId) }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('sourcify copy result', c.address, res.statusText);

  }




}

const main = async () => {
  const contract = await hre.deployments.get('DirectPaymentsFactory');
  const poolImpl = await hre.deployments.get('DirectPaymentsPool');
  const factory = await ethers.getContractAt('DirectPaymentsFactory', contract.address);
  const factoryImpl = await hre.deployments.get('DirectPaymentsFactory_Implementation');


  //verify beacon which is internal to the factory
  const beacon = await factory.impl();
  console.log({ beacon, poolImpl: poolImpl.address, factoryImpl: factoryImpl.address, factory: contract.address });

  // verify beacon which is internal to the factory
  const verifyBecon = await hre.run('verify', {
    address: beacon,
    constructorArgsParams: [poolImpl.address],
    contract: '@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol:UpgradeableBeacon',
  });

  // hardhat deployments plugin doesnt verify pool on etherscan
  const verifyPool = await hre.run('verify', {
    address: poolImpl.address,
    constructorArgsParams: poolImpl.args,
  });

  await Promise.all([hre.run('sourcify'), hre.run('etherscan-verify')]);

  // copy manually verifed to sourcify
  for (let c of [{ address: beacon }, poolImpl]) {
    //copy beacon to sourcify
    const res = await fetch('https://sourcify.dev/server/session/verify/etherscan', {
      method: 'POST',
      body: JSON.stringify({ address: c.address, chainId: String(hre.network.config.chainId) }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('sourcify copy result', c.address, res.statusText);

  }
};

verifyUbi().catch((e) => console.log(e));
main().catch((e) => console.log(e));
