class FuelPriceService {
  constructor() {
    // Default fuel prices for different states in India (realistic values)
    this.defaultPrices = {
      'Maharashtra': {
        'Mumbai': { regular: 106.31, premium: 119.87, diesel: 94.27 },
        'Pune': { regular: 106.87, premium: 120.45, diesel: 94.83 },
        'Nagpur': { regular: 105.98, premium: 119.32, diesel: 93.94 },
        'Thane': { regular: 106.45, premium: 119.98, diesel: 94.41 }
      },
      'Delhi': {
        'Central Delhi': { regular: 103.94, premium: 116.87, diesel: 92.76 },
        'North Delhi': { regular: 103.94, premium: 116.87, diesel: 92.76 },
        'South Delhi': { regular: 103.94, premium: 116.87, diesel: 92.76 },
        'East Delhi': { regular: 103.94, premium: 116.87, diesel: 92.76 },
        'West Delhi': { regular: 103.94, premium: 116.87, diesel: 92.76 }
      },
      'Karnataka': {
        'Bangalore': { regular: 101.94, premium: 114.87, diesel: 89.73 },
        'Mysore': { regular: 102.45, premium: 115.32, diesel: 90.24 },
        'Hubli': { regular: 102.87, premium: 115.76, diesel: 90.66 }
      },
      'Tamil Nadu': {
        'Chennai': { regular: 102.63, premium: 115.43, diesel: 89.94 },
        'Coimbatore': { regular: 103.15, premium: 115.98, diesel: 90.46 },
        'Madurai': { regular: 103.45, premium: 116.32, diesel: 90.76 }
      },
      'Gujarat': {
        'Ahmedabad': { regular: 96.72, premium: 108.94, diesel: 87.32 },
        'Surat': { regular: 97.15, premium: 109.43, diesel: 87.75 },
        'Vadodara': { regular: 96.94, premium: 109.15, diesel: 87.54 }
      },
      'Rajasthan': {
        'Jaipur': { regular: 108.48, premium: 122.15, diesel: 95.76 },
        'Udaipur': { regular: 108.94, premium: 122.65, diesel: 96.22 },
        'Jodhpur': { regular: 108.72, premium: 122.40, diesel: 96.00 }
      },
      'Uttar Pradesh': {
        'Lucknow': { regular: 96.57, premium: 108.76, diesel: 83.96 },
        'Kanpur': { regular: 96.84, premium: 109.06, diesel: 84.23 },
        'Noida': { regular: 96.32, premium: 108.48, diesel: 83.71 }
      },
      'West Bengal': {
        'Kolkata': { regular: 106.03, premium: 119.32, diesel: 92.76 },
        'Howrah': { regular: 106.32, premium: 119.65, diesel: 93.05 }
      },
      'Punjab': {
        'Chandigarh': { regular: 96.12, premium: 108.28, diesel: 84.32 },
        'Amritsar': { regular: 96.45, premium: 108.65, diesel: 84.65 },
        'Ludhiana': { regular: 96.28, premium: 108.45, diesel: 84.48 }
      },
      'Haryana': {
        'Gurgaon': { regular: 96.78, premium: 108.98, diesel: 84.98 },
        'Faridabad': { regular: 96.65, premium: 108.82, diesel: 84.85 }
      }
    };
  }

  async getStates() {
    return Object.keys(this.defaultPrices);
  }

  async getDistricts(state) {
    if (!this.defaultPrices[state]) {
      throw new Error(`State ${state} not found`);
    }
    return Object.keys(this.defaultPrices[state]);
  }

  async getFuelPrices(state, district) {
    if (!this.defaultPrices[state]) {
      throw new Error(`State ${state} not found`);
    }
    
    if (!this.defaultPrices[state][district]) {
      // If district not found, return the first district's prices as default
      const firstDistrict = Object.keys(this.defaultPrices[state])[0];
      return {
        state,
        district: firstDistrict,
        prices: this.defaultPrices[state][firstDistrict],
        lastUpdated: new Date().toISOString()
      };
    }

    return {
      state,
      district,
      prices: this.defaultPrices[state][district],
      lastUpdated: new Date().toISOString()
    };
  }

  async getAllStatePrices(state) {
    if (!this.defaultPrices[state]) {
      throw new Error(`State ${state} not found`);
    }

    return {
      state,
      districts: this.defaultPrices[state],
      lastUpdated: new Date().toISOString()
    };
  }

  // Method to update prices (for admin functionality)
  async updateFuelPrices(state, district, prices) {
    if (!this.defaultPrices[state]) {
      this.defaultPrices[state] = {};
    }
    
    this.defaultPrices[state][district] = {
      regular: prices.regular || this.defaultPrices[state][district]?.regular || 100,
      premium: prices.premium || this.defaultPrices[state][district]?.premium || 110,
      diesel: prices.diesel || this.defaultPrices[state][district]?.diesel || 90
    };

    return {
      state,
      district,
      prices: this.defaultPrices[state][district],
      lastUpdated: new Date().toISOString()
    };
  }
}

export default new FuelPriceService();
