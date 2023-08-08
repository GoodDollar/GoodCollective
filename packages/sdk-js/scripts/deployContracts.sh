#! /bin/bash
pushd ../contracts
yarn deploy &
sleep 20
popd