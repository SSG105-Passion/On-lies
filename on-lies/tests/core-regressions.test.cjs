const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { test } = require('node:test');

const root = path.join(__dirname, '../src');
function loader({ globals = {}, mocks = {}, exposeMain = false } = {}) {
  const cache = new Map();
  return function load(file) {
    const absolute = path.resolve(file);
    const name = path.basename(absolute);
    if (name in mocks) return mocks[name];
    if (name.endsWith('.css')) return {};
    if (cache.has(absolute)) return cache.get(absolute);
    const module = { exports: {} };
    cache.set(absolute, module.exports);
    let source = fs.readFileSync(absolute, 'utf8').replace(/import\.meta\.env/g, '__env');
    if (exposeMain && name === 'main.ts') source += '\nexports.__test = { engine, startGame, finishGame, renderLeaderboard, openGame, showDesktop };';
    vm.runInNewContext(ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
    }).outputText, {
      __env: {}, console: { warn() {} }, ...globals, exports: module.exports,
      require: request => request in mocks ? mocks[request]
        : load(path.resolve(path.dirname(absolute), request.endsWith('.css') ? request : request + '.ts')),
    }, { filename: absolute });
    return module.exports;
  };
}

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

function node() {
  const classes = new Set(['hidden']);
  return {
    textContent: '', innerHTML: '', style: {}, dataset: {}, value: '',
    classList: {
      add: value => classes.add(value), remove: value => classes.delete(value),
      contains: value => classes.has(value),
      toggle(value, force) { const enabled = force ?? !classes.has(value); enabled ? classes.add(value) : classes.delete(value); },
    },
    addEventListener() {}, setAttribute() {}, removeAttribute() {}, focus() {}, scrollTo() {},
    querySelector: () => null, querySelectorAll: () => [],
  };
}

