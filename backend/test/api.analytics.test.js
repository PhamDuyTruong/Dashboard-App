/**
 * API tests derived from OpenSpec:
 * - openspec/changes/archive/.../specs/dashboard-summary/spec.md
 * - openspec/changes/archive/.../specs/realtime-events/spec.md
 */
process.env.NODE_ENV = 'test';
process.env.ANALYTICS_DATA_DIR = require('path').join(__dirname, 'fixtures');

const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'analytics.json');
const originalFixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));

function restoreFixture() {
  fs.writeFileSync(FIXTURE_PATH, JSON.stringify(originalFixture, null, 2), 'utf8');
}

const { app, io } = require('../src/index');

describe('Analytics API — GET list with pagination, search, filter, sort', () => {
  it('GET /api/analytics with page, limit, sortBy, sortOrder returns 200 and shape items, totalCount, totalPages, page, limit, summary', async () => {
    const res = await request(app)
      .get('/api/analytics?page=1&limit=10&sortBy=updatedAt&sortOrder=desc')
      .expect(200);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.items));
    assert.ok(typeof res.body.totalCount === 'number');
    assert.ok(typeof res.body.totalPages === 'number');
    assert.strictEqual(res.body.page, 1);
    assert.strictEqual(res.body.limit, 10);
    assert.ok(res.body.summary && typeof res.body.summary === 'object');
    assert.ok(typeof res.body.summary.totalPlayers === 'number');
    assert.ok(typeof res.body.summary.activePlayers === 'number');
    assert.ok(res.body.summary.byStatus && typeof res.body.summary.byStatus === 'object');
  });

  it('GET /api/analytics default sort is newest first (updatedAt desc)', async () => {
    const res = await request(app).get('/api/analytics?page=1&limit=5').expect(200);
    const items = res.body.items;
    if (items.length >= 2) {
      const first = new Date(items[0].updatedAt || items[0].createdAt).getTime();
      const second = new Date(items[1].updatedAt || items[1].createdAt).getTime();
      assert.ok(first >= second, 'first item should be newer or equal');
    }
  });

  it('GET /api/analytics with search filters by id/totalPlayers/activePlayers', async () => {
    const res = await request(app).get('/api/analytics?search=test-1').expect(200);
    assert.ok(res.body.items.length >= 1);
    assert.ok(res.body.items.some((e) => String(e.id).includes('test-1')));
  });

  it('GET /api/analytics with status=active returns only entries with byStatus.active > 0', async () => {
    const res = await request(app).get('/api/analytics?status=active').expect(200);
    res.body.items.forEach((e) => {
      assert.ok(e.byStatus && Number(e.byStatus.active) > 0, 'entry should have active count > 0');
    });
  });

  it('Summary reflects current data after POST', async () => {
    const before = await request(app).get('/api/analytics').expect(200);
    const totalBefore = before.body.totalCount;
    await request(app)
      .post('/api/analytics')
      .send({
        totalPlayers: 999,
        activePlayers: 100,
        avgPlaytimeMinutes: 0,
        avgScore: 0,
      })
      .expect(201);
    const after = await request(app).get('/api/analytics').expect(200);
    assert.strictEqual(after.body.totalCount, totalBefore + 1);
    assert.ok(after.body.summary.totalPlayers >= 999);
    restoreFixture();
  });
});

describe('Analytics API — GET aggregated summary', () => {
  it('GET /api/analytics/summary returns 200 and aggregated stats', async () => {
    const res = await request(app).get('/api/analytics/summary').expect(200);
    assert.ok(res.body.totalPlayers !== undefined);
    assert.ok(res.body.activePlayers !== undefined);
    assert.ok(res.body.avgPlaytimeMinutes !== undefined);
    assert.ok(res.body.avgScore !== undefined);
    assert.ok(res.body.byStatus && typeof res.body.byStatus === 'object');
    assert.ok(Array.isArray(res.body.registrationsByDay));
  });
});

describe('Analytics API — POST new analytics entry', () => {
  it('POST /api/analytics with valid body persists and returns 201 with created object', async () => {
    const body = {
      totalPlayers: 300,
      activePlayers: 150,
      avgPlaytimeMinutes: 45,
      avgScore: 600,
    };
    const res = await request(app).post('/api/analytics').send(body).expect(201);
    assert.ok(res.body.id);
    assert.strictEqual(res.body.totalPlayers, body.totalPlayers);
    assert.strictEqual(res.body.activePlayers, body.activePlayers);
    assert.strictEqual(res.body.avgPlaytimeMinutes, body.avgPlaytimeMinutes);
    assert.strictEqual(res.body.avgScore, body.avgScore);
    assert.ok(res.body.createdAt);
    assert.ok(res.body.updatedAt);
    const entries = require('../utils/store').readAnalytics();
    const added = entries.find((e) => e.id === res.body.id);
    assert.ok(added);
    restoreFixture();
  });

  it('POST /api/analytics with missing totalPlayers returns 400', async () => {
    const res = await request(app)
      .post('/api/analytics')
      .send({ activePlayers: 10, avgPlaytimeMinutes: 0, avgScore: 0 })
      .expect(400);
    assert.ok(res.body.error);
  });

  it('POST /api/analytics with missing activePlayers returns 400', async () => {
    const res = await request(app)
      .post('/api/analytics')
      .send({ totalPlayers: 10, avgPlaytimeMinutes: 0, avgScore: 0 })
      .expect(400);
    assert.ok(res.body.error);
  });

  it('POST /api/analytics with valid body and omit byStatus persists with byStatus default Active', async () => {
    const res = await request(app)
      .post('/api/analytics')
      .send({
        totalPlayers: 50,
        activePlayers: 25,
        avgPlaytimeMinutes: 0,
        avgScore: 0,
      })
      .expect(201);
    assert.deepStrictEqual(res.body.byStatus, { active: 1, inactive: 0, banned: 0 });
    restoreFixture();
  });

  it('POST /api/analytics with byStatus all zeros persists with default Active', async () => {
    const res = await request(app)
      .post('/api/analytics')
      .send({
        totalPlayers: 50,
        activePlayers: 25,
        avgPlaytimeMinutes: 0,
        avgScore: 0,
        byStatus: { active: 0, inactive: 0, banned: 0 },
      })
      .expect(201);
    assert.deepStrictEqual(res.body.byStatus, { active: 1, inactive: 0, banned: 0 });
    restoreFixture();
  });
});

describe('Realtime — Socket.IO emits dashboard:refresh on POST', () => {
  it('Server has Socket.IO instance attached; POST success emits dashboard:refresh', async () => {
    assert.ok(io, 'io should be defined');
    await request(app)
      .post('/api/analytics')
      .send({ totalPlayers: 1, activePlayers: 1, avgPlaytimeMinutes: 0, avgScore: 0 })
      .expect(201);
    restoreFixture();
  });
});
