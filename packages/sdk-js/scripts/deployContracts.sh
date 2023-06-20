#! /bin/bash
pushd ../contracts
yarn deploy &
sleep 30
popd