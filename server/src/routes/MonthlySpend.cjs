const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const MonthlySpend = require('../models/MonthlyRecord');
const User = require('../models/User');
const SpendData = require('../models/SpendData');
const DateUtils = require('../Utils/DateUtils');
const auth = require('../middleware/auth');
const axios = require('axios');

require('dotenv').config();

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';


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

        try{
           const MonthlyInsrt = await axios.post(`${BASE_URL}/api/MonthlySpend/insert` ,
            {}, 
            { headers: { Authorization: req.headers.authorization } });

            const Sync = await axios.post(`${BASE_URL}/api/MonthlySpend/sync` ,
            {}, 
            { headers: { Authorization: req.headers.authorization } });
            return res.status(200).json("Succefully inserted the month record");        

        }   
        catch(err){
            console.log("Error ocured while inerting the monthly data:",err);
            return res.status(400).json("Error ocured while inserting the month !!");
        }
    }

    res.status(200).json({ msg: "month data updated succefully!!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "month can not be updated!!" });
  }
});


// @route   POST /api/MonthlySpend/fetchdata
// @desc    used for fetch all data of the monthly spend of the user

router.post('/fetchdata', auth, async (req, res) => {
  try {

    const userId = req.user.user.id;

    const user = await User.findOne({_id: userId});

    if(!user){
        return res.status(404).json({error: 'user not found while fetching budget'});
    }

    // --- selecting all from the month data ---
    const monthlyData = await MonthlySpend.find({ user_id: userId })
        .sort({ StartDate: 1 }); 

        console.log(monthlyData);
        res.status(200).json(monthlyData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "month can not be fetched!!" });
  }
});


module.exports = router;
