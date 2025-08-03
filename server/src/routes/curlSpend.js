const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SpendData = require('../models/SpendData');
const auth = require('../middleware/auth');

require('dotenv').config();

// @route   POST /api/spend/insert
// @desc    inserting the spend

router.post('/insert',auth, async (req, res) => {
  try {
    console.log("Inserting the spend record");

    const user_id = req.user.user.id;
    console.log(user_id);
    const { title, category, spend } = req.body;

    const newSpend = new SpendData({
      user_id,
      title,
      category,
      spend
    });

    await newSpend.save();

    res.status(201).json({ message: 'Spend record inserted successfully', data: newSpend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to insert spend record' });
  }
});

// @route   DELETE /api/spend/delete/:id
// @desc    Delete a spend record by ID for the logged-in user

router.delete('/delete/:id', auth, async (req, res) => {
  try {
    console.log(req.body);
    const user_id = req.user.user.id;
    const spendId = req.params.id;

    // Check if the spend record exists and belongs to the user
    const spendRecord = await SpendData.findOne({ _id: spendId, user_id });

    if (!spendRecord) {record
      return res.status(404).json({ error: 'Spend  not found or unauthorized' });
    }

    await SpendData.deleteOne({ _id: spendId });

    res.status(200).json({ message: 'Spend record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete spend record' });
  }
});

module.exports = router;
