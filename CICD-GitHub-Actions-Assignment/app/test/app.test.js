const test = require('node:test');
const assert = require('node:assert');
const { app, add } = require('../src/app');

let server;
let base;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

test('add() sums two numbers', () => {
  assert.strictEqual(add(2, 3), 5);
});

test('GET / returns the welcome message', async () => {
  const res = await fetch(`${base}/`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.match(body.message, /Session 16/);
});

test('GET /health returns ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('GET /add?a=4&b=6 returns 10', async () => {
  const res = await fetch(`${base}/add?a=4&b=6`);
  assert.deepStrictEqual(await res.json(), { result: 10 });
});

test('GET /add with bad input returns 400', async () => {
  const res = await fetch(`${base}/add?a=x&b=1`);
  assert.strictEqual(res.status, 400);
});
