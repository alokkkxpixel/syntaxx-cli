import { copyFiles } from "./copyFiles.js";
import { mergePackageJson } from "./mergePackageJson.js";
import logger from "../utils/logger.js";

/**
 * Apply an addon to a project
 * @param {string} targetDir
 * @param {string} addonPath
 */
export async function applyAddon(targetDir, addonPath) {
  try {
    await copyFiles(addonPath, targetDir);
    logger.success("✅ Addon applied successfully!");
    return true;
  } catch (err) {
    logger.error(`❌ Failed to apply addon: ${err.message}`);
    return false;
  }
}
