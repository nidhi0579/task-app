const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

let isConnected = false;
let fallbackMemoryTasks = []; 

// 1. Establish MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskapp';
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    isConnected = true;
  })
  .catch(() => {
    console.log('⚠️ MongoDB Service Not Found. Running on Local Memory Fallback Mode.');
    isConnected = false;
  });

// 2. Updated Mongoose Schema with 'category'
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Completed'] },
  category: { type: String, default: 'General' }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

// 3. Express API Routes

// GET route
app.get('/tasks', async (req, res) => {
  if (isConnected) {
    try {
      const allTasks = await Task.find().sort({ createdAt: -1 });
      return res.status(200).json(allTasks);
    } catch (err) {}
  }
  res.status(200).json(fallbackMemoryTasks);
});

// POST route - handles title and category selection
app.post('/tasks', async (req, res) => {
  const { title, category } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const cleanTitle = title.trim();
  const cleanCategory = category || 'General';

  if (isConnected) {
    try {
      const newTask = new Task({ title: cleanTitle, category: cleanCategory });
      await newTask.save();
      return res.status(201).json(newTask);
    } catch (err) {}
  }

  const mockTask = {
    _id: new mongoose.Types.ObjectId().toString(),
    title: cleanTitle,
    status: 'Pending',
    category: cleanCategory,
    createdAt: new Date()
  };
  fallbackMemoryTasks.unshift(mockTask);
  res.status(201).json(mockTask);
});

// PUT route
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, status, category } = req.body;

  if (isConnected) {
    try {
      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (status !== undefined) updateData.status = status;
      if (category !== undefined) updateData.category = category;
      const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });
      if (updatedTask) return res.status(200).json(updatedTask);
    } catch (err) {}
  }

  fallbackMemoryTasks = fallbackMemoryTasks.map(t => {
    if (t._id === id) {
      return {
        ...t,
        title: title !== undefined ? title.trim() : t.title,
        status: status !== undefined ? status : t.status,
        category: category !== undefined ? category : t.category
      };
    }
    return t;
  });
  const updatedMock = fallbackMemoryTasks.find(t => t._id === id);
  res.status(200).json(updatedMock);
});

// DELETE route
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  if (isConnected) {
    try {
      await Task.findByIdAndDelete(id);
    } catch (err) {}
  }
  fallbackMemoryTasks = fallbackMemoryTasks.filter(t => t._id !== id);
  res.status(200).json({ message: 'Task deleted successfully.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));