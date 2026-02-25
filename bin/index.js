#!/usr/bin/env node

import prompts from "prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const starterArg = args[0]; // express-auth

const STARTERS = {
  "express-auth": {
    title: "Express + JWT Auth",
    dir: "express-auth",
    installCmd: "npm install",
    runCmd: "npm run dev",
  },
};
async function createProject(starter, installDeps) {
  const template = STARTERS[starter];
  const targetDir = process.cwd();
  const templateDir = path.join(__dirname, "../templates", template.dir);

  if (!(await fs.pathExists(templateDir))) {
    console.log(chalk.red("❌ Template not found"));
    process.exit(1);
  }

  await fs.copy(templateDir, targetDir, {
    filter: (src) => !src.includes("node_modules"),
  });

  console.log(chalk.green("✔ Files created"));

  if (installDeps) {
    console.log(chalk.yellow("\n📦 Installing dependencies...\n"));

    await execa(template.installCmd, {
      shell: true,
      stdio: "inherit",
      cwd: targetDir,
    });
  }

  console.log(chalk.green("\n✅ Setup complete!\n"));
  console.log(chalk.cyan("Next steps:"));
  console.log(`  ${chalk.gray("→")} ${template.runCmd}\n`);
}

const run = async () => {
  console.log(chalk.cyan("\n🚀 Syntaxx CLI\n"));

  let starter = starterArg;

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
};

run();
