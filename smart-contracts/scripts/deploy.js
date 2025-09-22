import hre from "hardhat";
import fs from 'fs';
import path from 'path';

async function main() {
    console.log("Deploying Decentralized Voting System...");

    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Deploy VotingSystem
    const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
    const votingSystem = await VotingSystem.deploy(deployer.address);

    await votingSystem.waitForDeployment();

    const votingSystemAddress = await votingSystem.getAddress();
    console.log("VotingSystem deployed to:", votingSystemAddress);

    // Save contract addresses and ABIs
    const contractAddresses = {
        votingSystem: votingSystemAddress,
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address
    };

    // Create frontend contracts directory if it doesn't exist
    const contractsDir = path.join(__dirname, '../../frontend/src/contracts');
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    // Save addresses
    fs.writeFileSync(
        path.join(contractsDir, 'addresses.json'),
        JSON.stringify(contractAddresses, null, 2)
    );

    // Save ABI
    const VotingSystemArtifact = await hre.artifacts.readArtifact("VotingSystem");

    fs.writeFileSync(
        path.join(contractsDir, 'VotingSystem.json'),
        JSON.stringify({
            abi: VotingSystemArtifact.abi,
            bytecode: VotingSystemArtifact.bytecode
        }, null, 2)
    );

    console.log("Contract artifacts saved to frontend");

    // Verify contracts on block explorer (if not local network)
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Waiting for block confirmations...");
        await votingSystem.deploymentTransaction()?.wait(5);

        console.log("Verifying contracts...");
        try {
            await hre.run("verify:verify", {
                address: votingSystemAddress,
                constructorArguments: [deployer.address],
            });
            console.log("Contract verified successfully");
        } catch (error) {
            console.log("Verification failed:", error.message);
        }
    }

    console.log("\n=== Deployment Summary ===");
    console.log("VotingSystem:", votingSystemAddress);
    console.log("Network:", hre.network.name);
    console.log("Deployer:", deployer.address);
    console.log("Gas Used: Check transaction receipt");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });