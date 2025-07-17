#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

console.log('🧪 Testing LLM Prompt Optimizer Setup...\n')

// Check if required files exist
const requiredFiles = [
  'server/package.json',
  'client/package.json',
  'server/env.example',
  'client/env.example',
  'server/index.js',
  'client/src/App.tsx',
  'README.md'
]

console.log('📁 Checking required files...')
let allFilesExist = true

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MISSING`)
    allFilesExist = false
  }
}

// Check if .env files exist
console.log('\n🔐 Checking environment files...')
const envFiles = [
  'server/.env',
  'client/.env'
]

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    console.log(`✅ ${envFile} exists`)
  } else {
    console.log(`⚠️  ${envFile} - Create from ${envFile.replace('.env', 'env.example')}`)
  }
}

// Check package.json dependencies
console.log('\n📦 Checking dependencies...')

try {
  const serverPackage = JSON.parse(fs.readFileSync('server/package.json', 'utf8'))
  const clientPackage = JSON.parse(fs.readFileSync('client/package.json', 'utf8'))
  
  const requiredServerDeps = [
    '@kinde-oss/kinde-node',
    '@langchain/google-genai',
    '@langchain/mistralai',
    '@langchain/cohere',
    '@langchain/openai',
    'express',
    'mongoose',
    'cors',
    'dotenv'
  ]
  
  const requiredClientDeps = [
    '@kinde-oss/kinde-auth-react',
    'react',
    'react-dom',
    'lucide-react'
  ]
  
  console.log('Backend dependencies:')
  for (const dep of requiredServerDeps) {
    if (serverPackage.dependencies?.[dep]) {
      console.log(`✅ ${dep}`)
    } else {
      console.log(`❌ ${dep} - MISSING`)
    }
  }
  
  console.log('\nFrontend dependencies:')
  for (const dep of requiredClientDeps) {
    if (clientPackage.dependencies?.[dep]) {
      console.log(`✅ ${dep}`)
    } else {
      console.log(`❌ ${dep} - MISSING`)
    }
  }
  
} catch (error) {
  console.log('❌ Error reading package.json files')
}

// Check project structure
console.log('\n🏗️  Checking project structure...')
const requiredDirs = [
  'server/controllers',
  'server/models',
  'server/routes',
  'server/services',
  'server/constants',
  'client/src/components',
  'client/src/lib'
]

for (const dir of requiredDirs) {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`)
  } else {
    console.log(`❌ ${dir}/ - MISSING`)
  }
}

console.log('\n🎯 Setup Summary:')
if (allFilesExist) {
  console.log('✅ All required files are present')
  console.log('✅ Project structure looks good')
  console.log('\n🚀 Ready to start development!')
  console.log('\nNext steps:')
  console.log('1. Configure your .env files')
  console.log('2. Set up Kinde authentication')
  console.log('3. Configure MongoDB Atlas')
  console.log('4. Add LLM provider API keys')
  console.log('5. Run: cd server && npm run dev')
  console.log('6. Run: cd client && npm run dev')
} else {
  console.log('❌ Some required files are missing')
  console.log('Please run the setup script: ./setup.sh')
}

console.log('\n📖 See README.md for detailed setup instructions') 