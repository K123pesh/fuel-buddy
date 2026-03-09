import express from 'express';
import asyncHandler from 'express-async-handler';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

const router = express.Router();

// Store active voice sessions
const voiceSessions = new Map();

// Initialize OpenAI with API key
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-actual-key-will-be-set-by-user') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log('OpenAI initialized successfully');
} else {
  console.log('OpenAI API key not configured, using demo mode');
}

// Voice ordering system prompt
const VOICE_ORDERING_PROMPT = `You are a voice assistant for Fuel Buddy, an on-demand fuel delivery service. 

Your role is to help users place fuel orders through voice commands. You can:
1. Take fuel orders (petrol, diesel)
2. Collect delivery address information
3. Confirm order details
4. Process payment method selection
5. Provide order confirmations

Order process:
- Ask for fuel type (regular, premium, diesel)
- Ask for quantity in liters
- Ask for delivery address
- Ask for preferred delivery time
- Ask for payment method (cash on delivery, UPI, card)
- Confirm all details before placing order

Be conversational and natural. Always confirm order details before finalizing. If any information is missing, ask for it specifically.

Current fuel prices (approximate):
- Regular petrol: ₹102/liter
- Premium petrol: ₹108/liter  
- Diesel: ₹89/liter

Always speak in a friendly, helpful tone and keep responses concise for voice interaction.`;

// Create new voice session
router.post('/session', asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    userId: userId || null,
    createdAt: new Date(),
    messages: [],
    orderData: {},
    status: 'active'
  };

  voiceSessions.set(sessionId, session);

  // For development with Vite proxy, use relative URL
  // For production, construct full URL based on request
  const isDevelopment = process.env.NODE_ENV === 'development' ||
    req.get('host')?.includes('localhost');

  let wsUrl;
  if (isDevelopment) {
    // Use relative URL for Vite proxy - connect directly to backend WebSocket
    wsUrl = `ws://localhost:${process.env.PORT || 5003}/api/voice/ws/${sessionId}`;
  } else {
    // Production URL
    const protocol = req.protocol;
    const host = req.get('host');
    wsUrl = `${protocol === 'https' ? 'wss' : 'ws'}://${host}/api/voice/ws/${sessionId}`;
  }

  res.json({
    sessionId,
    message: 'Voice session created successfully',
    wsUrl: wsUrl
  });
}));

// WebSocket endpoint is handled by setupVoiceWebSocket function
// This route file only defines HTTP endpoints

