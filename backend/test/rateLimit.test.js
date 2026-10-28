const test = require("node:test");
const assert = require("node:assert/strict");
const { authRateLimit } = require("../src/middleware/rateLimit");

function runRequest(ip) {
  let statusCode = 200;
  const headers = {};
  let body;
  let nextCalled = false;
  const req = { ip, socket: { remoteAddress: ip } };
  const res = {
    set(name, value) { headers[name] = value; return this; },
    status(code) { statusCode = code; return this; },
    json(value) { body = value; return this; },
  };
  authRateLimit(req, res, () => { nextCalled = true; });
  return { statusCode, headers, body, nextCalled };
}

test("auth rate limiter allows first ten attempts and blocks the eleventh", () => {
  const ip = `test-${Date.now()}-${Math.random()}`;
  for (let i = 0; i < 10; i += 1) {
    assert.equal(runRequest(ip).nextCalled, true);
  }
  const blocked = runRequest(ip);
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.nextCalled, false);
  assert.ok(Number(blocked.headers["Retry-After"]) > 0);
  assert.equal(blocked.body.success, false);
});
