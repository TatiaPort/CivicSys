"use client";

import { useState } from "react";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { computeDniHash } from "@/lib/dni-hash";
import { CitizenRegistryAbi, getAddresses } from "@/lib/contracts";
import type { SupportedChainId } from "@/lib/wagmi";

const PUBLIC_SALT =
  process.env.NEXT_PUBLIC_PUBLIC_SALT ?? "ssc-antipereza-2026-publico";

export function RegisterCitizenForm() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContract, isPending } = useWriteContract();
  const [dni, setDni] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValid = /^\d{8}$/.test(dni);
  const hashPreview = isValid ? computeDniHash(dni, PUBLIC_SALT) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValid) {
      setError("DNI debe tener 8 dígitos numéricos");
      return;
    }
    try {
      const addresses = getAddresses(chainId as SupportedChainId);
      const hash = computeDniHash(dni, PUBLIC_SALT);
      writeContract({
        address: addresses.CitizenRegistry as `0x${string}`,
        abi: CitizenRegistryAbi,
        functionName: "register",
        args: [hash],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "error desconocido");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="dni">DNI (8 dígitos)</Label>
        <Input
          id="dni"
          type="text"
          inputMode="numeric"
          maxLength={8}
          value={dni}
          onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
        />
      </div>

      {hashPreview && (
        <p className="text-xs text-muted-foreground">
          Hash on-chain: <code className="font-mono">{hashPreview.slice(0, 12)}…</code>
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={!isConnected || !isValid || isPending}>
        {isPending ? "Esperando wallet..." : "Registrar"}
      </Button>

      {!isConnected && (
        <p className="text-sm text-muted-foreground">
          Conectá tu wallet para registrarte.
        </p>
      )}
    </form>
  );
}
