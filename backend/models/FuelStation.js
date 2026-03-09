import mongoose from 'mongoose';

const fuelStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  fuelTypes: [{
    type: String,
    enum: ['regular', 'premium', 'diesel']
  }],
  prices: {
    regular: {
      type: Number,
      required: true
    },
    premium: {
      type: Number,
      required: true
    },
    diesel: {
      type: Number,
      required: true
    }
  },
  currency: {
    type: String,
    required: true,
    enum: ['INR', 'USD', 'EUR'],
    default: 'INR'
  },
  pricesINR: {
    regular: {
      type: Number,
      required: function() {
        return this.currency === 'INR';
      }
    },
    premium: {
      type: Number,
      required: function() {
        return this.currency === 'INR';
      }
    },
    diesel: {
      type: Number,
      required: function() {
        return this.currency === 'INR';
      }
    }
  },
  operatingHours: {
    open: String,
    close: String
  },
  services: [{
    type: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('FuelStation', fuelStationSchema);