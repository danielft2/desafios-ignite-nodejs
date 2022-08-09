const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);
  if (!user) return response.status(404).json({ error: "user not found" });

  response.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlredyExist = users.some(user => user.username === username);

  if (userAlredyExist) return response.status(400).json({ error: "user alredy exist"});

  const userData = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(userData);

  return response.status(201).json(userData);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = response;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = response;
  const { title, deadline } = request.body;

  const todoData = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todoData);

  return response.status(201).json(todoData);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = response;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) return response.status(404).json({ error: "todo not found" });
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = response;
  const { id } = request.params;
  
  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) return response.status(404).json({ error: "todo not found" });

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = response;
  const { id } = request.params;
  
  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) return response.status(404).json({ error: "todo not found" });

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;