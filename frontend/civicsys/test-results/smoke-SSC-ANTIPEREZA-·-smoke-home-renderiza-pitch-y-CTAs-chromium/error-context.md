# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> SSC ANTIPEREZA · smoke >> home renderiza pitch y CTAs
- Location: e2e\smoke.spec.ts:21:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/La IA asesora/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/La IA asesora/i)

```

```yaml
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- img
- text: Next.js 16.2.6 Turbopack
- img
- dialog "Build Error":
  - text: Build Error
  - button "Copy Error Info":
    - img
  - link "Go to related documentation":
    - /url: https://nextjs.org/docs/messages/module-not-found
    - img
  - button "Attach Node.js inspector":
    - img
  - text: "Module not found: Can't resolve '../../../blockchain/deployments/localhost.json'"
  - img
  - text: ./lib/contracts.ts (9:1)
  - button "Open in editor":
    - img
  - text: "Module not found: Can't resolve '../../../blockchain/deployments/localhost.json' 7 | ... CitizenRegistryArtifact from \"../../../shared/abis/CitizenRegistry.json\" with { type: ... 8 | ... VoteArtifact from \"../../../shared/abis/Vote.json\" with { type: \"json\" }; > 9 | ... LocalDeployment from \"../../../blockchain/deployments/localhost.json\" with { type: \"js... | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 10 | ... type { SupportedChainId } from \"./wagmi\"; 11 | ... 12 | ... const CitizenRegistryAbi = CitizenRegistryArtifact.abi; Import traces: Client Component Browser: ./lib/contracts.ts [Client Component Browser] ./components/RegisterCitizenForm.tsx [Client Component Browser] ./components/RegisterCitizenForm.tsx [Server Component] ./app/registro/page.tsx [Server Component] Client Component SSR: ./lib/contracts.ts [Client Component SSR] ./components/RegisterCitizenForm.tsx [Client Component SSR] ./components/RegisterCitizenForm.tsx [Server Component] ./app/registro/page.tsx [Server Component]"
  - link "https://nextjs.org/docs/messages/module-not-found":
    - /url: https://nextjs.org/docs/messages/module-not-found
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { injectAnvilWallet } from "./anvil-injected";
  3  | 
  4  | /**
  5  |  * E2E smoke test minimal — solo verifica que la home renderiza el pitch.
  6  |  *
  7  |  * Tests más profundos (registro + voto + dashboard) requieren la stack
  8  |  * completa corriendo (backend Node :4000 + backend Python :8000 + frontend :3000)
  9  |  * + setup MetaMask + Anvil con contratos deployados.
  10 |  *
  11 |  * Plan vigente para Sprint 2: agregar happy-path completo cuando esté la
  12 |  * orquestación end-to-end estable (Docker Compose con los 3 servicios juntos).
  13 |  *
  14 |  * Por ahora, este smoke confirma que el bundle frontend compila + sirve + renderiza.
  15 |  */
  16 | test.describe("SSC ANTIPEREZA · smoke", () => {
  17 |   test.beforeEach(async ({ page }) => {
  18 |     await injectAnvilWallet(page);
  19 |   });
  20 | 
  21 |   test("home renderiza pitch y CTAs", async ({ page }) => {
  22 |     await page.goto("/");
> 23 |     await expect(page.getByText(/La IA asesora/i)).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  24 |     await expect(page.getByText(/El ciudadano supervisa/i)).toBeVisible();
  25 |     await expect(page.getByText(/El blockchain firma/i)).toBeVisible();
  26 |     await expect(page.getByRole("link", { name: /registro/i }).first()).toBeVisible();
  27 |   });
  28 | });
  29 | 
```