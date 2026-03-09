import axios from 'axios';

class CurrencyService {
  constructor() {
    this.exchangeRates = {};
    this.lastUpdated = null;
    // Cache rates for 1 hour
    this.cacheDuration = 60 * 60 * 1000;
  }

  // Fetch current exchange rates from a reliable API
  async fetchExchangeRates(baseCurrency = 'USD') {
    try {
      // Using a free currency API - in production, you might want to use a paid service
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      this.exchangeRates = response.data.rates;
      this.lastUpdated = new Date();
      return this.exchangeRates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error.message);
      // Return fallback rates if API call fails
      return this.getDefaultRates();
    }
  }

  // Get cached rates or fetch new ones if cache is expired
  async getExchangeRates() {
    const now = new Date();
    
    // Check if cache is expired (more than 1 hour old)
    if (!this.lastUpdated || (now - this.lastUpdated) > this.cacheDuration) {
      console.log('Updating exchange rates from API...');
      return await this.fetchExchangeRates();
    }
    
    return this.exchangeRates;
  }

  // Get rate for specific currency conversion
  async getConversionRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    const rates = await this.getExchangeRates();
    
    // If fromCurrency is USD, use the direct rate
    if (fromCurrency === 'USD') {
      return rates[toCurrency] || this.getDefaultRate(fromCurrency, toCurrency);
    }
    
    // If toCurrency is USD, use inverse rate
    if (toCurrency === 'USD') {
      return 1.0 / (rates[fromCurrency] || this.getDefaultRate(toCurrency, fromCurrency));
    }
    
    // Convert via USD as base currency
    const rateFromToUSD = 1.0 / (rates[fromCurrency] || this.getDefaultRate('USD', fromCurrency));
    const rateUSDtoTo = rates[toCurrency] || this.getDefaultRate('USD', toCurrency);
    
    return rateFromToUSD * rateUSDtoTo;
  }

  // Convert amount from one currency to another
  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = await this.getConversionRate(fromCurrency, toCurrency);
    return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
  }

  // Get default rates as fallback
  getDefaultRates() {
    return {
      USD: 1.0,
      INR: 83.0, // Approximate rate as fallback
      EUR: 0.85, // Approximate rate as fallback
    };
  }

  // Get default rate for a specific currency pair
  getDefaultRate(fromCurrency, toCurrency) {
    const defaultRates = this.getDefaultRates();
    
    if (fromCurrency === toCurrency) {
      return 1.0;
    }
    
    if (fromCurrency === 'USD') {
      return defaultRates[toCurrency] || 1.0;
    }
    
    if (toCurrency === 'USD') {
      return 1.0 / (defaultRates[fromCurrency] || 1.0);
    }
    
    // Convert via USD
    const rateFromToUSD = 1.0 / (defaultRates[fromCurrency] || 1.0);
    const rateUSDtoTo = defaultRates[toCurrency] || 1.0;
    
    return rateFromToUSD * rateUSDtoTo;
  }
}

export default new CurrencyService();