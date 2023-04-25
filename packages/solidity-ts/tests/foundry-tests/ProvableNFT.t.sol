// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../../contracts/ProvableNFT.sol";

contract ProvableNFTTest is Test {
    ProvableNFT public nft;

    function setUp() public {
        nft = new ProvableNFT();
        nft.initialize("Test", "T");
    }

    function sampleData1()
        internal
        pure
        returns (ProvableNFT.EventData[] memory sampleData)
    {
        sampleData = new ProvableNFT.EventData[](1);
        address[] memory contributers = new address[](1);
        contributers[0] = 0xdA030751FF448Cf127911f0518a2B9b012f72424;
        sampleData[0].eventType = 0;
        sampleData[0].subtype = 0;
        sampleData[0].quantity = 1;
        sampleData[0].contributers = contributers;
    }

    // function test_uri() public {
    //     assertEq(nft.uri(), "ipfs://f00");
    // }

    function test_correct_ipfs_prefix() public {
        nft.mint(
            msg.sender,
            hex"0f015512202c5f688262e0ece8569aa6f94d60aad55ca8d9d83734e4a7430d0cff6588ec2b"
        );
        assertEq(
            nft.tokenURI(
                0x2c5f688262e0ece8569aa6f94d60aad55ca8d9d83734e4a7430d0cff6588ec2b
            ),
            "ipfs://f015512202c5f688262e0ece8569aa6f94d60aad55ca8d9d83734e4a7430d0cff6588ec2b"
        );
        assertEq(
            nft.ownerOf(
                uint256(
                    0x2c5f688262e0ece8569aa6f94d60aad55ca8d9d83734e4a7430d0cff6588ec2b
                )
            ),
            msg.sender
        );
    }

    function test_fails_with_bad_IPFS_prefix() public {
        vm.expectRevert();
        nft.mint(
            msg.sender,
            hex"0015512202c5f688262e0ece8569aa6f94d60aad55ca8d9d83734e4a7430d0cff6588ec2b0"
        );
    }

    function test_proveNFTData_should_fail() public {
        nft.mint(
            msg.sender,
            hex"0f015512205041bf1f713df204784353e82f6a4a535931cb64f1f4b4a5aeaffcb720918b22" //CID of json '{"x":1}'
        );

        ProvableNFT.EventData[] memory sample = sampleData1();
        vm.expectRevert();

        nft.proveNFTData(
            0x5041bf1f713df204784353e82f6a4a535931cb64f1f4b4a5aeaffcb720918b22,
            sample
        );
    }

    function test_proveNFTData_should_pass() public {
        //0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000da030751ff448cf127911f0518a2b9b012f72424
        //single event: type 0, subtype 0, quantity 1, contributers 0xdA030751FF448Cf127911f0518a2B9b012f72424
        nft.mint(
            msg.sender,
            hex"0f015512200b68d5777707204e19637b67203f4f091ba11951a009b2e3dfc8836cb21dd5e5" //CID above ebi encoded data
        );

        ProvableNFT.EventData[] memory sample = sampleData1();

        ProvableNFT.EventData[] memory data = nft.proveNFTData(
            0x0b68d5777707204e19637b67203f4f091ba11951a009b2e3dfc8836cb21dd5e5,
            sample
        );
        assertEq(data[0].eventType, 0);
        assertEq(data[0].subtype, 0);
        assertEq(data[0].quantity, 1);
        assertEq(
            data[0].contributers[0],
            0xdA030751FF448Cf127911f0518a2B9b012f72424
        );
    }

    function test_mintPermissioned_non_manager_should_fail() public {
        ProvableNFT.EventData[] memory sample = sampleData1();
        vm.expectRevert();

        nft.mintPermissioned(
            msg.sender,
            hex"0f015512200b68d5777707204e19637b67203f4f091ba11951a009b2e3dfc8836cb21dd5e5",
            sample,
            false
        );
    }

    function test_mintPermissioned_manager_should_pass() public {
        ProvableNFT.EventData[] memory sample = sampleData1();
        nft.grantRole(
            keccak256(abi.encodePacked("MANAGER_", sample[0].eventType)),
            address(this)
        );

        nft.mintPermissioned(
            msg.sender,
            hex"0f015512200b68d5777707204e19637b67203f4f091ba11951a009b2e3dfc8836cb21dd5e5",
            sample,
            false
        );
    }

    function test_mintPermissioned_manager_should_store_data() public {
        ProvableNFT.EventData[] memory sample = sampleData1();
        nft.grantRole(
            keccak256(abi.encodePacked("MANAGER_", sample[0].eventType)),
            address(this)
        );

        uint256 tokenId = nft.mintPermissioned(
            msg.sender,
            hex"0f015512200b68d5777707204e19637b67203f4f091ba11951a009b2e3dfc8836cb21dd5e5",
            sample,
            true
        );
        ProvableNFT.EventData memory data = nft.getNFTData(tokenId, 0);
        assertEq(data.eventType, 0);
        assertEq(data.subtype, 0);
        assertEq(data.quantity, 1);
        assertEq(
            data.contributers[0],
            0xdA030751FF448Cf127911f0518a2B9b012f72424
        );
    }
}
