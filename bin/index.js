#!/usr/bin/env node

import prompts from "prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------------------------- */
/* Utils                              */
/* ---------------------------------- */

function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || "";

  if (ua.includes("pnpm")) return "pnpm";
  if (ua.includes("bun")) return "bun";
  return "npm";
}

function getInstallCommand(pm) {
  if (pm === "pnpm") return ["pnpm", ["install"]];
  if (pm === "bun") return ["bun", ["install"]];
  return ["npm", ["install"]];
}

/* ---------------------------------- */
/* Starters                           */
/* ---------------------------------- */

const STARTERS = {
  "express-auth": {
    title: "Express + JWT Auth",
    dir: "express-auth",
    runCmd: "npm run dev",
  },
};

/* ---------------------------------- */
/* Core Logic                         */
/* ---------------------------------- */

async function createProject(starter, installDeps) {
  const template = STARTERS[starter];
  const targetDir = process.cwd();
  const templateDir = path.join(__dirname, "../templates", template.dir);

  if (!(await fs.pathExists(templateDir))) {
    console.log(chalk.red("❌ Template not found"));
    process.exit(1);
  }

  // Prevent overwriting existing files
  const files = await fs.readdir(targetDir);
  if (files.length > 0) {
    console.log(
      chalk.red(
        "❌ Target directory is not empty. Please run in an empty folder.",
      ),
    );
    process.exit(1);
  }

  await fs.copy(templateDir, targetDir, {
    filter: (src) => !src.includes("node_modules"),
  });

  console.log(chalk.green("✔ Files created"));

  if (installDeps) {
    const pm = detectPackageManager();
    const [cmd, args] = getInstallCommand(pm);

    console.log(chalk.yellow(`\n📦 Installing dependencies (${pm})...\n`));

    await execa(cmd, args, {
      cwd: targetDir,
      stdio: "inherit",
    });
  }

  console.log(chalk.green("\n✅ Setup complete!\n"));
  console.log(chalk.cyan("Next steps:"));
  console.log(`  cd ${path.basename(targetDir)}`);
  console.log(`  ${template.runCmd}\n`);
}

/* ---------------------------------- */
/* CLI Entry                          */
/* ---------------------------------- */

async function run() {
  console.log(chalk.cyan("\n🚀 Syntaxx CLI\n"));

  const args = process.argv.slice(2);
  let starter = args[0];

  if (!starter) {
    const res = await prompts({
      type: "select",
      name: "starter",
      message: "Choose a starter template",
      choices: Object.entries(STARTERS).map(([key, val]) => ({
        title: val.title,
        value: key,
      })),
    });

    starter = res.starter;
  }

  if (!STARTERS[starter]) {
    console.log(chalk.red(`❌ Unknown starter: ${starter}`));
    process.exit(1);
  }

  const { installDeps } = await prompts({
    type: "confirm",
    name: "installDeps",
    message: "Install dependencies automatically?",
    initial: true,
  });

  await createProject(starter, installDeps);
}

run();
