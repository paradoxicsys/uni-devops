const express = require('express');

const app = express();
const VERSION = process.env.APP_VERSION || 'dev';

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the Session 16 CI/CD pipeline', version: VERSION });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/add', (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.status(400).json({ error: 'a and b must be numbers' });
  }
  return res.json({ result: add(a, b) });
});

function add(a, b) {
  return a + b;
}

module.exports = { app, add };
