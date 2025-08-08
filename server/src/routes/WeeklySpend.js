const express     = require('express');
const mongoose    = require('mongoose');
const router      = express.Router();
const WeeklyRecord= require('../models/WeeklyRecord');
const User        = require('../models/User');
const SpendData   = require('../models/SpendData');
const DateUtils   = require('../Utils/DateUtils');
const auth        = require('../middleware/auth');

const spendCategories = [
  "Groceries","Entertainment","Utilities","Transportation",
  "Dining Out","Shopping","Health","Other"
];

// @route   POST /api/WeeklySpend/insert
// @desc    it will insert the Weekly record use it only if the week record does not exist

router.post('/insert', auth, async (req, res) => {
  try {
    const userId = req.user.user.id;
    const user   = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today       = new Date();
    const StartOfWeek = DateUtils.getStartOfWeek(today);
    const EndOfWeek   = DateUtils.getEndOfWeek(today);

    // Only insert if not exists
    const exists = await WeeklyRecord.exists({
      user_id: userId,
      StartDate: StartOfWeek
    });
    if (exists) {
      return res.status(200).json({ msg: 'Weekly record already exists' });
    }

    const rec = new WeeklyRecord({
      user_id:    userId,
      StartDate:  StartOfWeek,
      EndDate:    EndOfWeek,
      budget:     user.budget
    });
    await rec.save();
    res.status(201).json({ msg: 'Weekly record inserted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to insert weekly record' });
  }
});

// @route   POST /api/WeeklySpend/sync
// @desc    it will update the Weekly record 



router.post('/sync', auth, async (req, res) => {
  try {

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

    const userId = req.user.user.id;

    const user = await User.findOne({_id: userId});

    if(!user){
        return res.status(404).json({error: 'user not found while fetching budget'});
    }
    const today = new Date();

    const StartOfWeek = DateUtils.getStartOfWeek(today);
    const EndOfWeek = DateUtils.getEndOfWeek(today);

    const spendByCategory = await SpendData.aggregate([
        {
        $match: {
            user_id: new mongoose.Types.ObjectId(userId),
            date: {
            $gte: StartOfWeek,
            $lte: EndOfWeek
            }
        }
        },
        {
        $group: {
            _id: "$category",
            total: { $sum: "$spend" }
        }
        }
    ]);

    // Initialize all categories with 0
    const categoryTotals = {};
    spendCategories.forEach(cat => {
        categoryTotals[cat] = 0;
    });

    // Fill in actual totals
    spendByCategory.forEach(item => {
        if (item._id && categoryTotals.hasOwnProperty(item._id)) {
        categoryTotals[item._id] = item.total;
        }
    });

    const totalSpend = Object.values(categoryTotals).reduce((acc, val) => acc + val, 0);

    const updateObject = {
    budget: user.budget,
    totalSpend: totalSpend,
    };

    spendCategories.forEach(category => {
    updateObject[`categories.${category}`] = categoryTotals[category];
    });

    const updatedRecord = await WeeklyRecord.findOneAndUpdate(
    {
        user_id: userId,
        StartDate: StartOfWeek
    },
    {
        $set: updateObject
    },
    {
        new: true
    }
    );

    if(!updatedRecord){
       return res.status(500).json({ msg: "week can not be found!!" });
    }

    res.status(200).json({ msg: "week data updated succefully!!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "week can not be updated!!" });
  }
});

module.exports = router;
