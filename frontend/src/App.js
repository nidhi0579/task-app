import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('General');
  const [activeFilter, setActiveFilter] = useState('Pending'); 
  const [error, setError] = useState('');

  // States handling the edit functionality
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const API_URL = 'http://localhost:5000/tasks';
  const categories = ['General', 'College', 'Project', 'Coding', 'Personal'];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Could not connect to backend server.');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle, category: taskCategory }),
      });

      if (!response.ok) throw new Error();

      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      setTaskTitle('');
      setError('');
    } catch (err) {
      setError('Failed to save task.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) throw new Error();

      const updated = await response.json();
      setTasks(tasks.map(t => t._id === id ? updated : t));
    } catch (err) {
      setError('Failed to update task status.');
    }
  };

  // Triggers inline edit mode for a row
  const startEditing = (task) => {
    setEditingId(task._id);
    setEditingText(task.title);
  };

  // Saves the edited text back to the server
  const handleSaveEdit = async (id) => {
    if (!editingText.trim()) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingText.trim() }),
      });

      if (!response.ok) throw new Error();

      const updated = await response.json();
      setTasks(tasks.map(t => t._id === id ? updated : t));
      setEditingId(null); // Close edit mode
      setError('');
    } catch (err) {
      setError('Failed to save edited task text.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'All') return true;
    return task.status === activeFilter;
  });

  return (
    <div className="app-container" style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Professional Task Dashboard</h2>
      <p style={{ color: '#64748b', marginTop: '0', marginBottom: '2rem' }}>Complete your goals step-by-step</p>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Creation Card */}
      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Type a new task name..."
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          style={{ flex: 2, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
        />
        
        <select 
          value={taskCategory} 
          onChange={(e) => setTaskCategory(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '1rem' }}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Add Task
        </button>
      </form>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['Pending', 'Completed', 'All'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              backgroundColor: activeFilter === filter ? '#e0e7ff' : '#f1f5f9',
              color: activeFilter === filter ? '#4338ca' : '#475569'
            }}
          >
            {filter} ({tasks.filter(t => filter === 'All' ? true : t.status === filter).length})
          </button>
        ))}
      </div>

      {/* Task Rows Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No {activeFilter.toLowerCase()} tasks found!</p>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={task.status === 'Completed'}
                  onChange={() => handleToggleStatus(task._id, task.status)}
                  style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                />
                
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  {editingId === task._id ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #6366f1', fontSize: '0.95rem' }}
                    />
                  ) : (
                    <span style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none', color: task.status === 'Completed' ? '#94a3b8' : '#1e293b', fontWeight: '500' }}>
                      {task.title}
                    </span>
                  )}
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', marginTop: '0.25rem', fontWeight: 'bold' }}>
                    🏷️ {task.category || 'General'}
                  </span>
                </div>
              </div>

              {/* Dynamic Action Buttons Pane */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {editingId === task._id ? (
                  <button onClick={() => handleSaveEdit(task._id)} style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Save
                  </button>
                ) : (
                  task.status !== 'Completed' && (
                    <button onClick={() => startEditing(task)} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                      Edit
                    </button>
                  )
                )}
                <button onClick={() => handleDeleteTask(task._id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}>
                  Delete
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;