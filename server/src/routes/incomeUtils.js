const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const IncomeData = require('../models/IncomeData');
const auth = require('../middleware/auth');

require('dotenv').config();

// @route   POST /api/incomeutils/getincome
// @desc    in req give the start and end date and it will give the total income between them

router.post('/getammount', auth, async (req, res) => {
  try {
    const { start_date, last_date } = req.body;

    if (!start_date || !last_date) {
      return res.status(400).json({ error: 'start_date and last_date are required' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(last_date);

    if (startDate > endDate) {
      return res.status(400).json({ error: 'start_date must be earlier than last_date' });
    }

    const userId = req.user.user.id;

    const totalIncome = await IncomeData.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const total = totalIncome[0]?.total || 0;

    res.status(200).json({ total_spent: total });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// @route   POST /api/incomeutils/recentIncome
// @desc    recentSpendRecords 

router.post('/recentIncome', auth, async (req, res) => {
  try {
    const userId = req.user.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found while fetching budget' });
    }

    // Get last 5 spends by this user, sorted by latest
    const recentIncome = await IncomeData.find({ user_id: userId })
      .sort({ date: -1 }) // assuming you have timestamps
      .limit(5)
      .select('title category amount date');

    console.log(recentIncome);
    res.status(200).json(recentIncome);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/spendutils/allSpend
// @desc    recentSpendRecords 

router.post('/allIncome', auth, async (req, res) => {
  try {
    const userId = req.user.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found while fetching budget' });
    }

    // Get last 5 spends by this user, sorted by latest
    const allIncome = await IncomeData.find({ user_id: userId })
      .sort({ date: -1 }) // assuming you have timestamps
      .select('category amount date');

    console.log(allIncome);
    res.status(200).json(allIncome);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});