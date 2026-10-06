import { GameEngine } from './gameEngine';
import type { ScenarioItem } from './types';

const engine = new GameEngine();
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const desktop = $('desktop');
const mailApp = $('mailApp');
const mailIntro = $('mailIntro');
const gameApp = $('gameApp');
const statsBar = $('statsBar');
const itemList = $('itemList');
const inspectModal = $('inspectModal');
const resultScreen = $('resultScreen');
const nextRoundBtn = $('nextRoundBtn');
const toast = $('toast');
let toastTimer: number | undefined;

function updateClock() {
  $('systemClock').textContent = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function showDesktop() {
  mailApp.classList.add('hidden');
  desktop.classList.remove('hidden');
  resultScreen.classList.add('hidden');
  inspectModal.classList.add('hidden');
}

function openMail() {
  desktop.classList.add('hidden');
  mailApp.classList.remove('hidden');
  mailIntro.classList.remove('hidden');
  gameApp.classList.add('hidden');
  statsBar.classList.add('hidden');
  resultScreen.classList.add('hidden');
}

function showComingSoon() {
  window.clearTimeout(toastTimer);
  toast.classList.remove('hidden');
  toastTimer = window.setTimeout(() => toast.classList.add('hidden'), 2800);
}

document.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button) return;

  if (button.dataset.app) {
    button.dataset.app === 'mail' ? openMail() : showComingSoon();
    return;
  }

  const actions: Record<string, () => void> = {
    closeTipBtn: () => document.querySelector('.daily-tip')?.remove(),
    exitMailBtn: showDesktop,
    introBackBtn: showDesktop,
    startGameBtn: startGame,
    resetGameBtn: openMail,
    closeModalBtn: closeModal,
    btnActionScam: () => submitEvaluation(true),
    btnActionSafe: () => submitEvaluation(false),
    nextRoundBtn: advanceRound,
    restartGameBtn: startGame,
    changeModeBtn: showDesktop,
  };
  actions[button.id]?.();
});

function startGame() {
  engine.setMode('mail');
  engine.resetGame();
  mailIntro.classList.add('hidden');
  resultScreen.classList.add('hidden');
  gameApp.classList.remove('hidden');
  statsBar.classList.remove('hidden');
  updateUI();
}

function getInitials(sender: string) {
  return sender.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase();
}

function updateUI() {
  const items = engine.getCurrentRoundItems();
  const completed = items.filter(item => engine.evaluatedItemIds.has(item.id)).length;
  $('roundBadge').textContent = `Vòng ${engine.currentRound}/3`;
  $('scoreBadge').textContent = `${engine.score} điểm`;
  $('livesDisplay').textContent = `${'♥'.repeat(Math.max(0, engine.lives))}${'♡'.repeat(Math.max(0, 3 - engine.lives))}`;
  $('roundLabelTitle').textContent = `Vòng ${engine.currentRound}`;
  $('roundProgressBar').style.width = `${(completed / items.length) * 100}%`;

  itemList.innerHTML = items.map((item: ScenarioItem) => {
    const answer = engine.userAnswers.find(entry => entry.item.id === item.id);
    const status = !answer
      ? '<span class="status-badge status-pending">CHƯA KIỂM TRA</span>'
      : answer.isCorrect
        ? '<span class="status-badge status-correct">✓ CHÍNH XÁC</span>'
        : '<span class="status-badge status-wrong">✕ CHƯA ĐÚNG</span>';
    return `<article class="mail-row">
      <div class="mail-avatar">${getInitials(item.sender)}</div>
      <div class="mail-sender"><strong>${item.sender}</strong><small>${item.address}</small></div>
      <div class="mail-subject"><strong>${item.subject}</strong><small>${item.body.slice(0, 78)}…</small></div>
      <div class="mail-action">${status}<button class="inspect-button" data-item-id="${item.id}">${answer ? 'Xem lại' : 'Kiểm tra'} →</button></div>
    </article>`;
  }).join('');

  document.querySelectorAll<HTMLButtonElement>('.inspect-button').forEach(button => {
    button.addEventListener('click', () => openInspectModal(Number(button.dataset.itemId)));
  });

  nextRoundBtn.classList.toggle('hidden', !engine.isRoundComplete() || engine.lives <= 0);
  if (engine.lives <= 0) finishGame();
}

function openInspectModal(itemId: number) {
  const item = engine.getItemById(itemId);
  if (!item) return;
  engine.activeItemId = itemId;
  $('modalItemId').textContent = `Mã thư #${item.id}`;
  $('modalSender').textContent = item.sender;
  $('senderAvatar').textContent = getInitials(item.sender);
  $('modalAddress').textContent = item.address;
  $('modalSubject').textContent = item.subject;
  $('modalSpf').textContent = item.spf;
  $('modalBody').textContent = item.body;
  $('modalAttachment').textContent = item.attachment === 'none' ? 'Không có' : item.attachment;

  const evaluated = engine.evaluatedItemIds.has(itemId);
  [$<HTMLButtonElement>('btnActionScam'), $<HTMLButtonElement>('btnActionSafe')].forEach(button => button.disabled = evaluated);
  inspectModal.classList.remove('hidden');
}

function closeModal() {
  inspectModal.classList.add('hidden');
}

function submitEvaluation(userChoiceIsScam: boolean) {
  if (engine.activeItemId === null || engine.evaluatedItemIds.has(engine.activeItemId)) return;
  engine.evaluateAnswer(engine.activeItemId, userChoiceIsScam);
  closeModal();
  updateUI();
}

function advanceRound() {
  if (engine.currentRound < 3) {
    engine.currentRound++;
    updateUI();
    return;
  }
  finishGame();
}

function finishGame() {
  resultScreen.classList.remove('hidden');
  $('finalScore').textContent = `${engine.score} / 9`;
  $('finalAccuracy').textContent = `${Math.round((engine.score / Math.max(1, engine.userAnswers.length)) * 100)}%`;
  $('finalLives').textContent = `${engine.lives} / 3`;
  $('finalRounds').textContent = `${engine.currentRound} / 3`;
  $('resultStatusIcon').textContent = engine.score >= 7 ? '🏆' : engine.score >= 5 ? '🛡️' : '🎓';
  $('resultTitle').textContent = engine.score >= 7 ? 'Bạn là chuyên gia hộp thư!' : 'Báo cáo an toàn hộp thư';
  $('breakdownContainer').innerHTML = engine.userAnswers.map(answer => `<div class="breakdown-item ${answer.isCorrect ? '' : 'wrong'}"><strong>${answer.isCorrect ? '✓' : '✕'} ${answer.item.sender} — ${answer.isCorrect ? 'Nhận diện đúng' : 'Cần lưu ý'}</strong><p>${answer.item.explanation}</p></div>`).join('');
}

updateClock();
window.setInterval(updateClock, 30_000);
