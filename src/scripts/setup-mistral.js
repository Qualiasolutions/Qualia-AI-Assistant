#!/usr/bin/env node

/**
 * Mistral AI Setup Script
 * 
 * This script helps with migrating from OpenAI to Mistral AI by:
 * 1. Installing necessary dependencies
 * 2. Updating environment variables
 * 3. Testing the Mistral AI connection
 */

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`
${colors.bright}${colors.blue}======================================${colors.reset}
${colors.bright}${colors.blue}    Mistral AI Integration Setup    ${colors.reset}
${colors.bright}${colors.blue}======================================${colors.reset}

This script will help you set up Mistral AI integration for the Tzironis Business Suite.
`);

// Step 1: Install dependencies
async function installDependencies() {
  console.log(`\n${colors.bright}Step 1: Installing Mistral AI SDK${colors.reset}`);
  
  try {
    console.log('Installing @mistralai/mistralai...');
    execSync('npm install @mistralai/mistralai@^0.1.3', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Successfully installed Mistral AI SDK${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Failed to install dependencies:${colors.reset}`, error.message);
    return false;
  }
}

// Step 2: Update environment variables
async function updateEnvironmentVariables() {
  console.log(`\n${colors.bright}Step 2: Setting up environment variables${colors.reset}`);
  
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}Do you have a Mistral API key? (yes/no): ${colors.reset}`, (answer) => {
      if (answer.toLowerCase() === 'no') {
        console.log(`
${colors.yellow}You'll need a Mistral API key to continue.${colors.reset}
1. Go to https://console.mistral.ai/ to create an account
2. Generate an API key from your dashboard
3. Come back and run this script again
`);
        resolve(false);
        return;
      }
      
      rl.question(`${colors.yellow}Enter your Mistral API key: ${colors.reset}`, (apiKey) => {
        if (!apiKey.trim()) {
          console.log(`${colors.red}✗ API key cannot be empty${colors.reset}`);
          resolve(false);
          return;
        }
        
        // Ask which Mistral model to use
        console.log(`
${colors.yellow}Available Mistral models:${colors.reset}
1. mistral-tiny       (fastest, lowest quality)
2. mistral-small      (balanced speed/quality)
3. mistral-medium     (good quality)
4. mistral-large      (highest quality, slowest)
5. mistral-large-latest (recommended default)
`);
        
        rl.question(`${colors.yellow}Select a model (1-5, default: 5): ${colors.reset}`, (modelChoice) => {
          const models = [
            'mistral-tiny',
            'mistral-small', 
            'mistral-medium', 
            'mistral-large',
            'mistral-large-latest'
          ];
          
          const modelIndex = parseInt(modelChoice) - 1;
          const model = models[modelIndex] || 'mistral-large-latest';
          
          // Create or update .env.local file
          const envPath = path.join(process.cwd(), '.env.local');
          let envContent = '';
          
          if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
            
            // Replace OpenAI variables if they exist
            envContent = envContent.replace(/OPENAI_API_KEY=.*/g, `# OPENAI_API_KEY=sk-xxxx (replaced with Mistral)`);
            envContent = envContent.replace(/ASSISTANT_ID=.*/g, `# ASSISTANT_ID=asst-xxxx (replaced with Mistral)`);
            
            // Add Mistral variables if they don't exist
            if (!envContent.includes('MISTRAL_API_KEY')) {
              envContent += `\n# Mistral AI Configuration\nMISTRAL_API_KEY=${apiKey}\nMISTRAL_MODEL=${model}\n`;
            } else {
              // Update existing Mistral variables
              envContent = envContent.replace(/MISTRAL_API_KEY=.*/g, `MISTRAL_API_KEY=${apiKey}`);
              envContent = envContent.replace(/MISTRAL_MODEL=.*/g, `MISTRAL_MODEL=${model}`);
            }
          } else {
            // Create new .env.local file
            envContent = `# Mistral AI Configuration\nMISTRAL_API_KEY=${apiKey}\nMISTRAL_MODEL=${model}\n`;
          }
          
          // Write updated content back to file
          fs.writeFileSync(envPath, envContent);
          
          console.log(`${colors.green}✓ Successfully updated environment variables${colors.reset}`);
          console.log(`${colors.green}✓ Using Mistral AI model: ${model}${colors.reset}`);
          resolve(true);
        });
      });
    });
  });
}

// Step 3: Test connection
async function testConnection() {
  console.log(`\n${colors.bright}Step 3: Testing Mistral AI connection${colors.reset}`);
  
  try {
    // Create a temporary test file
    const testFile = path.join(process.cwd(), 'mistral-test.js');
    const testCode = `
const MistralClient = require('@mistralai/mistralai').default;
require('dotenv').config({ path: '.env.local' });

async function testMistral() {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    const client = new MistralClient(apiKey);
    
    const model = process.env.MISTRAL_MODEL || 'mistral-large-latest';
    console.log('Testing connection with model:', model);
    
    const response = await client.chat({
      model: model,
      messages: [{ role: 'user', content: 'Hello! Are you working properly?' }],
    });
    
    console.log('Response:', response.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

testMistral().then(success => {
  process.exit(success ? 0 : 1);
});
`;

    fs.writeFileSync(testFile, testCode);
    
    // Install dotenv if not already installed
    try {
      require.resolve('dotenv');
    } catch (e) {
      console.log('Installing dotenv for testing...');
      execSync('npm install dotenv', { stdio: 'inherit' });
    }
    
    // Run the test
    console.log('Testing Mistral AI connection...');
    execSync('node mistral-test.js', { stdio: 'inherit' });
    
    // Clean up
    fs.unlinkSync(testFile);
    
    console.log(`${colors.green}✓ Successfully connected to Mistral AI${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Failed to connect to Mistral AI:${colors.reset}`, error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    const dependenciesInstalled = await installDependencies();
    if (!dependenciesInstalled) {
      throw new Error('Failed to install dependencies');
    }
    
    const environmentSetup = await updateEnvironmentVariables();
    if (!environmentSetup) {
      throw new Error('Failed to set up environment variables');
    }
    
    const connectionTested = await testConnection();
    if (!connectionTested) {
      throw new Error('Failed to connect to Mistral AI');
    }
    
    console.log(`
${colors.bright}${colors.green}======================================${colors.reset}
${colors.bright}${colors.green}    Mistral AI Setup Complete!      ${colors.reset}
${colors.bright}${colors.green}======================================${colors.reset}

${colors.green}✓ Mistral AI SDK installed${colors.reset}
${colors.green}✓ Environment variables configured${colors.reset}
${colors.green}✓ Connection to Mistral AI verified${colors.reset}

You can now use Mistral AI in your application!
`);
  } catch (error) {
    console.error(`
${colors.bright}${colors.red}======================================${colors.reset}
${colors.bright}${colors.red}    Mistral AI Setup Failed         ${colors.reset}
${colors.bright}${colors.red}======================================${colors.reset}

${colors.red}Error: ${error.message}${colors.reset}

Please fix the issues above and try again.
`);
  } finally {
    rl.close();
  }
}

main(); 