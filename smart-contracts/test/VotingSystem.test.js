import { expect } from "chai";
import { ethers } from "hardhat";

describe("VotingSystem", function () {
    let votingSystem;
    let owner, voter1, voter2, voter3, verifier, nonVerifier;

    beforeEach(async function () {
        [owner, voter1, voter2, voter3, verifier, nonVerifier] = await ethers.getSigners();

        const VotingSystem = await ethers.getContractFactory("VotingSystem");
        votingSystem = await VotingSystem.deploy(owner.address);
        await votingSystem.waitForDeployment();

        // Add authorized verifier
        await votingSystem.addAuthorizedVerifier(verifier.address);
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await votingSystem.owner()).to.equal(owner.address);
        });

        it("Should add owner as authorized verifier", async function () {
            expect(await votingSystem.authorizedVerifiers(owner.address)).to.be.true;
        });

        it("Should start with election counter at 0", async function () {
            expect(await votingSystem.getCurrentElectionCount()).to.equal(0);
        });
    });

    describe("Voter Registration and Verification", function () {
        it("Should register a voter with valid name", async function () {
            await expect(votingSystem.connect(voter1).registerVoter("Alice"))
                .to.emit(votingSystem, "VoterRegistered")
                .withArgs(voter1.address, "Alice");

            const voter = await votingSystem.voters(voter1.address);
            expect(voter.isRegistered).to.be.true;
            expect(voter.isVerified).to.be.false;
            expect(voter.name).to.equal("Alice");
            expect(voter.votedElections).to.equal(0);
        });

        it("Should revert when registering with empty name", async function () {
            await expect(votingSystem.connect(voter1).registerVoter(""))
                .to.be.revertedWithCustomError(votingSystem, "EmptyName");
        });

        it("Should revert when voter tries to register twice", async function () {
            await votingSystem.connect(voter1).registerVoter("Alice");

            await expect(votingSystem.connect(voter1).registerVoter("Alice Again"))
                .to.be.revertedWithCustomError(votingSystem, "VoterAlreadyRegistered");
        });

        it("Should verify a registered voter", async function () {
            await votingSystem.connect(voter1).registerVoter("Alice");

            await expect(votingSystem.connect(verifier).verifyVoter(voter1.address))
                .to.emit(votingSystem, "VoterVerified")
                .withArgs(voter1.address, verifier.address);

            const voter = await votingSystem.voters(voter1.address);
            expect(voter.isVerified).to.be.true;
        });

        it("Should revert when non-verifier tries to verify", async function () {
            await votingSystem.connect(voter1).registerVoter("Alice");

            await expect(votingSystem.connect(nonVerifier).verifyVoter(voter1.address))
                .to.be.revertedWithCustomError(votingSystem, "NotAuthorizedVerifier");
        });

        it("Should revert when verifying unregistered voter", async function () {
            await expect(votingSystem.connect(verifier).verifyVoter(voter1.address))
                .to.be.revertedWithCustomError(votingSystem, "VoterNotRegistered");
        });

        it("Should revert when verifying already verified voter", async function () {
            await votingSystem.connect(voter1).registerVoter("Alice");
            await votingSystem.connect(verifier).verifyVoter(voter1.address);

            await expect(votingSystem.connect(verifier).verifyVoter(voter1.address))
                .to.be.revertedWithCustomError(votingSystem, "VoterAlreadyVerified");
        });
    });

    describe("Verifier Management", function () {
        it("Should add authorized verifier", async function () {
            await expect(votingSystem.addAuthorizedVerifier(voter1.address))
                .to.emit(votingSystem, "VerifierAdded")
                .withArgs(voter1.address);

            expect(await votingSystem.authorizedVerifiers(voter1.address)).to.be.true;
        });

        it("Should remove authorized verifier", async function () {
            await votingSystem.addAuthorizedVerifier(voter1.address);

            await expect(votingSystem.removeAuthorizedVerifier(voter1.address))
                .to.emit(votingSystem, "VerifierRemoved")
                .withArgs(voter1.address);

            expect(await votingSystem.authorizedVerifiers(voter1.address)).to.be.false;
        });

        it("Should revert when removing owner as verifier", async function () {
            await expect(votingSystem.removeAuthorizedVerifier(owner.address))
                .to.be.revertedWithCustomError(votingSystem, "CannotRemoveOwner");
        });

        it("Should revert when non-owner tries to manage verifiers", async function () {
            await expect(votingSystem.connect(voter1).addAuthorizedVerifier(voter2.address))
                .to.be.revertedWithCustomError(votingSystem, "OwnableUnauthorizedAccount");
        });
    });

    describe("Election Creation", function () {
        it("Should create election with valid parameters", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            const startTime = currentTime + 3600; // 1 hour from now
            const endTime = startTime + 86400; // 24 hours later
            const candidates = ["Alice", "Bob", "Charlie"];

            await expect(votingSystem.createElection(
                "Presidential Election",
                "Choose the next president",
                startTime,
                endTime,
                candidates
            )).to.emit(votingSystem, "ElectionCreated")
              .withArgs(1, "Presidential Election", owner.address, startTime, endTime);

            const election = await votingSystem.getElection(1);
            expect(election.title).to.equal("Presidential Election");
            expect(election.description).to.equal("Choose the next president");
            expect(election.startTime).to.equal(startTime);
            expect(election.endTime).to.equal(endTime);
            expect(election.isActive).to.be.true;
            expect(election.creator).to.equal(owner.address);
            expect(election.totalVotes).to.equal(0);
            expect(election.candidates).to.deep.equal(candidates);
        });

        it("Should revert with empty title", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            const startTime = currentTime + 3600;
            const endTime = startTime + 86400;
            const candidates = ["Alice", "Bob"];

            await expect(votingSystem.createElection(
                "",
                "Description",
                startTime,
                endTime,
                candidates
            )).to.be.revertedWithCustomError(votingSystem, "EmptyTitle");
        });

        it("Should revert with past start time", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            const startTime = currentTime - 3600; // Past time
            const endTime = startTime + 86400;
            const candidates = ["Alice", "Bob"];

            await expect(votingSystem.createElection(
                "Invalid Election",
                "Description",
                startTime,
                endTime,
                candidates
            )).to.be.revertedWithCustomError(votingSystem, "InvalidElectionTime");
        });

        it("Should revert with end time before start time", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            const startTime = currentTime + 86400;
            const endTime = startTime - 3600; // Before start time
            const candidates = ["Alice", "Bob"];

            await expect(votingSystem.createElection(
                "Invalid Election",
                "Description",
                startTime,
                endTime,
                candidates
            )).to.be.revertedWithCustomError(votingSystem, "InvalidElectionTime");
        });

        it("Should revert with insufficient candidates", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            const startTime = currentTime + 3600;
            const endTime = startTime + 86400;
            const candidates = ["Alice"]; // Only one candidate

            await expect(votingSystem.createElection(
                "Invalid Election",
                "Description",
                startTime,
                endTime,
                candidates
            )).to.be.revertedWithCustomError(votingSystem, "InsufficientCandidates");
        });
    });

    describe("Voting Process", function () {
        let electionId;
        let startTime, endTime;

        beforeEach(async function () {
            // Register and verify voters
            await votingSystem.connect(voter1).registerVoter("Alice");
            await votingSystem.connect(voter2).registerVoter("Bob");
            await votingSystem.connect(voter3).registerVoter("Charlie");
            await votingSystem.connect(verifier).verifyVoter(voter1.address);
            await votingSystem.connect(verifier).verifyVoter(voter2.address);
            await votingSystem.connect(verifier).verifyVoter(voter3.address);

            // Create election
            const currentTime = Math.floor(Date.now() / 1000);
            startTime = currentTime + 100;
            endTime = startTime + 86400;
            const candidates = ["Candidate A", "Candidate B", "Candidate C"];

            const tx = await votingSystem.createElection(
                "Test Election",
                "Test Description",
                startTime,
                endTime,
                candidates
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(log => {
                try {
                    const parsedLog = votingSystem.interface.parseLog(log);
                    return parsedLog.name === "ElectionCreated";
                } catch (e) {
                    return false;
                }
            });
            electionId = event ? votingSystem.interface.parseLog(event).args.electionId : 1;
        });

        it("Should allow verified voters to vote during active period", async function () {
            // Fast forward to election start
            await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
            await ethers.provider.send("evm_mine");

            await expect(votingSystem.connect(voter1).vote(electionId, "Candidate A"))
                .to.emit(votingSystem, "VoteCast")
                .withArgs(electionId, voter1.address, "Candidate A");

            const hasVoted = await votingSystem.hasVotedInElection(electionId, voter1.address);
            expect(hasVoted).to.be.true;

            const voterChoice = await votingSystem.getVoterChoice(electionId, voter1.address);
            expect(voterChoice).to.equal("Candidate A");

            const candidateVotes = await votingSystem.getCandidateVotes(electionId, "Candidate A");
            expect(candidateVotes).to.equal(1);
        });

        it("Should prevent double voting", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
            await ethers.provider.send("evm_mine");

            await votingSystem.connect(voter1).vote(electionId, "Candidate A");

            await expect(votingSystem.connect(voter1).vote(electionId, "Candidate B"))
                .to.be.revertedWithCustomError(votingSystem, "AlreadyVoted");
        });

        it("Should prevent voting with invalid candidate", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
            await ethers.provider.send("evm_mine");

            await expect(votingSystem.connect(voter1).vote(electionId, "Invalid Candidate"))
                .to.be.revertedWithCustomError(votingSystem, "InvalidCandidate");
        });

        it("Should prevent unregistered voters from voting", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
            await ethers.provider.send("evm_mine");

            await expect(votingSystem.connect(nonVerifier).vote(electionId, "Candidate A"))
                .to.be.revertedWithCustomError(votingSystem, "VoterNotRegistered");
        });

        it("Should prevent unverified voters from voting", async function () {
            await votingSystem.connect(nonVerifier).registerVoter("Unverified");

            await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
            await ethers.provider.send("evm_mine");

            await expect(votingSystem.connect(nonVerifier).vote(electionId, "Candidate A"))
                .to.be.revertedWithCustomError(votingSystem, "VoterNotVerified");
        });

        it("Should prevent voting before election starts", async function () {
            await expect(votingSystem.connect(voter1).vote(electionId, "Candidate A"))
                .to.be.revertedWithCustomError(votingSystem, "ElectionNotStarted");
        });

        it("Should prevent voting after election ends", async function () {
            // Fast forward past election end
            await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
            await ethers.provider.send("evm_mine");

            await expect(votingSystem.connect(voter1).vote(electionId, "Candidate A"))
                .to.be.revertedWithCustomError(votingSystem, "ElectionEnded");
        });

        it("Should update vote counts correctly", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
            await ethers.provider.send("evm_mine");

            await votingSystem.connect(voter1).vote(electionId, "Candidate A");
            await votingSystem.connect(voter2).vote(electionId, "Candidate B");
            await votingSystem.connect(voter3).vote(electionId, "Candidate A");

            const candidateAVotes = await votingSystem.getCandidateVotes(electionId, "Candidate A");
            const candidateBVotes = await votingSystem.getCandidateVotes(electionId, "Candidate B");
            const candidateCVotes = await votingSystem.getCandidateVotes(electionId, "Candidate C");

            expect(candidateAVotes).to.equal(2);
            expect(candidateBVotes).to.equal(1);
            expect(candidateCVotes).to.equal(0);

            const election = await votingSystem.getElection(electionId);
            expect(election.totalVotes).to.equal(3);
        });

        it("Should provide accurate election results", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 1]);
            await ethers.provider.send("evm_mine");

            await votingSystem.connect(voter1).vote(electionId, "Candidate A");
            await votingSystem.connect(voter2).vote(electionId, "Candidate A");
            await votingSystem.connect(voter3).vote(electionId, "Candidate B");

            const [candidates, votes] = await votingSystem.getElectionResults(electionId);

            expect(candidates).to.deep.equal(["Candidate A", "Candidate B", "Candidate C"]);
            expect(votes[0]).to.equal(2); // Candidate A
            expect(votes[1]).to.equal(1); // Candidate B
            expect(votes[2]).to.equal(0); // Candidate C
        });
    });

    describe("Election Management", function () {
        let electionId;
        let startTime, endTime;

        beforeEach(async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            startTime = currentTime + 100;
            endTime = startTime + 1000;

            const tx = await votingSystem.createElection(
                "Management Test Election",
                "Testing management",
                startTime,
                endTime,
                ["Candidate A", "Candidate B"]
            );

            electionId = 1; // First election
        });

        it("Should end election after time expires", async function () {
            // Fast forward past end time
            await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
            await ethers.provider.send("evm_mine");

            await expect(votingSystem.endElection(electionId))
                .to.emit(votingSystem, "ElectionEnded")
                .withArgs(electionId, 0);

            const election = await votingSystem.getElection(electionId);
            expect(election.isActive).to.be.false;
        });

        it("Should prevent ending election before time expires", async function () {
            await expect(votingSystem.endElection(electionId))
                .to.be.revertedWithCustomError(votingSystem, "ElectionPeriodNotOver");
        });

        it("Should allow creator to end election after time expires", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
            await ethers.provider.send("evm_mine");

            await expect(votingSystem.connect(owner).endElection(electionId))
                .to.emit(votingSystem, "ElectionEnded");
        });

        it("Should prevent non-creator/non-owner from ending election", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
            await ethers.provider.send("evm_mine");

            await expect(votingSystem.connect(voter1).endElection(electionId))
                .to.be.revertedWithCustomError(votingSystem, "OnlyCreatorOrOwner");
        });

        it("Should return correct election status", async function () {
            // Before start
            expect(await votingSystem.getElectionStatus(electionId)).to.equal("Upcoming");

            // During election
            await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 500]);
            await ethers.provider.send("evm_mine");
            expect(await votingSystem.getElectionStatus(electionId)).to.equal("Active");

            // After election but before manually ended
            await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
            await ethers.provider.send("evm_mine");
            expect(await votingSystem.getElectionStatus(electionId)).to.equal("Expired");

            // After manually ended
            await votingSystem.endElection(electionId);
            expect(await votingSystem.getElectionStatus(electionId)).to.equal("Ended");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            await votingSystem.createElection(
                "Test Election 1",
                "Description 1",
                currentTime + 100,
                currentTime + 1000,
                ["A", "B"]
            );
            await votingSystem.createElection(
                "Test Election 2",
                "Description 2",
                currentTime + 200,
                currentTime + 2000,
                ["C", "D"]
            );
        });

        it("Should return all elections", async function () {
            const allElections = await votingSystem.getAllElections();
            expect(allElections).to.deep.equal([1, 2]);
        });

        it("Should return active elections only", async function () {
            const currentTime = Math.floor(Date.now() / 1000);

            // Fast forward to when first election is active but second is not
            await ethers.provider.send("evm_setNextBlockTimestamp", [currentTime + 150]);
            await ethers.provider.send("evm_mine");

            const activeElections = await votingSystem.getActiveElections();
            expect(activeElections).to.deep.equal([1]);
        });

        it("Should revert when getting non-existent election", async function () {
            await expect(votingSystem.getElection(999))
                .to.be.revertedWithCustomError(votingSystem, "ElectionDoesNotExist");
        });
    });

    describe("Emergency Functions", function () {
        let electionId;

        beforeEach(async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            await votingSystem.createElection(
                "Emergency Test",
                "Description",
                currentTime + 100,
                currentTime + 1000,
                ["A", "B"]
            );
            electionId = 1;
        });

        it("Should allow owner to pause contract", async function () {
            await votingSystem.pause();
            expect(await votingSystem.paused()).to.be.true;
        });

        it("Should prevent operations when paused", async function () {
            await votingSystem.pause();

            await expect(votingSystem.connect(voter1).registerVoter("Test"))
                .to.be.revertedWithCustomError(votingSystem, "EnforcedPause");
        });

        it("Should allow owner to emergency end election", async function () {
            await expect(votingSystem.emergencyEndElection(electionId))
                .to.emit(votingSystem, "ElectionEnded");

            const election = await votingSystem.getElection(electionId);
            expect(election.isActive).to.be.false;
        });

        it("Should prevent non-owner from using emergency functions", async function () {
            await expect(votingSystem.connect(voter1).emergencyEndElection(electionId))
                .to.be.revertedWithCustomError(votingSystem, "OwnableUnauthorizedAccount");
        });
    });
});