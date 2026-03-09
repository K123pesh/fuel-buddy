import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAIConfiguration() {
  console.log('Testing AI Configuration...\n');

  // Check if API key is set
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY is not set in environment variables');
    console.log('\nTo fix this:');
    console.log('1. Get an API key from https://aistudio.google.com/');
    console.log('2. Add it to your backend/.env file as: GEMINI_API_KEY=your_key_here');
    console.log('3. Restart the server after making changes');
    return;
  }

  console.log('✅ GEMINI_API_KEY is set');

  // Initialize the AI client
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Test available models
  console.log('\nTesting model availability...');
  
  const modelNames = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'];
  let modelFound = false;

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Try a simple test
      const result = await model.generateContent('Hello');
      console.log(`✅ Model ${modelName} is working correctly`);
      modelFound = true;
      break;
    } catch (error) {
      console.log(`❌ Model ${modelName} failed: ${error.message}`);
    }
  }

  if (!modelFound) {
    console.log('\n❌ No models are working with your API key.');
    console.log('This could be because:');
    console.log('- Your API key doesn\'t have access to these models');
    console.log('- The models are not enabled in your Google Cloud project');
    console.log('- Your API key is invalid or expired');
    console.log('- You might need to enable billing for your Google Cloud project');
  } else {
    console.log('\n🎉 AI Configuration test passed!');
    console.log('Your AI chatbot should work correctly.');
  }
}

// Run the test
testAIConfiguration().catch(console.error);