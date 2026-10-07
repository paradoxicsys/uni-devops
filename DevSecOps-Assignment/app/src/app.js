const express = require('express');
const helmet = require('helmet');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

const VERSION = process.env.APP_VERSION || 'dev';
const tasks = [];

app.get('/', (req, res) => {
  res.json({ app: 'devsecops-demo', version: VERSION });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title || title.length > 100) {
    return res.status(400).json({ error: 'title must be 1-100 characters' });
  }
  const task = { id: tasks.length + 1, title, done: false };
  tasks.push(task);
  return res.status(201).json(task);
});

module.exports = { app };
