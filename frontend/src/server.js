const mongoose = require('mongoose');
const uri = process.env.MONGO_URI; // This must match the name in Render

mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ Connection Error:', err));