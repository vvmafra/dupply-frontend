/**
 * Screenshots das telas-chave em light/dark e desktop/mobile, com sessão mock por perfil.
 *
 * Uso: node scripts/ds-screenshots.mjs <tag> [--base http://localhost:4173] [--no-serve]
 *   <tag>      nome da pasta de saída: screenshots/<tag>/
 *   --no-serve usa um servidor já rodando em --base em vez de subir `vite preview`
 *
 * Requer build feito (`npm run build`) e Playwright com Chromium.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const args = process.argv.slice(2);
const tag = args.find((a) => !a.startsWith("--")) ?? "run";
const base = args.includes("--base") ? args[args.indexOf("--base") + 1] : "http://localhost:4173";
const serve = !args.includes("--no-serve");
const out = path.join(root, "screenshots", tag);
mkdirSync(out, { recursive: true });

// platformRole é o que o mock login grava; selectedProfile é o que os guards checam.
const SESSIONS = {
  public: null,
  seller: { platformRole: "seller", selectedProfile: "seller" },
  analyst: { platformRole: "risk_analyst", selectedProfile: "riskAnalyst" },
  admin: { platformRole: "admin", selectedProfile: "admin" },
  investor: { platformRole: "investor", selectedProfile: "investor" },
};

// [nome, rota, sessão, mobile?]
const PAGES = [
  ["ds-catalog", "/__ds", "public", false],
  ["landing", "/", "public", true],
  ["login", "/login", "public", true],
  ["select-profile", "/select-profile", "seller-noprofile", false],
  ["investor-home", "/investor", "investor", true],
  ["investor-opportunities", "/investor/opportunities", "investor", true],
  ["investor-offer-detail", "/investor/offers/offer-demo-001", "investor", true],
  ["investor-investments", "/investor/investments", "investor", false],
  ["seller-dashboard", "/seller", "seller", true],
  ["seller-duplicatas", "/seller/duplicatas", "seller", false],
  ["seller-duplicata-new", "/seller/duplicatas/new", "seller", false],
  ["seller-duplicata-detail", "/seller/duplicatas/dup-001", "seller", false],
  ["analyst-dashboard", "/analyst", "analyst", false],
  ["analyst-duplicata-detail", "/analyst/duplicatas/dup-001", "analyst", false],
  ["admin-dashboard", "/admin", "admin", false],
  ["admin-offers", "/admin/offers", "admin", false],
  ["admin-offer-detail", "/admin/offers/offer-demo-001", "admin", false],
];

const VIEWPORTS = { desktop: { width: 1280, height: 800 }, mobile: { width: 375, height: 812 } };

function waitForServer(url, ms = 60000) {
  const t0 = Date.now();
  return new Promise((resolve, reject) => {
    (async function poll() {
      try {
        const r = await fetch(url);
        if (r.ok) return resolve();
      } catch {}
      if (Date.now() - t0 > ms) return reject(new Error("servidor não subiu em " + url));
      setTimeout(poll, 500);
    })();
  });
}

let server;
if (serve) {
  const port = new URL(base).port || "4173";
  server = spawn("npx", ["vite", "preview", "--port", port, "--strictPort", "--host", "127.0.0.1"], { cwd: root, stdio: "ignore" });
  await waitForServer(base);
}

const browser = await chromium.launch();
const index = [];
try {
  for (const [name, route, sessionKey, mobile] of PAGES) {
    for (const theme of ["light", "dark"]) {
      for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
        if (vpName === "mobile" && !mobile) continue;
        const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: "pt-BR", reducedMotion: "reduce" });
        const session = sessionKey === "seller-noprofile" ? { platformRole: "seller", selectedProfile: null } : SESSIONS[sessionKey];
        await ctx.addInitScript(
          ({ theme, session }) => {
            localStorage.setItem("theme", theme);
            if (session) {
              sessionStorage.setItem(
                "dupply_auth_snapshot",
                JSON.stringify({ userId: "user-demo", email: "demo@dupply.com.br", ...session }),
              );
            } else {
              sessionStorage.removeItem("dupply_auth_snapshot");
            }
          },
          { theme, session },
        );
        const page = await ctx.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(String(e)));
        await page.goto(base + route, { waitUntil: "networkidle" });
        await page.waitForTimeout(600);
        const file = `${name}__${theme}__${vpName}.png`;
        await page.screenshot({ path: path.join(out, file), fullPage: true });
        index.push({ name, route, theme, viewport: vpName, file, finalUrl: page.url().replace(base, ""), errors });
        await ctx.close();
      }
    }
  }
} finally {
  await browser.close();
  server?.kill();
}
writeFileSync(path.join(out, "index.json"), JSON.stringify(index, null, 2));
const bad = index.filter((i) => i.errors.length || i.finalUrl !== i.route);
console.log(`${index.length} screenshots em screenshots/${tag}/`);
if (bad.length) {
  console.log("atenção (redirect ou erro de página):");
  for (const b of bad) console.log(`  ${b.file}: url=${b.finalUrl} ${b.errors.join(" | ")}`);
}
