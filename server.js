require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: 'https://todo-mern-chi-sable.vercel.app',  // Allow requests only from this domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow these HTTP methods
  allowedHeaders: ['Content-Type'],  // Allow these headers
};

app.use(cors(corsOptions));  // Apply the CORS middleware with options
app.use(bodyParser.json());  // Parse incoming JSON data

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Todo Schema
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completed_on: { type: Date },
});

const Todo = mongoose.model('Todo', todoSchema);

// API Routes
app.get('/', (req, res) => {
  res.send('Hello');
});

// Get all todos
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add a new todo
app.post('/todos', async (req, res) => {
  const { title, description } = req.body;
  try {
    const newTodo = new Todo({
      title,
      description,
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// Update a todo (Using _id explicitly for MongoDB)
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;  // Get the id from the URL parameter
  const { title, description } = req.body;

  try {
    // Explicitly using _id for MongoDB query
    const updatedTodo = await Todo.findOneAndUpdate({ _id: id }, { title, description }, { new: true });
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Mark a todo as completed (Using _id explicitly for MongoDB)
app.put('/todos/complete/:id', async (req, res) => {
  const { id } = req.params;  // Get the id from the URL parameter
  const completedOn = new Date();

  try {
    // Explicitly using _id for MongoDB query
    const updatedTodo = await Todo.findOneAndUpdate({ _id: id }, { completed: true, completed_on: completedOn }, { new: true });
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete todo' });
  }
});

// Delete a todo (Using _id explicitly for MongoDB)
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;  // Get the id from the URL parameter

  try {
    // Explicitly using _id for MongoDB query
    const deletedTodo = await Todo.findOneAndDelete({ _id: id });
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send();  // No content returned after deletion
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Delete a completed todo (Using _id explicitly for MongoDB)
app.delete('/completed/:id', async (req, res) => {
  const { id } = req.params;  // Get the id from the URL parameter

  try {
    // Explicitly using _id for MongoDB query
    const deletedTodo = await Todo.findOneAndDelete({ _id: id });
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Completed Todo not found' });
    }
    res.status(204).send();  // No content returned after deletion
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete completed todo' });
  }
});

// Start the server
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
