const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const IncomeData = require('../models/IncomeData');
const auth = require('../middleware/auth');

require('dotenv').config();

// @route   POST /api/income/insert
// @desc    inserting the spend

router.post('/insert',auth, async (req, res) => {
  try {
    console.log("Inserting the income record");

    const user_id = req.user.user.id;
    console.log(user_id);
    const { category, amount } = req.body;

    const newIncome = new IncomeData({
      user_id,
      category,
      amount
    });

    await newIncome.save();

    res.status(201).json({ message: 'Income record inserted successfully', data: newIncome });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to insert Income record' });
  }
});

// @route   DELETE /api/income/delete/:id
// @desc    Delete a income record by ID for the logged-in user

router.delete('/delete/:id', auth, async (req, res) => {
  try {
    console.log(req.body);
    const user_id = req.user.user.id;
    const incomeId = req.params.id;

    // Check if the spend record exists and belongs to the user
    const incomeRecord = await IncomeData.findOne({ _id: incomeId, user_id });

    if (!incomeRecord) {record
      return res.status(404).json({ error: 'Income  not found or unauthorized' });
    }

    await IncomeData.deleteOne({ _id: incomeId });

    res.status(200).json({ message: 'Income record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete income record' });
  }
});

module.exports = router;
