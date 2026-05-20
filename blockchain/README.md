# blockchain/ — Smart contracts CivicSys

Contratos Solidity desplegados sobre **zkSYS Testnet (zkTanenbaum, Chain ID 57057)**, la edgechain de Syscoin basada en zkStack.

## Stack

- **Solidity** 0.8.24
- **Hardhat** + `hardhat-toolbox`
- **ethers v6** + **TypeChain**
- **OpenZeppelin Contracts** v5 (AccessControl, ReentrancyGuard)

## Configuración de red

`hardhat.config.ts`:

```ts
networks: {
  zkTanenbaum: {
    url: "https://rpc-zk.tanenbaum.io",
    chainId: 57057,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
  },
  hardhat: { chainId: 31337 },
},
etherscan: {
  // Verificación contra el explorer de zkTanenbaum (cuando exponga API estándar)
  customChains: [
    {
      network: "zkTanenbaum",
      chainId: 57057,
      urls: {
        apiURL: "https://explorer-zk.tanenbaum.io/api",
        browserURL: "https://explorer-zk.tanenbaum.io",
      },
    },
  ],
},
```

## Contratos de Sprint 1

### `CitizenRegistry.sol`

```solidity
struct Citizen {
    bytes32 id;              // keccak256(dni || normalized_name || salt)
    string normalizedName;   // nombre upper, sin tildes
    address wallet;          // wallet asociada (puede ser una smart account)
    uint64  registeredAt;
    bool    active;
}

event CitizenRegistered(bytes32 indexed id, address indexed wallet, uint64 timestamp);

function register(bytes32 citizenId, string calldata normalizedName) external;
function isRegistered(bytes32 citizenId) external view returns (bool);
function getCitizen(bytes32 citizenId) external view returns (Citizen memory);
```

**Invariantes:**
- Un `citizenId` solo puede registrarse una vez.
- El `dni` en claro NUNCA se almacena.
- El nombre se guarda normalizado (UPPER, sin tildes) para legibilidad pública.

### `Vote.sol`

```solidity
enum ProposalStatus { Active, Closed, Cancelled }

struct Proposal {
    uint256 id;
    string  title;
    string  description;
    string[] options;
    uint64  createdAt;
    uint64  deadline;
    ProposalStatus status;
    address curator;       // quien creó la propuesta
}

mapping(uint256 => mapping(bytes32 => uint8)) public votes;  // proposalId → citizenId → optionIdx
mapping(uint256 => uint256[]) public tallies;                // proposalId → [count per option]

event ProposalCreated(uint256 indexed id, address indexed curator, string title, uint64 deadline);
event VoteCast(uint256 indexed proposalId, bytes32 indexed citizenId, uint8 option);
event ProposalClosed(uint256 indexed proposalId, uint256[] tally, uint64 timestamp);

function createProposal(string calldata title, string calldata description, string[] calldata options, uint64 deadline) external returns (uint256);
function castVote(uint256 proposalId, uint8 optionIdx, bytes32 citizenId) external;
function tally(uint256 proposalId) external view returns (uint256[] memory);
function closeProposal(uint256 proposalId) external;   // solo curator o tras deadline
```

**Invariantes:**
- Un ciudadano solo puede votar una vez por propuesta.
- Solo ciudadanos registrados en `CitizenRegistry` pueden votar.
- No se puede votar después del `deadline`.

## Estructura

```
blockchain/
├── contracts/
│   ├── CitizenRegistry.sol
│   ├── Vote.sol
│   └── interfaces/
│       ├── ICitizenRegistry.sol
│       └── IVote.sol
├── scripts/
│   ├── deploy.ts              # despliega ambos contratos
│   ├── seed-proposals.ts      # crea propuestas de prueba
│   └── verify.ts
├── test/
│   ├── CitizenRegistry.test.ts
│   ├── Vote.test.ts
│   └── e2e.test.ts            # flujo completo en hardhat local
├── deployments/
│   └── zkTanenbaum.json       # direcciones del último deploy (commiteado)
├── hardhat.config.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## Quick start

```bash
npm install
cp .env.example .env
# editar .env y agregar DEPLOYER_PRIVATE_KEY (testnet, NUNCA mainnet)

# compilar
npx hardhat compile

# tests
npx hardhat test
npx hardhat coverage

# deploy a zkTanenbaum
npx hardhat run scripts/deploy.ts --network zkTanenbaum

# crear propuestas de prueba
npx hardhat run scripts/seed-proposals.ts --network zkTanenbaum
```

## Variables de entorno (`.env`)

```dotenv
# Wallet del deployer (cuenta de testnet — NUNCA usar mainnet aquí)
DEPLOYER_PRIVATE_KEY=0x...

# RPC con fallback
RPC_PRIMARY=https://rpc-zk.tanenbaum.io
RPC_FALLBACK=

# Salt público (compartido con el servicio API)
PUBLIC_SALT=ssc-antipereza-2026-publico
```

## Faucet

Solicitar TSYS al faucet oficial de zkTanenbaum. Si no responde, escalar a la Foundation vía el canal del hackathon.

## Verificación post-deploy

Tras el deploy:
1. Las direcciones quedan en `deployments/zkTanenbaum.json`.
2. Los ABIs se copian a `../shared/abis/` para que la API y Hermes los consuman.
3. Subir el código a `explorer-zk.tanenbaum.io` para verificación pública.
