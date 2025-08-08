const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const MonthlySpend = require('../models/MonthlyRecord');
const User = require('../models/User');
const SpendData = require('../models/SpendData');
const DateUtils = require('../Utils/DateUtils');
const auth = require('../middleware/auth');

require('dotenv').config();

// @route   POST /api/MonthlySpend/insert
// @desc    it willinsert the month record use it only if the month record does not exist

router.post('/insert', auth, async (req, res) => {
  try {

    const userId = req.user.user.id;

    const user = await User.findOne({_id: userId});

    if(!user){
        return res.status(404).json({error: 'user not found while fetching budget'});
    }

    const budget = user.budget;

    const today = new Date();

    const StartOfMonth = DateUtils.getStartOfMonth(today);
    const EndOfMonth = DateUtils.getEndOfMonth(today);

    const newMonthlySpend = new MonthlySpend(
        {
            user_id: userId,
            StartDate: StartOfMonth,
            EndDate: EndOfMonth,
            budget: budget, 
        }
    )
    
    await newMonthlySpend.save();

    res.status(200).json({ msg: "month inserted succefully!!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "month can not be inserted!!" });
  }
});

// @route   POST /api/MonthlySpend/sync
// @desc    used for sync the new data in the record

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

    const StartOfMonth = DateUtils.getStartOfMonth(today);
    const EndOfMonth = DateUtils.getEndOfMonth(today);

    const spendByCategory = await SpendData.aggregate([
        {
        $match: {
            user_id: new mongoose.Types.ObjectId(userId),
            date: {
            $gte: StartOfMonth,
            $lte: EndOfMonth
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

    const updatedRecord = await MonthlySpend.findOneAndUpdate(
    {
        user_id: userId,
        StartDate: StartOfMonth
    },
    {
        $set: updateObject
    },
    {
        new: true
    }
    );

    if(!updatedRecord){
       return res.status(500).json({ msg: "month can not be found!!" });
    }

    res.status(200).json({ msg: "month data updated succefully!!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "month can not be updated!!" });
  }
});

module.exports = router;
