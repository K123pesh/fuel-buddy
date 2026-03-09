import express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import FuelEfficiency from '../models/FuelEfficiency.js';

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

// Get all vehicles for a user
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user._id, isActive: true })
      .sort({ isPrimary: -1, createdAt: -1 });
    
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Failed to fetch vehicles' });
  }
}));

// Get a specific vehicle by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Get efficiency data for this vehicle
    const efficiencyData = await vehicle.getEfficiencyData();
    
    res.json({
      vehicle,
      efficiencyData
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Failed to fetch vehicle' });
  }
}));

// Create a new vehicle
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const {
      make,
      model,
      year,
      vehicleType,
      fuelType,
      licensePlate,
      odometerReading,
      tankCapacity,
      averageMileage,
      isPrimary,
      notes
    } = req.body;

    // Validate required fields
    if (!make || !model || !year || !vehicleType || !fuelType || !tankCapacity) {
      return res.status(400).json({ 
        message: 'Missing required fields: make, model, year, vehicleType, fuelType, tankCapacity' 
      });
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
      return res.status(400).json({ 
        message: `Year must be between 1900 and ${currentYear + 1}` 
      });
    }

    // Check if license plate already exists (if provided)
    if (licensePlate) {
      const existingVehicle = await Vehicle.findOne({ licensePlate });
      if (existingVehicle) {
        return res.status(400).json({ message: 'License plate already exists' });
      }
    }

    // Create new vehicle
    const vehicle = new Vehicle({
      user: req.user._id,
      make: make.trim(),
      model: model.trim(),
      year,
      vehicleType,
      fuelType,
      licensePlate: licensePlate ? licensePlate.trim() : undefined,
      odometerReading: odometerReading || 0,
      tankCapacity,
      averageMileage: averageMileage || 0,
      isPrimary: isPrimary || false,
      notes: notes ? notes.trim() : undefined
    });

    const savedVehicle = await vehicle.save();
    
    console.log(`Vehicle created: ${savedVehicle._id} by user ${req.user._id}`);
    
    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle: savedVehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ message: 'Failed to create vehicle' });
  }
}));

// Update a vehicle
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const {
      make,
      model,
      year,
      vehicleType,
      fuelType,
      licensePlate,
      odometerReading,
      tankCapacity,
      averageMileage,
      isActive,
      isPrimary,
      notes
    } = req.body;

    const vehicle = await Vehicle.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if license plate already exists (if being changed)
    if (licensePlate && licensePlate !== vehicle.licensePlate) {
      const existingVehicle = await Vehicle.findOne({ 
        licensePlate,
        _id: { $ne: req.params.id }
      });
      if (existingVehicle) {
        return res.status(400).json({ message: 'License plate already exists' });
      }
    }

    // Update vehicle
    if (make) vehicle.make = make.trim();
    if (model) vehicle.model = model.trim();
    if (year) vehicle.year = year;
    if (vehicleType) vehicle.vehicleType = vehicleType;
    if (fuelType) vehicle.fuelType = fuelType;
    if (licensePlate !== undefined) vehicle.licensePlate = licensePlate.trim();
    if (odometerReading !== undefined) vehicle.odometerReading = odometerReading;
    if (tankCapacity) vehicle.tankCapacity = tankCapacity;
    if (averageMileage !== undefined) vehicle.averageMileage = averageMileage;
    if (isActive !== undefined) vehicle.isActive = isActive;
    if (isPrimary !== undefined) vehicle.isPrimary = isPrimary;
    if (notes !== undefined) vehicle.notes = notes.trim();

    const updatedVehicle = await vehicle.save();
    
    console.log(`Vehicle ${req.params.id} updated by user ${req.user._id}`);

    res.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ message: 'Failed to update vehicle' });
  }
}));

// Delete a vehicle (soft delete)
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Soft delete by setting isActive to false
    vehicle.isActive = false;
    await vehicle.save();
    
    console.log(`Vehicle ${req.params.id} deleted by user ${req.user._id}`);

    res.json({
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ message: 'Failed to delete vehicle' });
  }
}));

// Get primary vehicle for user
router.get('/primary/current', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const primaryVehicle = await Vehicle.getPrimaryVehicle(req.user._id);
    
    if (!primaryVehicle) {
      return res.status(404).json({ message: 'No primary vehicle found' });
    }

    // Get efficiency data for this vehicle
    const efficiencyData = await primaryVehicle.getEfficiencyData();
    
    res.json({
      vehicle: primaryVehicle,
      efficiencyData
    });
  } catch (error) {
    console.error('Error fetching primary vehicle:', error);
    res.status(500).json({ message: 'Failed to fetch primary vehicle' });
  }
}));

// Set vehicle as primary
router.put('/:id/set-primary', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Set this vehicle as primary (middleware will handle unsetting others)
    vehicle.isPrimary = true;
    await vehicle.save();
    
    console.log(`Vehicle ${req.params.id} set as primary by user ${req.user._id}`);

    res.json({
      message: 'Vehicle set as primary successfully',
      vehicle
    });
  } catch (error) {
    console.error('Error setting primary vehicle:', error);
    res.status(500).json({ message: 'Failed to set primary vehicle' });
  }
}));

// Get vehicle efficiency summary
router.get('/:id/efficiency-summary', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Get efficiency trends
    const efficiencyTrends = await FuelEfficiency.getEfficiencyTrends(req.params.id, 30);
    
    // Detect anomalies
    const anomalies = await FuelEfficiency.detectAnomalies(req.params.id);

    // Calculate summary stats
    if (efficiencyTrends.length > 0) {
      const efficiencies = efficiencyTrends.map(e => e.efficiency);
      const avgEfficiency = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
      const maxEfficiency = Math.max(...efficiencies);
      const minEfficiency = Math.min(...efficiencies);
      
      res.json({
        vehicle,
        summary: {
          totalRecords: efficiencyTrends.length,
          averageEfficiency: Math.round(avgEfficiency * 100) / 100,
          maxEfficiency: Math.round(maxEfficiency * 100) / 100,
          minEfficiency: Math.round(minEfficiency * 100) / 100,
          anomalyCount: anomalies.length,
          lastEfficiencyRecord: efficiencyTrends[0]
        },
        recentTrends: efficiencyTrends.slice(0, 5),
        anomalies: anomalies.slice(0, 3)
      });
    } else {
      res.json({
        vehicle,
        summary: {
          totalRecords: 0,
          message: 'No efficiency data available'
        }
      });
    }
  } catch (error) {
    console.error('Error fetching efficiency summary:', error);
    res.status(500).json({ message: 'Failed to fetch efficiency summary' });
  }
}));

export default router;
