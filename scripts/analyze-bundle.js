#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 Analyzing bundle size...\n')

// Build the project first
try {
  console.log('Building project...')
  execSync('pnpm build', { stdio: 'inherit' })
} catch (error) {
  console.error('Build failed:', error.message)
  process.exit(1)
}

// Analyze .next folder
const nextDir = path.join(process.cwd(), '.next')
const staticDir = path.join(nextDir, 'static')

if (!fs.existsSync(staticDir)) {
  console.error('Static directory not found. Make sure the build completed successfully.')
  process.exit(1)
}

// Function to get file size in KB
const getFileSize = (filePath) => {
  const stats = fs.statSync(filePath)
  return (stats.size / 1024).toFixed(2)
}

// Function to analyze directory
const analyzeDirectory = (dir, label) => {
  if (!fs.existsSync(dir)) return

  console.log(`\n📁 ${label}:`)
  const files = fs.readdirSync(dir, { withFileTypes: true })
  
  let totalSize = 0
  const fileData = []

  files.forEach(file => {
    if (file.isFile()) {
      const filePath = path.join(dir, file.name)
      const size = parseFloat(getFileSize(filePath))
      totalSize += size
      fileData.push({ name: file.name, size })
    }
  })

  // Sort by size (largest first)
  fileData.sort((a, b) => b.size - a.size)
  
  fileData.slice(0, 10).forEach(file => {
    const sizeColor = file.size > 100 ? '🔴' : file.size > 50 ? '🟡' : '🟢'
    console.log(`  ${sizeColor} ${file.name}: ${file.size} KB`)
  })
  
  console.log(`  📊 Total: ${totalSize.toFixed(2)} KB`)
}

// Analyze chunks
const chunksDir = path.join(staticDir, 'chunks')
analyzeDirectory(chunksDir, 'JavaScript Chunks')

// Analyze CSS
const cssDir = path.join(staticDir, 'css')
analyzeDirectory(cssDir, 'CSS Files')

// Analyze media
const mediaDir = path.join(staticDir, 'media')
analyzeDirectory(mediaDir, 'Media Files')

console.log('\n✅ Bundle analysis complete!')
console.log('\n💡 Optimization tips:')
console.log('  • Files over 100KB should be code-split')
console.log('  • Consider lazy loading for non-critical components')
console.log('  • Use dynamic imports for heavy libraries')
console.log('  • Optimize images with next/image')
