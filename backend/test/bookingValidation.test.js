const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeTime,
  parseDateOnly,
  getDayOfWeek,
  timeToMinutes,
  minutesToTime,
} = require("../src/utils/bookingValidation");

test("normalizeTime accepts minute precision and normalizes seconds", () => {
  assert.equal(normalizeTime("09:05"), "09:05:00");
  assert.equal(normalizeTime("23:59:00"), "23:59:00");
  assert.equal(normalizeTime("9:05"), null);
  assert.equal(normalizeTime("24:00"), null);
  assert.equal(normalizeTime("12:30:01"), null);
  assert.equal(normalizeTime(null), null);
});

test("parseDateOnly validates calendar dates without timezone drift", () => {
  assert.equal(parseDateOnly("2026-02-28").value, "2026-02-28");
  assert.equal(parseDateOnly("2024-02-29").value, "2024-02-29");
  assert.equal(parseDateOnly("2025-02-29"), null);
  assert.equal(parseDateOnly("2026-13-01"), null);
  assert.equal(parseDateOnly("28-02-2026"), null);
});

test("getDayOfWeek uses Monday=1 and Sunday=7", () => {
  assert.equal(getDayOfWeek(new Date("2026-10-26T00:00:00Z")), 1);
  assert.equal(getDayOfWeek(new Date("2026-10-25T00:00:00Z")), 7);
});

test("time conversion helpers round-trip minute values", () => {
  assert.equal(timeToMinutes("08:30:00"), 510);
  assert.equal(minutesToTime(510), "08:30:00");
  assert.equal(minutesToTime(0), "00:00:00");
  assert.equal(minutesToTime(1439), "23:59:00");
});
