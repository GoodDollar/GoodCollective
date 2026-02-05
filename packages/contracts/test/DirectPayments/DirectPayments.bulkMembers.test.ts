import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-toolbox";
import { expect } from "chai";
import { DirectPaymentsFactory, DirectPaymentsPool, ProvableNFT } from "typechain-types";
import { ethers } from "hardhat";
import { MockContract } from "ethereum-waffle";
import {
    SignerWithAddress,
    setupDirectPaymentsTest,
    createFactoryPoolFixture,
    TestSetup
} from "./DirectPayments.claim.test";

describe("DirectPayments Bulk Members", () => {
    let pool: DirectPaymentsPool;
    let factory: DirectPaymentsFactory;
    let nft: ProvableNFT;
    let signer: SignerWithAddress;
    let signers: SignerWithAddress[];
    let poolSettings: DirectPaymentsPool.PoolSettingsStruct;
    let poolLimits: DirectPaymentsPool.SafetyLimitsStruct;
    let membersValidator: MockContract;
    let testSetup: TestSetup;

    before(async () => {
        testSetup = await setupDirectPaymentsTest();
        signers = testSetup.signers;
        signer = testSetup.signer;
        poolSettings = testSetup.poolSettings;
        poolLimits = testSetup.poolLimits;
    });

    const fixture = async () => {
        const factorySetup = await createFactoryPoolFixture(testSetup, "test-project", "ipfs");
        pool = factorySetup.pool;
        factory = factorySetup.factory;
        nft = factorySetup.nft;
        membersValidator = factorySetup.membersValidator;
    };

    beforeEach(async function () {
        await loadFixture(fixture);
    });

    describe("addMembers - Pool", () => {
        it("should add multiple valid members successfully", async () => {
            const members = [signers[1].address, signers[2].address, signers[3].address];
            const extraData = ["0x", "0x", "0x"];

            const tx = await pool.connect(signer).addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify all members have MEMBER_ROLE
            for (const member of members) {
                expect(await pool.hasRole(await pool.MEMBER_ROLE(), member)).to.be.true;
            }

            // Verify RoleGranted events emitted
            const receipt = await tx.wait();
            const roleGrantedEvents = receipt.events?.filter(
                (e) => e.event === "RoleGranted" && e.address === pool.address
            );
            expect(roleGrantedEvents?.length).to.equal(3);
        });

        it("should skip duplicate members without reverting", async () => {
            const members = [signers[1].address, signers[2].address, signers[1].address]; // duplicate
            const extraData = ["0x", "0x", "0x"];

            const tx = await pool.connect(signer).addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify unique members were added
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[1].address)).to.be.true;
            expect(await pool.hasRole(await pool.MEMBER_ROLE(), signers[2].address)).to.be.true;

            // Verify only 2 RoleGranted events emitted (duplicate skipped)
            const receipt = await tx.wait();
            const roleGrantedEvents = receipt.events?.filter(
                (e) => e.event === "RoleGranted" && e.address === pool.address
            );
            expect(roleGrantedEvents?.length).to.equal(2);
        });

        it("should skip invalid members when membersValidator rejects them", async () => {
            const members = [signers[1].address, signers[2].address, signers[3].address];
            const extraData = ["0x", "0x", "0x"];
            
            // Create a completely new validator for this test
            const { deployMockContract } = await import("ethereum-waffle");
            const customValidator = await deployMockContract(signers[0], [
                "function isMemberValid(address pool,address operator,address member,bytes memory extraData) external returns (bool)"
            ]);

            // Set up specific mocks for each member - do this BEFORE creating the pool
            // signers[1] should be valid
            await customValidator.mock["isMemberValid"]
                .withArgs(ethers.constants.AddressZero, ethers.constants.AddressZero, signers[1].address, "0x")
                .returns(true);
            // signers[2] should be invalid (rejected)
            await customValidator.mock["isMemberValid"]
                .withArgs(ethers.constants.AddressZero, ethers.constants.AddressZero, signers[2].address, "0x")
                .returns(false);
            // signers[3] should be valid
            await customValidator.mock["isMemberValid"]
                .withArgs(ethers.constants.AddressZero, ethers.constants.AddressZero, signers[3].address, "0x")
                .returns(true);

            // Create pool with this custom validator
            const customPoolSettings = { ...poolSettings, membersValidator: customValidator.address };
            const poolTx = await factory.createPool("test-validation", "ipfs-validation", customPoolSettings, poolLimits, 0);
            const poolReceipt = await poolTx.wait();
            const poolCreatedEvent = poolReceipt.events?.find((e) => e.event === "PoolCreated");
            const testPool = (await ethers.getContractAt(
                "DirectPaymentsPool",
                poolCreatedEvent?.args?.[0]
            )) as DirectPaymentsPool;

            // Now update the mocks with the actual pool address
            await customValidator.mock["isMemberValid"]
                .withArgs(testPool.address, signer.address, signers[1].address, "0x")
                .returns(true);
            await customValidator.mock["isMemberValid"]
                .withArgs(testPool.address, signer.address, signers[2].address, "0x")
                .returns(false);
            await customValidator.mock["isMemberValid"]
                .withArgs(testPool.address, signer.address, signers[3].address, "0x")
                .returns(true);

            const tx = await testPool.connect(signer).addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify valid members were added
            expect(await testPool.hasRole(await testPool.MEMBER_ROLE(), signers[1].address)).to.be.true;
            expect(await testPool.hasRole(await testPool.MEMBER_ROLE(), signers[3].address)).to.be.true;

            // Verify invalid member was skipped
            expect(await testPool.hasRole(await testPool.MEMBER_ROLE(), signers[2].address)).to.be.false;
        });

        it("should revert if members and extraData arrays have different lengths", async () => {
            const members = [signers[1].address, signers[2].address];
            const extraData = ["0x"]; // mismatched length

            await expect(pool.connect(signer).addMembers(members, extraData)).to.be.revertedWithCustomError(
                pool,
                "LENGTH_MISMATCH"
            );
        });

        it("should update factory registry for all added members", async () => {
            const members = [signers[1].address, signers[2].address, signers[3].address];
            const extraData = ["0x", "0x", "0x"];

            await pool.connect(signer).addMembers(members, extraData);

            // Verify factory registry updated
            for (const member of members) {
                const memberPools = await factory.memberPools(member, 0);
                expect(memberPools).to.equal(pool.address);
            }
        });

        it("should emit MemberAdded events from factory for each new member", async () => {
            const members = [signers[1].address, signers[2].address, signers[3].address];
            const extraData = ["0x", "0x", "0x"];

            const tx = await pool.connect(signer).addMembers(members, extraData);
            const receipt = await tx.wait();

            // Parse MemberAdded events from the receipt
            const factoryInterface = factory.interface;
            const memberAddedEvents = receipt.logs
                .map((log) => {
                    try {
                        return factoryInterface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .filter((parsed) => parsed && parsed.name === "MemberAdded");

            expect(memberAddedEvents.length).to.equal(3);

            // Verify event args
            const eventMembers = memberAddedEvents.map((e) => e?.args?.member?.toLowerCase());
            for (const member of members) {
                expect(eventMembers).to.include(member.toLowerCase());
            }

            // Verify all events have the correct pool address
            for (const event of memberAddedEvents) {
                expect(event?.args?.pool?.toLowerCase()).to.equal(pool.address.toLowerCase());
            }
        });

        it("should handle large batch of 100 members", async () => {
            const members = Array(100)
                .fill(0)
                .map((_, i) => ethers.Wallet.createRandom().address);
            const extraData = Array(100).fill("0x");

            const tx = await pool.connect(signer).addMembers(members, extraData);
            await expect(tx).not.reverted;

            // Verify all members added
            for (const member of members) {
                expect(await pool.hasRole(await pool.MEMBER_ROLE(), member)).to.be.true;
            }
        });
    });

    describe("Gas Measurement", () => {
        it("should measure gas for different batch sizes", async () => {
            const batchSizes = [10, 50, 100];

            for (const size of batchSizes) {
                const members = Array(size)
                    .fill(0)
                    .map((_, i) => ethers.Wallet.createRandom().address);
                const extraData = Array(size).fill("0x");

                const tx = await pool.connect(signer).addMembers(members, extraData);
                const receipt = await tx.wait();

                console.log(`Gas used for ${size} members: ${receipt.gasUsed.toString()}`);
                expect(receipt.gasUsed).to.be.lt(30000000); // Should be under block gas limit
            }
        });
    });
});
