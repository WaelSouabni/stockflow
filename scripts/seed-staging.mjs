const enabled = process.env.STAGING_SEED === "true";
const vercelEnv = process.env.VERCEL_ENV;

if (!enabled) {
  console.log("ℹ Staging seed disabled.");
  process.exit(0);
}

if (vercelEnv && vercelEnv !== "preview") {
  throw new Error("STAGING_SEED=true is only allowed on Vercel Preview deployments.");
}

console.log("▶ Running staging seed...");
const { spawnSync } = await import("node:child_process");
const result = spawnSync("npx", ["prisma", "db", "seed"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