const savedResult = { xpEarned: 950, newTotalXp: 950, newLevel: 1, requiresLogin: true, syncStatus: 'local' };
const guest = { id: 'local-guest-id', username: 'Guest', total_xp: 0, level: 1, is_authenticated: false };
function mainHarness(save = async () => savedResult, entries = []) {
  let inspectorRunning = false;
  // IDs come from the real document: a reference to missing markup fails this test.
  const html = fs.readFileSync(path.join(root, '../index.html'), 'utf8');
  const nodes = new Map([...html.matchAll(/id="([^"]+)"/g)].map(match => [match[1], node()]));
  const document = {
    getElementById: id => nodes.get(id) ?? null,
    querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
    documentElement: { setAttribute() {}, getAttribute: () => 'dark' },
  };
  const load = loader({ exposeMain: true,
    globals: { document, localStorage: storage(), window: { setInterval() {} } },
    mocks: {
      'supabase.ts': {
        getCurrentProfile: async () => guest, fetchLeaderboard: async () => entries,
        recordGameScore: save, subscribeToLeaderboard() {}, onAuthStateChange() {},
        getLeaderboardSource: () => 'local', scoreSaveMessage: () => 'Điểm đã lưu trên máy này.',
      },
      'phoneGame.ts': { openPhoneGame() {} },
      'familyGame.ts': { openFamilyGame() {} },
      'ui.ts': { InspectorUI: class {
        start() { inspectorRunning = true; }
        stop() { inspectorRunning = false; }
      } },
    },
  });
  const main = load(path.join(root, 'main.ts')).__test;
  main.engine.setMode('messages');
  main.startGame();
  const data = load(path.join(root, 'gameData.ts')).GAME_DATA.messages;
  function complete() {
    main.engine.currentRound = 3;
    main.engine.score = 8;
    main.engine.lives = 3;
    main.engine.userAnswers = data.map(item => ({ item, isCorrect: item.id !== 202,
      ...(item.id === 202 ? { smsAction: { outcome: 'cautious', feedback: 'Chưa xác minh' } } : {}),
    }));
  }
  return { main, nodes, complete, isInspectorRunning: () => inspectorRunning };
}

test('all four games share navigation and return to the overview with no visible game left behind', () => {
  const { main, nodes } = mainHarness();
  const games = { mail: ['inspectorApp', 'Thanh tra Hộp thư'], sms: ['mailApp', 'Lá chắn SMS'],
    phone: ['phoneApp', 'Cuộc gọi khẩn'], family: ['familyApp', 'Cứu người thân'] };
  for (const [mode, [visibleApp, name]] of Object.entries(games)) {
    main.openGame(mode);
    assert.equal(nodes.get('gameNavigation').classList.contains('hidden'), false);
    assert.equal(nodes.get('gameModeName').textContent, name);
    assert.equal(nodes.get('gameModeSelect').value, mode);
    for (const [app] of Object.values(games)) assert.equal(nodes.get(app).classList.contains('hidden'), app !== visibleApp);
    main.showDesktop();
    assert.equal(nodes.get('gameNavigation').classList.contains('hidden'), true);
    assert.equal(nodes.get('desktop').classList.contains('hidden'), false);
    for (const [app] of Object.values(games)) assert.equal(nodes.get(app).classList.contains('hidden'), true);
  }
});

test('switching games stops the inspector timer and leaving SMS closes the investigation and results', () => {
  const { main, nodes, isInspectorRunning } = mainHarness();
  main.openGame('mail');
  assert.equal(isInspectorRunning(), true);
  main.openGame('sms');
  assert.equal(isInspectorRunning(), false);
  const modal = nodes.get('inspectModal');
  modal.classList.remove('hidden');
  modal.classList.add('sms-investigation-active');
  nodes.get('resultScreen').classList.remove('hidden');
  main.openGame('family');
  assert.equal(modal.classList.contains('hidden'), true);
  assert.equal(modal.classList.contains('sms-investigation-active'), false);
  assert.equal(nodes.get('resultScreen').classList.contains('hidden'), true);
  assert.equal(nodes.get('gameModeName').textContent, 'Cứu người thân');
});

test('SMS renders complete results before saving; repeated finish awards only once', async () => {
  let resolve, writes = 0;
  const pending = new Promise(done => { resolve = done; });
  const { main, nodes, complete } = mainHarness(() => { writes++; return pending; });
  complete();
  const first = main.finishGame();
  await main.finishGame();
  assert.equal(writes, 1);
  assert.equal(nodes.get('resultScreen').classList.contains('hidden'), false);
  assert.equal(nodes.get('finalScore').textContent, '8 / 9');
  assert.match(nodes.get('finalAccuracy').textContent, /1 chưa xác minh/);
  assert.equal((nodes.get('breakdownContainer').innerHTML.match(/breakdown-item/g) || []).length, 9);
  resolve(savedResult);
  await first;
  assert.equal(nodes.get('finalXPEarned').textContent, '+950 XP');
  assert.match(nodes.get('scoreSaveStatus').textContent, /lưu trên máy/);
});

test('late save cannot overwrite a restarted game, and failed saves retain results', async () => {
  let resolve;
  const { main, nodes, complete } = mainHarness(() => new Promise(done => { resolve = done; }));
  complete();
  const old = main.finishGame();
  main.startGame();
  nodes.get('finalXPEarned').textContent = 'new session';
  resolve(savedResult);
  await old;
  assert.equal(nodes.get('finalXPEarned').textContent, 'new session');
  const failed = mainHarness(async () => { throw new Error('offline'); });
  failed.complete();
  failed.main.engine.lives = 0;
  await failed.main.finishGame();
  assert.match(failed.nodes.get('scoreSaveStatus').textContent, /Chưa lưu/);
  assert.equal(failed.nodes.get('finalScore').textContent, '8 / 9');
});

test('losing all SMS lives renders an early result and closes further scoring', async () => {
  let recorded;
  const { main, nodes } = mainHarness(async (...args) => { recorded = args; return { ...savedResult, xpEarned: 0 }; });
  main.engine.evaluateAnswer(201, true);
  main.engine.activeItemId = 202;
  const { createDeliveryInvestigation } = loader()(path.join(root, 'sms/deliveryModel.ts'));
  main.engine.evaluateSmsDeliveryAction('pay', createDeliveryInvestigation());
  main.engine.evaluateAnswer(203, false);
  assert.equal(main.engine.lives, 0);
  await main.finishGame();
  assert.equal(nodes.get('finalScore').textContent, '0 / 9');
  assert.equal(nodes.get('finalXPEarned').textContent, '+0 XP');
  assert.equal((nodes.get('breakdownContainer').innerHTML.match(/breakdown-item/g) || []).length, 3);
  assert.equal(recorded[3], 0);
  assert.equal(main.engine.evaluateAnswer(203, true), null);
});

test('leaderboard treats names, roles, avatars and ranks as untrusted data', async () => {
  const { main, nodes } = mainHarness(undefined, [{
    user_id: 'x', username: '<img src=x onerror=alert(1)>', role_title: '<script>bad()</script>',
    avatar_url: '<b>', rank: '<svg/onload=bad()>', level: 1, total_xp: 100,
  }]);
  await main.renderLeaderboard();
  const html = nodes.get('leaderboardList').innerHTML;
  assert.ok(html.includes('&lt;img'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;b&gt;'));
  assert.doesNotMatch(html, /<img|<script|<svg/);
});

test('completion migration tracks all four modes, and XP thresholds agree with level rewards', () => {
  const { readCompletedGames, TRACKED_GAMES, getLevelProgress } = loader()(path.join(root, 'playerProgress.ts'));
  assert.equal(TRACKED_GAMES.length, 4);
  assert.equal(readCompletedGames('["inspector","mail","messages","phone","family","fake"]').size, 4);
  assert.equal(readCompletedGames('corrupt').size, 0);
  assert.equal(getLevelProgress(1500).level, 2);
  assert.equal(getLevelProgress(1500).percent, 50);
  assert.equal(getLevelProgress(1500).nextXp, 2000);
  assert.equal(getLevelProgress(4000).nextXp, null);
});

function processDay(engine) {
  while (true) {
    const item = engine.getCurrentCase();
    engine.flaggedIndices = new Set(item.clueIndices);
    engine.stamp(item.isScam);
    if (!engine.nextCase()) break;
  }
}

test('all case rules are available on the day they are assessed', () => {
  const load = loader();
  const { CASES } = load(path.join(root, 'inspector/cases.ts'));
  const { RULES } = load(path.join(root, 'inspector/rules.ts'));
  for (const item of CASES) for (const part of item.allItems) {
    if (part.clue?.rule) assert.ok(RULES.find(rule => rule.id === part.clue.rule)?.day <= item.day, `case ${item.id}`);
  }
});

test('inspector counts each day separately and only completes after all 13 cases', () => {
  const { InspectorEngine } = loader()(path.join(root, 'inspector/engine.ts'));
  const engine = new InspectorEngine();
  engine.newGame();
  assert.equal(engine.nextCase(), false);
  processDay(engine);
  engine.startDay(2);
  assert.equal(engine.dayProcessed, 0);
  processDay(engine);
  assert.equal(engine.dayProcessed, 4);
  assert.equal(engine.totalProcessed, 8);
  assert.equal(engine.isTrainingComplete, false);
  engine.startDay(3);
  processDay(engine);
  assert.equal(engine.totalProcessed, 13);
  assert.equal(engine.isTrainingComplete, true);
  engine.newGame();
  engine.startDay(3);
  engine.timeRemaining = 1;
  engine.isRunning = true;
  assert.equal(engine.tickTimer(), true);
  assert.equal(engine.isTrainingComplete, false);
  assert.throws(() => engine.stamp(false));
});

test('inspector third warning fines income but allows the shift to continue', () => {
  const { InspectorEngine } = loader()(path.join(root, 'inspector/engine.ts'));
  const engine = new InspectorEngine();
  engine.newGame();
  for (let i = 0; i < 3; i++) {
    const item = engine.getCurrentCase();
    engine.flaggedIndices = new Set([0]);
    engine.stamp(!item.isScam);
    if (i < 2) assert.equal(engine.nextCase(), true);
  }
  assert.equal(engine.isFired(), false);
  assert.equal(engine.salary, -5);
  assert.throws(() => engine.stamp(false));
  assert.equal(engine.nextCase(), true);
});

function inspectorHarness() {
  let writes = 0;
  const scores = [];
  const events = [];
  const nodes = new Map(['inspDesk', 'inspExitBtn', 'inspModalOverlay', 'inspModalBox'].map(id => [id, node()]));
  const container = { innerHTML: '', querySelector: selector => nodes.get(selector.slice(1)) ?? null };
  const load = loader({ globals: {
    document: { dispatchEvent: event => events.push(event.type) },
    CustomEvent: class { constructor(type) { this.type = type; } },
    window: { setInterval: () => 1, clearInterval() {}, clearTimeout() {} },
  }, mocks: { 'supabase.ts': { recordGameScore: async (...args) => { writes++; scores.push(args); return savedResult; }, scoreSaveMessage: () => 'saved' } } });
  const { InspectorUI } = load(path.join(root, 'inspector/ui.ts'));
  const ui = new InspectorUI(container, () => {});
  ui.start();
  return { ui, nodes, events, scores, writes: () => writes };
}

test('timeout-only inspector report awards no XP or completion; day report never shows 8/4', () => {
  const { ui, nodes, events, writes } = inspectorHarness();
  ui.engine.startDay(3);
  ui.showFinalPerformanceModal();
  assert.equal(writes(), 0);
  assert.equal(events.length, 0);
  assert.match(nodes.get('inspModalBox').innerHTML, /không nhận XP/);
  ui.start();
  processDay(ui.engine);
  ui.engine.startDay(2);
  processDay(ui.engine);
  ui.showDayEndModal(false);
  assert.match(nodes.get('inspModalBox').innerHTML, /4\/4/);
  assert.doesNotMatch(nodes.get('inspModalBox').innerHTML, /8\/4/);
});

test('completed inspector report saves and unlocks only once', async () => {
  const { ui, events, writes } = inspectorHarness();
  for (let day = 1; day <= 3; day++) {
    if (day > 1) ui.engine.startDay(day);
    processDay(ui.engine);
  }
  ui.showFinalPerformanceModal();
  ui.showFinalPerformanceModal();
  await Promise.resolve();
  assert.equal(writes(), 1);
  assert.equal(events.filter(event => event === 'mail-completed').length, 1);
});

test('partial inspector sessions retain earned points but no completion or remaining-life bonus', async () => {
  const { ui, events, scores } = inspectorHarness();
  processDay(ui.engine);
  ui.engine.startDay(3);
  ui.showFinalPerformanceModal();
  await Promise.resolve();
  assert.equal(scores.length, 1);
  assert.equal(scores[0][1], 4);
  assert.equal(scores[0][2], 13);
  assert.equal(scores[0][3], 0);
  assert.equal(events.includes('mail-completed'), false);
});

test('local rewards deduplicate concurrent saves without losing rewards from different sessions', async () => {
  const localStorage = storage();
  const { recordGameScore, getLocalProfile, signIn } = loader({ globals: { localStorage }, mocks: { '@supabase/supabase-js': {} } })(path.join(root, 'supabase.ts'));
  const first = recordGameScore('sms', 1, 9, 3, 'a');
  assert.equal(recordGameScore('sms', 1, 9, 3, 'a'), first);
  await Promise.all([first, recordGameScore('sms', 1, 9, 3, 'b')]);
  assert.equal(getLocalProfile().total_xp, 500);
  assert.equal((await signIn('guest@example.com', 'not-a-real-password')).success, false);
  assert.equal(getLocalProfile().is_authenticated, false);
});

test('cloud errors are reported and do not trigger a second write for the session', async () => {
  const localStorage = storage();
  localStorage.setItem('on-lies-user-profile', JSON.stringify({ ...guest, id: 'user-1', is_authenticated: true }));
  let inserts = 0;
  const client = { auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
    from() { return {
      select() { return this; }, eq() { return this; }, single: async () => ({ data: { total_xp: 0 }, error: null }),
      insert: async () => { inserts++; return { error: { message: 'blocked by policy' } }; },
    }; },
  };
  const { recordGameScore, getLocalProfile } = loader({ globals: {
    localStorage, __env: { VITE_SUPABASE_URL: 'https://test.example', VITE_SUPABASE_ANON_KEY: 'public-test-key' },
  }, mocks: { '@supabase/supabase-js': { createClient: () => client } } })(path.join(root, 'supabase.ts'));
  const first = await recordGameScore('sms', 1, 9, 3, 'a');
  assert.equal(first.syncStatus, 'failed');
  assert.equal(getLocalProfile().total_xp, 250);
  await recordGameScore('sms', 1, 9, 3, 'a');
  assert.equal(inserts, 1);
});

test('cloud rewards use the current account total and report successful writes', async () => {
  const localStorage = storage();
  localStorage.setItem('on-lies-user-profile', JSON.stringify({ ...guest, id: 'user-1', is_authenticated: true }));
  const updates = [];
  let inserts = 0;
  const client = { auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
    from() { let updating = false; return {
      select() { return this; }, eq() { return this; },
      single: async () => ({ data: updating ? { id: 'user-1' } : { total_xp: 1250 }, error: null }),
      update(values) { updates.push(values); updating = true; return this; },
      insert: async () => { inserts++; return { error: null }; },
    }; },
  };
  const { recordGameScore, getLocalProfile } = loader({ globals: {
    localStorage, __env: { VITE_SUPABASE_URL: 'https://test.example', VITE_SUPABASE_ANON_KEY: 'public-test-key' },
  }, mocks: { '@supabase/supabase-js': { createClient: () => client } } })(path.join(root, 'supabase.ts'));
  const result = await recordGameScore('sms', 1, 9, 3, 'a');
  assert.equal(result.syncStatus, 'synced');
  assert.equal(result.xpEarned, 250);
  assert.equal(result.newTotalXp, 1500);
  assert.equal(getLocalProfile().total_xp, 1500);
  assert.equal(updates[0].level, 2);
  await recordGameScore('sms', 1, 9, 3, 'a');
  assert.equal(inserts, 1);
});

test('email confirmation does not impersonate a signed-in user', async () => {
  const localStorage = storage();
  const client = { auth: { signUp: async () => ({ data: { user: { id: 'pending-user' }, session: null }, error: null }) } };
  const { signUp, getLocalProfile } = loader({ globals: {
    localStorage, __env: { VITE_SUPABASE_URL: 'https://test.example', VITE_SUPABASE_ANON_KEY: 'public-test-key' },
  }, mocks: { '@supabase/supabase-js': { createClient: () => client } } })(path.join(root, 'supabase.ts'));
  const result = await signUp('guest@example.com', 'not-a-real-password', 'Guest');
  assert.equal(result.success, true);
  assert.match(result.message, /xác nhận/);
  assert.equal(getLocalProfile().is_authenticated, false);
});

test('inspector verdict needs no flags and exploratory flags never cause a citation', () => {
  const { InspectorEngine } = loader()(path.join(root, 'inspector/engine.ts'));
  const engine = new InspectorEngine();
  engine.newGame();
  const file = engine.getCurrentCase();
  engine.flaggedIndices = new Set(file.allItems.map((_, i) => i));
  assert.equal(engine.stamp(file.isScam).result.isCorrect, true);
  assert.equal(engine.citations, 0);
  assert.equal(engine.salary, 10);
  engine.nextCase();
  assert.equal(engine.stamp(engine.getCurrentCase().isScam).result.isCorrect, true);
});
