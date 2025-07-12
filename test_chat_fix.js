// Test script to verify chat functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testChatFunctionality() {
    try {
        console.log('Testing chat functionality...');
        
        // Test 1: Check if server is running
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Server is running:', healthResponse.data);
        
        // Note: This is a basic test. In a real scenario, you would need to:
        // 1. Register/login a user
        // 2. Set up an API key
        // 3. Send multiple chat messages
        // 4. Verify conversation history is maintained
        
        console.log('✅ Basic server connectivity test passed');
        console.log('To fully test the chat functionality:');
        console.log('1. Start the frontend and backend');
        console.log('2. Register/login with a user');
        console.log('3. Configure an API key in Settings');
        console.log('4. Open Smart Assistant and send multiple messages');
        console.log('5. Verify that subsequent messages work correctly');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testChatFunctionality();