// Alternative WebSocket setup using Express app's WebSocket server
export function setupVoiceWebSocket(app) {
  const wss = app.get('wss');

  wss.on('connection', (ws, req) => {
    try {
      // Extract session ID from the URL
      const url = new URL(req.url, `http://${req.headers.host}`);
      const pathParts = url.pathname.split('/');
      const sessionId = pathParts[pathParts.length - 1];

      console.log('WebSocket connection attempt for session:', sessionId);

      const session = voiceSessions.get(sessionId);

      if (!session) {
        console.log('Session not found:', sessionId);
        ws.close(1008, 'Session not found');
        return;
      }

      console.log(`Voice session connected: ${sessionId}`);

      // Store WebSocket connection
      session.ws = ws;

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'assistant',
        message: 'Hello! I\'m your Fuel Buddy voice assistant. I can help you order fuel delivery. What would you like to order today?'
      }));
    } catch (error) {
      console.error('Error handling WebSocket connection:', error);
      ws.close(1011, 'Internal server error');
    }

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'audio') {
          // Process audio with OpenAI Realtime API
          await processAudioMessage(session, message.audio);
        } else if (message.type === 'text') {
          // Process text message (for testing/fallback)
          await processTextMessage(session, message.text);
        } else if (message.type === 'order_confirm') {
          // Finalize order
          await finalizeOrder(session, message.orderData);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Sorry, I had trouble processing that. Could you please repeat?'
        }));
      }
    });

    ws.on('close', () => {
      console.log(`Voice session disconnected: ${sessionId}`);
      session.status = 'disconnected';
      if (session.ws) {
        delete session.ws;
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for session ${sessionId}:`, error);
    });
  });
}

// Process audio message using OpenAI
async function processAudioMessage(session, audioData) {
  try {
    if (!openai) {
      // Fallback response when API key is not available
      const demoResponses = [
        "I'd be happy to help you order fuel! Could you tell me what type of fuel you need - petrol or diesel?",
        "Welcome to Fuel Buddy! I can help you place a fuel order. What fuel type would you like?",
        "I'm here to help with your fuel delivery. Let me know what type and quantity you need."
      ];
      
      const response = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      
      session.ws.send(JSON.stringify({
        type: 'assistant',
        message: response,
        transcription: "Demo mode - audio processing simulated"
      }));
      
      // Store in session history
      session.messages.push({
        role: 'user',
        content: "Demo audio input",
        timestamp: new Date()
      });
      
      session.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });
      
      return;
    }

    // For a full implementation, you would:
    // 1. Convert audio to text using OpenAI Whisper API
    // 2. Process the text with OpenAI chat
    // 3. Convert response back to audio using OpenAI TTS

    // For now, we'll simulate the transcription and use chat API
    let transcription = "I would like to order fuel"; // Default placeholder

    try {
      // In a real implementation, you would send the audio to Whisper API
      // const transcriptionResponse = await openai.audio.transcriptions.create({
      //   file: audioData, // Would need to convert base64 to File
      //   model: "whisper-1",
      // });
      // transcription = transcriptionResponse.text;

      // For demo purposes, we'll use a simple pattern matching
      // This is where you would integrate actual speech-to-text
      console.log('Audio received, processing...');

    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError);
      transcription = "I need help with fuel delivery";
    }

    // Process with OpenAI chat
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: VOICE_ORDERING_PROMPT },
        { role: 'user', content: transcription }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const assistantResponse = response.choices[0].message.content;

    // Send response back to client
    session.ws.send(JSON.stringify({
      type: 'assistant',
      message: assistantResponse,
      transcription: transcription
    }));

    // Store in session history
    session.messages.push({
      role: 'user',
      content: transcription,
      timestamp: new Date()
    });

    session.messages.push({
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date()
    });

    // Extract order information from the conversation
    extractOrderInfo(session, transcription, assistantResponse);

  } catch (error) {
    console.error('Error processing audio:', error);
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Sorry, I had trouble processing your voice. Could you try again?'
    }));
  }
}

// Extract order information from conversation
function extractOrderInfo(session, userMessage, assistantResponse) {
  const message = userMessage.toLowerCase();

  // Extract fuel type
  if (message.includes('petrol') || message.includes('gasoline')) {
    if (message.includes('premium')) {
      session.orderData.fuelType = 'premium';
    } else {
      session.orderData.fuelType = 'regular';
    }
  } else if (message.includes('diesel')) {
    session.orderData.fuelType = 'diesel';
  }

  // Extract quantity (look for numbers followed by "liters", "litres", etc.)
  const quantityMatch = message.match(/(\d+)\s*(?:liters?|litres?|l)/i);
  if (quantityMatch) {
    session.orderData.quantity = parseInt(quantityMatch[1]);
  }

  // Extract payment method
  if (message.includes('cash') || message.includes('cod')) {
    session.orderData.paymentMethod = 'cash_on_delivery';
  } else if (message.includes('upi') || message.includes('phonepe') || message.includes('paytm')) {
    session.orderData.paymentMethod = 'upi';
  } else if (message.includes('card') || message.includes('credit') || message.includes('debit')) {
    session.orderData.paymentMethod = 'card';
  }

  // Check if we have enough information to place an order
  const hasFuelType = session.orderData.fuelType;
  const hasQuantity = session.orderData.quantity;
  const hasPaymentMethod = session.orderData.paymentMethod;

  if (hasFuelType && hasQuantity && hasPaymentMethod) {
    // Ask for final confirmation
    session.ws.send(JSON.stringify({
      type: 'order_ready',
      message: `Perfect! I have all the details:
- Fuel Type: ${session.orderData.fuelType}
- Quantity: ${session.orderData.quantity} liters
- Payment Method: ${session.orderData.paymentMethod.replace('_', ' ').toUpperCase()}

Could you please provide your delivery address to complete the order?`,
      orderData: session.orderData
    }));
  }
}

// Process text message (fallback/testing)
async function processTextMessage(session, text) {
  try {
    if (!openai) {
      // Fallback responses
      const fallbackResponses = [
        "I can help you order fuel. What type would you like - petrol or diesel?",
        "To place an order, I'll need to know your fuel type, quantity, and delivery address.",
        "I'm here to help with your fuel delivery order. What can I get for you?",
        "Great! Let me help you place your fuel order. What fuel type do you need?"
      ];

      const response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      session.ws.send(JSON.stringify({
        type: 'assistant',
        message: response
      }));
      
      // Store in session history
      session.messages.push({
        role: 'user',
        content: text,
        timestamp: new Date()
      });
      
      session.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });
      
      return;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: VOICE_ORDERING_PROMPT },
        { role: 'user', content: text }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const assistantResponse = response.choices[0].message.content;

    session.ws.send(JSON.stringify({
      type: 'assistant',
      message: assistantResponse
    }));

    // Store in session history
    session.messages.push({
      role: 'user',
      content: text,
      timestamp: new Date()
    });

    session.messages.push({
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error processing text:', error);
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Sorry, I had trouble processing your request. Could you try again?'
    }));
  }
}

// Finalize order
async function finalizeOrder(session, orderData) {
  try {
    // Merge with existing order data
    session.orderData = { ...session.orderData, ...orderData };

    // Calculate total price based on fuel type and quantity
    const fuelPrices = {
      'regular': 102,
      'premium': 108,
      'diesel': 89
    };

    const pricePerLiter = fuelPrices[session.orderData.fuelType] || 102;
    const totalPrice = session.orderData.quantity * pricePerLiter;

    // Create order using the existing orders API
    const orderPayload = {
      user: session.userId || 'guest', // Would normally get from auth
      fuelType: session.orderData.fuelType,
      quantity: session.orderData.quantity,
      totalPrice: totalPrice,
      deliveryAddress: session.orderData.deliveryAddress || 'Address provided via voice',
      deliveryTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      paymentMethod: session.orderData.paymentMethod || 'cash_on_delivery',
      specialInstructions: 'Order placed via voice assistant'
    };

    // Here you would normally make an API call to create the order
    // For now, we'll simulate the order creation
    console.log('Creating order:', orderPayload);

    const confirmation = `Great! Your order has been placed successfully:

📋 Order Details:
• Fuel Type: ${session.orderData.fuelType}
• Quantity: ${session.orderData.quantity} liters
• Total Price: ₹${totalPrice}
• Delivery Address: ${session.orderData.deliveryAddress || 'Provided via voice'}
• Payment Method: ${session.orderData.paymentMethod?.replace('_', ' ').toUpperCase() || 'Cash on delivery'}
• Estimated Delivery: Within 60 minutes

You'll receive a confirmation message shortly. Thank you for using Fuel Buddy!`;

    session.ws.send(JSON.stringify({
      type: 'order_confirmed',
      message: confirmation,
      orderData: {
        ...session.orderData,
        totalPrice,
        estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000)
      }
    }));

    session.status = 'completed';

  } catch (error) {
    console.error('Error finalizing order:', error);
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Sorry, I had trouble placing your order. Please try again or contact support.'
    }));
  }
}

// Get session details
router.get('/session/:sessionId', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = voiceSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  res.json({
    sessionId: session.id,
    userId: session.userId,
    status: session.status,
    createdAt: session.createdAt,
    messageCount: session.messages.length,
    hasOrderData: Object.keys(session.orderData).length > 0
  });
}));

// Clean up old sessions (run periodically)
function cleanupOldSessions() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  for (const [sessionId, session] of voiceSessions.entries()) {
    if (session.createdAt < oneHourAgo && session.status !== 'active') {
      if (session.ws) {
        session.ws.close();
      }
      voiceSessions.delete(sessionId);
      console.log(`Cleaned up old session: ${sessionId}`);
    }
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupOldSessions, 30 * 60 * 1000);

export default router;
