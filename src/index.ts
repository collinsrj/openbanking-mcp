import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { 
  ListResourcesRequestSchema, 
  ReadResourceRequestSchema,
  CompleteRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// Sample data for our banking MCP
// Account data
type Account = {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit";
  balance: number;
  status: "active" | "inactive" | "closed";
  createdAt: string;
};

const accounts: Account[] = [
  {
    id: "acc-001",
    name: "Robert Collins",
    type: "checking",
    balance: 2500.75,
    status: "active",
    createdAt: "2023-01-15T00:00:00Z"
  },
  {
    id: "acc-002",
    name: "Robert Collins",
    type: "savings",
    balance: 15750.25,
    status: "active",
    createdAt: "2022-11-20T00:00:00Z"
  },
  {
    id: "acc-003",
    name: "Robert Collins",
    type: "credit",
    balance: -450.00,
    status: "active",
    createdAt: "2023-02-05T00:00:00Z"
  },
  {
    id: "acc-004",
    name: "Robert Collins",
    type: "checking",
    balance: 100.50,
    status: "inactive",
    createdAt: "2022-10-10T00:00:00Z"
  }
];

// Transaction data
type Transaction = {
  id: string;
  accountId: string;
  amount: number;
  transactionType: "deposit" | "withdrawal" | "transfer" | "payment";
  recipient?: string;
  sender?: string;
  description: string;
  date: string;
};

const transactions: Transaction[] = [
  {
    id: "tx-001",
    accountId: "acc-001",
    amount: 1000.00,
    transactionType: "deposit",
    description: "Salary deposit",
    date: "2023-05-01T10:30:00Z"
  },
  {
    id: "tx-002",
    accountId: "acc-001",
    amount: -150.25,
    transactionType: "payment",
    recipient: "Electric Company",
    description: "Monthly electricity bill",
    date: "2023-05-05T14:15:00Z"
  },
  {
    id: "tx-003",
    accountId: "acc-002",
    amount: 500.00,
    transactionType: "transfer",
    sender: "acc-001",
    description: "Transfer to savings",
    date: "2023-05-10T09:45:00Z"
  },
  {
    id: "tx-004",
    accountId: "acc-003",
    amount: -200.00,
    transactionType: "withdrawal",
    description: "ATM withdrawal",
    date: "2023-05-12T17:30:00Z"
  },
  {
    id: "tx-005",
    accountId: "acc-001",
    amount: -75.50,
    transactionType: "payment",
    recipient: "Grocery Store",
    description: "Weekly groceries",
    date: "2023-05-15T11:20:00Z"
  }
];

// Create MCP server
const server = new McpServer({
  name: "Banking MCP",
  version: "1.0.0"
});

// Get all accounts
server.resource(
  "accounts-list",
  new ResourceTemplate("accounts", { list: undefined }),
  async (uri) => {
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(accounts, null, 2)
        }
      ]
    };
  }
);

// Get specific account by ID
server.resource(
  "account-detail",
  new ResourceTemplate("accounts/{id}", { list: undefined }),
  async (uri, params) => {
    const { id } = params;
    const account = accounts.find(acc => acc.id === id);
    
    if (!account) {
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ error: "Account not found" }, null, 2)
          }
        ]
      };
    }
    
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(account, null, 2)
        }
      ]
    };
  }
);

// Create the transactions resource template
const transactionsTemplate = new ResourceTemplate(
  "accounts/{id}/transactions", 
  { list: undefined }
);

// Get transactions for a specific account
server.resource(
  "transactions",
  transactionsTemplate,
  async (uri, params) => {
    const { id } = params;
    
    // Check if account exists
    const account = accounts.find(acc => acc.id === id);
    if (!account) {
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ error: "Account not found" }, null, 2)
          }
        ]
      };
    }
    
    // Get transactions for this account
    const accountTransactions = transactions.filter(tx => tx.accountId === id);
    
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(accountTransactions, null, 2)
        }
      ]
    };
  }
);

// Add a new account tool
server.tool(
  "create-account",
  {
    name: z.string(),
    type: z.enum(["checking", "savings", "credit"]),
    initialBalance: z.number().optional().default(0)
  },
  async ({ name, type, initialBalance }) => {
    const newAccount: Account = {
      id: `acc-${String(accounts.length + 1).padStart(3, '0')}`,
      name,
      type,
      balance: initialBalance || 0,
      status: "active",
      createdAt: new Date().toISOString()
    };
    
    accounts.push(newAccount);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(newAccount, null, 2)
        }
      ]
    };
  }
);

