# Banking MCP Server

This project implements a Model Context Protocol (MCP) server that exposes banking resources including Accounts and Transactions.

## Features

- Account resources with filtering capabilities
- Transaction resources linked to accounts with comprehensive filtering
- Tools to create new accounts and transactions
- RESTful URI templates following RFC6570

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Running the server

```bash
npm run dev
```

## Resources

### Accounts

- `accounts` - Returns all accounts
- `accounts/{id}` - Returns a specific account by ID

### Transactions

- `accounts/{id}/transactions` - Returns all transactions for a specific account

## Tools

### Create Account

Creates a new bank account.

Parameters:
- `name`: Account holder name
- `type`: "checking", "savings", or "credit"
- `initialBalance`: Starting balance (optional, defaults to 0)

### Create Transaction

Creates a new transaction for an existing account.

Parameters:
- `accountId`: ID of the account
- `amount`: Transaction amount (positive for deposits/incoming transfers, negative for withdrawals/payments)
- `transactionType`: "deposit", "withdrawal", "transfer", or "payment"
- `recipient`: Recipient name (optional)
- `sender`: Sender name/account (optional)
- `description`: Transaction description

## Example Usage

Get all accounts:
```
accounts
```

Get a specific account:
```
accounts/acc-001
```

Get all transactions for account "acc-001":
```
accounts/acc-001/transactions
```

## Implementation Details

This MCP server follows the RFC6570 URI Template specification and is built using the MCP TypeScript SDK.

## Completion Support

The server provides autocompletion for resource parameters:

- Account IDs in specific account detail paths (`accounts/{id}`)
- Account IDs in transaction resource paths (`accounts/{id}/transactions`)

This helps LLMs accurately construct valid resource URLs by providing possible values for the account ID parameter.

## Development

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Type check without emitting files
npm run typecheck

# Lint code
npm run lint

# Build for production
npm run build

# Run production build
npm run start
```

### CI/CD

This project uses GitHub Actions for continuous integration, with workflows that:

- Run on every push to main and pull requests
- Build and test the project on multiple Node.js versions (18.x, 20.x)
- Perform type checking and linting
- Run security scans with npm audit
- Check dependencies for vulnerabilities

The workflow is defined in `.github/workflows/ci.yml`.

## Project Structure

- `src/index.ts` - Main server implementation
- `dist/` - Compiled JavaScript output
- `.github/workflows/` - CI/CD configuration