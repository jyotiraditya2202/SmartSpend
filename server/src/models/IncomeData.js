const mongoose = require('mongoose');

const SpendSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },       
  amount: { type: Number, required: true },       
  date: { type: Date, default: Date.now }           
});

module.exports = mongoose.model('IncomeData', SpendSchema);