import mongoose from 'mongoose';
import currencyService from '../services/currencyService.js';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['fuel_delivery'],
    default: 'fuel_delivery'
  },
  fuelStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FuelStation',
    required: false // Make optional for now
  },
  fuelType: {
    type: String,
    required: function() {
      return this.serviceType === 'fuel_delivery';
    },
    enum: ['regular', 'premium', 'diesel']
  },

  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['INR', 'USD', 'EUR'],
    default: 'INR'
  },
  totalPriceINR: {
    type: Number,
    required: false,
    min: 0
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash_on_delivery', 'card', 'wallet'],
    default: 'cash_on_delivery'
  },
  deliveryTime: {
    type: Date,
    required: true
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  },
  cashOnDeliveryCollected: {
    type: Boolean,
    default: false
  },
  cashCollectionAmount: {
    type: Number,
    default: 0
  },
  cashCollectionCurrency: {
    type: String,
    enum: ['INR', 'USD'],
    default: 'INR'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: false
  },
  efficiencyData: {
    odometerBefore: {
      type: Number,
      min: 0
    },
    odometerAfter: {
      type: Number,
      min: 0
    },
    calculatedEfficiency: {
      type: Number,
      min: 0
    },
    distanceTraveled: {
      type: Number,
      min: 0
    },
    fuelEfficiencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FuelEfficiency'
    }
  },
  aiPredictions: {
    estimatedNextRefillKm: {
      type: Number,
      min: 0
    },
    estimatedNextRefillDate: {
      type: Date
    },
    efficiencyInsights: {
      type: String,
      maxlength: 500
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Add snake_case versions for frontend compatibility
      ret.total_price = ret.totalPrice;
      ret.payment_method = ret.paymentMethod;
      ret.delivery_address = ret.deliveryAddress;
      ret.payment_status = ret.paymentStatus;
      ret.cash_on_delivery_collected = ret.cashOnDeliveryCollected;
      ret.cash_collection_amount = ret.cashCollectionAmount;
      ret.cash_collection_currency = ret.cashCollectionCurrency;
      ret.vehicle_id = ret.vehicle;
      ret.efficiency_data = ret.efficiencyData;
      ret.ai_predictions = ret.aiPredictions;
      ret.created_at = ret.createdAt;
      ret.updated_at = ret.updatedAt;
      ret.id = ret._id;
      return ret;
    }
  }
});

// Pre-save middleware to handle currency conversion (disabled for now)
// orderSchema.pre('save', async function(next) {
//   if (this.currency === 'INR' && this.totalPrice && !this.totalPriceINR) {
//     // Convert USD price to INR (assuming totalPrice is in USD)
//     this.totalPriceINR = await currencyService.convertCurrency(this.totalPrice, 'USD', 'INR');
//   } else if (this.currency === 'USD' && this.totalPriceINR && !this.totalPrice) {
//     // Convert INR price to USD
//     this.totalPrice = await currencyService.convertCurrency(this.totalPriceINR, 'INR', 'USD');
//   } else if (this.currency === 'EUR' && this.totalPrice && !this.totalPriceINR) {
//     // Convert EUR price to INR
//     this.totalPriceINR = await currencyService.convertCurrency(this.totalPrice, 'EUR', 'INR');
//   }
//   
//   next();
// });

export default mongoose.model('Order', orderSchema);
