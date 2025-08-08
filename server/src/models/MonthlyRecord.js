const mongoose = require('mongoose');

const spendCategories = [
  "Groceries",
  "Entertainment",
  "Utilities",
  "Transportation",
  "Dining Out",
  "Shopping",
  "Health",
  "Other"
];

// Define a dynamic schema for category-wise spendings
const categorySchema = {};
spendCategories.forEach(category => {
  categorySchema[category] = {
    type: Number,
    default: 0,
  };
});

const MonthlySpendSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  StartDate: { type: Date, default: Date.now, index: true },
  EndDate: { type: Date, default: Date.now },
  
  budget: { type: Number, default: 0 }, 
  totalSpend: { type: Number, default: 0 }, 

  // Category-wise spendings (dynamically built from array)
  categories: {
    type: Map,
    of: Number,
    default: () => {
      const map = {};
      spendCategories.forEach(cat => map[cat] = 0);
      return map;
    }
  }
});

module.exports = mongoose.model('MonthlySpend', MonthlySpendSchema);
