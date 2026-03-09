// Currency utility functions for Indian Rupees formatting

export const formatIndianRupees = (amount: number): string => {
  if (isNaN(amount)) return '₹0.00';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatIndianRupeesCompact = (amount: number): string => {
  if (isNaN(amount)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getCurrencySymbol = (): string => {
  return '₹';
};

export const convertToRupees = (amountInDollars: number): number => {
  // Conversion rate (example: 1 USD = 83 INR)
  // You can update this rate based on current exchange rates
  const conversionRate = 83;
  return Math.round(amountInDollars * conversionRate);
};

// Price ranges for fuel in Indian market
export const getFuelPriceRangeINR = () => {
  return {
    regular: { min: 95, max: 110, average: 102.50 }, // per liter
    premium: { min: 105, max: 125, average: 115.00 }, // per liter
    diesel: { min: 90, max: 105, average: 97.50 } // per liter
  };
};

// Common fuel quantities and their prices in INR
export const getFuelPriceINR = (type: 'regular' | 'premium' | 'diesel', liters: number): number => {
  const priceRanges = getFuelPriceRangeINR();
  const pricePerLiter = priceRanges[type].average;
  return Math.round(pricePerLiter * liters * 100) / 100;
};
