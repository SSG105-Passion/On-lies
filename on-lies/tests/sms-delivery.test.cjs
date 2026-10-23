const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const cache = new Map();
function load(filename) {
  const absolute = path.resolve(filename);
  if (cache.has(absolute)) return cache.get(absolute);
  const module = { exports: {} };
  cache.set(absolute, module.exports);
  const source = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
  }).outputText;
  vm.runInNewContext(source, {
    exports: module.exports,
    require: name => load(path.resolve(path.dirname(absolute), `${name}.ts`)),
  }, { filename: absolute });
  return module.exports;
}
const { GameEngine } = load(path.join(__dirname, '../src/gameEngine.ts'));
const { getSmsContinuation } = load(path.join(__dirname, '../src/sms/navigation.ts'));
const {
  createDeliveryInvestigation, inspectDeliveryTool, confirmDeliveryContact, evaluateDeliveryAction,
} = load(path.join(__dirname, '../src/sms/deliveryModel.ts'));

function setup() {
  const engine = new GameEngine();
  engine.setMode('messages');
  engine.activeItemId = 202;
  return { engine, investigation: createDeliveryInvestigation() };
}

test('tools record distinct views, link preview does not confirm carrier identity', () => {
  const state = createDeliveryInvestigation();
  assert.equal(inspectDeliveryTool(state, 'link'), true);
  assert.equal(inspectDeliveryTool(state, 'link'), true);
  assert.equal(state.inspected.length, 1);
  assert.equal(state.contactConfirmed, false);
  assert.equal(confirmDeliveryContact(state), false);
  assert.equal(inspectDeliveryTool(state, 'unknown'), false);
  assert.equal(state.activeTool, 'link');
});

test('verification requires actually contacting through the order, not just clicking tools', () => {
  const { engine, investigation } = setup();
  assert.equal(engine.evaluateSmsDeliveryAction('verify', investigation), null);
  inspectDeliveryTool(investigation, 'order');
  inspectDeliveryTool(investigation, 'history');
  assert.equal(confirmDeliveryContact(investigation), false);
  assert.equal(engine.evaluateSmsDeliveryAction('verify', investigation), null);
  assert.equal(engine.userAnswers.length, 0);
  assert.equal(engine.lives, 3);
  inspectDeliveryTool(investigation, 'order');
  assert.equal(confirmDeliveryContact(investigation), true);
  const answer = engine.evaluateSmsDeliveryAction('verify', investigation);
  assert.equal(answer.smsAction.outcome, 'verified');
  assert.equal(answer.isCorrect, true);
  assert.equal(engine.score, 1);
  assert.equal(engine.lives, 3);
});

test('ignoring SMS is cautious: no point and no lost life', () => {
  const { engine, investigation } = setup();
  const answer = engine.evaluateSmsDeliveryAction('ignore', investigation);
  assert.equal(answer.smsAction.outcome, 'cautious');
  assert.equal(answer.isCorrect, false);
  assert.equal(engine.score, 0);
  assert.equal(engine.lives, 3);
  assert.equal(engine.evaluatedItemIds.has(202), true);
});

test('paying through the SMS loses exactly one life, including after inspecting tools', () => {
  const { engine, investigation } = setup();
  inspectDeliveryTool(investigation, 'order');
  const answer = engine.evaluateSmsDeliveryAction('pay', investigation);
  assert.equal(answer.smsAction.outcome, 'unsafe');
  assert.equal(answer.isCorrect, false);
  assert.equal(engine.score, 0);
  assert.equal(engine.lives, 2);
  assert.equal(engine.evaluateSmsDeliveryAction('pay', investigation), null);
  assert.equal(engine.evaluateSmsDeliveryAction('ignore', investigation), null);
  assert.equal(engine.lives, 2);
  assert.equal(engine.userAnswers.length, 1);
});

test('ignoring the fee after independently confirming the order is a verified safe action', () => {
  const { engine, investigation } = setup();
  inspectDeliveryTool(investigation, 'order');
  confirmDeliveryContact(investigation);
  const answer = engine.evaluateSmsDeliveryAction('ignore', investigation);
  assert.equal(answer.smsAction.action, 'ignore');
  assert.equal(answer.smsAction.outcome, 'verified');
  assert.equal(answer.isCorrect, true);
  assert.equal(engine.score, 1);
  assert.equal(engine.lives, 3);
});