// Add a new transaction tool
server.tool(
  "create-transaction",
  {
    accountId: z.string(),
    amount: z.number(),
    transactionType: z.enum(["deposit", "withdrawal", "transfer", "payment"]),
    recipient: z.string().optional(),
    sender: z.string().optional(),
    description: z.string()
  },
  async ({ accountId, amount, transactionType, recipient, sender, description }) => {
    // Verify account exists
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: "Account not found" }, null, 2)
          }
        ],
        isError: true
      };
    }
    
    // Create new transaction
    const newTransaction: Transaction = {
      id: `tx-${String(transactions.length + 1).padStart(3, '0')}`,
      accountId,
      amount,
      transactionType,
      recipient,
      sender,
      description,
      date: new Date().toISOString()
    };
    
    // Update account balance
    account.balance += amount;
    
    // Add transaction to the list
    transactions.push(newTransaction);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(newTransaction, null, 2)
        }
      ]
    };
  }
);

// Handle list resources request to properly expose all resources
server.server.setRequestHandler(ListResourcesRequestSchema, async () => {
  // Create resources list for accounts
  const accountResources = accounts.map(account => ({
    uri: `accounts/${account.id}`,
    name: `${account.type} Account, ${account.id}`,
    description: `A ${account.type} account for ${account.name}. Balance: $${account.balance.toFixed(2)}, Status: ${account.status}`,
    mimeType: "application/json"
  }));

  // Create a general accounts resource
  const allAccountsResource = {
    uri: "accounts",
    name: "All Accounts",
    description: "List of all bank accounts",
    mimeType: "application/json"
  };

  // Create transaction resources for each account
  const transactionResources = accounts.map(account => {
    const accountTransactions = transactions.filter(tx => tx.accountId === account.id);
    if (accountTransactions.length === 0) return null;
    
    return {
      uri: `accounts/${account.id}/transactions`,
      name: `Transactions for ${account.id}`,
      description: `The set of transactions for ${account.id} with ${accountTransactions.length} transactions`,
      mimeType: "application/json"
    };
  }).filter((resource): resource is { uri: string; name: string; description: string; mimeType: string } => 
    resource !== null
  );

  return {
    resources: [
      allAccountsResource,
      ...accountResources,
      ...transactionResources
    ]
  };
});

// Handle read resource request directly to properly handle URIs
server.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  // Check if URI is for the accounts list
  if (uri === "accounts") {
    return {
      contents: [
        {
          uri: "accounts",
          text: JSON.stringify(accounts, null, 2)
        }
      ]
    };
  }
  
  // Check if URI is for a specific account
  const accountMatch = uri.match(/^accounts\/([^/]+)$/);
  if (accountMatch) {
    const accountId = accountMatch[1];
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
      return {
        contents: [
          {
            uri,
            text: JSON.stringify({ error: "Account not found" }, null, 2)
          }
        ]
      };
    }
    
    return {
      contents: [
        {
          uri,
          text: JSON.stringify(account, null, 2)
        }
      ]
    };
  }
  
  // Check if URI is for transactions of a specific account
  const transactionMatch = uri.match(/^accounts\/([^/]+)\/transactions$/);
  if (transactionMatch) {
    const accountId = transactionMatch[1];
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
      return {
        contents: [
          {
            uri,
            text: JSON.stringify({ error: "Account not found" }, null, 2)
          }
        ]
      };
    }
    
    const accountTransactions = transactions.filter(tx => tx.accountId === accountId);
    
    return {
      contents: [
        {
          uri,
          text: JSON.stringify(accountTransactions, null, 2)
        }
      ]
    };
  }
  
  // Return error for unknown URIs
  return {
    contents: [
      {
        uri,
        text: JSON.stringify({ error: "Resource not found" }, null, 2)
      }
    ]
  };
});

// Completion helper function for account IDs
const getMatchingAccountIds = (partialId: string) => {
  return accounts
    .filter(account => account.id.startsWith(partialId))
    .map(account => account.id);
};

// Handle completion requests
server.server.setRequestHandler(CompleteRequestSchema, async (request) => {
  const { argument, ref } = request.params;
  
  // Only process resource reference completion requests
  if (ref.type !== "ref/resource") {
    return { 
      completion: {
        values: [], 
        hasMore: false 
      }
    };
  }
  
  // Handle account ID completion for account resources
  if (argument.name === "id") {
    // Check if this is a request for a resource that has an account ID parameter
    if (
      ref.uri === "accounts/{id}" || 
      ref.uri === "accounts/{id}/transactions"
    ) {
      return {
        completion: {
          values: getMatchingAccountIds(argument.value || ""),
          hasMore: false
        }
      };
    }
  }
  
  // Default to empty completion
  return {
    completion: {
      values: [],
      hasMore: false
    }
  };
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();

// Silence the console logs to avoid interfering with stdio
// We need to replace console.log to prevent it from interfering with stdio
// eslint-disable-next-line no-console
console.log = () => {
  // Disable console.log outputs
  // Use process.stderr.write("message\n") if you need to log
};

// Connect to the transport
server.connect(transport).then(() => {
  process.stderr.write("Banking MCP server is running...\n");
}).catch(err => {
  process.stderr.write(`Error starting server: ${err}\n`);
});