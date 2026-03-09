import FuelEfficiency from '../models/FuelEfficiency.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';

class EfficiencyService {
  // Calculate fuel efficiency from odometer readings
  static calculateEfficiency(odometerBefore, odometerAfter, fuelQuantity) {
    if (fuelQuantity <= 0) return 0;
    const distance = odometerAfter - odometerBefore;
    return distance / fuelQuantity; // km per litre
  }

  // Analyze efficiency trend
  static analyzeTrend(efficiencyRecords) {
    if (efficiencyRecords.length < 3) return 'unknown';
    
    const recent = efficiencyRecords.slice(0, 3).map(r => r.efficiency);
    const older = efficiencyRecords.slice(3, 6).map(r => r.efficiency);
    
    if (recent.length === 0 || older.length === 0) return 'unknown';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (changePercent > 10) return 'improving';
    if (changePercent < -10) return 'declining';
    return 'stable';
  }

  // Detect anomalies using statistical methods
  static detectAnomalies(efficiencyRecords) {
    if (efficiencyRecords.length < 3) return [];
    
    const efficiencies = efficiencyRecords.map(r => r.efficiency);
    const mean = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
    const variance = efficiencies.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / efficiencies.length;
    const stdDev = Math.sqrt(variance);
    
    const anomalies = [];
    
    efficiencyRecords.forEach((record, index) => {
      const zScore = Math.abs(record.efficiency - mean) / stdDev;
      if (zScore > 2) { // 2 standard deviations threshold
        anomalies.push({
          ...record.toObject(),
          anomalyScore: Math.min(zScore / 3, 1), // Normalize to 0-1
          zScore
        });
      }
    });
    
    return anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore);
  }

  // Predict next refill date and distance
  static predictNextRefill(vehicle, currentEfficiency, userDrivingProfile) {
    const avgDailyKm = userDrivingProfile?.averageDailyKm || 50;
    const tankCapacity = vehicle.tankCapacity;
    
    const estimatedKmPerTank = tankCapacity * currentEfficiency;
    const daysUntilRefill = estimatedKmPerTank / avgDailyKm;
    
    const nextRefillDate = new Date();
    nextRefillDate.setDate(nextRefillDate.getDate() + Math.floor(daysUntilRefill));
    
    return {
      estimatedKmPerTank: Math.round(estimatedKmPerTank),
      estimatedNextRefillDate: nextRefillDate,
      daysUntilRefill: Math.floor(daysUntilRefill)
    };
  }

  // Assess engine health based on efficiency
  static assessEngineHealth(efficiency, fuelType, vehicleAge) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - vehicleAge;
    
    // Efficiency thresholds based on fuel type and vehicle age
    const thresholds = {
      petrol: {
        excellent: { min: 18, max: 25 },
        good: { min: 15, max: 18 },
        fair: { min: 12, max: 15 },
        poor: { min: 8, max: 12 },
        critical: { min: 0, max: 8 }
      },
      diesel: {
        excellent: { min: 22, max: 30 },
        good: { min: 18, max: 22 },
        fair: { min: 14, max: 18 },
        poor: { min: 10, max: 14 },
        critical: { min: 0, max: 10 }
      }
    };
    
    const fuelThresholds = thresholds[fuelType] || thresholds.petrol;
    
    // Adjust thresholds based on vehicle age
    const ageMultiplier = age > 10 ? 0.8 : age > 5 ? 0.9 : 1;
    
    for (const [status, range] of Object.entries(fuelThresholds)) {
      const adjustedMin = range.min * ageMultiplier;
      const adjustedMax = range.max * ageMultiplier;
      
      if (efficiency >= adjustedMin && efficiency <= adjustedMax) {
        return status;
      }
    }
    
    return 'unknown';
  }

  // Generate personalized recommendations
  static generateRecommendations(efficiencyRecord, vehicle, user) {
    const recommendations = [];
    const { efficiency, aiInsights, drivingConditions, weatherConditions } = efficiencyRecord;
    
    // Efficiency-based recommendations
    if (aiInsights.efficiencyTrend === 'declining') {
      recommendations.push({
        type: 'maintenance',
        priority: 'medium',
        title: 'Schedule Engine Check',
        description: 'Your fuel efficiency has been declining. Consider getting your engine serviced.',
        action: 'Book service appointment'
      });
    }
    
    // Engine health recommendations
    if (aiInsights.engineHealthAlert === 'warning') {
      recommendations.push({
        type: 'maintenance',
        priority: 'high',
        title: 'Engine Diagnostic Recommended',
        description: 'Your engine efficiency is below optimal range. A diagnostic check is recommended.',
        action: 'Schedule diagnostic'
      });
    } else if (aiInsights.engineHealthAlert === 'critical') {
      recommendations.push({
        type: 'maintenance',
        priority: 'urgent',
        title: 'Immediate Service Required',
        description: 'Your engine efficiency is critically low. Immediate service is recommended.',
        action: 'Book urgent service'
      });
    }
    
    // Theft risk recommendations
    if (aiInsights.theftRisk === 'high') {
      recommendations.push({
        type: 'security',
        priority: 'high',
        title: 'Unusual Fuel Consumption Detected',
        description: 'We detected unusual fuel consumption patterns. Monitor for potential fuel theft.',
        action: 'Review recent fuel records'
      });
    }
    
    // Driving condition recommendations
    if (drivingConditions === 'heavy_traffic') {
      recommendations.push({
        type: 'driving',
        priority: 'low',
        title: 'Optimize Your Route',
        description: 'Heavy traffic conditions are reducing your efficiency. Consider alternative routes.',
        action: 'Try route optimization apps'
      });
    }
    
    // Weather-based recommendations
    if (weatherConditions === 'cold') {
      recommendations.push({
        type: 'maintenance',
        priority: 'low',
        title: 'Cold Weather Efficiency Tips',
        description: 'Cold weather can reduce fuel efficiency. Consider warming up your engine briefly.',
        action: 'Learn winter driving tips'
      });
    }
    
    // Vehicle-specific recommendations
    if (vehicle.fuelType === 'petrol' && efficiency < 12) {
      recommendations.push({
        type: 'driving',
        priority: 'medium',
        title: 'Improve Driving Habits',
        description: 'Your petrol vehicle efficiency is below average. Try smoother acceleration and braking.',
        action: 'Practice eco-driving techniques'
      });
    }
    
    if (vehicle.fuelType === 'diesel' && efficiency < 14) {
      recommendations.push({
        type: 'driving',
        priority: 'medium',
        title: 'Diesel Efficiency Tips',
        description: 'Your diesel vehicle efficiency could be improved. Maintain steady speeds on highways.',
        action: 'Learn diesel efficiency tips'
      });
    }
    
    return recommendations;
  }

  // Calculate cost savings from efficiency improvements
  static calculateCostSavings(currentEfficiency, targetEfficiency, fuelPrice, monthlyKm) {
    const currentFuelConsumption = monthlyKm / currentEfficiency;
    const targetFuelConsumption = monthlyKm / targetEfficiency;
    const fuelSaved = currentFuelConsumption - targetFuelConsumption;
    const costSavings = fuelSaved * fuelPrice;
    
    return {
      monthlySavings: Math.round(costSavings * 100) / 100,
      yearlySavings: Math.round(costSavings * 12 * 100) / 100,
      fuelSavedMonthly: Math.round(fuelSaved * 100) / 100,
      percentageImprovement: Math.round(((targetEfficiency - currentEfficiency) / currentEfficiency) * 100)
    };
  }

  // Compare efficiency with similar vehicles
  static compareWithSimilarVehicles(vehicle, currentEfficiency) {
    // This would typically use a database of similar vehicles
    // For now, we'll use industry averages
    const industryAverages = {
      petrol: {
        sedan: { min: 12, max: 18, average: 15 },
        suv: { min: 8, max: 14, average: 11 },
        hatchback: { min: 14, max: 20, average: 17 },
        motorcycle: { min: 25, max: 45, average: 35 }
      },
      diesel: {
        sedan: { min: 16, max: 24, average: 20 },
        suv: { min: 12, max: 20, average: 16 },
        hatchback: { min: 18, max: 26, average: 22 },
        truck: { min: 8, max: 15, average: 11 }
      }
    };
    
    const averages = industryAverages[vehicle.fuelType]?.[vehicle.vehicleType];
    
    if (!averages) {
      return {
        comparison: 'unknown',
        message: 'No comparison data available for this vehicle type'
      };
    }
    
    let comparison;
    if (currentEfficiency > averages.max) {
      comparison = 'excellent';
    } else if (currentEfficiency > averages.average) {
      comparison = 'good';
    } else if (currentEfficiency > averages.min) {
      comparison = 'below_average';
    } else {
      comparison = 'poor';
    }
    
    const percentile = ((currentEfficiency - averages.min) / (averages.max - averages.min)) * 100;
    
    return {
      comparison,
      percentile: Math.round(Math.min(100, Math.max(0, percentile))),
      industryAverage: averages.average,
      message: this.getComparisonMessage(comparison, percentile)
    };
  }

  static getComparisonMessage(comparison, percentile) {
    const messages = {
      excellent: `Outstanding! Your efficiency is in the top ${100 - percentile}% of similar vehicles.`,
      good: `Great job! Your efficiency is better than average for similar vehicles.`,
      below_average: `Your efficiency is below average. There's room for improvement.`,
      poor: `Your efficiency is significantly below average. Consider maintenance or driving adjustments.`,
      unknown: 'Comparison data not available.'
    };
    
    return messages[comparison] || messages.unknown;
  }

  // Generate comprehensive efficiency report
  static generateEfficiencyReport(userId, vehicleId, days = 30) {
    return new Promise(async (resolve, reject) => {
      try {
        const vehicle = await Vehicle.findOne({ _id: vehicleId, user: userId, isActive: true });
        if (!vehicle) {
          return reject(new Error('Vehicle not found'));
        }

        const user = await User.findById(userId);
        const efficiencyRecords = await FuelEfficiency.getEfficiencyTrends(vehicleId, days);
        
        if (efficiencyRecords.length === 0) {
          return resolve({
            message: 'No efficiency data available for the specified period',
            vehicle: {
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year
            }
          });
        }

        const latestRecord = efficiencyRecords[0];
        const anomalies = this.detectAnomalies(efficiencyRecords);
        const trend = this.analyzeTrend(efficiencyRecords);
        const engineHealth = this.assessEngineHealth(latestRecord.efficiency, vehicle.fuelType, vehicle.year);
        const predictions = this.predictNextRefill(vehicle, latestRecord.efficiency, user.drivingProfile);
        const recommendations = this.generateRecommendations(latestRecord, vehicle, user);
        const comparison = this.compareWithSimilarVehicles(vehicle, latestRecord.efficiency);

        const efficiencies = efficiencyRecords.map(r => r.efficiency);
        const statistics = {
          averageEfficiency: Math.round((efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length) * 100) / 100,
          maxEfficiency: Math.round(Math.max(...efficiencies) * 100) / 100,
          minEfficiency: Math.round(Math.min(...efficiencies) * 100) / 100,
          totalRecords: efficiencyRecords.length,
          totalDistance: efficiencyRecords.reduce((sum, r) => sum + r.distanceTraveled, 0),
          totalFuel: efficiencyRecords.reduce((sum, r) => sum + r.fuelQuantity, 0)
        };

        resolve({
          vehicle: {
            id: vehicle._id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            fuelType: vehicle.fuelType,
            vehicleType: vehicle.vehicleType,
            tankCapacity: vehicle.tankCapacity
          },
          period: {
            days,
            startDate: efficiencyRecords[efficiencyRecords.length - 1].createdAt,
            endDate: latestRecord.createdAt
          },
          currentEfficiency: Math.round(latestRecord.efficiency * 100) / 100,
          statistics,
          analysis: {
            trend,
            engineHealth,
            anomalyCount: anomalies.length,
            comparison
          },
          predictions,
          recommendations: recommendations.slice(0, 5), // Top 5 recommendations
          anomalies: anomalies.slice(0, 3), // Top 3 anomalies
          recentRecords: efficiencyRecords.slice(0, 5) // Last 5 records
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default EfficiencyService;
