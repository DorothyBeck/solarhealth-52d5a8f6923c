# SolarHealth Frontend

Privacy-First Health Data Management Platform

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 7.0.0

### Installation

```bash
npm install
```

### Development

#### Mock Mode (Local Hardhat Node)

```bash
npm run dev:mock
```

This will:
1. Check if Hardhat node is running
2. Generate ABI files from deployments
3. Start Next.js dev server with mock FHEVM

#### Production Mode (Real Relayer)

```bash
npm run dev
```

This will:
1. Generate ABI files from deployments
2. Start Next.js dev server with real Relayer SDK

### Build

```bash
npm run check:static  # Check for static export violations
npm run build         # Build static export
```

### Generate ABI

```bash
npm run genabi
```

### Check Static Export Compliance

```bash
npm run check:static
```

## Project Structure

```
solarhealth-frontend/
├── app/              # Next.js app router pages
├── components/       # React components
├── hooks/           # Custom React hooks
├── fhevm/           # FHEVM integration
├── scripts/          # Build scripts
└── abi/             # Generated contract ABIs
```

## Notes

- This app uses static export (`output: 'export'`)
- FHEVM requires COOP/COEP headers - configure at server level for production
- Wallet persistence uses localStorage for silent reconnect


