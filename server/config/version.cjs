/**
 * Project Versioning Engine (vN.N.MM Specification)
 * 
 * Rules:
 * - Format: vN.N.MM (e.g. v2.0.76)
 * - N is 1-digit integer (Major, Minor)
 * - MM is 2-digit integer (Patch / Commit Count % 100, padded with leading 0)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAJOR = 2; // Current major version (single digit)
const MINOR = 0; // Current minor version (single digit)

function getVersionInfo() {
  let commitCount = 76;
  let commitHash = 'head';

  try {
    const countOutput = execSync('git rev-list --count HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (countOutput && !isNaN(parseInt(countOutput, 10))) {
      commitCount = parseInt(countOutput, 10);
    }
  } catch (e) {
    // Fallback if git is not available
  }

  try {
    const hashOutput = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (hashOutput) {
      commitHash = hashOutput;
    }
  } catch (e) {}

  // Format MM as 2-digit number (01 to 99)
  const patchNumber = commitCount % 100;
  const mm = String(patchNumber).padStart(2, '0');
  const version = `v${MAJOR}.${MINOR}.${mm}`;

  return {
    version,
    major: MAJOR,
    minor: MINOR,
    patch: patchNumber,
    patchFormatted: mm,
    commitCount,
    commitHash,
    appName: 'Dastyor Store'
  };
}

module.exports = {
  getVersionInfo,
  MAJOR,
  MINOR
};
