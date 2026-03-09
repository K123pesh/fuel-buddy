#!/usr/bin/env node

// Test script for voice ordering functionality
// Run from backend directory to access node_modules

const WebSocket = require('ws');
const axios = require('axios');

const API_BASE = 'http://localhost:5003/api';

async function testVoiceOrdering() {
  console.log('🎤 Testing Voice Ordering System...\n');

  try {
    // Step 1: Create voice session
    console.log('1. Creating voice session...');
    const sessionResponse = await axios.post(`${API_BASE}/voice/session`, {
      userId: 'test-user-123'
    });

    const { sessionId, wsUrl } = sessionResponse.data;
    console.log(`✅ Session created: ${sessionId}`);
    console.log(`📡 WebSocket URL: ${wsUrl}\n`);

    // Step 2: Test WebSocket connection
    console.log('2. Testing WebSocket connection...');
    
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      console.log('✅ WebSocket connected');
      
      // Send test message
      const testMessage = {
        type: 'audio',
        data: 'test-audio-data',
        format: 'wav'
      };
      
      ws.send(JSON.stringify(testMessage));
      console.log('📤 Sent test message');
    });

    ws.on('message', (data) => {
      const response = JSON.parse(data);
      console.log('📥 Received response:', response);
      
      if (response.type === 'text') {
        console.log('🤖 AI Response:', response.text);
      }
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
    });

    // Wait for responses
    setTimeout(() => {
      ws.close();
      console.log('\n🎉 Voice ordering test completed!');
    }, 5000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
    
    console.log('\n💡 Make sure:');
    console.log('- Backend server is running on port 5003');
    console.log('- OpenAI API key is set in backend/.env');
    console.log('- MongoDB is connected');
  }
}

// Run the test
testVoiceOrdering();
