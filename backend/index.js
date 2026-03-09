import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Import models to ensure they are registered
import './models/User.js';
import './models/Order.js';
import './models/FuelStation.js';
import './models/Loyalty.js';
import './models/Admin.js';
import './models/SupportTicket.js';
import './models/Vehicle.js';
import './models/FuelEfficiency.js';


// Import routes
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import fuelStationRoutes from './routes/fuelStations.js';
import loyaltyRoutes from './routes/loyalty.js';
import adminRoutes from './routes/admin.js';
import fuelPriceRoutes from './routes/fuelPrices.js';
import aiRoutes from './routes/ai.js';
import enhancedAiRoutes from './routes/ai-enhanced.js';
import voiceRoutes, { setupVoiceWebSocket } from './routes/voice.js';
import contactRoutes from './routes/contact.js';
import supportRoutes from './routes/support.js';
import vehicleRoutes from './routes/vehicles.js';
import fuelEfficiencyRoutes from './routes/fuelEfficiency.js';


// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the backend .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('\nPlease set these environment variables in your .env file and restart the server.');
  process.exit(1);
}

// Validate optional but important environment variables
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
  console.warn('⚠️  OPENAI_API_KEY is not configured. AI features will be limited.');
}

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket support for voice ordering
const server = createServer(app);
const wss = new WebSocketServer({ 
  server,
  // Remove path to handle all WebSocket connections
});

// Make WebSocket server available to routes
app.set('wss', wss);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/fuel-stations', fuelStationRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/fuel-prices', fuelPriceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-enhanced', enhancedAiRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/fuel-efficiency', fuelEfficiencyRoutes);


// Setup WebSocket for voice ordering
setupVoiceWebSocket(app);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Fuel Buddy API is running', status: 'OK' });
});

// 404 handler for API routes (should be last, after all specific routes)
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Error handling middleware (should be last, after all routes and 404 handler)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
