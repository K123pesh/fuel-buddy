import express from 'express';
import asyncHandler from 'express-async-handler';
import Loyalty from '../models/Loyalty.js';
import User from '../models/User.js';

const router = express.Router();

// Get loyalty points for a user
router.get('/points', asyncHandler(async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  const loyalty = await Loyalty.findOne({ user: userId, isActive: true });
  
  if (!loyalty) {
    return res.json({ totalPoints: 0, tier: 'bronze' });
  }
  
  res.json({
    totalPoints: loyalty.totalPoints,
    tier: loyalty.tier,
    pointsHistory: loyalty.pointsHistory
  });
}));

// Get loyalty transactions for a user
router.get('/transactions', asyncHandler(async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  const loyalty = await Loyalty.findOne({ user: userId, isActive: true })
    .select('pointsHistory');
  
  if (!loyalty) {
    return res.json([]);
  }
  
  // Sort by most recent first
  const transactions = loyalty.pointsHistory.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  res.json(transactions);
}));

// Earn loyalty points
router.post('/earn', asyncHandler(async (req, res) => {
  const { userId, points, orderId, description } = req.body;
  
  if (!userId || !points || !description) {
    return res.status(400).json({ 
      message: 'Missing required fields: userId, points, description' 
    });
  }
  
  // Find or create loyalty record
  let loyalty = await Loyalty.findOne({ user: userId });
  
  if (!loyalty) {
    loyalty = new Loyalty({
      user: userId,
      totalPoints: 0,
      pointsHistory: [],
      tier: 'bronze'
    });
  }
  
  // Add points and history entry
  loyalty.totalPoints += points;
  loyalty.pointsHistory.push({
    type: 'earned',
    points,
    orderId,
    description,
    createdAt: new Date()
  });
  
  // Update tier based on total points
  if (loyalty.totalPoints >= 1000) {
    loyalty.tier = 'platinum';
  } else if (loyalty.totalPoints >= 500) {
    loyalty.tier = 'gold';
  } else if (loyalty.totalPoints >= 200) {
    loyalty.tier = 'silver';
  } else {
    loyalty.tier = 'bronze';
  }
  
  const savedLoyalty = await loyalty.save();
  
  res.json({
    message: 'Points earned successfully',
    totalPoints: savedLoyalty.totalPoints,
    tier: savedLoyalty.tier
  });
}));

// Redeem loyalty points
router.post('/redeem', asyncHandler(async (req, res) => {
  const { userId, points, description } = req.body;
  
  if (!userId || !points || !description) {
    return res.status(400).json({ 
      message: 'Missing required fields: userId, points, description' 
    });
  }
  
  const loyalty = await Loyalty.findOne({ user: userId, isActive: true });
  
  if (!loyalty) {
    return res.status(404).json({ message: 'Loyalty account not found' });
  }
  
  if (loyalty.totalPoints < points) {
    return res.status(400).json({ 
      message: 'Insufficient points. Available: ' + loyalty.totalPoints 
    });
  }
  
  // Deduct points and add history entry
  loyalty.totalPoints -= points;
  loyalty.pointsHistory.push({
    type: 'redeemed',
    points: -points,
    description,
    createdAt: new Date()
  });
  
  // Update tier based on total points
  if (loyalty.totalPoints >= 1000) {
    loyalty.tier = 'platinum';
  } else if (loyalty.totalPoints >= 500) {
    loyalty.tier = 'gold';
  } else if (loyalty.totalPoints >= 200) {
    loyalty.tier = 'silver';
  } else {
    loyalty.tier = 'bronze';
  }
  
  const savedLoyalty = await loyalty.save();
  
  res.json({
    message: 'Points redeemed successfully',
    pointsRedeemed: points,
    remainingPoints: savedLoyalty.totalPoints,
    tier: savedLoyalty.tier
  });
}));

export default router;