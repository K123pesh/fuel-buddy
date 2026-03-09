import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['sedan', 'suv', 'hatchback', 'motorcycle', 'truck', 'van', 'bus', 'other']
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng']
  },
  licensePlate: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  odometerReading: {
    type: Number,
    default: 0,
    min: 0
  },
  tankCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  averageMileage: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Add snake_case versions for frontend compatibility
      ret.user_id = ret.user;
      ret.vehicle_type = ret.vehicleType;
      ret.fuel_type = ret.fuelType;
      ret.license_plate = ret.licensePlate;
      ret.odometer_reading = ret.odometerReading;
      ret.tank_capacity = ret.tankCapacity;
      ret.average_mileage = ret.averageMileage;
      ret.is_active = ret.isActive;
      ret.is_primary = ret.isPrimary;
      ret.created_at = ret.createdAt;
      ret.updated_at = ret.updatedAt;
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for efficient queries
vehicleSchema.index({ user: 1, isActive: 1 });
vehicleSchema.index({ user: 1, isPrimary: 1 });
vehicleSchema.index({ licensePlate: 1 });

// Pre-save middleware to ensure only one primary vehicle per user
vehicleSchema.pre('save', async function(next) {
  if (this.isPrimary) {
    // Unset other primary vehicles for this user
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

// Instance method to get efficiency data
vehicleSchema.methods.getEfficiencyData = async function() {
  const FuelEfficiency = mongoose.model('FuelEfficiency');
  return await FuelEfficiency.find({ vehicle: this._id })
    .sort({ createdAt: -1 })
    .limit(10);
};

// Static method to get user's primary vehicle
vehicleSchema.statics.getPrimaryVehicle = async function(userId) {
  return await this.findOne({ user: userId, isPrimary: true, isActive: true });
};

export default mongoose.model('Vehicle', vehicleSchema);
