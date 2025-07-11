const mongoose = require('mongoose');

const AdBudgetSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.ObjectId,
    ref: 'AdCampaign',
    required: true
  },
  totalBudget: {
    type: Number,
    required: [true, 'Please add a total budget']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  budgetAllocation: [
    {
      platform: {
        type: String,
        enum: ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'],
        required: true
      },
      allocatedAmount: Number,
      spentAmount: {
        type: Number,
        default: 0
      },
      dailyLimit: Number
    }
  ],
  monthlyBreakdown: [
    {
      month: Number,
      year: Number,
      allocatedAmount: Number,
      spentAmount: Number
    }
  ],
  weeklyBreakdown: [
    {
      week: Number,
      year: Number,
      allocatedAmount: Number,
      spentAmount: Number
    }
  ],
  thresholds: [
    {
      percentage: Number,
      notified: {
        type: Boolean,
        default: false
      }
    }
  ],
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
AdBudgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to calculate budget utilization
AdBudgetSchema.statics.calculateUtilization = async function(budgetId) {
  const budget = await this.findById(budgetId);
  
  // Calculate total spent
  let totalSpent = 0;
  budget.budgetAllocation.forEach(allocation => {
    totalSpent += allocation.spentAmount;
  });
  
  // Calculate utilization percentage
  const utilizationPercentage = (totalSpent / budget.totalBudget) * 100;
  
  return {
    totalSpent,
    remaining: budget.totalBudget - totalSpent,
    utilizationPercentage
  };
};

module.exports = mongoose.model('AdBudget', AdBudgetSchema);