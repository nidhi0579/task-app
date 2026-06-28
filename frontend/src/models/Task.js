const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Completed']
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);