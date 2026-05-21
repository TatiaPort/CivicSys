import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("wagmi", () => ({
  useAccount: () => ({ isConnected: true, address: "0x" + "1".repeat(40) }),
  useChainId: () => 31337,
  useWriteContract: () => ({ writeContract: vi.fn(), isPending: false, isSuccess: false }),
}));

vi.mock("@/lib/contracts", () => ({
  getAddresses: () => ({
    CitizenRegistry: "0x" + "a".repeat(40),
    Vote: "0x" + "b".repeat(40),
  }),
  CitizenRegistryAbi: [],
  VoteAbi: [],
}));

import { RegisterCitizenForm } from "./RegisterCitizenForm";

describe("RegisterCitizenForm", () => {
  it("renderiza un input con label DNI", () => {
    render(<RegisterCitizenForm />);
    expect(screen.getByLabelText(/DNI/i)).toBeInTheDocument();
  });

  it("renderiza boton Registrar deshabilitado cuando input esta vacio", () => {
    render(<RegisterCitizenForm />);
    const btn = screen.getByText("Registrar");
    expect(btn).toBeDisabled();
  });

  it("habilita el boton cuando hay 8 digitos numericos", () => {
    render(<RegisterCitizenForm />);
    const input = screen.getByLabelText(/DNI/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12345678" } });
    const btn = screen.getByText("Registrar");
    expect(btn).not.toBeDisabled();
  });

  it("muestra preview del hash al ingresar 8 digitos", () => {
    render(<RegisterCitizenForm />);
    const input = screen.getByLabelText(/DNI/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12345678" } });
    expect(screen.getByText(/0x[a-f0-9]{6}/)).toBeInTheDocument();
  });

  it("filtra caracteres no numericos al setear el state", () => {
    render(<RegisterCitizenForm />);
    const input = screen.getByLabelText(/DNI/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc12345" } });
    expect(input.value).toBe("12345");
  });
});
