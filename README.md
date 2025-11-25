# SolarHealth - Privacy-First Health Data Management Platform

A fully homomorphic encryption (FHE) enabled health data management system built on Ethereum using FHEVM. This platform allows users to record, analyze, and manage their health data with complete privacy - all data is encrypted on-chain and can only be decrypted by the data owner.

## Features

- 🔒 **Fully Encrypted Health Data**: All health metrics (weight, blood pressure, blood sugar, steps, heart rate) are encrypted using FHEVM before being stored on-chain
- 📊 **Privacy-Preserving Analytics**: Calculate averages, trends, health scores, and risk assessments without decrypting the data
- 🎯 **Goal Tracking**: Set and track encrypted health goals
- 📱 **Modern Web Interface**: Built with Next.js 15, React 19, and Tailwind CSS
- 🔐 **Wallet Integration**: Seamless MetaMask integration with automatic reconnection
- 🌐 **Multi-Network Support**: Deployed on Sepolia testnet, supports local development

## Project Structure

```
.
├── fhevm-hardhat-template/    # Smart contracts and Hardhat configuration
│   ├── contracts/             # Solidity contracts
│   │   └── SolarHealth.sol    # Main health data management contract
│   ├── deploy/                # Deployment scripts
│   ├── test/                  # Contract tests
│   └── hardhat.config.ts      # Hardhat configuration
│
└── solarhealth-frontend/      # Next.js frontend application
    ├── app/                   # Next.js app router pages
    │   ├── dashboard/         # Health dashboard
    │   ├── data-entry/        # Data recording interface
    │   ├── analysis/          # Health analysis tools
    │   ├── goals/             # Goal management
    │   └── reports/            # Health reports
    ├── components/            # React components
    ├── hooks/                 # Custom React hooks
    ├── fhevm/                 # FHEVM integration layer
    └── abi/                   # Contract ABIs and addresses
```

## Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **MetaMask**: Browser extension for wallet connection
- **Hardhat Node** (for local development): For running local FHEVM-enabled blockchain

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd solarhealth
```

### 2. Install contract dependencies

```bash
cd fhevm-hardhat-template
npm install
```

### 3. Install frontend dependencies

```bash
cd ../solarhealth-frontend
npm install
```

### 4. Set up environment variables

#### For Hardhat (contracts)

```bash
cd fhevm-hardhat-template
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY  # Optional
```

#### For Frontend

No environment variables required for static export. Contract addresses are configured in `solarhealth-frontend/abi/SolarHealthAddresses.ts`.

## Development

### Smart Contracts

#### Compile contracts

```bash
cd fhevm-hardhat-template
npx hardhat compile
```

#### Run tests

```bash
npx hardhat test
```

#### Deploy to local network

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat deploy --network localhost
```

#### Deploy to Sepolia testnet

```bash
npx hardhat deploy --network sepolia
```

### Frontend

#### Development with Mock FHEVM (Local)

```bash
cd solarhealth-frontend
npm run dev:mock
```

This will:
1. Check if Hardhat node is running
2. Generate ABI files from deployments
3. Start Next.js dev server with mock FHEVM

#### Development with Real Relayer (Production)

```bash
cd solarhealth-frontend
npm run dev
```

This will:
1. Generate ABI files from deployments
2. Start Next.js dev server with real Relayer SDK

#### Build for production

```bash
cd solarhealth-frontend
npm run check:static  # Check for static export violations
npm run build         # Build static export
```

The build output will be in the `out/` directory, ready for static hosting.

## Contract Addresses

### Sepolia Testnet

- **SolarHealth**: `0xBf0bE4d0000ba1b340B58071C0b24Ad6Ed59E575`

### Localhost

Contract addresses are automatically generated during deployment and stored in `fhevm-hardhat-template/deployments/localhost/`.

## Technology Stack

### Smart Contracts

- **Solidity**: ^0.8.24
- **FHEVM**: ^0.9.1
- **Hardhat**: Development framework
- **Ethers.js**: Ethereum interaction library

### Frontend

- **Next.js**: 15.4.2 (with static export)
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Tailwind CSS**: Styling
- **Ethers.js**: 6.15.0
- **FHEVM Relayer SDK**: ^0.3.0-5

## Key Features Implementation

### Encrypted Data Storage

All health data is stored as encrypted types (`euint16`, `euint32`, `ebool`) on-chain. Only the data owner can decrypt their own data using their private key.

### Privacy-Preserving Calculations

- **Average Calculation**: Compute averages across multiple encrypted values
- **Trend Analysis**: Compare encrypted values between dates
- **Health Score**: Calculate composite health scores from encrypted metrics
- **Risk Assessment**: Analyze health trends for risk indicators

### Goal Management

Users can set encrypted health goals and track progress without revealing target values.

## Security Considerations

- All data is encrypted using FHEVM before storage
- Decryption requires user's private key (never stored on-chain)
- Access control enforced through FHEVM's `FHE.allow` mechanism
- Static export ensures no server-side data processing

## Deployment

### Frontend (Vercel)

The frontend is configured for static export and can be deployed to any static hosting service. It's currently deployed on Vercel:

- **Production**: https://solarhealth-frontend.vercel.app

### Smart Contracts

Deploy using Hardhat:

```bash
npx hardhat deploy --network <network-name>
```

## Testing

### Contract Tests

```bash
cd fhevm-hardhat-template
npx hardhat test
```

### Frontend Static Export Check

```bash
cd solarhealth-frontend
npm run check:static
```

## License

This project is licensed under the BSD-3-Clause-Clear License.

## Support

For issues and questions:
- Check the [FHEVM Documentation](https://docs.zama.ai/fhevm)
- Review contract tests in `fhevm-hardhat-template/test/`
- Check frontend implementation in `solarhealth-frontend/`

---

**Built with FHEVM by Zama** 🔒

