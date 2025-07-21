#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

// Configuration
const PUBLIC_DIR = path.join(process.cwd(), 'public')
const IMAGE_DIRS = ['images', 'media']
const FORMATS = ['jpg', 'jpeg', 'png', 'webp']
const SIZES = [640, 750, 1080, 1920] // Common responsive sizes

console.log('🖼️  Starting image optimization...')

// Create optimized directory if it doesn't exist
const optimizedDir = path.join(PUBLIC_DIR, 'optimized')
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true })
}

// Process all image directories
IMAGE_DIRS.forEach(dir => {
  const fullDir = path.join(PUBLIC_DIR, dir)
  if (!fs.existsSync(fullDir)) return

  console.log(`\n📁 Processing ${dir} directory...`)
  processDirectory(fullDir)
})

/**
 * Process all images in a directory recursively
 */
function processDirectory(directory, relativePath = '') {
  const files = fs.readdirSync(directory, { withFileTypes: true })
  
  files.forEach(file => {
    const fullPath = path.join(directory, file.name)
    
    if (file.isDirectory()) {
      // Process subdirectories recursively
      const newRelativePath = path.join(relativePath, file.name)
      processDirectory(fullPath, newRelativePath)
    } else if (file.isFile() && isImage(file.name)) {
      // Process image file
      const relativeFilePath = path.join(relativePath, file.name)
      optimizeImage(fullPath, relativeFilePath)
    }
  })
}

/**
 * Check if a file is an image based on extension
 */
function isImage(filename) {
  const ext = path.extname(filename).toLowerCase().substring(1)
  return FORMATS.includes(ext)
}

/**
 * Optimize an image and create responsive versions
 */
function optimizeImage(imagePath, relativePath) {
  const filename = path.basename(imagePath, path.extname(imagePath))
  const outputDir = path.join(optimizedDir, path.dirname(relativePath))
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  try {
    // Create WebP version at original size
    const webpOutput = path.join(outputDir, `${filename}.webp`)
    sharp(imagePath)
      .webp({ quality: 80 })
      .toFile(webpOutput)
      .then(() => {
        console.log(`  ✅ Created WebP: ${webpOutput}`)
      })
      .catch(err => {
        console.error(`  ❌ Error creating WebP for ${filename}:`, err.message)
      })
    
    // Create responsive versions
    SIZES.forEach(width => {
      const responsiveOutput = path.join(outputDir, `${filename}-${width}.webp`)
      
      sharp(imagePath)
        .resize(width)
        .webp({ quality: 75 })
        .toFile(responsiveOutput)
        .then(() => {
          console.log(`  ✅ Created ${width}px: ${responsiveOutput}`)
        })
        .catch(err => {
          console.error(`  ❌ Error creating ${width}px version for ${filename}:`, err.message)
        })
    })
  } catch (error) {
    console.error(`  ❌ Failed to process ${imagePath}:`, error.message)
  }
}

console.log('\n🎉 Image optimization complete!')
console.log('\n💡 Usage tips:')
console.log('  • Use next/image with these optimized images')
console.log('  • Access optimized images at /optimized/[original-path]/[filename].webp')
console.log('  • Responsive versions available at /optimized/[original-path]/[filename]-[width].webp')
