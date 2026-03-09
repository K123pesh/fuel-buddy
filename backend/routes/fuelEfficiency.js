import express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import FuelEfficiency from '../models/FuelEfficiency.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all efficiency records for a user
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { vehicleId, days = 30, page = 1, limit = 20 } = req.query;
    
    let filter = { user: req.user._id };
    if (vehicleId) {
      filter.vehicle = vehicleId;
    }
    
    // Filter by date range
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      filter.createdAt = { $gte: startDate };
    }
    
    const efficiencyRecords = await FuelEfficiency.find(filter)
      .populate('vehicle', 'make model year fuelType')
      .populate('order', 'quantity totalPrice createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FuelEfficiency.countDocuments(filter);

    res.json({
      records: efficiencyRecords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching efficiency records:', error);
    res.status(500).json({ message: 'Failed to fetch efficiency records' });
  }
}));

// Create a new efficiency record
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const {
      vehicleId,
      orderId,
      odometerBefore,
      odometerAfter,
      fuelQuantity,
      drivingConditions,
      weatherConditions
    } = req.body;

    // Validate required fields
    if (!vehicleId || !odometerBefore || !odometerAfter || !fuelQuantity) {
      return res.status(400).json({ 
        message: 'Missing required fields: vehicleId, odometerBefore, odometerAfter, fuelQuantity' 
      });
    }

    // Validate vehicle ownership
    const vehicle = await Vehicle.findOne({ 
      _id: vehicleId, 
      user: req.user._id,
      isActive: true 
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Validate odometer readings
    if (odometerAfter <= odometerBefore) {
      return res.status(400).json({ 
        message: 'Odometer after must be greater than odometer before' 
      });
    }

    // Validate order ownership (if provided)
    if (orderId) {
      const order = await Order.findOne({ 
        _id: orderId, 
        user: req.user._id 
      });
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
    }

    // Create new efficiency record
    const efficiencyRecord = new FuelEfficiency({
      user: req.user._id,
      vehicle: vehicleId,
      order: orderId,
      odometerBefore,
      odometerAfter,
      fuelQuantity,
      fuelType: vehicle.fuelType,
      drivingConditions: drivingConditions || 'mixed',
      weatherConditions: weatherConditions || 'normal'
    });

    const savedRecord = await efficiencyRecord.save();
    
    // Generate AI insights
    await savedRecord.generateAIInsights();
    
    // Update vehicle odometer reading
    vehicle.odometerReading = odometerAfter;
    await vehicle.save();
    
    // Update order with efficiency data (if order provided)
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        'efficiencyData.odometerBefore': odometerBefore,
        'efficiencyData.odometerAfter': odometerAfter,
        'efficiencyData.calculatedEfficiency': savedRecord.efficiency,
        'efficiencyData.distanceTraveled': savedRecord.distanceTraveled,
        'efficiencyData.fuelEfficiencyId': savedRecord._id,
        'aiPredictions.estimatedNextRefillKm': savedRecord.aiInsights.predictedNextRefillKm,
        'aiPredictions.estimatedNextRefillDate': savedRecord.aiInsights.predictedNextRefillDate,
        'aiPredictions.efficiencyInsights': savedRecord.aiInsights.analysis
      });
    }
    
    // Populate references for response
    const populatedRecord = await FuelEfficiency.findById(savedRecord._id)
      .populate('vehicle', 'make model year fuelType')
      .populate('order', 'quantity totalPrice createdAt');

    console.log(`Efficiency record created: ${savedRecord._id} by user ${req.user._id}`);
    
    res.status(201).json({
      message: 'Efficiency record created successfully',
      record: populatedRecord
    });
  } catch (error) {
    console.error('Error creating efficiency record:', error);
    res.status(500).json({ message: 'Failed to create efficiency record' });
  }
}));

