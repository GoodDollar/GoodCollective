import hre, { ethers } from 'hardhat';
import fetch from 'node-fetch';
const main = async () => {
  const contract = await hre.deployments.get('DirectPaymentsFactory');
  const poolImpl = await hre.deployments.get('DirectPaymentsPool');
  const factory = await ethers.getContractAt('DirectPaymentsFactory', contract.address);

  //verify beacon which is internal to the factory
  const beacon = await factory.impl();
  const verifyBecon = hre.run('verify', {
    address: beacon,
    constructorArgsParams: [poolImpl.address],
    contract: '@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol:UpgradeableBeacon',
  });
  await Promise.all([verifyBecon, hre.run('sourcify'), hre.run('etherscan-verify')]);

  //copy beacon to sourcify
  const res = await fetch('https://sourcify.dev/server/session/verify/etherscan', {
    method: 'POST',
    body: JSON.stringify({ address: beacon, chainId: String(hre.network.config.chainId) }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  console.log('sourcify beacon copy result', res.statusText);
};

main().catch((e) => console.log(e));
