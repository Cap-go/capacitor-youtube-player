import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const platform = process.argv[2];

if (platform !== 'android' && platform !== 'ios') {
  throw new Error('Usage: node scripts/test-capacitor-referer-smoke.mjs <android|ios>');
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), `youtube-player-smoke-${platform}-`));

function run(command, args, cwd = tempRoot) {
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: '1',
    },
  });
}

function writeFile(relativePath, content) {
  const file = path.join(tempRoot, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function assertMarker(relativePath) {
  const content = fs.readFileSync(path.join(tempRoot, relativePath), 'utf8');
  assert.match(content, /CAPGO_YOUTUBE_REFERER_PATCH/);
}

function installDependencies() {
  const platformPackage = `@capacitor/${platform}@^8.0.0`;
  run('bun', ['add', '@capacitor/core@^8.0.0', '@capacitor/cli@^8.0.0', platformPackage, repoRoot]);
}

function writeAppFiles() {
  writeFile(
    'capacitor.config.json',
    JSON.stringify(
      {
        appId: 'app.capgo.youtubepatch',
        appName: 'YoutubePatchSmoke',
        webDir: 'www',
        plugins: {
          YoutubePlayer: {
            patchRefererHeader: true,
          },
        },
      },
      null,
      2,
    ),
  );
  writeFile(
    'package.json',
    JSON.stringify(
      {
        name: `youtube-player-smoke-${platform}`,
        private: true,
      },
      null,
      2,
    ),
  );
  writeFile('www/index.html', '<!doctype html><html><body><h1>patch smoke test</h1></body></html>');
}

function buildAndroidApp() {
  assertMarker('node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/plugin/util/HttpRequestHandler.java');
  assertMarker('node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/WebViewLocalServer.java');
  run('./gradlew', ['assembleDebug'], path.join(tempRoot, 'android'));
}

function buildIosApp() {
  assertMarker('node_modules/@capacitor/ios/Capacitor/Capacitor/Plugins/HttpRequestHandler.swift');
  assertMarker('node_modules/@capacitor/ios/Capacitor/Capacitor/WebViewAssetHandler.swift');

  const appDir = path.join(tempRoot, 'ios', 'App');
  const xcodeArgs = fs.existsSync(path.join(appDir, 'App.xcworkspace'))
    ? ['-workspace', 'App.xcworkspace']
    : ['-project', 'App.xcodeproj'];

  xcodeArgs.push('-scheme', 'App', '-destination', 'generic/platform=iOS Simulator', 'build');
  run('xcodebuild', xcodeArgs, appDir);
}

try {
  writeAppFiles();
  installDependencies();
  run('bunx', ['cap', 'add', platform]);
  run('bunx', ['cap', 'sync', platform]);

  if (platform === 'android') {
    buildAndroidApp();
  } else {
    buildIosApp();
  }
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
