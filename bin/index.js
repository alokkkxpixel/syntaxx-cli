#!/usr/bin/env node

import prompts from "prompts";
import chalk from "chalk";
import logger from "../utils/logger.js";
import { createProject } from "../commands/create.js";
import { addAddon } from "../commands/add.js";
import { listTemplates, listAddons, BASES } from "../commands/list.js";

/* ---------------------------------- */
/* CLI Entry                          */
/* ---------------------------------- */

async function run() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Handle flags
  if (args.includes("--list") || args.includes("-l") || command === "list") {
    if (args.includes("addons")) {
      await listAddons();
    } else {
      await listTemplates();
    }
    process.exit(0);
  }

  if (args.includes("--help") || args.includes("-h") || !command) {
    logger.info("\n🚀 Syntaxx CLI - Usage Guide\n");
    console.log("  syntaxx create <base> [dir] [--add addon1 addon2] ");
    console.log("  syntaxx add <addon1> [addon2...] ");
    console.log("  syntaxx list                List all available bases");
    console.log("  syntaxx list addons         List all available addons");
    console.log("  syntaxx --help, -h          Show this help message\n");
    process.exit(0);
  }

  // Handle "create" command
  if (command === "create") {
    let base = args[1];
    let targetDir = args[2];
    const addons = [];

    // Parse --add flag and addons
    const addIdx = args.indexOf("--add");
    if (addIdx !== -1) {
      // If targetDir was actually --add, it means no targetDir was provided
      if (targetDir === "--add") {
        targetDir = null;
      }

      // Collect all words after --add as addons
      for (let i = addIdx + 1; i < args.length; i++) {
        if (!args[i].startsWith("-")) {
          addons.push(args[i]);
        } else {
          break;
        }
      }
    }

    if (!base) {
      const res = await prompts({
        type: "select",
        name: "base",
        message: "Choose a base framework",
        choices: BASES.map((b) => ({ title: b, value: b })),
      });
      if (!res.base) process.exit(0);
      base = res.base;
    }

    if (!targetDir || targetDir === "--add") {
      const res = await prompts({
        type: "text",
        name: "targetDir",
        message: "Where should we create the project?",
        initial: base,
      });
      targetDir = res.targetDir || base;
    }

    await createProject(base, targetDir, addons);
    process.exit(0);
  }

  // Handle "add" command
  if (command === "add") {
    const addons = args.slice(1);
    if (addons.length === 0) {
      logger.error(
        "❌ Please provide at least one addon name. e.g. syntaxx add auth",
      );
      process.exit(1);
    }
    await addAddon(addons);
    process.exit(0);
  }

  logger.error(`❌ Unknown command: ${command}`);
  logger.dim("Run 'syntaxx --help' to see all usage options.");
  process.exit(1);
}

run();
