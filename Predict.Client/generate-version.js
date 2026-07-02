// Predict.Client/generate-version.js
const fs = require('fs');
const path = require('path');

// Get the latest git commit hash or use package.json version
const { execSync } = require('child_process');
let version;

try {
  // Try to get git commit hash
  version = execSync('git rev-parse --short HEAD').toString().trim();
} catch (error) {
  // Fallback to package.json version + timestamp
  const pkg = require('./package.json');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  version = `${pkg.version}-${timestamp}`;
}

const versionFile = {
  version: version,
  timestamp: new Date().toISOString()
};

// Write to dist folder - matches your angular.json outputPath
const outputPath = path.join(process.cwd(), 'dist', 'predict.client', 'version.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(versionFile, null, 2));

console.log(`✅ Version file generated at: ${outputPath}`);
console.log(`📦 Version: ${version}`);