# AI Configuration Guide

## Setting up Google Gemini AI

The Fuel Buddy application uses Google's Gemini AI to provide intelligent responses to user queries. To properly configure the AI functionality, follow these steps:

### 1. Obtain a Google Gemini API Key

1. Go to the [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API Key" or navigate to the API keys section
4. Create a new API key
5. In the Google Cloud Console, make sure to enable the Generative Language API:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select or create a project
   - Navigate to "APIs & Services > Library"
   - Search for "Generative Language API" and enable it
   - Ensure billing is enabled for your project
6. Make sure the API key has access to the Gemini models

### 2. Configure the API Key

1. Open the `.env` file in the `backend` directory
2. Replace the dummy API key with your actual API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Available Models

The application is configured to use these models in order of preference:
1. `gemini-pro` - Primary model
2. `gemini-1.5-flash` - Secondary model (faster responses)
3. `gemini-1.0-pro` - Fallback model

### 4. Troubleshooting Common Issues

#### Issue: "AI service is not properly configured"
- **Cause**: The GEMINI_API_KEY is missing, invalid, or doesn't have proper permissions
- **Solution**: Verify that your API key is correct and has access to the Gemini API

#### Issue: "AI service access denied"
- **Cause**: The API key exists but doesn't have the necessary permissions
- **Solution**: Regenerate the API key or ensure it has access to the required models

#### Issue: Model not found (404 error)
- **Cause**: The model name is incorrect or not available with your API key
- **Solution**: Check the Google AI Studio documentation for available models

### 5. Testing the Configuration

After setting up your API key:

1. Restart the backend server
2. Test the AI functionality through the chat interface
3. Or test directly using curl/Postman:
   ```bash
   curl -X POST http://localhost:5003/api/ai/simple-chat \
   -H "Content-Type: application/json" \
   -d '{"message": "Hello"}'
   ```

### 6. Security Best Practices

- Never commit your API key to version control
- Store the API key only in environment variables
- Restrict the API key to only the domains/IPs that need access
- Regularly rotate your API keys

### 7. Model Limitations

- Free tier API keys may have usage limitations
- Some advanced features may require paid access
- Response times may vary based on model and traffic