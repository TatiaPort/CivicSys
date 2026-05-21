// Deploy de CitizenRegistry + Vote a la red localhost (Anvil).
//
// Uso:
//   pnpm exec hardhat run scripts/deploy-local.ts --network localhost
//
// Side effects:
//   - Escribe deployments/localhost.json con las addresses
//   - Copia ABIs a ../shared/abis/{CitizenRegistry,Vote}.json
//
// Pre-requisito: Anvil corriendo en localhost:8545 (bash infra/up.sh)

import hre from "hardhat";
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { SEED_PROPOSAL } from "./seed-data";

const ROOT = join(__dirname, "..");
const SHARED_ABIS = join(ROOT, "..", "shared", "abis");
const DEPLOYMENTS = join(ROOT, "deployments");

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  console.log(`→ deployer: ${deployer.account.address}`);
  console.log(`→ chain id: ${await publicClient.getChainId()}`);

  console.log("\n→ deploying CitizenRegistry...");
  const registry = await hre.viem.deployContract("CitizenRegistry");
  console.log(`✓ CitizenRegistry → ${registry.address}`);

  const block = await publicClient.getBlock();
  const openAt = block.timestamp;
  const closeAt = openAt + BigInt(SEED_PROPOSAL.durationSeconds);

  console.log("\n→ deploying Vote with seed proposal...");
  const vote = await hre.viem.deployContract("Vote", [
    registry.address,
    SEED_PROPOSAL.title,
    SEED_PROPOSAL.ipfsCid,
    openAt,
    closeAt,
  ]);
  console.log(`✓ Vote → ${vote.address}`);
  console.log(`  title:   ${SEED_PROPOSAL.title}`);
  console.log(`  openAt:  ${new Date(Number(openAt) * 1000).toISOString()}`);
  console.log(`  closeAt: ${new Date(Number(closeAt) * 1000).toISOString()}`);

  mkdirSync(DEPLOYMENTS, { recursive: true });
  const out = {
    chainId: 31337,
    network: "localhost",
    deployedAt: new Date().toISOString(),
    deployer: deployer.account.address,
    contracts: {
      CitizenRegistry: registry.address,
      Vote: vote.address,
    },
    seedProposal: {
      id: 1,
      title: SEED_PROPOSAL.title,
      ipfsCid: SEED_PROPOSAL.ipfsCid,
      openAt: openAt.toString(),
      closeAt: closeAt.toString(),
    },
  };
  writeFileSync(
    join(DEPLOYMENTS, "localhost.json"),
    JSON.stringify(out, null, 2)
  );
  console.log(`\n✓ deployments/localhost.json escrito`);

  mkdirSync(SHARED_ABIS, { recursive: true });
  for (const name of ["CitizenRegistry", "Vote"]) {
    const artifactPath = join(
      ROOT, "artifacts", "contracts", `${name}.sol`, `${name}.json`
    );
    const targetPath = join(SHARED_ABIS, `${name}.json`);
    copyFileSync(artifactPath, targetPath);
    console.log(`✓ ABI copied: shared/abis/${name}.json`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
