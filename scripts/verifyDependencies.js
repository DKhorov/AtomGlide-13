/**
 * Verification script for advanced performance optimization dependencies
 * Checks that all required packages are installed and accessible
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Advanced Performance Optimization Dependencies...\n');

const requiredDependencies = {
  'react-window': 'Virtual scrolling',
  'dexie': 'IndexedDB management',
  'web-vitals': 'Performance monitoring',
};

const requiredDevDependencies = {
  'fast-check': 'Property-based testing',
};

let allInstalled = true;

// Check production dependencies
console.log('📦 Production Dependencies:');
Object.entries(requiredDependencies).forEach(([pkg, purpose]) => {
  try {
    require.resolve(pkg);
    console.log(`  ✅ ${pkg} - ${purpose}`);
  } catch (error) {
    console.log(`  ❌ ${pkg} - ${purpose} (NOT INSTALLED)`);
    allInstalled = false;
  }
});

// Check dev dependencies
console.log('\n🛠️  Development Dependencies:');
Object.entries(requiredDevDependencies).forEach(([pkg, purpose]) => {
  try {
    require.resolve(pkg);
    console.log(`  ✅ ${pkg} - ${purpose}`);
  } catch (error) {
    console.log(`  ❌ ${pkg} - ${purpose} (NOT INSTALLED)`);
    allInstalled = false;
  }
});

// Check AVIF support in craco config
console.log('\n⚙️  Build Configuration:');
const cracoConfigPath = path.join(__dirname, '..', 'craco.config.js');
if (fs.existsSync(cracoConfigPath)) {
  const cracoConfig = fs.readFileSync(cracoConfigPath, 'utf8');
  if (cracoConfig.includes('avif')) {
    console.log('  ✅ AVIF image support configured in craco.config.js');
  } else {
    console.log('  ❌ AVIF image support NOT configured in craco.config.js');
    allInstalled = false;
  }
} else {
  console.log('  ❌ craco.config.js not found');
  allInstalled = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allInstalled) {
  console.log('✅ All dependencies and configurations verified successfully!');
  process.exit(0);
} else {
  console.log('❌ Some dependencies or configurations are missing.');
  console.log('Run: npm install');
  process.exit(1);
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
