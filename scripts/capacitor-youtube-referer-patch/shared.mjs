import fs from 'node:fs';
import path from 'node:path';

export const PATCH_MARKER = 'CAPGO_YOUTUBE_REFERER_PATCH';
export const SUPPORTED_CAPACITOR_MAJOR = '8.';
export const DEFAULT_REFERER = 'https://www.youtube.com';

export const IOS_PACKAGE_JSON = path.join('node_modules', '@capacitor', 'ios', 'package.json');
export const ANDROID_PACKAGE_JSON = path.join('node_modules', '@capacitor', 'android', 'package.json');

/**
 * Read a UTF-8 text file.
 * @param {string} file
 * @returns {string}
 */
export function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

/**
 * Write a UTF-8 text file.
 * @param {string} file
 * @param {string} content
 */
export function writeText(file, content) {
  fs.writeFileSync(file, content);
}

/**
 * Check whether a file exists.
 * @param {string} file
 * @returns {boolean}
 */
export function fileExists(file) {
  return fs.existsSync(file);
}

/**
 * Read a JSON file.
 * @param {string} file
 * @returns {any}
 */
export function readJSON(file) {
  return JSON.parse(readText(file));
}

/**
 * Parse the Capacitor config string passed through the hook environment.
 * @param {string | undefined} rawValue
 * @returns {Record<string, any>}
 */
export function parseCapacitorConfig(rawValue) {
  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    throw new Error(`Unable to parse CAPACITOR_CONFIG: ${error.message}`);
  }
}

/**
 * Extract the plugin patch config from the Capacitor config object.
 * @param {Record<string, any>} config
 * @returns {{ enabled: boolean, refererHeader: string }}
 */
export function getPatchConfig(config) {
  const pluginConfig = config?.plugins?.YoutubePlayer ?? {};

  return {
    enabled: pluginConfig.patchRefererHeader === true,
    refererHeader: typeof pluginConfig.refererHeader === 'string' ? pluginConfig.refererHeader : DEFAULT_REFERER,
  };
}

/**
 * Replace a single expected snippet or throw if the source no longer matches.
 * @param {string} content
 * @param {string} searchValue
 * @param {string} replacementValue
 * @param {string} label
 * @returns {string}
 */
export function replaceOnce(content, searchValue, replacementValue, label) {
  if (!content.includes(searchValue)) {
    throw new Error(`Unable to apply patch: missing expected snippet for ${label}`);
  }

  return content.replace(searchValue, replacementValue);
}

/**
 * Ensure a Capacitor package is installed and matches the supported major.
 * @param {string} rootDir
 * @param {string} packageJsonPath
 */
export function ensureSupportedCapacitorVersion(rootDir, packageJsonPath) {
  const file = path.join(rootDir, packageJsonPath);
  if (!fileExists(file)) {
    throw new Error(`Unable to find ${packageJsonPath}. Install Capacitor before running sync/update.`);
  }

  const { version } = readJSON(file);
  if (typeof version !== 'string' || !version.startsWith(SUPPORTED_CAPACITOR_MAJOR)) {
    throw new Error(
      `Unsupported Capacitor package version "${version}" in ${packageJsonPath}. This patch currently supports Capacitor 8.x only.`,
    );
  }
}

/**
 * Apply a patch function to a file relative to the consuming app root.
 * @param {string} rootDir
 * @param {string} relativePath
 * @param {(content: string) => string} patcher
 * @returns {boolean}
 */
export function applyPatch(rootDir, relativePath, patcher) {
  const file = path.join(rootDir, relativePath);
  if (!fileExists(file)) {
    throw new Error(`Unable to find ${relativePath} in ${rootDir}`);
  }

  const original = readText(file);
  const updated = patcher(original);

  if (updated !== original) {
    writeText(file, updated);
    return true;
  }

  return false;
}