// Get efficiency trends and analytics
router.get('/analytics', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { vehicleId, days = 30 } = req.query;
    
    // Get user's vehicles
    const vehicles = await Vehicle.find({ 
      user: req.user._id, 
      isActive: true 
    });
    
    const analyticsData = [];
    
    for (const vehicle of vehicles) {
      if (vehicleId && vehicle._id.toString() !== vehicleId) {
        continue;
      }
      
      const trends = await FuelEfficiency.getEfficiencyTrends(vehicle._id, parseInt(days));
      const anomalies = await FuelEfficiency.detectAnomalies(vehicle._id);
      
      if (trends.length > 0) {
        const efficiencies = trends.map(t => t.efficiency);
        const avgEfficiency = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
        const maxEfficiency = Math.max(...efficiencies);
        const minEfficiency = Math.min(...efficiencies);
        
        // Calculate efficiency trend
        let trend = 'stable';
        if (trends.length >= 6) {
          const recent = trends.slice(0, 3).map(t => t.efficiency);
          const older = trends.slice(3, 6).map(t => t.efficiency);
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
          const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
          
          if (recentAvg > olderAvg * 1.1) {
            trend = 'improving';
          } else if (recentAvg < olderAvg * 0.9) {
            trend = 'declining';
          }
        }
        
        analyticsData.push({
          vehicle: {
            id: vehicle._id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            fuelType: vehicle.fuelType
          },
          statistics: {
            totalRecords: trends.length,
            averageEfficiency: Math.round(avgEfficiency * 100) / 100,
            maxEfficiency: Math.round(maxEfficiency * 100) / 100,
            minEfficiency: Math.round(minEfficiency * 100) / 100,
            trend,
            anomalyCount: anomalies.length
          },
          recentRecords: trends.slice(0, 5),
          anomalies: anomalies.slice(0, 3)
        });
      }
    }
    
    res.json({
      analytics: analyticsData,
      summary: {
        totalVehicles: vehicles.length,
        vehiclesWithData: analyticsData.length,
        totalRecords: analyticsData.reduce((sum, data) => sum + data.statistics.totalRecords, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
}));

// Get AI insights and predictions
router.get('/insights', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { vehicleId } = req.query;
    
    const vehicles = await Vehicle.find({ 
      user: req.user._id, 
      isActive: true 
    });
    
    const insights = [];
    
    for (const vehicle of vehicles) {
      if (vehicleId && vehicle._id.toString() !== vehicleId) {
        continue;
      }
      
      const latestRecord = await FuelEfficiency.findOne({ 
        vehicle: vehicle._id 
      }).sort({ createdAt: -1 });
      
      if (latestRecord) {
        // Predict next refill based on user's driving profile
        const user = req.user;
        const avgDailyKm = user.drivingProfile?.averageDailyKm || 50;
        const efficiency = latestRecord.efficiency;
        const tankCapacity = vehicle.tankCapacity;
        
        const estimatedKmPerTank = tankCapacity * efficiency;
        const daysUntilRefill = estimatedKmPerTank / avgDailyKm;
        const nextRefillDate = new Date();
        nextRefillDate.setDate(nextRefillDate.getDate() + Math.floor(daysUntilRefill));
        
        // Generate personalized recommendations
        const recommendations = [];
        
        if (latestRecord.aiInsights.efficiencyTrend === 'declining') {
          recommendations.push('Your fuel efficiency is declining. Consider checking tire pressure and engine maintenance.');
        }
        
        if (latestRecord.aiInsights.engineHealthAlert === 'warning') {
          recommendations.push('Engine efficiency is below optimal range. Schedule a diagnostic check.');
        } else if (latestRecord.aiInsights.engineHealthAlert === 'critical') {
          recommendations.push('Critical: Your engine efficiency is very low. Immediate service recommended.');
        }
        
        if (latestRecord.aiInsights.theftRisk === 'high') {
          recommendations.push('Unusual fuel consumption detected. Monitor for potential fuel theft.');
        }
        
        if (efficiency < 10 && vehicle.fuelType === 'petrol') {
          recommendations.push('Consider adopting fuel-efficient driving habits for better mileage.');
        }
        
        insights.push({
          vehicle: {
            id: vehicle._id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year
          },
          currentEfficiency: Math.round(efficiency * 100) / 100,
          predictions: {
            nextRefillKm: Math.round(estimatedKmPerTank),
            nextRefillDate: nextRefillDate.toISOString().split('T')[0],
            daysUntilRefill: Math.floor(daysUntilRefill)
          },
          health: {
            engineStatus: latestRecord.aiInsights.engineHealthAlert,
            theftRisk: latestRecord.aiInsights.theftRisk,
            trend: latestRecord.aiInsights.efficiencyTrend
          },
          recommendations,
          lastUpdated: latestRecord.createdAt
        });
      }
    }
    
    res.json({
      insights,
      summary: {
        totalVehicles: vehicles.length,
        vehiclesWithInsights: insights.length
      }
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ message: 'Failed to fetch insights' });
  }
}));

// Detect and get anomalies
router.get('/anomalies', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { vehicleId } = req.query;
    
    const vehicles = await Vehicle.find({ 
      user: req.user._id, 
      isActive: true 
    });
    
    const allAnomalies = [];
    
    for (const vehicle of vehicles) {
      if (vehicleId && vehicle._id.toString() !== vehicleId) {
        continue;
      }
      
      const anomalies = await FuelEfficiency.detectAnomalies(vehicle._id);
      
      for (const anomaly of anomalies) {
        allAnomalies.push({
          vehicle: {
            id: vehicle._id,
            make: vehicle.make,
            model: vehicle.model
          },
          anomaly: {
            id: anomaly._id,
            efficiency: Math.round(anomaly.efficiency * 100) / 100,
            date: anomaly.createdAt,
            anomalyScore: anomaly.anomalyScore,
            fuelQuantity: anomaly.fuelQuantity,
            distanceTraveled: anomaly.distanceTraveled
          }
        });
      }
    }
    
    // Sort by anomaly score (highest first)
    allAnomalies.sort((a, b) => b.anomaly.anomalyScore - a.anomaly.anomalyScore);
    
    res.json({
      anomalies: allAnomalies,
      summary: {
        totalAnomalies: allAnomalies.length,
        highRiskAnomalies: allAnomalies.filter(a => a.anomaly.anomalyScore > 0.8).length
      }
    });
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    res.status(500).json({ message: 'Failed to fetch anomalies' });
  }
}));

export default router;
