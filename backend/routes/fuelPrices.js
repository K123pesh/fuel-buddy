import express from 'express';
import asyncHandler from 'express-async-handler';
import fuelPriceService from '../services/fuelPriceService.js';

const router = express.Router();

// Get all available states
router.get('/states', asyncHandler(async (req, res) => {
  try {
    const states = await fuelPriceService.getStates();
    res.json(states);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}));

// Get districts in a state
router.get('/:state/districts', asyncHandler(async (req, res) => {
  try {
    const { state } = req.params;
    const districts = await fuelPriceService.getDistricts(state);
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}));

// Get fuel prices for specific state and district
router.get('/:state/:district', asyncHandler(async (req, res) => {
  try {
    const { state, district } = req.params;
    const fuelPrices = await fuelPriceService.getFuelPrices(state, district);
    res.json(fuelPrices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}));

// Get all fuel prices for a state
router.get('/state/:state', asyncHandler(async (req, res) => {
  try {
    const { state } = req.params;
    const statePrices = await fuelPriceService.getAllStatePrices(state);
    res.json(statePrices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}));

export default router;
