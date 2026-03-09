import mongoose from 'mongoose';

const fuelEfficiencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  odometerBefore: {
    type: Number,
    required: true,
    min: 0
  },
  odometerAfter: {
    type: Number,
    required: true,
    min: 0
  },
  fuelQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  distanceTraveled: {
    type: Number,
    required: true,
    min: 0
  },
  efficiency: {
    type: Number,
    required: true,
    min: 0
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng']
  },
  drivingConditions: {
    type: String,
    enum: ['city', 'highway', 'mixed', 'heavy_traffic'],
    default: 'mixed'
  },
  weatherConditions: {
    type: String,
    enum: ['normal', 'rain', 'hot', 'cold'],
    default: 'normal'
  },
  aiInsights: {
    efficiencyTrend: {
      type: String,
      enum: ['improving', 'declining', 'stable', 'unknown'],
      default: 'unknown'
    },
    predictedNextRefillKm: {
      type: Number,
      min: 0
    },
    predictedNextRefillDate: {
      type: Date
    },
    engineHealthAlert: {
      type: String,
      enum: ['good', 'warning', 'critical'],
      default: 'good'
    },
    theftRisk: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    recommendations: [{
      type: String,
      maxlength: 200
    }],
    analysis: {
      type: String,
      maxlength: 1000
    }
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  anomalyScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Add snake_case versions for frontend compatibility
      ret.user_id = ret.user;
      ret.vehicle_id = ret.vehicle;
      ret.order_id = ret.order;
      ret.odometer_before = ret.odometerBefore;
      ret.odometer_after = ret.odometerAfter;
      ret.fuel_quantity = ret.fuelQuantity;
      ret.distance_traveled = ret.distanceTraveled;
      ret.fuel_type = ret.fuelType;
      ret.driving_conditions = ret.drivingConditions;
      ret.weather_conditions = ret.weatherConditions;
      ret.ai_insights = ret.aiInsights;
      ret.is_anomaly = ret.isAnomaly;
      ret.anomaly_score = ret.anomalyScore;
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
fuelEfficiencySchema.index({ user: 1, createdAt: -1 });
fuelEfficiencySchema.index({ vehicle: 1, createdAt: -1 });
fuelEfficiencySchema.index({ order: 1 });
fuelEfficiencySchema.index({ isAnomaly: 1 });

// Pre-save middleware to calculate efficiency
fuelEfficiencySchema.pre('save', function(next) {
  if (this.isModified('odometerBefore') || this.isModified('odometerAfter') || this.isModified('fuelQuantity')) {
    this.distanceTraveled = this.odometerAfter - this.odometerBefore;
    if (this.fuelQuantity > 0) {
      this.efficiency = this.distanceTraveled / this.fuelQuantity; // km per litre
    }
  }
  next();
});

// Static method to get efficiency trends
fuelEfficiencySchema.statics.getEfficiencyTrends = async function(vehicleId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.find({ 
    vehicle: vehicleId, 
    createdAt: { $gte: startDate } 
  }).sort({ createdAt: -1 });
};

// Static method to detect anomalies
fuelEfficiencySchema.statics.detectAnomalies = async function(vehicleId) {
  const recentRecords = await this.find({ vehicle: vehicleId })
    .sort({ createdAt: -1 })
    .limit(10);
  
  if (recentRecords.length < 3) return [];
  
  const efficiencies = recentRecords.map(r => r.efficiency);
  const avg = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
  const stdDev = Math.sqrt(efficiencies.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / efficiencies.length);
  
  const anomalies = recentRecords.filter(record => {
    const zScore = Math.abs(record.efficiency - avg) / stdDev;
    return zScore > 2; // 2 standard deviations
  });
  
  return anomalies;
};

// Instance method to generate AI insights
fuelEfficiencySchema.methods.generateAIInsights = async function() {
  const trends = await this.constructor.getEfficiencyTrends(this.vehicle);
  const anomalies = await this.constructor.detectAnomalies(this.vehicle);
  
  // Analyze efficiency trend
  if (trends.length >= 3) {
    const recent = trends.slice(0, 3).map(t => t.efficiency);
    const older = trends.slice(3, 6).map(t => t.efficiency);
    
    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      
      if (recentAvg > olderAvg * 1.1) {
        this.aiInsights.efficiencyTrend = 'improving';
      } else if (recentAvg < olderAvg * 0.9) {
        this.aiInsights.efficiencyTrend = 'declining';
      } else {
        this.aiInsights.efficiencyTrend = 'stable';
      }
    }
  }
  
  // Predict next refill
  if (this.efficiency > 0) {
    const Vehicle = mongoose.model('Vehicle');
    const vehicle = await Vehicle.findById(this.vehicle);
    if (vehicle) {
      const estimatedKmPerTank = vehicle.tankCapacity * this.efficiency;
      this.aiInsights.predictedNextRefillKm = estimatedKmPerTank;
      
      // Predict next refill date (assuming average daily driving)
      const avgDailyKm = 50; // Default assumption
      const daysUntilRefill = estimatedKmPerTank / avgDailyKm;
      const nextRefillDate = new Date();
      nextRefillDate.setDate(nextRefillDate.getDate() + Math.floor(daysUntilRefill));
      this.aiInsights.predictedNextRefillDate = nextRefillDate;
    }
  }
  
  // Engine health assessment
  if (this.efficiency < 8 && this.fuelType === 'petrol') {
    this.aiInsights.engineHealthAlert = 'warning';
  } else if (this.efficiency < 6 && this.fuelType === 'petrol') {
    this.aiInsights.engineHealthAlert = 'critical';
  } else if (this.efficiency < 12 && this.fuelType === 'diesel') {
    this.aiInsights.engineHealthAlert = 'warning';
  } else if (this.efficiency < 10 && this.fuelType === 'diesel') {
    this.aiInsights.engineHealthAlert = 'critical';
  }
  
  // Theft risk assessment
  const isAnomaly = anomalies.some(a => a._id.toString() === this._id.toString());
  if (isAnomaly) {
    this.aiInsights.theftRisk = 'high';
    this.isAnomaly = true;
  } else if (anomalies.length > 0) {
    this.aiInsights.theftRisk = 'medium';
  }
  
  // Generate recommendations
  this.aiInsights.recommendations = [];
  
  if (this.aiInsights.efficiencyTrend === 'declining') {
    this.aiInsights.recommendations.push('Consider engine maintenance check');
    this.aiInsights.recommendations.push('Check tire pressure');
  }
  
  if (this.aiInsights.engineHealthAlert === 'warning') {
    this.aiInsights.recommendations.push('Schedule engine diagnostic');
  } else if (this.aiInsights.engineHealthAlert === 'critical') {
    this.aiInsights.recommendations.push('Immediate engine service recommended');
  }
  
  if (this.drivingConditions === 'heavy_traffic') {
    this.aiInsights.recommendations.push('Consider alternative routes to avoid traffic');
  }
  
  return this.save();
};

export default mongoose.model('FuelEfficiency', fuelEfficiencySchema);
