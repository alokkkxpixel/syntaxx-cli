import fs from "fs-extra";
import path from "path";

/**
 * Merge two package.json files
 * @param {string} target
 * @param {object} sourcePkg
 */
export async function mergePackageJson(targetDir, sourcePkg) {
  const pkgPath = path.join(targetDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    await fs.writeJson(pkgPath, sourcePkg, { spaces: 2 });
    return;
  }

  const currentPkg = await fs.readJson(pkgPath);

  const merged = {
    ...currentPkg,
    scripts: { ...currentPkg.scripts, ...sourcePkg.scripts },
    dependencies: { ...currentPkg.dependencies, ...sourcePkg.dependencies },
    devDependencies: {
      ...currentPkg.devDependencies,
      ...sourcePkg.devDependencies,
    },
  };

  await fs.writeJson(pkgPath, merged, { spaces: 2 });
}
