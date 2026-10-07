const test = require('node:test');
const assert = require('node:assert');
const { app } = require('../src/app');

let server;
let base;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

test('GET /health returns ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('security headers are set and x-powered-by is hidden', async () => {
  const res = await fetch(`${base}/`);
  assert.strictEqual(res.headers.get('x-powered-by'), null);
  assert.ok(res.headers.get('content-security-policy'));
  assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
});

test('POST /api/tasks creates a task', async () => {
  const res = await fetch(`${base}/api/tasks`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'scan the image' }),
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual((await res.json()).title, 'scan the image');
});

test('POST /api/tasks rejects an empty title', async () => {
  const res = await fetch(`${base}/api/tasks`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: '' }),
  });
  assert.strictEqual(res.status, 400);
});

test('GET /api/tasks lists tasks', async () => {
  const res = await fetch(`${base}/api/tasks`);
  const body = await res.json();
  assert.ok(Array.isArray(body));
  assert.strictEqual(body.length, 1);
});
