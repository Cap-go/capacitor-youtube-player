import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { applyCapacitorYoutubeRefererPatch } from './apply-capacitor-youtube-referer-patch.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const fixtureFiles = [
  ['node_modules/@capacitor/ios/package.json', 'node_modules/@capacitor/ios/package.json'],
  [
    'node_modules/@capacitor/ios/Capacitor/Capacitor/Plugins/HttpRequestHandler.swift',
    'node_modules/@capacitor/ios/Capacitor/Capacitor/Plugins/HttpRequestHandler.swift',
  ],
  [
    'node_modules/@capacitor/ios/Capacitor/Capacitor/WebViewAssetHandler.swift',
    'node_modules/@capacitor/ios/Capacitor/Capacitor/WebViewAssetHandler.swift',
  ],
  [
    'node_modules/@capacitor/ios/Capacitor/Capacitor/CAPBridgeViewController.swift',
    'node_modules/@capacitor/ios/Capacitor/Capacitor/CAPBridgeViewController.swift',
  ],
  ['node_modules/@capacitor/android/package.json', 'node_modules/@capacitor/android/package.json'],
  [
    'node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/plugin/util/HttpRequestHandler.java',
    'node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/plugin/util/HttpRequestHandler.java',
  ],
  [
    'node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/WebViewLocalServer.java',
    'node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/WebViewLocalServer.java',
  ],
];

const iosFixtureFiles = fixtureFiles.filter(([sourceRelativePath]) => sourceRelativePath.includes('/ios/'));
const androidFixtureFiles = fixtureFiles.filter(([sourceRelativePath]) => sourceRelativePath.includes('/android/'));

function copyFixture(tempRoot, files = fixtureFiles) {
  for (const [sourceRelativePath, targetRelativePath] of files) {
    const source = path.join(repoRoot, sourceRelativePath);
    const target = path.join(tempRoot, targetRelativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

function readPatchedFile(tempRoot, relativePath) {
  return fs.readFileSync(path.join(tempRoot, relativePath), 'utf8');
}

test('skips patching when the workaround is disabled and support is not installed', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'youtube-player-patch-disabled-'));
  copyFixture(tempRoot);

  const result = applyCapacitorYoutubeRefererPatch(tempRoot, {
    plugins: {
      YoutubePlayer: {
        patchRefererHeader: false,
      },
    },
  });

  assert.equal(result.applied, false);
  assert.equal(result.changedFiles.length, 0);
});

test('patches the relevant Capacitor native files when enabled', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'youtube-player-patch-enabled-'));
  copyFixture(tempRoot);

  const result = applyCapacitorYoutubeRefererPatch(tempRoot, {
    plugins: {
      YoutubePlayer: {
        patchRefererHeader: true,
      },
    },
  });

  assert.equal(result.applied, true);
  assert.equal(result.changedFiles.length, 5);

  assert.match(
    readPatchedFile(tempRoot, 'node_modules/@capacitor/ios/Capacitor/Capacitor/Plugins/HttpRequestHandler.swift'),
    /CAPGO_YOUTUBE_REFERER_PATCH/,
  );
  assert.match(
    readPatchedFile(tempRoot, 'node_modules/@capacitor/ios/Capacitor/Capacitor/WebViewAssetHandler.swift'),
    /setRequestConfiguration/,
  );
  assert.match(
    readPatchedFile(tempRoot, 'node_modules/@capacitor/ios/Capacitor/Capacitor/CAPBridgeViewController.swift'),
    /setRequestConfiguration\(configuration\)/,
  );
  assert.match(
    readPatchedFile(
      tempRoot,
      'node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/plugin/util/HttpRequestHandler.java',
    ),
    /applyYoutubePlayerDefaultRequestHeaders/,
  );
  assert.match(
    readPatchedFile(
      tempRoot,
      'node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/WebViewLocalServer.java',
    ),
    /applyYoutubePlayerDefaultRequestHeaders\(headers, bridge, url\)/,
  );
});

test('is idempotent once the patch has been applied', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'youtube-player-patch-idempotent-'));
  copyFixture(tempRoot);

  const config = {
    plugins: {
      YoutubePlayer: {
        patchRefererHeader: true,
      },
    },
  };

  const first = applyCapacitorYoutubeRefererPatch(tempRoot, config);
  const second = applyCapacitorYoutubeRefererPatch(tempRoot, config);

  assert.equal(first.changedFiles.length, 5);
  assert.equal(second.changedFiles.length, 0);
  assert.equal(second.alreadyPatched, true);
});

test('patches only iOS files when Android is not installed', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'youtube-player-patch-ios-only-'));
  copyFixture(tempRoot, iosFixtureFiles);

  const result = applyCapacitorYoutubeRefererPatch(tempRoot, {
    plugins: {
      YoutubePlayer: {
        patchRefererHeader: true,
      },
    },
  });

  assert.equal(result.applied, true);
  assert.deepEqual(result.changedFiles.sort(), [
    'node_modules/@capacitor/ios/Capacitor/Capacitor/CAPBridgeViewController.swift',
    'node_modules/@capacitor/ios/Capacitor/Capacitor/Plugins/HttpRequestHandler.swift',
    'node_modules/@capacitor/ios/Capacitor/Capacitor/WebViewAssetHandler.swift',
  ]);
});

test('patches only Android files when iOS is not installed', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'youtube-player-patch-android-only-'));
  copyFixture(tempRoot, androidFixtureFiles);

  const result = applyCapacitorYoutubeRefererPatch(tempRoot, {
    plugins: {
      YoutubePlayer: {
        patchRefererHeader: true,
      },
    },
  });

  assert.equal(result.applied, true);
  assert.deepEqual(result.changedFiles.sort(), [
    'node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/WebViewLocalServer.java',
    'node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/plugin/util/HttpRequestHandler.java',
  ]);
});
