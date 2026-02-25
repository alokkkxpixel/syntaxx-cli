#!/usr/bin/env node

import prompts from "prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(chalk.cyan("\n🚀 Syntaxx CLI\n"));

const run = async () => {
  const { starter } = await prompts({
    type: "select",
    name: "starter",
    message: "Choose a starter template",
    choices: [{ title: "Express + JWT Auth", value: "express-auth" }],
  });

  if (!starter) {
    console.log(chalk.red("❌ Cancelled"));
    return;
  }

  const targetDir = process.cwd();
  const templateDir = path.join(__dirname, "../templates", starter);

  if (!(await fs.pathExists(templateDir))) {
    console.log(chalk.red("❌ Template not found"));
    return;
  }

  await fs.copy(templateDir, targetDir);

  console.log(chalk.green("\n✔ Project created successfully!\n"));
};

run();
