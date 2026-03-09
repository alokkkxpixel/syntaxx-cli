import chalk from "chalk";
import logger from "../utils/logger.js";
import { detectFramework } from "../core/detectFramework.js";

// Note: In a real-world scenario, you might want to fetch this list
// from your repo's metadata or a central registry.
export const BASES = ["react", "express", "next"];
export const ADDONS = {
  react: ["hooks", "context", "tailwind"],
  express: ["auth-jwt", "swagger", "rate-limit"],
};

export async function listTemplates() {
  logger.info("\n📋 Available Bases:\n");
  BASES.forEach((base) => {
    console.log(`${chalk.green("• " + base.padEnd(15))}`);
  });
  logger.dim("\nUsage: syntaxx create <base-name> [target-dir]\n");
}

export async function listAddons() {
  const framework = await detectFramework(process.cwd());

  if (framework && ADDONS[framework]) {
    logger.info(`\n🧩 Available Addons for ${framework}:\n`);
    ADDONS[framework].forEach((addon) => {
      console.log(`${chalk.cyan("+ " + addon.padEnd(15))}`);
    });
  } else {
    logger.info("\n🧩 All Available Addons:\n");
    Object.entries(ADDONS).forEach(([fw, list]) => {
      console.log(chalk.yellow(`\n${fw}:`));
      list.forEach((addon) => console.log(`  ${chalk.cyan("+ " + addon)}`));
    });
  }
  logger.dim("\nUsage: syntaxx add <addon-name>\n");
}
