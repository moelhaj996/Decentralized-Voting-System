# Deployment Guide

This guide walks you through deploying the Decentralized Voting System to various networks.

## Prerequisites

1. Node.js 18+ installed
2. Wallet with sufficient ETH for gas fees
3. RPC endpoint URLs (Alchemy, Infura, etc.)
4. API keys for contract verification

## Environment Setup

### 1. Smart Contract Environment

```bash
cd smart-contracts
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
REPORT_GAS=true
```

### 2. Frontend Environment

```bash
cd ../frontend/frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

Get your Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).

## Local Development

### 1. Start Local Blockchain

```bash
cd smart-contracts
npm run node
```

This starts a local Hardhat network on `http://localhost:8545` with 20 test accounts.

### 2. Deploy Contracts Locally

```bash
npm run deploy:local
```

### 3. Start Frontend

```bash
cd ../frontend/frontend
npm run dev
```

Access at `http://localhost:3000`.

## Testnet Deployment

### Sepolia Testnet

1. **Get Sepolia ETH**: Use [Sepolia Faucet](https://sepoliafaucet.com/)

2. **Deploy Contract**:
   ```bash
   cd smart-contracts
   npm run deploy:sepolia
   ```

3. **Update Frontend**: Copy contract address to `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```

### Polygon Mumbai Testnet

1. **Get Mumbai MATIC**: Use [Mumbai Faucet](https://mumbaifaucet.com/)

2. **Configure Network**: Add Mumbai to `hardhat.config.js`:
   ```javascript
   mumbai: {
     url: process.env.MUMBAI_URL,
     accounts: [process.env.PRIVATE_KEY],
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy:mumbai
   ```

## Mainnet Deployment

⚠️ **Warning**: Mainnet deployment costs real ETH. Ensure thorough testing first.

### Ethereum Mainnet

1. **Prepare Wallet**: Ensure sufficient ETH (typically 0.05-0.1 ETH)

2. **Deploy**:
   ```bash
   npm run deploy:mainnet
   ```

3. **Verify Contract**:
   ```bash
   npm run verify:mainnet DEPLOYED_ADDRESS
   ```

### Polygon Mainnet

1. **Get MATIC**: Bridge ETH to Polygon using [Polygon Bridge](https://wallet.polygon.technology/)

2. **Deploy**:
   ```bash
   npm run deploy:polygon
   ```

## Frontend Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repo to Vercel

2. **Set Environment Variables**:
   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS=deployed_contract_address
   NEXT_PUBLIC_CHAIN_ID=network_chain_id
   ```

3. **Deploy**: Push to main branch or click deploy in Vercel dashboard

### Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `out`
3. **Environment Variables**: Same as above

### AWS/Digital Ocean

Use Docker for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Post-Deployment

### 1. Contract Verification

Verify your contracts on block explorers:

```bash
# Etherscan
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "CONSTRUCTOR_ARGS"

# Polygonscan
npx hardhat verify --network polygon DEPLOYED_ADDRESS "CONSTRUCTOR_ARGS"
```

### 2. Initial Setup

1. **Add Verifiers**: Call `addAuthorizedVerifier()` for trusted addresses
2. **Test Registration**: Register a test voter
3. **Create Test Election**: Test the full flow
4. **Monitor Gas Usage**: Check transaction costs

### 3. Security Checklist

- [ ] Contract verified on block explorer
- [ ] Owner address is secure (hardware wallet recommended)
- [ ] Authorized verifiers are trusted entities
- [ ] Emergency pause functionality tested
- [ ] Frontend environment variables are secure
- [ ] SSL certificate is valid (HTTPS)

## Network Configuration

### Chain IDs

- Ethereum Mainnet: `1`
- Ethereum Sepolia: `11155111`
- Polygon Mainnet: `137`
- Polygon Mumbai: `80001`
- Hardhat Local: `31337`

### RPC Endpoints

#### Ethereum
- Mainnet: `https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY`
- Sepolia: `https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY`

#### Polygon
- Mainnet: `https://polygon-mainnet.g.alchemy.com/v2/YOUR-API-KEY`
- Mumbai: `https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY`

## Troubleshooting

### Common Deployment Issues

1. **Insufficient Gas**: Increase gas limit in deployment script
2. **Nonce Error**: Reset wallet nonce or wait for pending transactions
3. **Network Congestion**: Try deploying during low traffic periods
4. **Verification Failed**: Ensure exact compiler version and settings match

### Gas Optimization

1. **Batch Operations**: Deploy multiple contracts in one transaction
2. **Constructor Efficiency**: Minimize constructor complexity
3. **Storage Optimization**: Use packed structs and efficient data types

### Frontend Issues

1. **Wrong Network**: Ensure wallet is connected to correct network
2. **Contract Not Found**: Verify contract address and ABI
3. **Transaction Failed**: Check gas settings and network congestion

## Monitoring

### Contract Events

Monitor contract events for:
- New voter registrations
- Election creation
- Vote casting
- Unusual activity patterns

### Analytics

Track key metrics:
- Total elections created
- Voter participation rates
- Gas usage trends
- Frontend usage analytics

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Keep packages up to date
2. **Monitor Security**: Watch for new vulnerabilities
3. **Backup Data**: Export critical election data
4. **Performance Monitoring**: Track transaction costs and speed

### Emergency Procedures

1. **Pause Contract**: Use emergency pause if needed
2. **Emergency Migration**: Plan for contract upgrades
3. **Incident Response**: Have a plan for security issues
4. **Communication**: Prepare user notification procedures

## Support

For deployment issues:
- Check the troubleshooting section
- Review Hardhat and Next.js documentation
- Open an issue on GitHub
- Join our Discord community