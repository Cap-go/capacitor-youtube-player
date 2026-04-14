import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import {
  ANDROID_PACKAGE_JSON,
  IOS_PACKAGE_JSON,
  PATCH_MARKER,
  applyPatch,
  ensureSupportedCapacitorVersion,
  fileExists,
  getPatchConfig,
  parseCapacitorConfig,
  readText,
} from './capacitor-youtube-referer-patch/shared.mjs';
import { ANDROID_PATCH_TARGETS } from './capacitor-youtube-referer-patch/android.mjs';
import { IOS_PATCH_TARGETS } from './capacitor-youtube-referer-patch/ios.mjs';

const PLATFORM_PATCHES = [
  {
    name: 'ios',
    packageJsonPath: IOS_PACKAGE_JSON,
    targets: IOS_PATCH_TARGETS,
  },
  {
    name: 'android',
    packageJsonPath: ANDROID_PACKAGE_JSON,
    targets: ANDROID_PATCH_TARGETS,
  },
];

function isAlreadyPatched(rootDir) {
  return PLATFORM_PATCHES.flatMap(({ targets }) => targets.map(([relativePath]) => relativePath))
    .map((relativePath) => path.join(rootDir, relativePath))
    .filter(fileExists)
    .some((file) => readText(file).includes(PATCH_MARKER));
}

function getInstalledPlatformPatches(rootDir) {
  return PLATFORM_PATCHES.filter(({ packageJsonPath }) => fileExists(path.join(rootDir, packageJsonPath)));
}

export function applyCapacitorYoutubeRefererPatch(rootDir, config = {}) {
  const patchConfig = getPatchConfig(config);
  const alreadyPatched = isAlreadyPatched(rootDir);

  if (!patchConfig.enabled && !alreadyPatched) {
    return {
      applied: false,
      alreadyPatched: false,
      enabled: false,
      refererHeader: patchConfig.refererHeader,
      changedFiles: [],
    };
  }

  const installedPlatforms = getInstalledPlatformPatches(rootDir);
  if (installedPlatforms.length === 0) {
    throw new Error('Unable to find `@capacitor/ios` or `@capacitor/android` in the app root.');
  }

  const changedFiles = [];

  for (const { packageJsonPath, targets } of installedPlatforms) {
    ensureSupportedCapacitorVersion(rootDir, packageJsonPath);

    for (const [relativePath, patcher] of targets) {
      if (applyPatch(rootDir, relativePath, patcher)) {
        changedFiles.push(relativePath);
      }
    }
  }

  return {
    applied: true,
    alreadyPatched,
    enabled: patchConfig.enabled,
    refererHeader: patchConfig.refererHeader,
    changedFiles,
  };
}

function main() {
  const rootDir = process.env.CAPACITOR_ROOT_DIR;
  if (!rootDir) {
    console.log('[YoutubePlayer] Skipping Referer patch: CAPACITOR_ROOT_DIR is not set.');
    return;
  }

  const config = parseCapacitorConfig(process.env.CAPACITOR_CONFIG);
  const result = applyCapacitorYoutubeRefererPatch(rootDir, config);

  if (!result.applied) {
    console.log('[YoutubePlayer] Capacitor Referer patch is disabled. Set plugins.YoutubePlayer.patchRefererHeader=true to enable it.');
    return;
  }

  if (result.changedFiles.length > 0) {
    console.log(
      `[YoutubePlayer] Applied optional Capacitor Referer patch for YouTube hosts (${result.refererHeader}).`,
    );
    for (const file of result.changedFiles) {
      console.log(`[YoutubePlayer] Patched ${file}`);
    }
    return;
  }

  console.log(
    `[YoutubePlayer] Capacitor Referer patch support is already installed. Runtime flag is ${
      result.enabled ? 'enabled' : 'disabled'
    }.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
