import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(v) {
        // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  preferences: {
    defaultFuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
      default: 'petrol'
    },
    defaultMileage: {
      type: Number,
      default: 15,
      min: 1,
      max: 50
    },
    efficiencyTracking: {
      type: Boolean,
      default: true
    },
    aiInsights: {
      type: Boolean,
      default: true
    },
    refillReminders: {
      type: Boolean,
      default: true
    },
    anomalyAlerts: {
      type: Boolean,
      default: true
    }
  },
  drivingProfile: {
    averageDailyKm: {
      type: Number,
      default: 50,
      min: 1,
      max: 500
    },
    primaryDrivingCondition: {
      type: String,
      enum: ['city', 'highway', 'mixed'],
      default: 'mixed'
    }
  }

}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Transform to remove password from response
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  
  // Add snake_case versions for frontend compatibility
  userObject.email_verified = userObject.email_verified;
  userObject.full_name = userObject.full_name;
  userObject.preferences = userObject.preferences;
  userObject.driving_profile = userObject.drivingProfile;
  userObject.created_at = userObject.createdAt;
  userObject.updated_at = userObject.updatedAt;
  userObject.id = userObject._id;
  delete userObject._id;
  delete userObject.__v;
  
  return userObject;
};

export default mongoose.model('User', userSchema);