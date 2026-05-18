// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {OnChainRaffle} from "../src/OnChainRaffle.sol";

contract Deploy is Script {
    // Base Sepolia Chainlink VRF v2.5
    address constant VRF_COORDINATOR_BASE_SEPOLIA = 0x5C210eF41CD1a72de73bF76eD5813b0098d8B1e4;
    bytes32 constant KEY_HASH_BASE_SEPOLIA = 0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71;

    // Base Mainnet Chainlink VRF v2.5
    address constant VRF_COORDINATOR_BASE = 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634;
    bytes32 constant KEY_HASH_BASE = 0x027f94ff1465b3525f9fc03e9ff7d6d2c0953482246dd6ae0080b51dc28de2b7;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 subscriptionId = vm.envUint("VRF_SUBSCRIPTION_ID");

        address vrfCoordinator;
        bytes32 keyHash;

        if (block.chainid == 84532) {
            // Base Sepolia
            vrfCoordinator = vm.envOr("VRF_COORDINATOR", VRF_COORDINATOR_BASE_SEPOLIA);
            keyHash = vm.envOr("VRF_KEY_HASH", KEY_HASH_BASE_SEPOLIA);
        } else if (block.chainid == 8453) {
            // Base Mainnet
            vrfCoordinator = vm.envOr("VRF_COORDINATOR", VRF_COORDINATOR_BASE);
            keyHash = vm.envOr("VRF_KEY_HASH", KEY_HASH_BASE);
        } else {
            vrfCoordinator = vm.envAddress("VRF_COORDINATOR");
            keyHash = vm.envBytes32("VRF_KEY_HASH");
        }

        vm.startBroadcast(deployerPrivateKey);

        OnChainRaffle raffle = new OnChainRaffle(vrfCoordinator, subscriptionId, keyHash);

        vm.stopBroadcast();

        console2.log("OnChainRaffle deployed at:", address(raffle));
        console2.log("Chain ID:", block.chainid);
        console2.log("VRF Coordinator:", vrfCoordinator);
        console2.log("Subscription ID:", subscriptionId);
    }
}
