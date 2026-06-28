require('dotenv').config(); 
const mongoose = require('mongoose');

// The code must use process.env.MONGO_URI exactly
const dbURI = process.env.MONGO_URI; 

mongoose.connect(dbURI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ Connection Error:', err));