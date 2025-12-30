/**
 * Script to analyze dependencies and identify optimization opportunities
 * This helps reduce bundle size by removing unused dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

console.log('🔍 Analyzing dependencies...\n');

// Run depcheck
let depcheckResult;
try {
  const output = execSync('npx depcheck --json', { 
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8'
  });
  depcheckResult = JSON.parse(output);
} catch (error) {
  // depcheck exits with code 1 if it finds issues
  if (error.stdout) {
    depcheckResult = JSON.parse(error.stdout);
  } else {
    console.error('Failed to run depcheck:', error.message);
    process.exit(1);
  }
}

const results = {
  unusedDependencies: depcheckResult.dependencies || [],
  unusedDevDependencies: depcheckResult.devDependencies || [],
  missingDependencies: Object.keys(depcheckResult.missing || {}),
  totalDependencies: Object.keys(packageJson.dependencies || {}).length,
  totalDevDependencies: Object.keys(packageJson.devDependencies || {}).length
};

// Known false positives (dependencies that are used but not detected)
const knownFalsePositives = [
  'web-vitals', // Used in performance monitoring
  'react-window', // Will be used for virtual scrolling
  'sass', // Used by webpack for SCSS compilation
  '@craco/craco', // Used in build process
  'webpack-bundle-analyzer', // Used in analyze script
  'compression-webpack-plugin', // Used in build process
  'fast-check', // Used in property-based tests
  'depcheck' // This tool itself
];

// Filter out false positives
const actualUnusedDeps = results.unusedDependencies.filter(
  dep => !knownFalsePositives.includes(dep)
);
const actualUnusedDevDeps = results.unusedDevDependencies.filter(
  dep => !knownFalsePositives.includes(dep)
);

console.log('📊 Dependency Analysis Results:');
console.log('='.repeat(60));
console.log(`Total dependencies: ${results.totalDependencies}`);
console.log(`Total devDependencies: ${results.totalDevDependencies}`);
console.log(`Unused dependencies: ${actualUnusedDeps.length}`);
console.log(`Unused devDependencies: ${actualUnusedDevDeps.length}`);
console.log(`Missing dependencies: ${results.missingDependencies.length}`);
console.log('='.repeat(60));

if (actualUnusedDeps.length > 0) {
  console.log('\n⚠️  Unused dependencies (can be removed):');
  actualUnusedDeps.forEach(dep => {
    const version = packageJson.dependencies[dep];
    console.log(`  - ${dep}@${version}`);
  });
  console.log('\n  Command to remove:');
  console.log(`  npm uninstall ${actualUnusedDeps.join(' ')}`);
}

if (actualUnusedDevDeps.length > 0) {
  console.log('\n⚠️  Unused devDependencies (can be removed):');
  actualUnusedDevDeps.forEach(dep => {
    const version = packageJson.devDependencies[dep];
    console.log(`  - ${dep}@${version}`);
  });
  console.log('\n  Command to remove:');
  console.log(`  npm uninstall ${actualUnusedDevDeps.join(' ')}`);
}

if (results.missingDependencies.length > 0) {
  console.log('\n❌ Missing dependencies (should be installed):');
  results.missingDependencies.forEach(dep => {
    const files = depcheckResult.missing[dep];
    console.log(`  - ${dep}`);
    console.log(`    Used in: ${files.join(', ')}`);
  });
  console.log('\n  Command to install:');
  console.log(`  npm install ${results.missingDependencies.join(' ')}`);
}

// Check for duplicate icon libraries
console.log('\n🔍 Checking for duplicate icon libraries...');
const iconLibraries = [
  '@mui/icons-material',
  '@fortawesome/fontawesome-free',
  'lucide-react',
  'phosphor-react',
  'react-icons'
];

const usedIconLibraries = iconLibraries.filter(lib => 
  packageJson.dependencies[lib] || packageJson.devDependencies[lib]
);

if (usedIconLibraries.length > 1) {
  console.log(`⚠️  Found ${usedIconLibraries.length} icon libraries:`);
  usedIconLibraries.forEach(lib => console.log(`  - ${lib}`));
  console.log('\n  Recommendation: Consolidate to one icon library (preferably @mui/icons-material)');
} else {
  console.log('✅ Only one icon library in use');
}

// Check for duplicate styling libraries
console.log('\n🔍 Checking for duplicate styling libraries...');
const stylingLibraries = [
  '@emotion/react',
  '@emotion/styled',
  'styled-components'
];

const usedStylingLibraries = stylingLibraries.filter(lib => 
  packageJson.dependencies[lib] || packageJson.devDependencies[lib]
);

if (usedStylingLibraries.length > 1) {
  console.log(`⚠️  Found ${usedStylingLibraries.length} styling libraries:`);
  usedStylingLibraries.forEach(lib => console.log(`  - ${lib}`));
  console.log('\n  Recommendation: Keep @emotion (used by MUI), remove styled-components');
} else {
  console.log('✅ No duplicate styling libraries');
}

// Calculate potential savings
const totalUnused = actualUnusedDeps.length + actualUnusedDevDeps.length;
const optimizationScore = totalUnused === 0 ? 100 : 
  ((results.totalDependencies + results.totalDevDependencies - totalUnused) / 
   (results.totalDependencies + results.totalDevDependencies) * 100);

console.log(`\n📈 Dependency Optimization Score: ${optimizationScore.toFixed(1)}%`);

if (totalUnused > 0) {
  console.log(`\n💡 Removing ${totalUnused} unused dependencies could reduce:`);
  console.log('  - node_modules size');
  console.log('  - Installation time');
  console.log('  - Potential security vulnerabilities');
}

// Exit with error if there are issues
if (actualUnusedDeps.length > 0 || results.missingDependencies.length > 0) {
  console.log('\n⚠️  Action required: Clean up dependencies');
  process.exit(1);
} else {
  console.log('\n✅ All dependencies are optimized!');
  process.exit(0);
}


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00
