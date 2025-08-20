/* eslint-disable @typescript-eslint/no-explicit-any */
// Run with npx ts-node --esm
import * as ethers from 'ethers';
import { GoodCollectiveSDK } from '../src/goodcollective/goodcollective';
import { config } from 'dotenv';

config();

const provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const chainId = '44787';

async function testGetCollectiveFees() {
  try {
    const sdk = new GoodCollectiveSDK(chainId as any, provider, { network: 'alfajores' });

    console.log('Testing SDK initialization...');
    console.log('Chain ID:', chainId);
    console.log('Network:', 'alfajores');

    console.log('SDK Factory address:', sdk.factory.address);
    console.log('SDK UBI Factory address:', sdk.ubifactory?.address);

    // Test getting protocol fees from factories
    console.log('\n--- Testing Factory Protocol Fees ---');

    try {
      const directPaymentsProtocolFee = await sdk.factory.feeBps();
      console.log('DirectPaymentsFactory protocol fee (basis points):', directPaymentsProtocolFee.toString());
      console.log('DirectPaymentsFactory protocol fee (percentage):', Number(directPaymentsProtocolFee) / 100 + '%');
    } catch (error) {
      console.log(
        'Failed to get DirectPaymentsFactory protocol fee:',
        error instanceof Error ? error.message : String(error)
      );
    }

    if (sdk.ubifactory) {
      try {
        const ubiProtocolFee = await sdk.ubifactory.feeBps();
        console.log('UBIPoolFactory protocol fee (basis points):', ubiProtocolFee.toString());
        console.log('UBIPoolFactory protocol fee (percentage):', Number(ubiProtocolFee) / 100 + '%');
      } catch (error) {
        console.log(
          'Failed to get UBIPoolFactory protocol fee:',
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Test with a dummy pool address to see what happens
    console.log('\n--- Testing with Dummy Pool Address ---');
    const dummyPoolAddress = '0x1234567890123456789012345678901234567890';

    try {
      const fees = await sdk.getCollectiveFees(dummyPoolAddress);
      console.log('Fees for dummy pool:', fees);
    } catch (error) {
      console.log('Error with dummy pool (expected):', error instanceof Error ? error.message : String(error));
    }

    // Test with mainnet
    console.log('\n--- Testing Mainnet ---');
    const mainnetProvider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
    const mainnetSdk = new GoodCollectiveSDK('42220' as any, mainnetProvider, { network: 'development-celo' });

    console.log('Mainnet SDK Factory address:', mainnetSdk.factory.address);
    console.log('Mainnet SDK UBI Factory address:', mainnetSdk.ubifactory?.address);

    // Test getting protocol fees from mainnet factories
    try {
      const mainnetDirectPaymentsProtocolFee = await mainnetSdk.factory.feeBps();
      console.log(
        'Mainnet DirectPaymentsFactory protocol fee (basis points):',
        mainnetDirectPaymentsProtocolFee.toString()
      );
      console.log(
        'Mainnet DirectPaymentsFactory protocol fee (percentage):',
        Number(mainnetDirectPaymentsProtocolFee) / 100 + '%'
      );
    } catch (error) {
      console.log(
        'Failed to get mainnet DirectPaymentsFactory protocol fee:',
        error instanceof Error ? error.message : String(error)
      );
    }

    if (mainnetSdk.ubifactory) {
      try {
        const mainnetUbiProtocolFee = await mainnetSdk.ubifactory.feeBps();
        console.log('Mainnet UBIPoolFactory protocol fee (basis points):', mainnetUbiProtocolFee.toString());
        console.log('Mainnet UBIPoolFactory protocol fee (percentage):', Number(mainnetUbiProtocolFee) / 100 + '%');
      } catch (error) {
        console.log(
          'Failed to get mainnet UBIPoolFactory protocol fee:',
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Test with production-celo network
    console.log('\n--- Testing Production Mainnet ---');
    const productionSdk = new GoodCollectiveSDK('42220' as any, mainnetProvider, { network: 'production-celo' });

    console.log('Production SDK Factory address:', productionSdk.factory.address);
    console.log('Production SDK UBI Factory address:', productionSdk.ubifactory?.address);

    try {
      const productionDirectPaymentsProtocolFee = await productionSdk.factory.feeBps();
      console.log(
        'Production DirectPaymentsFactory protocol fee (basis points):',
        productionDirectPaymentsProtocolFee.toString()
      );
      console.log(
        'Production DirectPaymentsFactory protocol fee (percentage):',
        Number(productionDirectPaymentsProtocolFee) / 100 + '%'
      );
    } catch (error) {
      console.log(
        'Failed to get production DirectPaymentsFactory protocol fee:',
        error instanceof Error ? error.message : String(error)
      );
    }

    if (productionSdk.ubifactory) {
      try {
        const productionUbiProtocolFee = await productionSdk.ubifactory.feeBps();
        console.log('Production UBIPoolFactory protocol fee (basis points):', productionUbiProtocolFee.toString());
        console.log(
          'Production UBIPoolFactory protocol fee (percentage):',
          Number(productionUbiProtocolFee) / 100 + '%'
        );
      } catch (error) {
        console.log(
          'Failed to get production UBIPoolFactory protocol fee:',
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  } catch (error) {
    console.error('Error testing getCollectiveFees:', error);
  }
}

testGetCollectiveFees();
