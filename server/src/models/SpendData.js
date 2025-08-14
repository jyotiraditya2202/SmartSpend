const mongoose = require('mongoose');

const SpendSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },        
  category: { type: String, required: true },       
  amount: { type: Number, required: true },       
  type:  { type: String, required: true },
  date: { type: Date, default: Date.now }           
});

module.exports = mongoose.model('SpendData', SpendSchema);