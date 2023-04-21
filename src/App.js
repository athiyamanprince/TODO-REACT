import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './Footer';

function App() {
  // Set up state for the list of todos and the title of a new todo
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  // set up state for the editing id and the new title of the new todo
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  // Use the useEffect() hook to fetch the list of todos from the API when the component mounts
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('http://localhost:5000/todos');
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTodos();
  }, []);

  // Handle form submissions to add a new todo to the list
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (title.trim() === '' || !title === '') {
      toast.warn("Please enter a task to add...");
      return;
    }

    if (todos.some(todo => todo.title.toLowerCase() === title.toLowerCase())) {
      toast.warn("Task already exist");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, body: JSON.stringify({ title: title })
      });
      const data = await response.json();
      const newTodo = { id: data.id, title: title }
      console.log(newTodo);
      setTodos([...todos, newTodo]);
      setTitle('');
      toast.success('Task added successfullt')
    } catch (error) {
      console.error(error);
    }
  };

  // Handle clicks on the "delete" button to remove a todo from the list
  const handleDelete = async (id) => {
    const sure = window.confirm("Are you sure want to delete this task?");
    if (sure) {
      try {
        const response = await fetch(`http://localhost:5000/todos?id=${id}`, {
          method: 'DELETE'
        })
        console.log(response);
        // Remove the deleted todo from the local state
        setTodos(todos.filter(todo => todo.id !== id));
        toast.success('Task deleted successfully!')
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Handle clicks on the "edit" button to update the title of a todo in the list
  const handleEdit = async (id) => {
    setEditingId(id); // Set the ID of the todo being edited
    const todoToEdit = todos.find(todo => todo.id === id); // Get the todo being edited
    setNewTitle(todoToEdit.title); // Set the initial value of the input field to the current title of the todo
  };

  const handleSaveEdit = async (id) => {
    if (newTitle.trim() === '') {
      toast.warn('Please enter a new task');
      return;
    }
    try {
      // Send a PUT request to the API endpoint with the new title
      const response = await fetch(`http://localhost:5000/todos?id=${id}&title=${newTitle}`, {
        method: 'PUT'
      });
      console.log(response);
      // Update the local state of todos with the new title
      setTodos(todos.map(todo => todo.id === id ? { ...todo, title: newTitle } : todo));
      setEditingId(null); // Reset the editing state
      setNewTitle(''); // Reset the new title state
      toast.success('Task updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occured - Try Again')
    }
  };

  // Render the component with the list of todos and form to add new todos
  return (
    <div className="container">
      <ToastContainer />
      <h1 className='heading' >To-Do List</h1>
      <form onSubmit={handleSubmit}>
        <input
          className='sumit-input'
          maxLength={50}
          placeholder='Enter a Task to add'
          autoFocus="autofocus"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)} />
        <button type="submit">Add</button>
      </form>

      {/* Looping to generate new todos */}
      {todos.map(todo => (
        <div key={todo.id} className='list'>
          <div>
            {editingId === todo.id ? (
              <div className='edit-input-wrapper'>
                <input
                  className='edit-input'
                  type="text"
                  maxLength={50}
                  value={newTitle}
                  autoFocus
                  onChange={(event) => setNewTitle(event.target.value)} />
              </div>
            ) : (
              <span>{todo.title}</span>
            )}
          </div>


          <div>
            {editingId === todo.id ? (
              <>
                <button className='save-button' onClick={() => handleSaveEdit(todo.id)}>
                  <i class="fa-solid fa-floppy-disk">
                  </i></button>
                <button className='cancel-button' onClick={() => setEditingId(null)}>
                  <i class="fa-solid fa-xmark">
                  </i></button>
              </>
            ) : (
              <button className='edit-button' onClick={() => handleEdit(todo.id)}><i class="fa-solid fa-pen-to-square"></i></button>
            )}

            {editingId !== todo.id && (<button className='delete-button' onClick={() => handleDelete(todo.id)}>
              <i class="fa-solid fa-trash"></i>
            </button>)}

          </div>
        </div>
      ))}
      <Footer />
    </div>

  );
}

export default App;