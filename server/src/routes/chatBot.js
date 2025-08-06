// in routes/spendUtils.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const SpendData = require('../models/SpendData');
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatHistories = {};
    
/**
 * @route   POST /api/chat/generatePrompt
 * @desc    Build system prompt for budget chatbot based on user data
 */

router.post('/generatePrompt', auth, async (req, res) => {
  try {
    const userId = req.user.user.id;

    // 1. Fetch user and budget
    const user = await User.findById(userId).select('budget');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const monthlyBudget = user.budget ?? 0;

    // 2. Determine current month range
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    const monthStart = new Date(year, month, 1);
    const monthEnd   = new Date(year, month + 1, 0);

    // 3. Aggregate total spent and category breakdown for this month
    const agg = await SpendData.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: '$category',
          totalByCat: { $sum: '$spend' },
          countByCat: { $sum: 1 }
        }
      }
    ]);

    const totalSpent = agg.reduce((sum, c) => sum + c.totalByCat, 0);
    const remaining  = monthlyBudget - totalSpent;

    // 4. Days left in month
    const daysInMonth = monthEnd.getDate();
    const today = now.getDate();
    const daysLeft = daysInMonth - today + 1;

    // 5. Build the prompt string
    let prompt = [
    `You are SmartBudgetBot, an intelligent and friendly personal finance assistant.`,
    `Your job is to help the user manage their budget with practical, numeric, and category-wise suggestions.`,
    ``,
    `User's Monthly Budget: ₹${monthlyBudget}`,
    `Total Spent So Far (as of ${now.toLocaleDateString()}): ₹${totalSpent}`,
    `Remaining Budget: ₹${remaining}`,
    `Days Left in Month: ${daysLeft}`,
    ``,
    `Based on this, calculate the user's average daily spending allowance for the rest of the month.`,
    `Then, analyze category-wise spending and suggest a plan to adjust or cut down in specific categories.`,
    ``,
    `Here's the category-wise breakdown:`
    ].join('\n');

    // 6. Append each category line
    agg.forEach(cat => {
      prompt += `\n  • ${cat._id}: ₹${cat.totalByCat} (${cat.countByCat} transactions)`;
    });

    prompt += `\n\nWhen the user asks a question, answer in the context of this budget information.`;

    // store the sirst conversation in the history 

    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: prompt }]
        },
        {
          role: "model",
          parts: [{ text: "Great! I'm ready to help you make smart spending decisions based on your budget." }]
        }
      ]
    });

    chatHistories[userId] = [
      {
        role: "user",
        parts: [{ text: prompt }]
      },
      {
        role: "model",
        parts: [{ text: "Great! I'm ready to help you make smart spending decisions based on your budget." }]
      }
    ];

    // 7. Return the generated system prompt
    res.status(200).json({
      firstreply: "Great! I'm ready to help you make smart spending decisions based on your budget."
    });

  } catch (err) {
    console.error('Error in generatePrompt:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- chat ---
// POST /api/chat
// Body: { userMessage: "Should I spend ₹500 on dinner?" }

router.post('/chat', auth, async (req, res) => {
  const { userMessage } = req.body;

  const userId = req.user.user.id; // or req.user.id based on your middleware

  if (!userMessage) {
    return res.status(400).json({ error: "userMessage is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    // Check if prompt is initialized
    const history = chatHistories[userId];
    if (!history || history.length < 2) {
      return res.status(400).json({ error: "System prompt not generated yet. Call /generatePrompt first." });
    }

    history.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const geminiResponse = result.response.text();

    history.push({
      role: "model",
      parts: [{ text: geminiResponse }]
    });

    chatHistories[userId] = history;

    res.status(200).json({ response: geminiResponse });

  } catch (error) {
    console.error("Gemini Chat Error:", error.message);
    res.status(500).json({ error: "Failed to get response from Gemini." });
  }
});

module.exports = router;
