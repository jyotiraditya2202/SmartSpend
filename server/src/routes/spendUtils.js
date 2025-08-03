const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const SpendData = require('../models/SpendData');
const auth = require('../middleware/auth');

require('dotenv').config();

// @route   POST /api/spendutils/getbudget
// @desc    it gives budget od the user 

router.post('/getbudget', auth, async (req, res) => {
  try {

    const userId = req.user.user.id;

    const user = await User.findOne({_id: userId});

    if(!user){
        return res.status(404).json({error: 'user not found while fetching budget'});
    }

    const budget = user.budget;

    if(budget == null){
        return res.status(200).json({budget: null});
    }
    res.status(200).json({ budget: budget });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/spendutils/getammount
// @desc    in req give the start and end date and it will give the total spen between them

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

    const totalSpend = await SpendData.aggregate([
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
          total: { $sum: "$spend" }
        }
      }
    ]);

    const total = totalSpend[0]?.total || 0;

    res.status(200).json({ total_spent: total });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
