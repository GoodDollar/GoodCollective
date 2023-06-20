import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ProvableNFT } from 'typechain-types';
import { ethers, upgrades } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('ProvableNFT', function () {
  let nft: ProvableNFT;
  let signer: SignerWithAddress;
  let signers: SignerWithAddress[];
  const sampleData1 = (): ProvableNFT.NFTDataStruct => {
    return {
      nftUri: 'uri',
      nftType: 2,
      version: 2,
      events: [
        {
          subtype: 1,
          quantity: 1,
          timestamp: 1,
          eventUri: 'uri2',
          contributers: ['0xdA030751FF448Cf127911f0518a2B9b012f72424'],
        },
      ],
    };
  };

  const fixture = async () => {
    const factory = await ethers.getContractFactory('ProvableNFT');
    return (await upgrades.deployProxy(factory, ['nft', 'cc'], { kind: 'uups' })) as ProvableNFT;
  };
  before(async () => {
    signers = await ethers.getSigners();
    signer = signers[0];
  });

  beforeEach(async function () {
    nft = await loadFixture(fixture);
  });

  it('should mint the NFT with correct URI and owner', async function () {
    const sample = sampleData1();
    const dh = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        [
          'tuple(uint32 nftType,uint16 version,string nftUri,tuple(uint16 subtype,uint32 timestamp,uint256 quantity,string eventUri,address[] contributers)[] events)',
        ],
        [sample]
      )
    );
    await nft.mint(signer.address, 'ipfs://1243', dh);

    expect(await nft.tokenURI(dh)).to.equal('ipfs://1243');
    expect(await nft.ownerOf(dh)).to.equal(signer.address);
  });

  it('should fail to prove NFT data with invalid digest', async function () {
    await (
      await nft.mint(signer.address, '', '0x5041bf1f713df204784353e82f6a4a535931cb64f1f4b4a5aeaffcb720918b23')
    ).wait();
    const sample = sampleData1();
    // eslint-disable-next-line prettier/prettier
    await expect(
      nft.proveNFTData('0x5041bf1f713df204784353e82f6a4a535931cb64f1f4b4a5aeaffcb720918b23', sample)
    ).to.be.revertedWithCustomError(nft, 'BAD_DATAHASH');
  });

  it('should prove NFT data with valid digest', async function () {
    const sample = sampleData1();
    const dh = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        [
          'tuple(uint32 nftType,uint16 version,string nftUri,tuple(uint16 subtype,uint32 timestamp,uint256 quantity,string eventUri,address[] contributers)[] events)',
        ],
        [sample]
      )
    );
    const tx = await (await nft.mint(signer.address, '', dh)).wait();
    const event = tx.events?.find((_) => _.event === 'Transfer');
    const data = await nft.proveNFTData(dh, sample);

    expect(data.nftUri).to.equal('uri');
    expect(data.nftType).to.equal(2);
    expect(data.version).to.equal(2);
    expect(data.events[0].subtype).to.equal(1);
    expect(data.events[0].quantity).to.equal(1);
    expect(data.events[0].timestamp).to.equal(1);
    expect(data.events[0].eventUri).to.equal('uri2');
    expect(data.events[0].contributers[0]).to.equal('0xdA030751FF448Cf127911f0518a2B9b012f72424');
  });

  it('should fail to mint permissioned NFT for non-manager account', async function () {
    const sample = sampleData1();
    await expect(
      nft.connect(signers[1]).mintPermissioned(signer.address, sample, false, '0x00')
    ).to.be.revertedWithCustomError(nft, 'NOT_MANAGER');
  });

  it('should mint permissioned NFT for manager account', async function () {
    const sample = sampleData1();
    const managerRole = ethers.utils.solidityPack(['string', 'uint32'], ['MANAGER_', sample.nftType]);
    await nft.grantRole(ethers.utils.keccak256(managerRole), signers[1].address);
    await expect(nft.connect(signers[1]).mintPermissioned(signer.address, sample, false, [])).not.reverted;
  });

  it('should store the NFT data correctly', async function () {
    const sample = sampleData1();
    const managerRole = ethers.utils.solidityPack(['string', 'uint32'], ['MANAGER_', sample.nftType]);

    await nft.grantRole(ethers.utils.keccak256(managerRole), signers[1].address);

    const tx = await (
      await nft.connect(signers[1]).mintPermissioned(signer.address, sample, true, ethers.utils.toUtf8Bytes(''))
    ).wait();
    const tokenId = tx.events?.find((_) => _.event === 'Transfer')?.args?.tokenId as number;
    const nftData = await nft.getNFTData(tokenId);
    const eventData = await nft.getNFTEvent(tokenId, 0);
    const eventDatas = await nft.getNFTEvents(tokenId);

    expect(nftData.nftUri).to.equal('uri');
    expect(nftData.nftType).to.equal(2);
    expect(nftData.version).to.equal(2);
    expect(JSON.stringify(nftData.events)).to.equal(JSON.stringify(eventDatas));

    expect(JSON.stringify(eventData)).to.equal(JSON.stringify(eventDatas[0]));
    expect(eventData.subtype).to.equal(1);
    expect(eventData.quantity).to.equal(1);
    expect(eventData.timestamp).to.equal(1);
    expect(eventData.eventUri).to.equal('uri2');
    expect(eventData.contributers[0]).to.equal('0xdA030751FF448Cf127911f0518a2B9b012f72424');
  });
});
