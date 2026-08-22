/**
 * Script to synchronize version into src/version.json and package.json
 */

const fs = require('fs');
const path = require('path');
const { getVersionInfo } = require('../server/config/version.cjs');

const versionInfo = getVersionInfo();

// 1. Write src/version.json
const srcVersionPath = path.join(__dirname, '../src/version.json');
fs.writeFileSync(srcVersionPath, JSON.stringify(versionInfo, null, 2) + '\n', 'utf8');

// 2. Update package.json version
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  pkg.version = `${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

console.log(`[Versioning] Synced version: ${versionInfo.version} (commit #${versionInfo.commitCount})`);
