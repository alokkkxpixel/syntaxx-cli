import fs from "fs-extra";
import path from "path";

/**
 * Copy files from source to destination
 * @param {string} src
 * @param {string} dest
 */
export async function copyFiles(src, dest) {
  try {
    await fs.copy(src, dest, {
      overwrite: true,
      errorOnExist: false,
    });
    return true;
  } catch (err) {
    console.error(`Error copying files: ${err.message}`);
    return false;
  }
}
