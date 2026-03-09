import fs from "fs-extra";
import path from "path";
import { downloadTemplate } from "giget";
import { execa } from "execa";
import logger from "../utils/logger.js";
import { TEMPLATE_REPO } from "../core/config.js";
import { mergePackageJson } from "../core/mergePackageJson.js";

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

export async function createProject(
  baseName,
  targetDir,
  addons = [],
  installDeps = true,
) {
  const fullTargetDir = path.resolve(process.cwd(), targetDir);

  // Ensure target directory exists
  await fs.ensureDir(fullTargetDir);

  // Prevent overwriting existing files (only if creating a new base)
  const files = await fs.readdir(fullTargetDir);
  if (files.length > 0) {
    logger.error(
      "❌ Target directory is not empty. Please run in an empty folder.",
    );
    process.exit(1);
  }

  logger.info(`\n✨ Initializing ${baseName} project...\n`);

  try {
    // 1. Download Base
    await downloadTemplate(`${TEMPLATE_REPO}/bases/${baseName}/files`, {
      dir: fullTargetDir,
      force: true,
    });
    logger.success("✔ Base files created");

    // 2. Apply Addons
    for (const addon of addons) {
      logger.info(`📦 Adding addon: ${addon}...`);
      try {
        // We download to a temp dir first to handle package.json merging if necessary
        // but if we follow "mirrors project root", giget will merge folders automatically.
        // The only issue is package.json. Let's download addons directly.
        await downloadTemplate(
          `${TEMPLATE_REPO}/addons/${baseName}/${addon}/files`,
          {
            dir: fullTargetDir,
            force: true,
          },
        );
        logger.success(`  ✔ ${addon} applied`);
      } catch (err) {
        logger.error(`  ❌ Failed to add addon: ${addon}`);
      }
    }
  } catch (error) {
    logger.error(`❌ Failed to create project: ${baseName}`);
    console.error(error);
    process.exit(1);
  }

  if (installDeps) {
    const pm = detectPackageManager();
    const [cmd, args] = getInstallCommand(pm);

    logger.warn(`\n📦 Installing dependencies (${pm})...\n`);

    try {
      await execa(cmd, args, {
        cwd: fullTargetDir,
        stdio: "inherit",
      });
    } catch (err) {
      logger.error("❌ Failed to install dependencies automatically.");
    }
  }

  logger.success("\n✅ Setup complete!\n");

  const isCurrentDir = fullTargetDir === process.cwd();
  logger.info("Next steps:");
  if (!isCurrentDir) {
    console.log(`  cd ${targetDir}`);
  }
  console.log(`  npm run dev (or equivalent)\n`);
}
