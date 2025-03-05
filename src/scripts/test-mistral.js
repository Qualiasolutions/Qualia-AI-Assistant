#!/usr/bin/env node

/**
 * Mistral AI Test Script
 * 
 * This script tests the Mistral AI integration by:
 * 1. Verifying environment variables
 * 2. Testing the API connection
 * 3. Making a sample request
 */

require('dotenv').config({ path: '.env.local' });
const { MistralClient } = require('@mistralai/mistralai');

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
${colors.bright}${colors.blue}     Mistral AI Diagnostic Test      ${colors.reset}
${colors.bright}${colors.blue}======================================${colors.reset}
`);

// Function to verify environment variables
function checkEnvironmentVariables() {
  console.log(`${colors.bright}Step 1: Checking environment variables${colors.reset}`);
  
  const apiKey = process.env.MISTRAL_API_KEY;
  const modelName = process.env.MISTRAL_MODEL;
  
  if (!apiKey) {
    console.error(`${colors.red}✗ MISTRAL_API_KEY is not set${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.green}✓ MISTRAL_API_KEY is set ${colors.reset}`);
  
  if (!modelName) {
    console.log(`${colors.yellow}! MISTRAL_MODEL is not set, will use default${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ MISTRAL_MODEL is set to ${modelName}${colors.reset}`);
  }
  
  return true;
}

// Function to test API connection
async function testAPIConnection() {
  console.log(`\n${colors.bright}Step 2: Testing API connection${colors.reset}`);
  
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    const client = new MistralClient(apiKey);
    
    const model = process.env.MISTRAL_MODEL || 'mistral-large-latest';
    console.log(`${colors.yellow}Testing connection with model: ${model}${colors.reset}`);
    
    const response = await client.chat({
      model: model,
      messages: [{ role: 'user', content: 'Hello! Are you working properly?' }],
    });
    
    if (response.choices && response.choices.length > 0) {
      console.log(`${colors.green}✓ Successfully connected to Mistral API${colors.reset}`);
      console.log(`\n${colors.yellow}Response:${colors.reset} ${response.choices[0].message.content}`);
      return true;
    } else {
      console.error(`${colors.red}✗ API returned an unexpected response${colors.reset}`);
      console.error(`Response:`, response);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Failed to connect to Mistral API${colors.reset}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  try {
    const envCheck = checkEnvironmentVariables();
    if (!envCheck) {
      throw new Error('Environment variables check failed');
    }
    
    const apiCheck = await testAPIConnection();
    if (!apiCheck) {
      throw new Error('API connection test failed');
    }
    
    console.log(`
${colors.bright}${colors.green}======================================${colors.reset}
${colors.bright}${colors.green}     Mistral AI Test Successful      ${colors.reset}
${colors.bright}${colors.green}======================================${colors.reset}

${colors.green}✓ Environment variables are properly set${colors.reset}
${colors.green}✓ Successfully connected to Mistral API${colors.reset}
${colors.green}✓ Received response from model${colors.reset}

Your Mistral AI integration appears to be working correctly!
`);
  } catch (error) {
    console.error(`
${colors.bright}${colors.red}======================================${colors.reset}
${colors.bright}${colors.red}      Mistral AI Test Failed          ${colors.reset}
${colors.bright}${colors.red}======================================${colors.reset}

${colors.red}Error: ${error.message}${colors.reset}

Please fix the issues above and try again.
`);
    process.exit(1);
  }
}

main(); 