test('answer snapshots preserve only tools used before choosing', () => {
  const { engine, investigation } = setup();
  inspectDeliveryTool(investigation, 'order');
  confirmDeliveryContact(investigation);
  const answer = engine.evaluateSmsDeliveryAction('verify', investigation);
  inspectDeliveryTool(investigation, 'link');
  assert.equal(answer.smsAction.inspected.length, 1);
  assert.equal(answer.smsAction.inspected[0], 'order');
});

test('invalid actions, other modes, other messages and ended games cannot submit a delivery answer', () => {
  const { engine, investigation } = setup();
  assert.equal(evaluateDeliveryAction('unknown', investigation), null);
  assert.equal(engine.evaluateSmsDeliveryAction('unknown', investigation), null);
  engine.activeItemId = 201;
  assert.equal(engine.evaluateSmsDeliveryAction('ignore', investigation), null);
  engine.activeItemId = 202;
  engine.currentRound = 2;
  assert.equal(engine.evaluateSmsDeliveryAction('ignore', investigation), null);
  engine.currentRound = 1;
  engine.setMode('mail');
  assert.equal(engine.evaluateSmsDeliveryAction('ignore', investigation), null);
  engine.setMode('messages');
  engine.lives = 0;
  assert.equal(engine.evaluateSmsDeliveryAction('ignore', investigation), null);
  assert.equal(engine.userAnswers.length, 0);
});

for (const action of ['verify', 'ignore', 'pay']) {
  test(`all nine SMS still complete across three rounds with delivery choice ${action}`, () => {
    const { engine, investigation } = setup();
    if (action === 'verify') {
      inspectDeliveryTool(investigation, 'order');
      confirmDeliveryContact(investigation);
    }
    for (let round = 1; round <= 3; round++) {
      engine.currentRound = round;
      assert.equal(engine.isRoundComplete(), false);
      for (const item of engine.getCurrentRoundItems()) {
        engine.activeItemId = item.id;
        if (item.id === 202) assert.ok(engine.evaluateSmsDeliveryAction(action, investigation));
        else engine.evaluateAnswer(item.id, item.isScam);
      }
      assert.equal(engine.isRoundComplete(), true);
    }
    assert.equal(engine.userAnswers.length, 9);
    assert.equal(engine.score, action === 'verify' ? 9 : 8);
    assert.equal(engine.lives, action === 'pay' ? 2 : 3);
    engine.resetGame();
    assert.equal(engine.userAnswers.length, 0);
    assert.equal(engine.score, 0);
    assert.equal(engine.lives, 3);
    assert.equal(engine.activeItemId, null);
  });
}

test('last-life delivery mistake ends play and does not charge twice', () => {
  const { engine, investigation } = setup();
  engine.lives = 1;
  assert.ok(engine.evaluateSmsDeliveryAction('pay', investigation));
  assert.equal(engine.lives, 0);
  assert.equal(engine.evaluateSmsDeliveryAction('pay', investigation), null);
  assert.equal(engine.lives, 0);
});

test('continuation chooses the next unanswered SMS, wrapping back to skipped messages', () => {
  const { engine } = setup();
  const items = engine.getCurrentRoundItems();
  engine.evaluateAnswer(202, true);
  let next = getSmsContinuation(items, engine.userAnswers, 202, 1, 3);
  assert.equal(next.kind, 'item');
  assert.equal(next.itemId, 203);
  engine.evaluateAnswer(203, true);
  next = getSmsContinuation(items, engine.userAnswers, 203, 1, 3);
  assert.equal(next.kind, 'item');
  assert.equal(next.itemId, 201);
});

test('continuation moves directly to the next round only after all messages are processed', () => {
  const { engine, investigation } = setup();
  engine.evaluateSmsDeliveryAction('ignore', investigation);
  engine.evaluateAnswer(201, false);
  engine.evaluateAnswer(203, true);
  const next = getSmsContinuation(engine.getCurrentRoundItems(), engine.userAnswers, 203, 1, 3);
  assert.equal(next.kind, 'round');
  assert.match(next.label, /2/);
});

test('last round and zero lives offer results rather than another SMS', () => {
  const { engine } = setup();
  assert.equal(getSmsContinuation(engine.getCurrentRoundItems(), [], 202, 1, 0).kind, 'results');
  engine.currentRound = 3;
  for (const item of engine.getCurrentRoundItems()) engine.evaluateAnswer(item.id, item.isScam);
  assert.equal(getSmsContinuation(engine.getCurrentRoundItems(), engine.userAnswers, 209, 3, 3).kind, 'results');
});
