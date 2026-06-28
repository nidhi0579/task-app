// Add this as the VERY FIRST line
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');

// Now you can safely use process.env.MONGO_URI
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ Connection Error:", err));