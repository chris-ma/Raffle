// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/libraries/VRFV2PlusClient.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title OnChainRaffle
/// @notice Provably fair raffle using Chainlink VRF v2.5. Anyone can create a raffle;
///         tickets are purchased with native ETH; winner is selected by VRF randomness.
contract OnChainRaffle is VRFConsumerBaseV2Plus, ReentrancyGuard {
    // ─── VRF Config ───────────────────────────────────────────────────────────
    uint256 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private constant CALLBACK_GAS_LIMIT = 300_000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // ─── Raffle State ─────────────────────────────────────────────────────────
    enum RaffleStatus {
        Open,
        Closed,
        Drawing,
        Drawn
    }

    struct Raffle {
        uint256 id;
        string prizeDescription;
        uint256 ticketPrice; // in wei
        uint256 maxEntries;
        RaffleStatus status;
        uint256 drawTime; // 0 = no time restriction
        uint256 ticketCount;
        uint256 prizePool;
        address creator;
    }

    struct Ticket {
        uint256 id;
        address owner;
        uint256 timestamp;
    }

    struct DrawResult {
        uint256 winnerTicketId;
        address winnerAddress;
        uint256 vrfRequestId;
        bool prizeClaimed;
    }

    uint256 public raffleCount;
    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => mapping(uint256 => Ticket)) public tickets;
    mapping(uint256 => DrawResult) public drawResults;
    mapping(uint256 => uint256) private vrfRequestToRaffle;

    // ─── Events ───────────────────────────────────────────────────────────────
    event RaffleCreated(
        uint256 indexed raffleId,
        uint256 ticketPrice,
        uint256 maxEntries,
        string prizeDescription,
        address indexed creator
    );
    event TicketBought(
        uint256 indexed raffleId,
        uint256 indexed ticketId,
        address indexed owner,
        uint256 timestamp
    );
    event RaffleClosed(uint256 indexed raffleId);
    event DrawRequested(uint256 indexed raffleId, uint256 indexed vrfRequestId);
    event DrawFulfilled(
        uint256 indexed raffleId,
        uint256 winnerTicketId,
        address indexed winnerAddress,
        uint256 prizeAmount
    );
    event PrizeClaimed(uint256 indexed raffleId, address indexed winner, uint256 amount);

    // ─── Errors ───────────────────────────────────────────────────────────────
    error NotCreator();
    error RaffleNotOpen();
    error RaffleNotClosed();
    error MaxEntriesReached();
    error InsufficientPayment();
    error DrawTimeNotReached();
    error NoTicketsSold();
    error NotWinner();
    error AlreadyClaimed();
    error NoPrize();
    error TransferFailed();
    error InvalidMaxEntries();

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address vrfCoordinator, uint256 subscriptionId, bytes32 keyHash)
        VRFConsumerBaseV2Plus(vrfCoordinator)
    {
        i_subscriptionId = subscriptionId;
        i_keyHash = keyHash;
    }

    // ─── External functions ───────────────────────────────────────────────────

    function createRaffle(
        uint256 ticketPrice,
        uint256 maxEntries,
        string calldata prizeDescription,
        uint256 drawTime
    ) external returns (uint256 raffleId) {
        if (maxEntries == 0) revert InvalidMaxEntries();

        raffleId = ++raffleCount;
        raffles[raffleId] = Raffle({
            id: raffleId,
            prizeDescription: prizeDescription,
            ticketPrice: ticketPrice,
            maxEntries: maxEntries,
            status: RaffleStatus.Open,
            drawTime: drawTime,
            ticketCount: 0,
            prizePool: 0,
            creator: msg.sender
        });

        emit RaffleCreated(raffleId, ticketPrice, maxEntries, prizeDescription, msg.sender);
    }

    function buyTicket(uint256 raffleId) external payable nonReentrant returns (uint256 ticketId) {
        Raffle storage raffle = raffles[raffleId];
        if (raffle.status != RaffleStatus.Open) revert RaffleNotOpen();
        if (raffle.ticketCount >= raffle.maxEntries) revert MaxEntriesReached();
        if (msg.value < raffle.ticketPrice) revert InsufficientPayment();

        ticketId = ++raffle.ticketCount;
        tickets[raffleId][ticketId] = Ticket({
            id: ticketId,
            owner: msg.sender,
            timestamp: block.timestamp
        });
        raffle.prizePool += raffle.ticketPrice;

        uint256 excess = msg.value - raffle.ticketPrice;
        if (excess > 0) {
            (bool ok,) = payable(msg.sender).call{value: excess}("");
            if (!ok) revert TransferFailed();
        }

        emit TicketBought(raffleId, ticketId, msg.sender, block.timestamp);
    }

    function closeRaffle(uint256 raffleId) external {
        Raffle storage raffle = raffles[raffleId];
        if (raffle.creator != msg.sender) revert NotCreator();
        if (raffle.status != RaffleStatus.Open) revert RaffleNotOpen();

        raffle.status = RaffleStatus.Closed;
        emit RaffleClosed(raffleId);
    }

    function requestDraw(uint256 raffleId) external returns (uint256 requestId) {
        Raffle storage raffle = raffles[raffleId];
        if (raffle.creator != msg.sender) revert NotCreator();
        if (raffle.status != RaffleStatus.Closed) revert RaffleNotClosed();
        if (raffle.drawTime != 0 && block.timestamp < raffle.drawTime) revert DrawTimeNotReached();
        if (raffle.ticketCount == 0) revert NoTicketsSold();

        raffle.status = RaffleStatus.Drawing;

        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        vrfRequestToRaffle[requestId] = raffleId;
        emit DrawRequested(raffleId, requestId);
    }

    function claimPrize(uint256 raffleId) external nonReentrant {
        Raffle storage raffle = raffles[raffleId];
        DrawResult storage result = drawResults[raffleId];

        if (result.winnerAddress != msg.sender) revert NotWinner();
        if (result.prizeClaimed) revert AlreadyClaimed();
        if (raffle.prizePool == 0) revert NoPrize();

        uint256 prize = raffle.prizePool;
        raffle.prizePool = 0;
        result.prizeClaimed = true;

        (bool ok,) = payable(msg.sender).call{value: prize}("");
        if (!ok) revert TransferFailed();

        emit PrizeClaimed(raffleId, msg.sender, prize);
    }

    // ─── View functions ───────────────────────────────────────────────────────

    function getRaffle(uint256 raffleId) external view returns (Raffle memory) {
        return raffles[raffleId];
    }

    function getTicket(uint256 raffleId, uint256 ticketId) external view returns (Ticket memory) {
        return tickets[raffleId][ticketId];
    }

    function getDrawResult(uint256 raffleId) external view returns (DrawResult memory) {
        return drawResults[raffleId];
    }

    // ─── VRF callback ─────────────────────────────────────────────────────────

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 raffleId = vrfRequestToRaffle[requestId];
        Raffle storage raffle = raffles[raffleId];

        uint256 winnerTicketId = (randomWords[0] % raffle.ticketCount) + 1;
        address winnerAddress = tickets[raffleId][winnerTicketId].owner;

        raffle.status = RaffleStatus.Drawn;

        DrawResult storage result = drawResults[raffleId];
        result.winnerTicketId = winnerTicketId;
        result.winnerAddress = winnerAddress;
        result.vrfRequestId = requestId;

        uint256 prize = raffle.prizePool;

        // Attempt auto-transfer; if it fails the winner uses claimPrize()
        (bool ok,) = payable(winnerAddress).call{value: prize}("");
        if (ok) {
            raffle.prizePool = 0;
            result.prizeClaimed = true;
            emit PrizeClaimed(raffleId, winnerAddress, prize);
        }

        emit DrawFulfilled(raffleId, winnerTicketId, winnerAddress, prize);
    }
}
