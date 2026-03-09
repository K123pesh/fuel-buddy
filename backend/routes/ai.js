import express from 'express';
import asyncHandler from 'express-async-handler';
import OpenAI from 'openai';

const router = express.Router();

// System prompt to give context about Fuel Buddy
const SYSTEM_PROMPT = `You are a helpful AI assistant for Fuel Buddy, an on-demand fuel delivery service. 

Your role is to help users with:
1. Ordering fuel delivery - Users can order petrol or diesel
2. Finding nearby fuel stations
3. Understanding order status and delivery process
4. Pricing and payment information
5. Loyalty points and rewards
6. General FAQs about fuel delivery services

Key information about Fuel Buddy:
- We deliver fuel (petrol, diesel) services
- Users can track their orders in real-time
- Delivery typically takes 30-60 minutes
- We have loyalty points program (1 point per ₹10 spent)
- Payment methods: Cash on Delivery, UPI, Cards
- Service hours: 24/7

Always be friendly, helpful, and concise. If users ask about topics unrelated to fuel delivery, politely redirect them to fuel-related questions.

If users want to place an order, guide them to use the mobile app or website's order form.
If users want to check their order status, ask for their order ID or tell them to check their order history.
If users have technical issues, advise them to contact support at fuelorder94@gmail.com or call our helpline at +91 9145470140.`;

// Initialize OpenAI with API key
const initializeOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// No need to pre-initialize OpenAI model
// We'll check for the API key availability in the endpoints

// Chat endpoint
router.post('/chat', asyncHandler(async (req, res) => {
  const { messages, userId } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'Please provide a messages array' });
  }

  if (!process.env.OPENAI_API_KEY) {
    // Return a mock response when API key is not set
    const mockResponses = [
      "Hello! I'm the Fuel Buddy assistant. I'm currently having trouble connecting to my AI backend, but I'm here to help with general questions about fuel delivery services.",
      "Thanks for reaching out! I'm experiencing connectivity issues with my AI system, but I can provide information about Fuel Buddy services.",
      "Hi there! I'm the Fuel Buddy AI assistant. Due to a temporary issue with my connection, I'm responding with preset responses, but I'm still happy to help!"
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)] + 
      " You can ask me about fuel delivery options, pricing, or service areas.";
    
    return res.json({
      message: 'Success',
      response: randomResponse,
      userId: userId || null
    });
  }
  
  try {
    // Convert messages for OpenAI format
    const openAiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: 'Understood! I am ready to help users with their fuel delivery questions. I have context about Fuel Buddy services including ordering, fuel stations, pricing, loyalty programs, and support.' },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openAiMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    const response = completion.choices[0].message.content;
    
    res.json({
      message: 'Success',
      response: response,
      userId: userId || null
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    // Check if it's an API key error
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('401') || errorMessage.includes('invalid_api_key') || errorMessage.includes('Incorrect API key')) {
      // Return a mock response for API key issues
      const mockResponses = [
        "Hello! I'm the Fuel Buddy assistant. I'm currently having trouble connecting to my AI backend, but I'm here to help with general questions about fuel delivery services.",
        "Thanks for reaching out! I'm experiencing connectivity issues with my AI system, but I can provide information about Fuel Buddy services.",
        "Hi there! I'm the Fuel Buddy AI assistant. Due to a temporary issue with my connection, I'm responding with preset responses, but I'm still happy to help!"
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)] + 
        " You can ask me about fuel delivery options, pricing, or service areas.";
      
      return res.json({
        message: 'Success',
        response: randomResponse,
        userId: userId || null
      });
    } else {
      return res.status(500).json({ 
        message: 'Failed to get response from AI', 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}));

// Simple chat endpoint (without conversation history)
router.post('/simple-chat', asyncHandler(async (req, res) => {
  const { message, userId } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Please provide a message' });
  }

  if (!process.env.OPENAI_API_KEY) {
    // Return a mock response when API key is not set
    const mockResponses = [
      "Hello! I'm the Fuel Buddy assistant. I'm currently having trouble connecting to my AI backend, but I'm here to help with general questions about fuel delivery services.",
      "Thanks for reaching out! I'm experiencing connectivity issues with my AI system, but I can provide information about Fuel Buddy services.",
      "Hi there! I'm the Fuel Buddy AI assistant. Due to a temporary issue with my connection, I'm responding with preset responses, but I'm still happy to help!"
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)] + 
      " You can ask me about fuel delivery options, pricing, or service areas.";
    
    return res.json({
      message: 'Success',
      response: randomResponse,
      userId: userId || null
    });
  }
  
  try {
    // Create a new chat session with system prompt
    const openai = initializeOpenAI();
    const openAiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: 'Understood! I am ready to help users with their fuel delivery questions.' },
      { role: 'user', content: message }
    ];
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openAiMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    const response = completion.choices[0].message.content;
    
    res.json({
      message: 'Success',
      response: response,
      userId: userId || null
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    // Check if it's an API key error
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('401') || errorMessage.includes('invalid_api_key') || errorMessage.includes('Incorrect API key')) {
      // Return a mock response for API key issues
      const mockResponses = [
        "Hello! I'm the Fuel Buddy assistant. I'm currently having trouble connecting to my AI backend, but I'm here to help with general questions about fuel delivery services.",
        "Thanks for reaching out! I'm experiencing connectivity issues with my AI system, but I can provide information about Fuel Buddy services.",
        "Hi there! I'm the Fuel Buddy AI assistant. Due to a temporary issue with my connection, I'm responding with preset responses, but I'm still happy to help!"
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)] + 
        " You can ask me about fuel delivery options, pricing, or service areas.";
      
      return res.json({
        message: 'Success',
        response: randomResponse,
        userId: userId || null
      });
    } else {
      return res.status(500).json({ 
        message: 'Failed to get response from AI', 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}));

// Health check endpoint for AI
router.get('/health', asyncHandler(async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      message: 'AI service not configured', 
      status: 'error',
      details: 'OPENAI_API_KEY is not set'
    });
  }
  
  res.json({ 
    message: 'AI service is available', 
    status: 'ok'
  });
}));

export default router;
