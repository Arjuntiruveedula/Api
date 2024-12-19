import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { BsCheckLg } from 'react-icons/bs';

const API_URL = 'http://localhost:5000';

function App() {
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [allTodos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [completedTodos, setCompletedTodos] = useState([]);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [currentEditedItem, setCurrentEditedItem] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchTodos();
    fetchCompletedTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      const todos = response.data.filter(todo => !todo.completed); // Only get non-completed todos
      setTodos(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const fetchCompletedTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      const completed = response.data.filter(todo => todo.completed); // Only get completed todos
      setCompletedTodos(completed);
    } catch (error) {
      console.error('Error fetching completed todos:', error);
    }
  };

  const handleAddTodo = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      alert('Please fill in both the title and description!');
      return;
    }
  
    try {
      const newTodoItem = {
        title: newTitle,
        description: newDescription,
      };
      await axios.post(`${API_URL}/todos`, newTodoItem);
      fetchTodos(); // Refresh the list after adding a new todo
      setNewTitle(''); // Reset the input fields after adding
      setNewDescription('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };
  
  const handleDeleteTodo = async (id, isCompleted) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      if (isCompleted) {
        fetchCompletedTodos();
      } else {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`${API_URL}/todos/complete/${id}`);
      fetchTodos();
      fetchCompletedTodos();
    } catch (error) {
      console.error('Error completing todo:', error);
    }
  };

  const handleEdit = (id, item) => {
    setCurrentEdit(id);
    setCurrentEditedItem(item);
  };

  const handleUpdateToDo = async () => {
    try {
      const updatedTodo = {
        title: currentEditedItem.title,
        description: currentEditedItem.description,
      };
      await axios.put(`${API_URL}/todos/${currentEdit}`, updatedTodo);
      fetchTodos();
      fetchCompletedTodos();
      setCurrentEdit(null);
      setCurrentEditedItem({ title: '', description: '' });
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleUpdateTitle = (value) => {
    setCurrentEditedItem((prev) => ({ ...prev, title: value }));
  };

  const handleUpdateDescription = (value) => {
    setCurrentEditedItem((prev) => ({ ...prev, description: value }));
  };

  return (
    <div className="App">
      <h1>TO-DO-LIST Task for QuadB Tech</h1>

      <div className="todo-wrapper">
        <div className="todo-input">
          <div className="todo-input-item">
            <label>Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What's the task title?"
            />
          </div>
          <div className="todo-input-item">
            <label>Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What's the task description?"
            />
          </div>
          <div className="todo-input-item">
            <button type="button" onClick={handleAddTodo} className="primaryBtn">
              Add
            </button>
          </div>
        </div>

        <div className="btn-area">
          <button
            className={`secondaryBtn ${!isCompleteScreen && 'active'}`}
            onClick={() => setIsCompleteScreen(false)}
          >
            Todo
          </button>
          <button
            className={`secondaryBtn ${isCompleteScreen && 'active'}`}
            onClick={() => setIsCompleteScreen(true)}
          >
            Completed
          </button>
        </div>

        <div className="todo-list">
          {!isCompleteScreen &&
            allTodos.map((item, index) => {
              if (currentEdit === item.id) {
                return (
                  <div className="edit__wrapper" key={index}>
                    <input
                      placeholder="Updated Title"
                      onChange={(e) => handleUpdateTitle(e.target.value)}
                      value={currentEditedItem.title}
                    />
                    <textarea
                      placeholder="Updated Description"
                      rows={4}
                      onChange={(e) => handleUpdateDescription(e.target.value)}
                      value={currentEditedItem.description}
                    />
                    <button
                      type="button"
                      onClick={handleUpdateToDo}
                      className="primaryBtn"
                    >
                      Update
                    </button>
                  </div>
                );
              } else {
                return (
                  <div className="todo-list-item" key={index}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                    <div>
                      <AiOutlineDelete
                        className="icon"
                        onClick={() => handleDeleteTodo(item.id)}
                        title="Delete?"
                      />
                      <BsCheckLg
                        className="check-icon"
                        onClick={() => handleComplete(item.id)}
                        title="Complete?"
                      />
                      <AiOutlineEdit
                        className="check-icon"
                        onClick={() => handleEdit(item.id, item)}
                        title="Edit?"
                      />
                    </div>
                  </div>
                );
              }
            })}
          {isCompleteScreen &&
            completedTodos.map((item, index) => (
              <div className="todo-list-item" key={index}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p>
                    <small>Completed on: {item.completed_on}</small>
                  </p>
                </div>
                <div>
                  <AiOutlineDelete
                    className="icon"
                    onClick={() => handleDeleteTodo(item.id, true)}
                    title="Delete?"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;
