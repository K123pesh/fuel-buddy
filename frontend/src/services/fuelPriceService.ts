import { apiClient } from '@/integrations/api/client';

export interface FuelPrices {
  regular: number;
  premium: number;
  diesel: number;
}

export interface FuelPriceResponse {
  state: string;
  district: string;
  prices: FuelPrices;
  lastUpdated: string;
}

export interface StationWithRealTimePrices {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  fuelTypes: string[];
  prices: FuelPrices;
  realTimePrices?: {
    regular?: number;
    diesel?: number;
    premium?: number;
  };
}

class FuelPriceService {
  async getStates(): Promise<string[]> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/fuel-prices/states`);
      if (!response.ok) {
        throw new Error('Failed to fetch states');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching states:', error);
      // Return fallback states
      return ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat'];
    }
  }

  async getDistricts(state: string): Promise<string[]> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/fuel-prices/${state}/districts`);
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching districts:', error);
      // Return fallback districts based on state
      const fallbackDistricts: { [key: string]: string[] } = {
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
        'Delhi': ['Central Delhi', 'North Delhi', 'South Delhi'],
        'Karnataka': ['Bangalore', 'Mysore', 'Hubli'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
        'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara']
      };
      return fallbackDistricts[state] || ['City Center'];
    }
  }

  async getFuelPrices(state: string, district: string): Promise<FuelPriceResponse> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/fuel-prices/${state}/${district}`);
      if (!response.ok) {
        throw new Error('Failed to fetch fuel prices');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching fuel prices:', error);
      // Return fallback prices
      const fallbackPrices: { [key: string]: FuelPrices } = {
        'Mumbai': { regular: 106.31, premium: 119.87, diesel: 94.27 },
        'Delhi': { regular: 103.94, premium: 116.87, diesel: 92.76 },
        'Bangalore': { regular: 101.94, premium: 114.87, diesel: 89.73 },
        'Chennai': { regular: 102.63, premium: 115.43, diesel: 89.94 },
        'Ahmedabad': { regular: 96.72, premium: 108.94, diesel: 87.32 }
      };
      
      const defaultPrices = fallbackPrices[district] || { regular: 100, premium: 110, diesel: 90 };
      
      return {
        state,
        district,
        prices: defaultPrices,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async getAllStatePrices(state: string): Promise<{ state: string; districts: { [district: string]: FuelPrices }; lastUpdated: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/fuel-prices/state/${state}`);
      if (!response.ok) {
        throw new Error('Failed to fetch state prices');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching state prices:', error);
      // Return fallback state prices
      const fallbackStatePrices: { [key: string]: { [district: string]: FuelPrices } } = {
        'Maharashtra': {
          'Mumbai': { regular: 106.31, premium: 119.87, diesel: 94.27 },
          'Pune': { regular: 106.87, premium: 120.45, diesel: 94.83 },
          'Nagpur': { regular: 105.98, premium: 119.32, diesel: 93.94 }
        },
        'Delhi': {
          'Central Delhi': { regular: 103.94, premium: 116.87, diesel: 92.76 },
          'North Delhi': { regular: 103.94, premium: 116.87, diesel: 92.76 },
          'South Delhi': { regular: 103.94, premium: 116.87, diesel: 92.76 }
        }
      };
      
      return {
        state,
        districts: fallbackStatePrices[state] || {
          'City Center': { regular: 100, premium: 110, diesel: 90 }
        },
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async getLocationFromCoordinates(lat: number, lng: number): Promise<{ state: string; district: string } | null> {
    try {
      // Using Nominatim reverse geocoding API (free)
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&countrycodes=in`);
      if (!response.ok) {
        throw new Error('Failed to reverse geocode');
      }
      const data = await response.json();
      
      if (data && data.address) {
        const state = data.address.state || data.address.state_district || 'Maharashtra';
        const district = data.address.city || data.address.district || data.address.town || data.address.village || 'Mumbai';
        
        return { state, district };
      }
      
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Return default location for Mumbai area
      return { state: 'Maharashtra', district: 'Mumbai' };
    }
  }

  async getStationsWithRealTimePrices(state: string, district: string, lat: number, lng: number): Promise<any[]> {
    try {
      // This would typically call an external API for real-time station data
      // For now, return mock stations near the coordinates
      const mockStations = [
        {
          name: `${district} Fuel Station 1`,
          coordinates: { latitude: lat + 0.01, longitude: lng + 0.01 },
          fuelTypes: ['Petrol', 'Diesel'],
          prices: { regular: 106.31, premium: 119.87, diesel: 94.27 },
          realTimePrices: { regular: 106.31, diesel: 94.27 }
        },
        {
          name: `${district} Fuel Station 2`,
          coordinates: { latitude: lat - 0.01, longitude: lng + 0.01 },
          fuelTypes: ['Petrol', 'Diesel', 'CNG'],
          prices: { regular: 106.45, premium: 119.98, diesel: 94.41 },
          realTimePrices: { regular: 106.45, diesel: 94.41 }
        },
        {
          name: `${district} Fuel Station 3`,
          coordinates: { latitude: lat + 0.01, longitude: lng - 0.01 },
          fuelTypes: ['Petrol', 'CNG'],
          prices: { regular: 106.10, premium: 119.65, diesel: 94.05 },
          realTimePrices: { regular: 106.10, diesel: 94.05 }
        }
      ];
      
      return mockStations;
    } catch (error) {
      console.error('Error fetching stations with real-time prices:', error);
      return [];
    }
  }
}

export const fuelPriceService = new FuelPriceService();
export default fuelPriceService;
