// Run with npx ts-node --esm
import * as ethers from 'ethers';
import { GoodCollectiveSDK } from '../src/goodcollective/goodcollective';
import { config } from 'dotenv';

config();

const provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const chainId = '44787';

async function testGetCollectiveFees() {
  try {
    const sdk = new GoodCollectiveSDK(chainId as any, provider, { network: 'localhost' });

    // You would need to replace this with an actual pool address
    const poolAddress = '0x...'; // Replace with actual pool address

    console.log('Testing getCollectiveFees function...');
    console.log('Pool address:', poolAddress);

    const fees = await sdk.getCollectiveFees(poolAddress);

    console.log('Fees retrieved successfully:');
    console.log('Protocol Fee (basis points):', fees.protocolFeeBps);
    console.log('Manager Fee (basis points):', fees.managerFeeBps);
    console.log('Manager Fee Recipient:', fees.managerFeeRecipient);

    // Convert to percentages
    const protocolFeePercentage = fees.protocolFeeBps / 100;
    const managerFeePercentage = fees.managerFeeBps / 100;

    console.log('Protocol Fee (percentage):', protocolFeePercentage + '%');
    console.log('Manager Fee (percentage):', managerFeePercentage + '%');
  } catch (error) {
    console.error('Error testing getCollectiveFees:', error);
  }
}

testGetCollectiveFees();
