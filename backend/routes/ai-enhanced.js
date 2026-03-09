import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Enhanced system responses
const getSmartResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Order related queries
  if (lowerMessage.includes('order') || lowerMessage.includes('book') || lowerMessage.includes('delivery') || lowerMessage.includes('petrol') || lowerMessage.includes('diesel')) {
    return "🚗 Ready to order fuel? Here's how easy it is:\n\n1️⃣ Select your location\n2️⃣ Choose fuel type (Petrol/Diesel)\n3️⃣ Enter quantity needed\n4️⃣ Pick delivery time\n5️⃣ Pay via UPI/Card/Cash\n\n⏰ Delivery time: 30-60 minutes\n💰 Starting from ₹199 delivery fee\n\nWould you like me to guide you to the order form?";
  }
  
  // Price related queries
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate') || lowerMessage.includes('charge')) {
    return "💰 Current Fuel Prices (Mumbai):\n\n⛽ Petrol: ₹106.31/liter\n⛽ Premium Petrol: ₹119.87/liter\n🛢️ Diesel: ₹94.27/liter\n\n📦 Delivery Fee: ₹199\n🎁 Earn 1 loyalty point per ₹10 spent\n\nPrices may vary by location. Real-time prices available in the order form!";
  }
  
  // Tracking related queries
  if (lowerMessage.includes('track') || lowerMessage.includes('status') || lowerMessage.includes('where') || lowerMessage.includes('delivery')) {
    return "📍 Track Your Order:\n\n📱 Check your order history in the app\n🔍 Enter order ID if available\n🚚 Real-time GPS tracking\n⏰ ETA updates via SMS\n\nIf you don't see your order, please share your order ID and I'll help locate it!";
  }
  
  // Payment related queries
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('upi') || lowerMessage.includes('card') || lowerMessage.includes('cash')) {
    return "💳 Payment Options:\n\n📱 UPI: Scan QR or use UPI ID\n💳 Credit/Debit Cards: All major cards accepted\n💵 Cash on Delivery: Pay when fuel arrives\n👛 Fuel Wallet: Use your balance\n\nAll payments are secure and encrypted!";
  }
  
  // Support related queries
  if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
    return "📞 Contact Fuel Buddy Support:\n\n📞 24/7 Helpline: +91 9145470140\n📧 Email: fuelorder94@gmail.com\n💬 Live Chat: Available 24/7\n📍 Address: Check our service areas\n\nWe're here to help you anytime!";
  }
  
  // Loyalty related queries
  if (lowerMessage.includes('loyalty') || lowerMessage.includes('points') || lowerMessage.includes('rewards') || lowerMessage.includes('earn')) {
    return "🏆 Fuel Buddy Rewards:\n\n🎯 Earn 1 point per ₹10 spent\n💰 Redeem points for discounts\n🎁 Exclusive member benefits\n📊 Track points in your profile\n\nThe more you order, the more you save!";
  }
  
  // Emergency related queries
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('fast')) {
    return "🚨 Emergency Fuel Delivery:\n\n⚡ Priority dispatch available\n🏃 Express delivery: 20-30 minutes\n📞 Call urgent line: +91 9145470140\n📍 Real-time tracking\n\nExtra charges may apply for emergency service.";
  }
  
  // Fuel efficiency and mileage related queries
  if (lowerMessage.includes('mileage') || lowerMessage.includes('efficiency') || lowerMessage.includes('km per litre') || lowerMessage.includes('fuel consumption')) {
    return "⛽ Fuel Efficiency Tracking:\n\n📊 Track your vehicle's km per litre\n📈 Monitor efficiency trends over time\n🔍 Detect unusual consumption patterns\n💡 Get personalized efficiency tips\n📱 Set up efficiency tracking with your vehicle\n\nAdd your vehicle and odometer readings to get started!";
  }
  
  // Vehicle related queries
  if (lowerMessage.includes('vehicle') || lowerMessage.includes('car') || lowerMessage.includes('bike') || lowerMessage.includes('add vehicle')) {
    return "🚗 Vehicle Management:\n\n➕ Add multiple vehicles to your profile\n📋 Track efficiency per vehicle\n🔧 Get vehicle-specific insights\n📊 Compare performance across vehicles\n⚙️ Set primary vehicle for quick ordering\n\nGo to Vehicle Settings to add your vehicle details!";
  }
  
  // Refill prediction queries
  if (lowerMessage.includes('refill') || lowerMessage.includes('next refill') || lowerMessage.includes('when to refill') || lowerMessage.includes('fuel prediction')) {
    return "🔮 Smart Refill Predictions:\n\n📅 AI predicts your next refill date\n📊 Based on your driving patterns\n⚠️ Get timely refill reminders\n💰 Plan your fuel budget better\n📍 Never run out of fuel unexpectedly\n\nEnable efficiency tracking to get predictions!";
  }
  
  // Engine health queries
  if (lowerMessage.includes('engine') || lowerMessage.includes('maintenance') || lowerMessage.includes('service') || lowerMessage.includes('engine health')) {
    return "🔧 Engine Health Monitoring:\n\n📈 AI analyzes efficiency for engine health\n⚠️ Early warning system for issues\n🔍 Detect performance problems\n📝 Get maintenance recommendations\n⏰ Schedule service alerts\n\nTrack your mileage to monitor engine health!";
  }
  
  // Fuel theft detection queries
  if (lowerMessage.includes('theft') || lowerMessage.includes('steal') || lowerMessage.includes('fuel theft') || lowerMessage.includes('anomaly')) {
    return "🛡️ Fuel Theft Detection:\n\n🔍 AI monitors for unusual consumption\n⚠️ Alerts for potential fuel theft\n📊 Anomaly detection system\n📱 Instant notifications for suspicious activity\n🔒 Protect your fuel investment\n\nEnable anomaly alerts in your preferences!";
  }
  
  // Cost saving queries
  if (lowerMessage.includes('save') || lowerMessage.includes('cost') || lowerMessage.includes('saving') || lowerMessage.includes('expensive')) {
    return "💰 Fuel Cost Savings:\n\n📊 Track your fuel spending\n💡 Get efficiency improvement tips\n📈 Compare with similar vehicles\n🎯 Set efficiency goals\n💵 Calculate potential savings\n\nOptimize your driving habits to save money!";
  }
  
  // Default response
  return "🌟 I'm here to help! You can ask me about:\n\n⛽ Ordering fuel delivery\n📍 Tracking your order\n💰 Pricing and payments\n🏆 Loyalty rewards\n� Fuel efficiency tracking\n🚗 Vehicle management\n🔧 Engine health monitoring\n🛡️ Fuel theft detection\n�📞 Customer support\n\nWhat would you like to know more about?";
};

// Enhanced simple chat endpoint
router.post('/enhanced-chat', asyncHandler(async (req, res) => {
  const { message, userId } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Please provide a message' });
  }

  try {
    // Get smart response based on message content
    const response = getSmartResponse(message);
    
    res.json({
      message: 'Success',
      response: response,
      userId: userId || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Enhanced Chat Error:', error);
    res.status(500).json({ 
      message: 'Failed to get response', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

export default router;
