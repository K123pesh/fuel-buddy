import express from 'express';
import asyncHandler from 'express-async-handler';
import FuelStation from '../models/FuelStation.js';
import fuelPriceService from '../services/fuelPriceService.js';

const router = express.Router();

// Get fuel stations with real-time prices
router.get('/with-prices', asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 10, state, district } = req.query;
  
  let filter = { isActive: true };
  
  // If coordinates provided, find nearby stations
  if (latitude && longitude) {
    filter.coordinates = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: parseInt(radius) * 1000 // Convert km to meters
      }
    };
  }
  
  const stations = await FuelStation.find(filter)
    .sort({ rating: -1 });
  
  // If state and district provided, get real-time fuel prices
  if (state && district) {
    try {
      const fuelPrices = await fuelPriceService.getFuelPrices(state, district);
      
      // Update stations with real-time prices
      const stationsWithPrices = stations.map(station => ({
        ...station.toObject(),
        realTimePrices: fuelPrices.prices,
        pricesLastUpdated: fuelPrices.lastUpdated,
        priceSource: fuelPrices.source
      }));
      
      return res.json(stationsWithPrices);
    } catch (error) {
      console.error('Error fetching real-time prices:', error);
      // Return stations with original prices if API fails
    }
  }
    
  res.json(stations);
}));

// Get all fuel stations
router.get('/', asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 10 } = req.query;
  
  let filter = { isActive: true };
  
  // If coordinates provided, find nearby stations
  if (latitude && longitude) {
    filter.coordinates = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: parseInt(radius) * 1000 // Convert km to meters
      }
    };
  }
  
  const stations = await FuelStation.find(filter)
    .sort({ rating: -1 });
    
  res.json(stations);
}));

// Get a specific fuel station
router.get('/:id', asyncHandler(async (req, res) => {
  const station = await FuelStation.findById(req.params.id);
  
  if (!station) {
    return res.status(404).json({ message: 'Fuel station not found' });
  }
  
  res.json(station);
}));

// Create a new fuel station (admin only)
router.post('/', asyncHandler(async (req, res) => {
  const {
    name,
    address,
    phone,
    email,
    coordinates,
    fuelTypes,
    prices,
    operatingHours,
    services,
    rating
  } = req.body;

  // Validate required fields
  if (!name || !address || !coordinates || !prices) {
    return res.status(400).json({ 
      message: 'Missing required fields: name, address, coordinates, prices' 
    });
  }

  const station = new FuelStation({
    name,
    address,
    phone,
    email,
    coordinates,
    fuelTypes,
    prices,
    operatingHours,
    services,
    rating
  });

  const savedStation = await station.save();
  res.status(201).json(savedStation);
}));

// Update fuel station (admin only)
router.put('/:id', asyncHandler(async (req, res) => {
  const station = await FuelStation.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!station) {
    return res.status(404).json({ message: 'Fuel station not found' });
  }
  
  res.json(station);
}));

// Delete fuel station (admin only)
router.delete('/:id', asyncHandler(async (req, res) => {
  const station = await FuelStation.findByIdAndDelete(req.params.id);
  
  if (!station) {
    return res.status(404).json({ message: 'Fuel station not found' });
  }
  
  res.json({ message: 'Fuel station deleted successfully' });
}));

export default router;