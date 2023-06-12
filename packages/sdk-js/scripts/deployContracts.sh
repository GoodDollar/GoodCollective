#! /bin/bash
pushd ../solidity-ts
yarn deploy &
sleep 30
popd