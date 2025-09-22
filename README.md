# Decentralized Voting System

A secure, transparent, and tamper-proof voting platform built on blockchain technology using Ethereum smart contracts and a modern web interface.

## 🎯 Features

- **Secure Voter Registration**: Wallet-based identity with verification system
- **Transparent Elections**: All votes recorded immutably on the blockchain
- **Real-time Results**: Live vote counting with interactive charts
- **Multi-Election Support**: Create and manage multiple concurrent elections
- **Comprehensive Security**: Prevents double voting and unauthorized access
- **Modern UI**: Responsive design with intuitive user experience

## 🏗️ Architecture

### Smart Contracts
- **VotingSystem.sol**: Main contract handling elections, voters, and voting logic
- **Security Features**: ReentrancyGuard, Pausable, Access Control
- **Events**: Real-time event emission for frontend integration

### Frontend
- **Next.js 14**: React-based framework with App Router
- **RainbowKit**: Web3 wallet connection and management
- **Wagmi**: React hooks for Ethereum interactions
- **Tailwind CSS**: Utility-first styling framework
- **Recharts**: Interactive data visualization

## 📋 Prerequisites

- Node.js 18+ (LTS recommended)
- Git
- MetaMask or other Web3 wallet
- Ethereum testnet ETH (for testing)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Decentralized-Voting-System
```

### 2. Smart Contract Setup

```bash
cd smart-contracts
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your private key and RPC URLs

# Compile contracts
npx hardhat compile

# Run tests (if Node.js version is compatible)
npx hardhat test

# Deploy to local network
npx hardhat node  # In a separate terminal
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet (e.g., Sepolia)
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. Frontend Setup

```bash
cd ../frontend/frontend
npm install

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local with your WalletConnect Project ID and contract address

# Start development server
npm run dev
```

### 4. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### For Voters

1. **Connect Wallet**: Click "Connect Wallet" and choose your preferred wallet
2. **Register**: Go to "Voter Registration" tab and register with your name
3. **Wait for Verification**: An authorized verifier must approve your registration
4. **Vote**: Once verified, participate in active elections
5. **View Results**: Check real-time election results and analytics

### For Election Creators

1. **Create Election**: Use the "Create Election" tab
2. **Set Parameters**: Define title, description, voting period, and candidates
3. **Deploy**: Submit transaction to create the election on-chain
4. **Manage**: Monitor participation and end elections when the time expires

### For Verifiers

1. **Authorization**: Must be added as an authorized verifier by the contract owner
2. **Verify Voters**: Use the verification form to approve registered voters
3. **Bulk Operations**: Verify multiple voters efficiently

## 🔧 Configuration

### Smart Contract Configuration

```javascript
// hardhat.config.js
networks: {
  sepolia: {
    url: process.env.SEPOLIA_URL,
    accounts: [process.env.PRIVATE_KEY]
  },
  polygon: {
    url: process.env.POLYGON_URL,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

### Frontend Configuration

```typescript
// src/lib/wagmi.ts
export const config = getDefaultConfig({
  appName: 'Decentralized Voting System',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, polygon, sepolia, hardhat],
});
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd smart-contracts
npx hardhat test
npx hardhat test --grep "Voting Process"  # Run specific tests
```

### Frontend Development

```bash
cd frontend/frontend
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Code linting
```

## 🔒 Security Features

- **Access Control**: Owner-based permissions for critical functions
- **Reentrancy Protection**: Guards against reentrancy attacks
- **Input Validation**: Comprehensive parameter validation
- **Emergency Controls**: Pause functionality for critical situations
- **Event Logging**: Complete audit trail of all actions

## 📊 Smart Contract Functions

### Core Functions

- `registerVoter(string name)`: Register as a voter
- `verifyVoter(address voter)`: Verify a registered voter (authorized only)
- `createElection(...)`: Create a new election
- `vote(uint256 electionId, string candidate)`: Cast a vote
- `getElectionResults(uint256 electionId)`: Get current results

### View Functions

- `getElection(uint256 electionId)`: Get election details
- `getActiveElections()`: Get list of active elections
- `hasVotedInElection(uint256 electionId, address voter)`: Check vote status

## 🌐 Deployment Networks

### Testnet Deployment (Recommended for testing)

```bash
# Sepolia Testnet
npx hardhat run scripts/deploy.js --network sepolia

# Polygon Mumbai Testnet
npx hardhat run scripts/deploy.js --network mumbai
```

### Mainnet Deployment

```bash
# Ethereum Mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Polygon Mainnet
npx hardhat run scripts/deploy.js --network polygon
```

## 🔍 Contract Verification

Contracts are automatically verified on Etherscan/Polygonscan during deployment. Manual verification:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "CONSTRUCTOR_ARGS"
```

## 📈 Gas Optimization

- **Batch Operations**: Group multiple operations to save gas
- **Efficient Storage**: Optimized data structures and packing
- **Event Emission**: Minimal gas cost for transparency
- **Smart Defaults**: Gas-efficient default values

## 🐛 Troubleshooting

### Common Issues

1. **Transaction Failed**: Check gas limits and network congestion
2. **Wallet Connection**: Ensure correct network is selected
3. **Contract Interaction**: Verify contract address and ABI
4. **Verification Pending**: Wait for authorized verifier approval

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Contract debugging
npx hardhat console --network localhost
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Smart Contract Documentation](./smart-contracts/README.md)
- [Frontend Documentation](./frontend/README.md)
- [API Reference](./docs/API.md)
- [Security Audit](./docs/SECURITY.md)

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Join our Discord community
- Check the documentation

---

**⚠️ Disclaimer**: This software is provided for educational and demonstration purposes. Ensure thorough testing and security audits before using in production environments.