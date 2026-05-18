// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {OnChainRaffle} from "../src/OnChainRaffle.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2Plus.sol";

/// @dev Minimal VRF coordinator mock
contract MockVRFCoordinator {
    uint256 private _nextRequestId = 1;
    mapping(uint256 => address) private _consumers;

    function requestRandomWords(bytes memory /* req */ ) external returns (uint256 requestId) {
        requestId = _nextRequestId++;
        _consumers[requestId] = msg.sender;
    }

    function fulfillRandomWords(uint256 requestId, address consumer, uint256[] memory randomWords) external {
        VRFConsumerBaseV2Plus(consumer).rawFulfillRandomWords(requestId, randomWords);
    }
}

contract OnChainRaffleTest is Test {
    OnChainRaffle public raffle;
    MockVRFCoordinator public coordinator;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public carol = makeAddr("carol");

    uint256 constant TICKET_PRICE = 0.01 ether;
    uint256 constant MAX_ENTRIES = 10;

    function setUp() public {
        coordinator = new MockVRFCoordinator();
        raffle = new OnChainRaffle(address(coordinator), 1, bytes32(0));
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(carol, 10 ether);
    }

    // ─── createRaffle ─────────────────────────────────────────────────────────

    function test_createRaffle() public {
        vm.prank(alice);
        uint256 id = raffle.createRaffle(TICKET_PRICE, MAX_ENTRIES, "AirPods Pro", 0);

        assertEq(id, 1);
        assertEq(raffle.raffleCount(), 1);

        OnChainRaffle.Raffle memory r = raffle.getRaffle(1);
        assertEq(r.ticketPrice, TICKET_PRICE);
        assertEq(r.maxEntries, MAX_ENTRIES);
        assertEq(r.creator, alice);
        assertEq(uint8(r.status), uint8(OnChainRaffle.RaffleStatus.Open));
    }

    function test_createRaffle_revertZeroMaxEntries() public {
        vm.expectRevert(OnChainRaffle.InvalidMaxEntries.selector);
        raffle.createRaffle(TICKET_PRICE, 0, "test", 0);
    }

    // ─── buyTicket ────────────────────────────────────────────────────────────

    function test_buyTicket() public {
        vm.prank(alice);
        raffle.createRaffle(TICKET_PRICE, MAX_ENTRIES, "Prize", 0);

        vm.prank(bob);
        uint256 ticketId = raffle.buyTicket{value: TICKET_PRICE}(1);

        assertEq(ticketId, 1);
        OnChainRaffle.Ticket memory t = raffle.getTicket(1, 1);
        assertEq(t.owner, bob);
    }

    function test_buyTicket_refundsExcess() public {
        vm.prank(alice);
        raffle.createRaffle(TICKET_PRICE, MAX_ENTRIES, "Prize", 0);

        uint256 balanceBefore = bob.balance;
        vm.prank(bob);
        raffle.buyTicket{value: 1 ether}(1);

        assertEq(bob.balance, balanceBefore - TICKET_PRICE);
    }

    function test_buyTicket_revertInsufficientPayment() public {
        vm.prank(alice);
        raffle.createRaffle(TICKET_PRICE, MAX_ENTRIES, "Prize", 0);

        vm.prank(bob);
        vm.expectRevert(OnChainRaffle.InsufficientPayment.selector);
        raffle.buyTicket{value: TICKET_PRICE - 1}(1);
    }

    function test_buyTicket_revertMaxEntries() public {
        vm.prank(alice);
        raffle.createRaffle(TICKET_PRICE, 2, "Prize", 0);

        vm.prank(bob);
        raffle.buyTicket{value: TICKET_PRICE}(1);
        vm.prank(carol);
        raffle.buyTicket{value: TICKET_PRICE}(1);

        vm.prank(alice);
        vm.expectRevert(OnChainRaffle.MaxEntriesReached.selector);
        raffle.buyTicket{value: TICKET_PRICE}(1);
    }

    // ─── closeRaffle ──────────────────────────────────────────────────────────

    function test_closeRaffle() public {
        vm.prank(alice);
        raffle.createRaffle(TICKET_PRICE, MAX_ENTRIES, "Prize", 0);

        vm.prank(alice);
        raffle.closeRaffle(1);

        OnChainRaffle.Raffle memory r = raffle.getRaffle(1);
        assertEq(uint8(r.status), uint8(OnChainRaffle.RaffleStatus.Closed));
    }

    function test_closeRaffle_revertNotCreator() public {
        vm.prank(alice);
        raffle.createRaffle(TICKET_PRICE, MAX_ENTRIES, "Prize", 0);

        vm.prank(bob);
        vm.expectRevert(OnChainRaffle.NotCreator.selector);
        raffle.closeRaffle(1);
    }

    // ─── Full flow ────────────────────────────────────────────────────────────

    function test_fullFlow() public {
        // Create raffle
        vm.prank(alice);
        raffle.createRaffle(TICKET_PRICE, MAX_ENTRIES, "MacBook", 0);

        // Buy 3 tickets
        vm.prank(bob);
        raffle.buyTicket{value: TICKET_PRICE}(1);
        vm.prank(carol);
        raffle.buyTicket{value: TICKET_PRICE}(1);
        vm.prank(alice);
        raffle.buyTicket{value: TICKET_PRICE}(1);

        // Close raffle
        vm.prank(alice);
        raffle.closeRaffle(1);

        // Request draw
        vm.prank(alice);
        raffle.requestDraw(1);

        OnChainRaffle.Raffle memory r = raffle.getRaffle(1);
        assertEq(uint8(r.status), uint8(OnChainRaffle.RaffleStatus.Drawing));

        // Simulate VRF callback – randomness selects ticket #2 (carol)
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1; // (1 % 3) + 1 = 2
        coordinator.fulfillRandomWords(1, address(raffle), randomWords);

        r = raffle.getRaffle(1);
        assertEq(uint8(r.status), uint8(OnChainRaffle.RaffleStatus.Drawn));

        OnChainRaffle.DrawResult memory result = raffle.getDrawResult(1);
        assertEq(result.winnerTicketId, 2);
        assertEq(result.winnerAddress, carol);
    }

    function test_drawTime_revertTooEarly() public {
        uint256 future = block.timestamp + 1 days;

        vm.prank(alice);
        raffle.createRaffle(TICKET_PRICE, MAX_ENTRIES, "Prize", future);

        vm.prank(bob);
        raffle.buyTicket{value: TICKET_PRICE}(1);

        vm.prank(alice);
        raffle.closeRaffle(1);

        vm.prank(alice);
        vm.expectRevert(OnChainRaffle.DrawTimeNotReached.selector);
        raffle.requestDraw(1);
    }
}
