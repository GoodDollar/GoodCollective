#! /bin/bash
pushd ../contracts
yarn hardhat node --export-all 'releases/deployment.json' &
sleep 20
popd