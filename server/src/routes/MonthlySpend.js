const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const router = express.Router();

const MonthlySpend = require('../models/MonthlyRecord');
const User = require('../models/User');
const SpendData = require('../models/SpendData');
const IncomeData = require('../models/IncomeData');
const DateUtils = require('../Utils/DateUtils');
const auth = require('../middleware/auth');


require('dotenv').config();

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';

// --- insert function for reusabilty ---
async function insert(userId) {

  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new Error('User not found while fetching budget');
  }

  const budget = user.budget;

  const today = new Date();

  const StartOfMonth = DateUtils.getStartOfMonth(today);
  const EndOfMonth = DateUtils.getEndOfMonth(today);

  const existingRecord = await MonthlySpend.findOne({
    user_id: userId,
    StartDate: StartOfMonth
  });

  if (existingRecord) {
    throw new Error('Month entry already exists');
  }

  try {

  const newMonthlySpend = new MonthlySpend(
      {
          user_id: userId,
          StartDate: StartOfMonth,
          EndDate: EndOfMonth,
          budget: budget, 
      }
  )
  
  await newMonthlySpend.save(); 
  const msg = "Succesfully created the month entry!!";
  return msg;
  }
  catch(error){
    return error;
  }
}
// --- aggregate income of this month ---

async function getIncome(userId, startDate, endDate) {
  try {
      const result = await IncomeData.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: "$amount" }
          }
        }
      ]);

      // If no income, return 0
      return result.length > 0 ? result[0].totalIncome : 0;
    } catch (err) {
      console.error("Error in getBudget:", err);
      throw err;
    }
}
  
// --- sync function for re-usabilty ---
async function sync(userId) {
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

    const user = await User.findOne({_id: userId});

    if(!user){
        return 'user not found while fetching budget';
    }

    const today = new Date();

    const StartOfMonth = DateUtils.getStartOfMonth(today);
    const EndOfMonth = DateUtils.getEndOfMonth(today);

    const budget = await getIncome(userId, StartOfMonth, EndOfMonth);

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
            total: { $sum: "$amount" }
        }
        }
    ]);

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
    budget: budget,
    totalSpend: totalSpend,
    };

    spendCategories.forEach(category => {
    updateObject[`categories.${category}`] = categoryTotals[category];
    });

    let updatedRecord = await MonthlySpend.findOneAndUpdate(
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
      try {
        await insert(userId); 

        await MonthlySpend.findOneAndUpdate(
          { user_id: userId, StartDate: StartOfMonth },
          { $set: updateObject },
          { new: true }
        );

        return "succefully synced the data";
      }
      catch(err){
        return err;
      }}

    try{
      await User.findOneAndUpdate(
        {_id: userId},
        {$set: {budget: budget}},
        {new: true}
      );

      return "suuceffully update the user budget";
    }
    catch(err){
      return "cant update the user budget";
    }

    return "succefully synced the data";

  }
  catch(err){
    return "Internal Server Error";
  }
  
}

// @route   POST /api/MonthlySpend/sync
// @desc    used for sync the new data in the record

router.post('/sync', auth, async (req, res) => {
  try {

    const userId = req.user.user.id;
    
    const result = await sync(userId);
    return res.status(200).json({ message: result });
  }
  catch(err){
    console.error(err);
    return res.status(500).json("Internal Server Error !!");
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
