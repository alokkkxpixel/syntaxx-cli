#!/usr/bin/env node

import prompts from "prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------ CLI CONFIG ------------------ */

const STARTERS = {
  "express-auth": {
    title: "Express + JWT Auth",
    dir: "express-auth",
    runCmd: "npm run dev",
  },
};

/* ------------------ HELPERS ------------------ */

function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || "";

  if (ua.includes("pnpm")) return "pnpm";
  if (ua.includes("yarn")) return "yarn";
  if (ua.includes("bun")) return "bun";

  return "npm";
}

async function ensureEmptyDir(dir) {
  const exists = await fs.pathExists(dir);
  if (!exists) return true;

  const files = await fs.readdir(dir);
  if (files.length === 0) return true;

  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: "Directory is not empty. Continue anyway?",
    initial: false,
  });

  if (!confirm) {
    console.log(chalk.red("❌ Cancelled"));
    process.exit(1);
  }
}

/* ------------------ CORE LOGIC ------------------ */

async function createProject({ starter, projectName, installDeps }) {
  const template = STARTERS[starter];
  const templateDir = path.join(__dirname, "../templates", template.dir);
  const targetDir = projectName
    ? path.join(process.cwd(), projectName)
    : process.cwd();

  if (!(await fs.pathExists(templateDir))) {
    console.log(chalk.red("❌ Template not found"));
    process.exit(1);
  }

  await fs.ensureDir(targetDir);
  await ensureEmptyDir(targetDir);

  await fs.copy(templateDir, targetDir, {
    filter: (src) => !src.includes("node_modules"),
  });

  console.log(chalk.green("✔ Files created"));

  if (installDeps) {
    const pm = detectPackageManager();
    console.log(chalk.yellow(`\n📦 Installing dependencies (${pm})...\n`));

    await execa(pm, ["install"], {
      cwd: targetDir,
      stdio: "inherit",
    });
  }

  console.log(chalk.green("\n🎉 Project ready!\n"));
  console.log(chalk.cyan("Next steps:"));
  if (projectName) console.log(`  cd ${projectName}`);
  console.log(`  ${template.runCmd}\n`);
}

/* ------------------ CLI ENTRY ------------------ */

async function run() {
  console.log(chalk.cyan("\n🚀 Syntaxx CLI\n"));

  const args = process.argv.slice(2);
  let starter = args[0];
  const projectName = args[1];

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

  await createProject({
    starter,
    projectName,
    installDeps,
  });
}

run();
