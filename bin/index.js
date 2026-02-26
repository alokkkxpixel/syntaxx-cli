#!/usr/bin/env node

import prompts from "prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import { fileURLToPath } from "url";
import { downloadTemplate } from "giget";

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
    repo: "gh:alokkkxpixel/syntaxx-templates/templates/express-auth",
    runCmd: "npm run dev",
  },
};

/* ---------------------------------- */
/* Core Logic                         */
/* ---------------------------------- */

async function createProject(starter, installDeps, targetDir) {
  const template = STARTERS[starter];
  const fullTargetDir = path.resolve(process.cwd(), targetDir);

  // Ensure target directory exists
  await fs.ensureDir(fullTargetDir);

  // Prevent overwriting existing files
  const files = await fs.readdir(fullTargetDir);
  if (files.length > 0) {
    console.log(
      chalk.red(
        "❌ Target directory is not empty. Please run in an empty folder.",
      ),
    );
    process.exit(1);
  }

  console.log(chalk.yellow("\n📥 Downloading template from GitHub...\n"));

  try {
    await downloadTemplate(template.repo, {
      dir: fullTargetDir,
      force: true,
    });
    console.log(chalk.green("✔ Files created"));
  } catch (error) {
    console.log(chalk.red("❌ Failed to download template"));
    console.error(error);
    process.exit(1);
  }

  if (installDeps) {
    const pm = detectPackageManager();
    const [cmd, args] = getInstallCommand(pm);

    console.log(chalk.yellow(`\n📦 Installing dependencies (${pm})...\n`));

    await execa(cmd, args, {
      cwd: fullTargetDir,
      stdio: "inherit",
    });
  }

  console.log(chalk.green("\n✅ Setup complete!\n"));

  const isCurrentDir = fullTargetDir === process.cwd();
  console.log(chalk.cyan("Next steps:"));
  if (!isCurrentDir) {
    console.log(`  cd ${targetDir}`);
  }
  console.log(`  ${template.runCmd}\n`);
}

/* ---------------------------------- */
/* CLI Entry                          */
/* ---------------------------------- */

async function run() {
  console.log(chalk.cyan("\n🚀 Syntaxx CLI\n"));

  const args = process.argv.slice(2);
  let starter = args[0];
  let targetDir = args[1];

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

  if (!targetDir) {
    const res = await prompts({
      type: "text",
      name: "targetDir",
      message: "Where should we create the project?",
      initial: ".",
    });
    targetDir = res.targetDir || ".";
  }

  const { installDeps } = await prompts({
    type: "confirm",
    name: "installDeps",
    message: "Install dependencies automatically?",
    initial: true,
  });

  await createProject(starter, installDeps, targetDir);
}

run();
