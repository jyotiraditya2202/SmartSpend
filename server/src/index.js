require('dotenv').config(); // Load environment variables at the top
const express = require('express');
const cors = require('cors');

const connectDB = require('../../server/src/config/db');

const app = express();

// app.use(cors({ origin: 'https://smartspend-1.onrender.com', credentials: true }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(express.json());

// Middleware to parse JSON
app.use(express.json());

// Connect to the database
(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to the database:', err.message);
    process.exit(1); // Exit the process if the database connection fails
  }
})();

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/spend', require('./routes/curlSpend'));
app.use('/api/spendutils', require('./routes/spendUtils'));
app.use('/api/chat', require('./routes/chatBot'));
app.use('/api/MonthlySpend', require('./routes/MonthlySpend'));
app.use('/api/WeeklySpend', require('./routes/WeeklySpend'));

// Use environment variable for port, fallback to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));