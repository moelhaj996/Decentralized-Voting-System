// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract VotingSystem is Ownable, ReentrancyGuard, Pausable {
    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        address creator;
        uint256 totalVotes;
        string[] candidates;
        mapping(string => uint256) candidateVotes;
        mapping(address => bool) hasVoted;
        mapping(address => string) voterChoice;
    }

    struct Voter {
        bool isRegistered;
        bool isVerified;
        uint256 registrationTime;
        string name;
        uint256 votedElections;
    }

    uint256 private _electionCounter;

    mapping(uint256 => Election) public elections;
    mapping(address => Voter) public voters;
    mapping(address => bool) public authorizedVerifiers;

    // Events
    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        address indexed creator,
        uint256 startTime,
        uint256 endTime
    );

    event VoterRegistered(address indexed voter, string name);
    event VoterVerified(address indexed voter, address indexed verifier);
    event VoteCast(
        uint256 indexed electionId,
        address indexed voter,
        string candidate
    );

    event ElectionEnded(uint256 indexed electionId, uint256 totalVotes);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    // Custom errors
    error ElectionDoesNotExist();
    error ElectionNotActive();
    error ElectionNotStarted();
    error ElectionEnded();
    error VoterNotRegistered();
    error VoterNotVerified();
    error VoterAlreadyRegistered();
    error VoterAlreadyVerified();
    error AlreadyVoted();
    error InvalidCandidate();
    error NotAuthorizedVerifier();
    error OnlyCreatorOrOwner();
    error ElectionPeriodNotOver();
    error ElectionAlreadyEnded();
    error InvalidElectionTime();
    error InsufficientCandidates();
    error EmptyTitle();
    error EmptyName();
    error CannotRemoveOwner();

    // Modifiers
    modifier electionExists(uint256 _electionId) {
        if (_electionId == 0 || _electionId > _electionCounter) {
            revert ElectionDoesNotExist();
        }
        _;
    }

    modifier electionActive(uint256 _electionId) {
        Election storage election = elections[_electionId];
        if (!election.isActive) revert ElectionNotActive();
        if (block.timestamp < election.startTime) revert ElectionNotStarted();
        if (block.timestamp > election.endTime) revert ElectionEnded();
        _;
    }

    modifier onlyVerifiedVoter() {
        if (!voters[msg.sender].isRegistered) revert VoterNotRegistered();
        if (!voters[msg.sender].isVerified) revert VoterNotVerified();
        _;
    }

    modifier onlyAuthorizedVerifier() {
        if (!authorizedVerifiers[msg.sender] && msg.sender != owner()) {
            revert NotAuthorizedVerifier();
        }
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        authorizedVerifiers[initialOwner] = true;
    }

    // Voter Management Functions
    function registerVoter(string memory _name) external whenNotPaused {
        if (voters[msg.sender].isRegistered) revert VoterAlreadyRegistered();
        if (bytes(_name).length == 0) revert EmptyName();

        voters[msg.sender] = Voter({
            isRegistered: true,
            isVerified: false,
            registrationTime: block.timestamp,
            name: _name,
            votedElections: 0
        });

        emit VoterRegistered(msg.sender, _name);
    }

    function verifyVoter(address _voter) external onlyAuthorizedVerifier whenNotPaused {
        if (!voters[_voter].isRegistered) revert VoterNotRegistered();
        if (voters[_voter].isVerified) revert VoterAlreadyVerified();

        voters[_voter].isVerified = true;

        emit VoterVerified(_voter, msg.sender);
    }

    function addAuthorizedVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    function removeAuthorizedVerifier(address _verifier) external onlyOwner {
        if (_verifier == owner()) revert CannotRemoveOwner();
        authorizedVerifiers[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    // Election Management Functions
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string[] memory _candidates
    ) external whenNotPaused returns (uint256) {
        if (bytes(_title).length == 0) revert EmptyTitle();
        if (_startTime <= block.timestamp) revert InvalidElectionTime();
        if (_endTime <= _startTime) revert InvalidElectionTime();
        if (_candidates.length < 2) revert InsufficientCandidates();

        _electionCounter++;
        uint256 electionId = _electionCounter;

        Election storage newElection = elections[electionId];
        newElection.id = electionId;
        newElection.title = _title;
        newElection.description = _description;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.isActive = true;
        newElection.creator = msg.sender;
        newElection.totalVotes = 0;
        newElection.candidates = _candidates;

        // Initialize candidate votes
        for (uint256 i = 0; i < _candidates.length; i++) {
            newElection.candidateVotes[_candidates[i]] = 0;
        }

        emit ElectionCreated(electionId, _title, msg.sender, _startTime, _endTime);
        return electionId;
    }

    // Voting Functions
    function vote(uint256 _electionId, string memory _candidate)
        external
        nonReentrant
        whenNotPaused
        electionExists(_electionId)
        electionActive(_electionId)
        onlyVerifiedVoter
    {
        Election storage election = elections[_electionId];

        if (election.hasVoted[msg.sender]) revert AlreadyVoted();
        if (!isValidCandidate(_electionId, _candidate)) revert InvalidCandidate();

        // Record the vote
        election.hasVoted[msg.sender] = true;
        election.voterChoice[msg.sender] = _candidate;
        election.candidateVotes[_candidate]++;
        election.totalVotes++;

        // Update voter statistics
        voters[msg.sender].votedElections++;

        emit VoteCast(_electionId, msg.sender, _candidate);
    }

    function endElection(uint256 _electionId)
        external
        whenNotPaused
        electionExists(_electionId)
    {
        Election storage election = elections[_electionId];
        if (msg.sender != election.creator && msg.sender != owner()) {
            revert OnlyCreatorOrOwner();
        }
        if (!election.isActive) revert ElectionAlreadyEnded();
        if (block.timestamp <= election.endTime) revert ElectionPeriodNotOver();

        election.isActive = false;

        emit ElectionEnded(_electionId, election.totalVotes);
    }

    // View Functions
    function getElection(uint256 _electionId)
        external
        view
        electionExists(_electionId)
        returns (
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool isActive,
            address creator,
            uint256 totalVotes,
            string[] memory candidates
        )
    {
        Election storage election = elections[_electionId];
        return (
            election.title,
            election.description,
            election.startTime,
            election.endTime,
            election.isActive,
            election.creator,
            election.totalVotes,
            election.candidates
        );
    }

    function getElectionResults(uint256 _electionId)
        external
        view
        electionExists(_electionId)
        returns (string[] memory candidates, uint256[] memory votes)
    {
        Election storage election = elections[_electionId];

        candidates = election.candidates;
        votes = new uint256[](candidates.length);

        for (uint256 i = 0; i < candidates.length; i++) {
            votes[i] = election.candidateVotes[candidates[i]];
        }

        return (candidates, votes);
    }

    function getCandidateVotes(uint256 _electionId, string memory _candidate)
        external
        view
        electionExists(_electionId)
        returns (uint256)
    {
        return elections[_electionId].candidateVotes[_candidate];
    }

    function hasVotedInElection(uint256 _electionId, address _voter)
        external
        view
        electionExists(_electionId)
        returns (bool)
    {
        return elections[_electionId].hasVoted[_voter];
    }

    function getVoterChoice(uint256 _electionId, address _voter)
        external
        view
        electionExists(_electionId)
        returns (string memory)
    {
        if (!elections[_electionId].hasVoted[_voter]) revert VoterNotRegistered();
        return elections[_electionId].voterChoice[_voter];
    }

    function getCurrentElectionCount() external view returns (uint256) {
        return _electionCounter;
    }

    function isValidCandidate(uint256 _electionId, string memory _candidate)
        public
        view
        electionExists(_electionId)
        returns (bool)
    {
        Election storage election = elections[_electionId];
        for (uint256 i = 0; i < election.candidates.length; i++) {
            if (keccak256(bytes(election.candidates[i])) == keccak256(bytes(_candidate))) {
                return true;
            }
        }
        return false;
    }

    function getElectionStatus(uint256 _electionId)
        external
        view
        electionExists(_electionId)
        returns (string memory)
    {
        Election storage election = elections[_electionId];

        if (!election.isActive) {
            return "Ended";
        } else if (block.timestamp < election.startTime) {
            return "Upcoming";
        } else if (block.timestamp > election.endTime) {
            return "Expired";
        } else {
            return "Active";
        }
    }

    function getActiveElections() external view returns (uint256[] memory) {
        uint256 totalElections = _electionCounter;
        uint256[] memory activeElections = new uint256[](totalElections);
        uint256 activeCount = 0;

        for (uint256 i = 1; i <= totalElections; i++) {
            if (elections[i].isActive &&
                block.timestamp >= elections[i].startTime &&
                block.timestamp <= elections[i].endTime) {
                activeElections[activeCount] = i;
                activeCount++;
            }
        }

        // Create result array with exact size
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeElections[i];
        }

        return result;
    }

    function getAllElections() external view returns (uint256[] memory) {
        uint256 totalElections = _electionCounter;
        uint256[] memory allElections = new uint256[](totalElections);

        for (uint256 i = 1; i <= totalElections; i++) {
            allElections[i - 1] = i;
        }

        return allElections;
    }

    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyEndElection(uint256 _electionId) external onlyOwner electionExists(_electionId) {
        elections[_electionId].isActive = false;
        emit ElectionEnded(_electionId, elections[_electionId].totalVotes);
    }
}