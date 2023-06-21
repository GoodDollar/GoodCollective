#! /bin/bash
pushd ../contracts
npx hardhat node &
sleep 20
popd