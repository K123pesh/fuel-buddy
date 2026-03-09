# Voice Ordering System Setup Guide

This guide explains how to set up and use the voice ordering functionality in the Fuel Buddy application.

## Overview

The voice ordering system allows users to place fuel orders using natural voice commands. It includes:

- **Backend WebSocket Server**: Handles real-time voice communication
- **Frontend Voice Interface**: React components for voice interaction
- **AI Integration**: OpenAI API for speech processing and order management
- **Audio Processing**: Real-time audio recording and transmission

## Prerequisites

### Backend Requirements

1. **Node.js** (v18 or higher)
2. **OpenAI API Key**: Required for voice processing
3. **MongoDB**: For session and order data storage

### Frontend Requirements

1. **Modern Browser**: Chrome, Firefox, Safari, or Edge (with WebRTC support)
2. **Microphone Access**: Users must grant microphone permissions
3. **WebSocket Support**: Required for real-time communication

## Environment Setup

### Backend Configuration

1. **Set Environment Variables** in `backend/.env`:

```env
PORT=5003
MONGODB_URI=mongodb://localhost:27017/fuel-buddy
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
OPENAI_API_KEY=your_openai_api_key_here
```

2. **Install Dependencies**:

```bash
cd backend
npm install
```

3. **Start Backend Server**:

```bash
npm run dev
```

### Frontend Configuration

1. **Set Environment Variables** in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5003/api
```

2. **Install Dependencies**:

```bash
cd frontend
npm install
```

3. **Start Frontend Development Server**:

```bash
npm run dev
```

## System Architecture

### Backend Components

1. **Voice Session Management** (`backend/routes/voice.js`)
   - Creates and manages voice ordering sessions
   - Handles WebSocket connections
   - Processes audio and text messages
   - Integrates with OpenAI for speech processing

2. **WebSocket Server** (`backend/index.js`)
   - Real-time communication between frontend and backend
   - Session-based message routing
   - Error handling and connection management

3. **AI Integration** (`backend/routes/voice.js`)
   - OpenAI API integration for speech-to-text
   - Natural language processing for order extraction
   - Order confirmation and processing

### Frontend Components

1. **VoiceOrderingButton** (`frontend/src/components/common/VoiceOrderingButton.tsx`)
   - Simple button to trigger voice ordering
   - Opens the voice ordering dialog

2. **VoiceOrderingDialog** (`frontend/src/components/common/VoiceOrderingDialog.tsx`)
   - Main voice ordering interface
   - Audio recording and playback
   - Real-time message display
   - WebSocket communication

## Usage Instructions

### For Users

1. **Start Voice Ordering**:
   - Click the "Voice Order" button in the application
   - Grant microphone permissions when prompted

2. **Place an Order**:
   - Speak clearly about your fuel order
   - Include: fuel type, quantity, delivery address, payment method
   - Example: "I want to order 20 liters of premium petrol to my home address, please use cash on delivery"

3. **Confirm Order**:
   - The system will confirm all order details
   - You can make corrections if needed
   - Final confirmation completes the order

### For Developers

1. **Testing the System**:
   - Use the test script: `node test-voice-ordering.js`
   - This tests session creation, WebSocket connections, and message processing

2. **Integration Points**:
   - Voice orders are processed through the existing order system
   - Order data is stored in the same database as regular orders
   - Payment processing works the same way

## Technical Details

### Audio Processing Flow

1. **Frontend Recording**:
   - Uses WebRTC MediaRecorder API
   - Records audio in WebM format
   - Converts to ArrayBuffer for transmission

2. **WebSocket Transmission**:
   - Audio data sent as JSON with type 'audio'
   - Includes array of audio sample data
   - Real-time transmission during recording

3. **Backend Processing**:
   - Receives audio data via WebSocket
   - Processes through OpenAI Whisper API (planned)
   - Extracts order information using GPT-3.5-turbo
   - Responds with confirmation and next steps

### Message Types

- **'assistant'**: AI responses to user input
- **'user'**: User voice/text input
- **'error'**: Error messages and troubleshooting
- **'order_ready'**: Order details ready for confirmation
- **'order_confirmed'**: Order successfully placed
- **'audio'**: Raw audio data from frontend
- **'text'**: Text input for testing/fallback

### Session Management

- Sessions are created with UUID identifiers
- Sessions expire after 1 hour of inactivity
- WebSocket connections are tied to specific sessions
- Session data includes order progress and user messages

## Troubleshooting

### Common Issues

1. **Microphone Not Working**:
   - Check browser permissions
   - Ensure no other applications are using the microphone
   - Try refreshing the page

2. **WebSocket Connection Failed**:
   - Verify backend server is running
   - Check network connectivity
   - Ensure correct WebSocket URL configuration

3. **OpenAI API Errors**:
   - Verify OPENAI_API_KEY is set correctly
   - Check API usage limits
   - Ensure API key has necessary permissions

4. **Voice Recognition Issues**:
   - Speak clearly and at normal volume
   - Minimize background noise
   - Use simple, direct language

### Debug Mode

Enable debug logging by setting environment variables:

```env
DEBUG=voice:*
NODE_ENV=development
```

### Testing

Run the comprehensive test suite:

```bash
# Test backend voice API
node test-voice-ordering.js

# Test individual components
npm test
```

## Security Considerations

1. **Audio Data**: Audio is processed locally and transmitted securely via WebSocket
2. **Session Security**: Each session has a unique UUID and expires automatically
3. **API Keys**: OpenAI API keys should be kept secure and not exposed to frontend
4. **User Privacy**: Voice data is not stored permanently, only used for order processing

## Future Enhancements

1. **Real-time Speech-to-Text**: Integrate OpenAI Whisper API for live transcription
2. **Voice Biometrics**: Add voice recognition for user authentication
3. **Multi-language Support**: Support for multiple languages
4. **Voice Commands**: Specific voice commands for common actions
5. **Offline Mode**: Basic functionality without internet connection

## Support

For issues or questions about the voice ordering system:

1. Check the troubleshooting section above
2. Review the test scripts for expected behavior
3. Check browser developer console for errors
4. Verify all environment variables are set correctly
5. Contact the development team for technical issues