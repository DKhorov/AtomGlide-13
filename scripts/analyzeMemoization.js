/**
 * Memoization Analyzer
 * Analyzes components and suggests memoization opportunities
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

const results = {
  totalComponents: 0,
  memoizedComponents: 0,
  needsMemoization: [],
  suggestions: [],
};

/**
 * Find all component files
 */
function findComponentFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('build')) {
        findComponentFiles(filePath, fileList);
      }
    } else if ((file.endsWith('.jsx') || file.endsWith('.tsx')) && 
               !file.endsWith('.test.jsx') && 
               !file.endsWith('.test.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Analyze component file
 */
function analyzeComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(srcDir, filePath);
  
  // Check if it's a component
  const isComponent = /^(const|function|class)\s+[A-Z]\w+/.test(content) ||
                     /export\s+(default\s+)?(function|class)\s+[A-Z]\w+/.test(content);
  
  if (!isComponent) return;
  
  results.totalComponents++;
  
  // Check if already memoized
  const isMemoized = /React\.memo\(|memo\(/.test(content);
  
  if (isMemoized) {
    results.memoizedComponents++;
    return;
  }
  
  // Check if component receives props
  const hasProps = /\(props\)|(\{\s*\w+.*\}\s*\))|(\w+\s*:\s*\w+)/.test(content);
  
  // Check if component is in a list (likely needs memo)
  const isInList = content.includes('.map(') || content.includes('key=');
  
  // Check if component has expensive operations
  const hasExpensiveOps = content.includes('filter(') || 
                         content.includes('reduce(') ||
                         content.includes('sort(') ||
                         content.includes('forEach(');
  
  // Check if component uses callbacks
  const hasCallbacks = /on[A-Z]\w+/.test(content);
  
  // Calculate priority
  let priority = 'low';
  let reasons = [];
  
  if (isInList) {
    priority = 'high';
    reasons.push('Component used in list (map)');
  }
  
  if (hasExpensiveOps) {
    priority = priority === 'high' ? 'high' : 'medium';
    reasons.push('Has expensive operations');
  }
  
  if (hasCallbacks && hasProps) {
    priority = priority === 'high' ? 'high' : 'medium';
    reasons.push('Receives callback props');
  }
  
  if (hasProps && (isInList || hasExpensiveOps || hasCallbacks)) {
    results.needsMemoization.push({
      file: relativePath,
      priority,
      reasons,
    });
  }
}

/**
 * Generate suggestions
 */
function generateSuggestions() {
  const highPriority = results.needsMemoization.filter(c => c.priority === 'high');
  const mediumPriority = results.needsMemoization.filter(c => c.priority === 'medium');
  
  if (highPriority.length > 0) {
    results.suggestions.push({
      type: 'critical',
      message: `${highPriority.length} components need immediate memoization`,
      components: highPriority,
    });
  }
  
  if (mediumPriority.length > 0) {
    results.suggestions.push({
      type: 'recommended',
      message: `${mediumPriority.length} components would benefit from memoization`,
      components: mediumPriority,
    });
  }
}

/**
 * Main analysis
 */
function main() {
  console.log('🔍 Analyzing components for memoization opportunities...\n');
  
  const files = findComponentFiles(srcDir);
  files.forEach(analyzeComponent);
  
  generateSuggestions();
  
  console.log('📊 Memoization Analysis Results:');
  console.log('='.repeat(60));
  console.log(`Total components: ${results.totalComponents}`);
  console.log(`Already memoized: ${results.memoizedComponents}`);
  console.log(`Need memoization: ${results.needsMemoization.length}`);
  console.log('='.repeat(60));
  
  if (results.needsMemoization.length === 0) {
    console.log('\n✅ All components are optimized!');
    return;
  }
  
  // Group by priority
  const byPriority = {
    high: results.needsMemoization.filter(c => c.priority === 'high'),
    medium: results.needsMemoization.filter(c => c.priority === 'medium'),
    low: results.needsMemoization.filter(c => c.priority === 'low'),
  };
  
  if (byPriority.high.length > 0) {
    console.log('\n🔴 HIGH PRIORITY (Immediate action needed):');
    byPriority.high.forEach(comp => {
      console.log(`\n  ${comp.file}`);
      comp.reasons.forEach(reason => console.log(`    - ${reason}`));
    });
  }
  
  if (byPriority.medium.length > 0) {
    console.log('\n🟡 MEDIUM PRIORITY (Recommended):');
    byPriority.medium.forEach(comp => {
      console.log(`\n  ${comp.file}`);
      comp.reasons.forEach(reason => console.log(`    - ${reason}`));
    });
  }
  
  if (byPriority.low.length > 0) {
    console.log('\n🟢 LOW PRIORITY (Optional):');
    byPriority.low.forEach(comp => {
      console.log(`  - ${comp.file}`);
    });
  }
  
  // Calculate optimization score
  const optimizationScore = results.totalComponents > 0
    ? (results.memoizedComponents / results.totalComponents * 100).toFixed(1)
    : 100;
  
  console.log(`\n📈 Memoization Score: ${optimizationScore}%`);
  
  if (optimizationScore < 50) {
    console.log('⚠️  Low memoization score. Consider optimizing high-priority components.');
    process.exit(1);
  } else if (optimizationScore < 80) {
    console.log('💡 Good progress! Continue optimizing medium-priority components.');
  } else {
    console.log('✅ Excellent memoization coverage!');
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
