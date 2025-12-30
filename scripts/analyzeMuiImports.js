/**
 * Script to analyze Material-UI imports and identify optimization opportunities
 * This helps ensure tree shaking is working effectively
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const results = {
  totalFiles: 0,
  filesWithMui: 0,
  namedImports: 0,
  defaultImports: 0,
  wildcardImports: 0,
  issues: []
};

/**
 * Recursively find all JS/JSX files
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('build')) {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Analyze MUI imports in a file
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(srcDir, filePath);
  
  results.totalFiles++;
  
  // Check for MUI imports
  const muiImportRegex = /@mui\/(material|icons-material|lab)/g;
  const hasMuiImports = muiImportRegex.test(content);
  
  if (!hasMuiImports) {
    return;
  }
  
  results.filesWithMui++;
  
  // Check for different import patterns
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Named imports (good) - import { Button, Box } from '@mui/material'
    if (line.match(/import\s+\{[^}]+\}\s+from\s+['"]@mui\/(material|icons-material|lab)['"]/)) {
      results.namedImports++;
    }
    
    // Default imports (bad for tree shaking) - import Material from '@mui/material'
    if (line.match(/import\s+\w+\s+from\s+['"]@mui\/(material|icons-material|lab)['"]/)) {
      results.defaultImports++;
      results.issues.push({
        file: relativePath,
        line: index + 1,
        type: 'default-import',
        content: line.trim(),
        suggestion: 'Use named imports instead: import { Component } from "@mui/material"'
      });
    }
    
    // Wildcard imports (bad) - import * as Material from '@mui/material'
    if (line.match(/import\s+\*\s+as\s+\w+\s+from\s+['"]@mui\/(material|icons-material|lab)['"]/)) {
      results.wildcardImports++;
      results.issues.push({
        file: relativePath,
        line: index + 1,
        type: 'wildcard-import',
        content: line.trim(),
        suggestion: 'Use named imports instead: import { Component } from "@mui/material"'
      });
    }
    
    // Deep imports (suboptimal) - import Button from '@mui/material/Button'
    if (line.match(/import\s+\w+\s+from\s+['"]@mui\/material\/\w+['"]/)) {
      results.issues.push({
        file: relativePath,
        line: index + 1,
        type: 'deep-import',
        content: line.trim(),
        suggestion: 'Use top-level named imports: import { Button } from "@mui/material"'
      });
    }
  });
}

/**
 * Main analysis
 */
function main() {
  console.log('🔍 Analyzing Material-UI imports...\n');
  
  const files = findFiles(srcDir);
  files.forEach(analyzeFile);
  
  console.log('📊 Analysis Results:');
  console.log('='.repeat(50));
  console.log(`Total files analyzed: ${results.totalFiles}`);
  console.log(`Files with MUI imports: ${results.filesWithMui}`);
  console.log(`Named imports (✓ good): ${results.namedImports}`);
  console.log(`Default imports (✗ bad): ${results.defaultImports}`);
  console.log(`Wildcard imports (✗ bad): ${results.wildcardImports}`);
  console.log('='.repeat(50));
  
  if (results.issues.length > 0) {
    console.log(`\n⚠️  Found ${results.issues.length} optimization opportunities:\n`);
    
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.file}:${issue.line}`);
      console.log(`   Type: ${issue.type}`);
      console.log(`   Current: ${issue.content}`);
      console.log(`   Suggestion: ${issue.suggestion}`);
      console.log('');
    });
  } else {
    console.log('\n✅ All MUI imports are optimized for tree shaking!');
  }
  
  // Calculate optimization score
  const totalImports = results.namedImports + results.defaultImports + results.wildcardImports;
  const score = totalImports > 0 ? (results.namedImports / totalImports * 100).toFixed(1) : 100;
  
  console.log(`\n📈 Tree Shaking Optimization Score: ${score}%`);
  
  if (score < 90) {
    console.log('⚠️  Consider optimizing imports to improve tree shaking');
    process.exit(1);
  } else {
    console.log('✅ Good tree shaking optimization!');
  }
}

main();


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
