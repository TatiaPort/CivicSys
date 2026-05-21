import Link from "next/link";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { NetworkBadge } from "@/components/NetworkBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
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

      <section className="max-w-3xl mx-auto px-6 py-20 space-y-8">
        <h1 className="text-5xl font-bold leading-tight">
          La IA asesora.<br />
          El ciudadano supervisa.<br />
          El blockchain firma.
        </h1>
        <p className="text-xl text-muted-foreground">
          Cámara cívica deliberativa sobre Syscoin / zkTanenbaum.
          Coordinada por <strong>Hermes</strong>, agente maestro con identidad y memoria propias.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold">1 · Te registrás</h3>
              <p className="text-sm text-muted-foreground">DNI hash on-chain. Tu identidad nunca sale en claro.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold">2 · Votás</h3>
              <p className="text-sm text-muted-foreground">Sí · No · Abstención. Firmado en zkTanenbaum.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold">3 · Hermes audita</h3>
              <p className="text-sm text-muted-foreground">Genera reportes trazables con fuente + confianza.</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link href="/registro"><Button size="lg">Empezar · registro</Button></Link>
          <Link href="/propuesta/1"><Button size="lg" variant="outline">Ver propuesta activa</Button></Link>
          <Link href="/dashboard"><Button size="lg" variant="ghost">Dashboard</Button></Link>
        </div>
      </section>
    </main>
  );
}
