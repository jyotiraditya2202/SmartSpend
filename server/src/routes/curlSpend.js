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

module.exports = router;

/*
// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  console.log("Received login request:", req.body);
  
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
*/