const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token') || req.headers['authorization']?.split(' ')[1];

  console.log("req.user:", req.user);

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};