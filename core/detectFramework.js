import fs from "fs-extra";
import path from "path";

/**
 * Detect project framework based on files
 * @param {string} target
 * @returns {string|null}
 */
export async function detectFramework(target) {
  const pkgPath = path.join(target, "package.json");
  if (!fs.existsSync(pkgPath)) return null;

  const pkg = await fs.readJson(pkgPath);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  if (deps.next) return "next";
  if (deps.vite) return "vite";
  if (deps.express) return "express";

  return "unknown";
}
