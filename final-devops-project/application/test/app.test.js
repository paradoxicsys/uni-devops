const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../src/app');

const TOKEN = 'unit-test-token';
let server;
let base;
let dataDir;

test.before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'final-app-'));
  const app = createApp({ APP_ENV: 'test', APP_MESSAGE: 'hi from test', API_TOKEN: TOKEN, DATA_DIR: dataDir });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

const post = (body, token = TOKEN) => fetch(`${base}/api/tasks`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-api-token': token },
  body: JSON.stringify(body),
});

test('GET /health returns ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('GET /ready returns ready when storage is writable', async () => {
  const res = await fetch(`${base}/ready`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, 'ready');
});

test('GET / and /api/info use config from the environment', async () => {
  const root = await (await fetch(`${base}/`)).json();
  assert.strictEqual(root.environment, 'test');
  assert.strictEqual(root.message, 'hi from test');
  const info = await (await fetch(`${base}/api/info`)).json();
  assert.strictEqual(info.secretConfigured, true);
  assert.strictEqual(info.persistence, true);
});

test('security headers are set and x-powered-by is hidden', async () => {
  const res = await fetch(`${base}/`);
  assert.strictEqual(res.headers.get('x-powered-by'), null);
  assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
});

test('POST /api/tasks without the token is rejected', async () => {
  const res = await post({ title: 'no token' }, 'wrong');
  assert.strictEqual(res.status, 401);
});

test('POST /api/tasks creates a task and persists it to DATA_DIR', async () => {
  const res = await post({ title: 'deploy with helm' });
  assert.strictEqual(res.status, 201);
  assert.strictEqual((await res.json()).title, 'deploy with helm');
  const saved = JSON.parse(fs.readFileSync(path.join(dataDir, 'tasks.json'), 'utf8'));
  assert.strictEqual(saved.length, 1);
});

test('POST /api/tasks rejects an empty title', async () => {
  const res = await post({ title: '' });
  assert.strictEqual(res.status, 400);
});

test('DELETE /api/tasks/:id removes the task', async () => {
  const del = await fetch(`${base}/api/tasks/1`, { method: 'DELETE', headers: { 'x-api-token': TOKEN } });
  assert.strictEqual(del.status, 204);
  const list = await (await fetch(`${base}/api/tasks`)).json();
  assert.strictEqual(list.length, 0);
});

test('GET /metrics exposes Prometheus metrics', async () => {
  const res = await fetch(`${base}/metrics`);
  const body = await res.text();
  assert.strictEqual(res.status, 200);
  assert.match(body, /http_requests_total\{/);
  assert.match(body, /app_tasks 0/);
  assert.match(body, /process_cpu_seconds_total/);
});
