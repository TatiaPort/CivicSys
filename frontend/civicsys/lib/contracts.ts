/**
 * Loaders de ABIs + addresses por chain.
 * ABIs vienen de shared/abis/ (regenerados en cada deploy).
 * Addresses vienen de blockchain/deployments/{red}.json.
 */

import CitizenRegistryArtifact from "../../../shared/abis/CitizenRegistry.json" with { type: "json" };
import VoteArtifact from "../../../shared/abis/Vote.json" with { type: "json" };
import LocalDeployment from "../../../blockchain/deployments/localhost.json" with { type: "json" };
import type { SupportedChainId } from "./wagmi";

export const CitizenRegistryAbi = CitizenRegistryArtifact.abi;
export const VoteAbi = VoteArtifact.abi;

interface DeploymentJson {
  chainId: number;
  contracts: { CitizenRegistry: string; Vote: string };
  seedProposal?: {
    id: number;
    title: string;
    ipfsCid: string;
    openAt: string;
    closeAt: string;
  };
}

const DEPLOYMENTS: Partial<Record<SupportedChainId, DeploymentJson>> = {
  31337: LocalDeployment as DeploymentJson,
};

export function getAddresses(chainId: SupportedChainId) {
  const d = DEPLOYMENTS[chainId];
  if (!d) {
    throw new Error(`No deployment available for chainId ${chainId}`);
  }
  return d.contracts;
}

export function getSeedProposal(chainId: SupportedChainId) {
  const d = DEPLOYMENTS[chainId];
  return d?.seedProposal ?? null;
}
