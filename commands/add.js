import logger from "../utils/logger.js";
import { applyAddon } from "../core/applyAddon.js";
import { detectFramework } from "../core/detectFramework.js";
import { TEMPLATE_REPO } from "../core/config.js";
import { downloadTemplate } from "giget";

export async function addAddon(addons) {
  const cwd = process.cwd();
  const framework = await detectFramework(cwd);

  if (!framework) {
    logger.error(
      "❌ No supported project (package.json) detected in current directory.",
    );
    return;
  }

  if (framework === "unknown") {
    logger.warn(
      "⚠️  Framework could not be detected. Addons might not work correctly.",
    );
  }

  const addonList = Array.isArray(addons) ? addons : [addons];

  for (const addonName of addonList) {
    logger.info(`✨ Adding ${addonName} to your ${framework} project...`);

    try {
      await downloadTemplate(
        `${TEMPLATE_REPO}/addons/${framework}/${addonName}/files`,
        {
          dir: cwd,
          force: true,
        },
      );
      logger.success(`✅ ${addonName} added successfully!`);
    } catch (err) {
      logger.error(
        `❌ Failed to add addon: ${addonName}. Make sure it exists for ${framework}.`,
      );
    }
  }

  logger.info(
    "\n💡 Don't forget to run 'npm install' (or your package manager's equivalent) to update dependencies.",
  );
}
