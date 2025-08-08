const mongoose = require('mongoose');

const WeeklyRecordSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  StartDate:  { type: Date, required: true, index: true },
  EndDate:    { type: Date, required: true },
// budget for weekly bases is yet to make
//   budget:     { type: Number, required: true },
  totalSpend: { type: Number, default: 0 },
  categories: {
    Groceries:     { type: Number, default: 0 },
    Entertainment: { type: Number, default: 0 },
    Utilities:     { type: Number, default: 0 },
    Transportation:{ type: Number, default: 0 },
    DiningOut:     { type: Number, default: 0 },
    Shopping:      { type: Number, default: 0 },
    Health:        { type: Number, default: 0 },
    Other:         { type: Number, default: 0 },
  }
});

module.exports = mongoose.model('WeeklyRecord', WeeklyRecordSchema);