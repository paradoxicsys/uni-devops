const crypto = require('node:crypto');
const express = require('express');
const helmet = require('helmet');
const metrics = require('./metrics');
const { TaskStore } = require('./store');

function createApp(env = process.env) {
  // configuration comes from the environment (ConfigMap + Secret in Kubernetes)
  const config = {
    version: env.APP_VERSION || 'dev',
    environment: env.APP_ENV || 'local',
    message: env.APP_MESSAGE || 'Hello from the final DevOps project',
    apiToken: env.API_TOKEN || '',
  };
  const store = new TaskStore(env.DATA_DIR);
  metrics.tasksGauge.set(store.list().length);

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '10kb' }));
  app.use(metrics.middleware);

  // write endpoints require the token from the Secret (if one is configured)
  function requireToken(req, res, next) {
    if (!config.apiToken) return next();
    const given = Buffer.from(req.get('x-api-token') || '');
    const expected = Buffer.from(config.apiToken);
    if (given.length === expected.length && crypto.timingSafeEqual(given, expected)) return next();
    return res.status(401).json({ error: 'invalid or missing x-api-token' });
  }

  app.get('/', (req, res) => {
    res.json({ app: 'final-devops-app', version: config.version, environment: config.environment, message: config.message });
  });

  // liveness: the process is up
  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  // readiness: the app can serve traffic (storage is writable)
  app.get('/ready', (req, res) => {
    if (!store.isWritable()) return res.status(503).json({ status: 'not ready', reason: 'data dir not writable' });
    return res.json({ status: 'ready' });
  });

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', metrics.register.contentType);
    res.end(await metrics.register.metrics());
  });

  app.get('/api/info', (req, res) => {
    res.json({
      environment: config.environment,
      message: config.message,
      persistence: Boolean(env.DATA_DIR),
      secretConfigured: Boolean(config.apiToken),
    });
  });

  app.get('/api/tasks', (req, res) => res.json(store.list()));

  app.post('/api/tasks', requireToken, (req, res) => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    if (!title || title.length > 100) {
      return res.status(400).json({ error: 'title must be 1-100 characters' });
    }
    const task = store.add(title);
    metrics.tasksGauge.set(store.list().length);
    return res.status(201).json(task);
  });

  app.delete('/api/tasks/:id', requireToken, (req, res) => {
    const removed = store.remove(Number(req.params.id));
    metrics.tasksGauge.set(store.list().length);
    return removed ? res.status(204).end() : res.status(404).json({ error: 'task not found' });
  });

  // small CPU-bound endpoint used to drive the HPA during load tests
  app.get('/api/work', (req, res) => {
    let hash = 'seed';
    for (let i = 0; i < 20000; i += 1) {
      hash = crypto.createHash('sha256').update(hash).digest('hex');
    }
    res.json({ hash: hash.slice(0, 16) });
  });

  return app;
}

module.exports = { createApp };
