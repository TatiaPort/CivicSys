import Link from "next/link";
import { RegisterCitizenForm } from "@/components/RegisterCitizenForm";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { NetworkBadge } from "@/components/NetworkBadge";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-bold">CivicSys · SSC ANTIPEREZA</Link>
          <div className="flex items-center gap-3">
            <NetworkBadge />
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      <section className="max-w-md mx-auto px-6 py-16 space-y-6">
        <h1 className="text-3xl font-bold">Registro ciudadano</h1>
        <p className="text-muted-foreground">
          Tu DNI se transforma en un hash criptográfico antes de tocar la cadena.
          El número en claro nunca sale de tu navegador.
        </p>
        <RegisterCitizenForm />
      </section>
    </main>
  );
}
