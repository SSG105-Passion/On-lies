import { GameEngine } from './gameEngine';
import { GameMode, ScenarioItem } from './types';

const engine = new GameEngine();

// DOM References
const modeSelectOverlay = document.getElementById('modeSelectOverlay')!;
const gameApp = document.getElementById('gameApp')!;
const statsBar = document.getElementById('statsBar')!;
const itemList = document.getElementById('itemList')!;
const inspectModal = document.getElementById('inspectModal')!;
const resultScreen = document.getElementById('resultScreen')!;
const nextRoundBtn = document.getElementById('nextRoundBtn')!;

// Navigation Buttons
document.getElementById('startGameBtn')?.addEventListener('click', startGame);
document.getElementById('resetGameBtn')?.addEventListener('click', exitToMenu);
document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
document.getElementById('btnActionScam')?.addEventListener('click', () => submitEvaluation(true));
document.getElementById('btnActionSafe')?.addEventListener('click', () => submitEvaluation(false));
document.getElementById('nextRoundBtn')?.addEventListener('click', advanceRound);
document.getElementById('restartGameBtn')?.addEventListener('click', restartCurrentMode);
document.getElementById('changeModeBtn')?.addEventListener('click', exitToMenu);

// Global Mode Select Hook
(window as any).selectGameMode = (mode: GameMode) => {
  engine.setMode(mode);
  ['mail', 'messages', 'posts'].forEach(m => {
    const card = document.getElementById(`card-${m}`);
    if (card) {
      if (m === mode) {
        card.className = "mode-card border-indigo-500 bg-indigo-500/10 p-4 rounded-xl text-left border-2";
      } else {
        card.className = "mode-card border-slate-700 p-4 rounded-xl text-left border-2 hover:border-slate-500";
      }
    }
  });
};

function startGame() {
  engine.resetGame();
  modeSelectOverlay.classList.add('hidden');
  gameApp.classList.remove('opacity-30', 'pointer-events-none');
  statsBar.classList.remove('hidden');
  updateUI();
}

function updateUI() {
  // Update Stats Bar
  document.getElementById('roundBadge')!.innerText = `VÒNG ${engine.currentRound} / 3`;
  document.getElementById('scoreBadge')!.innerText = `ĐIỂM: ${engine.score} / 9`;
  document.getElementById('livesDisplay')!.innerText = `${'❤️'.repeat(Math.max(0, engine.lives))}${engine.lives < 3 ? '💔'.repeat(3 - engine.lives) : ''}`;

  document.getElementById('roundLabelTitle')!.innerText = `Vòng ${engine.currentRound}`;

  // Render Items
  const items = engine.getCurrentRoundItems();
  itemList.innerHTML = items.map((item: ScenarioItem) => {
    const isEvaluated = engine.evaluatedItemIds.has(item.id);
    const answerObj = engine.userAnswers.find(a => a.item.id === item.id);

    let statusBadge = `<span class="text-[10px] bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/50">CHƯA KIỂM TRA</span>`;
    if (isEvaluated && answerObj) {
      if (answerObj.isCorrect) {
        statusBadge = `<span class="text-[10px] bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">✅ CHÍNH XÁC (+1)</span>`;
      } else {
        statusBadge = `<span class="text-[10px] bg-rose-900/50 text-rose-300 px-2 py-0.5 rounded border border-rose-700/50">❌ SAI BẢN CHẤT</span>`;
      }
    }

    return `
      <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between hover:border-slate-700 transition">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-xs text-slate-200">${item.sender}</span>
            <span class="text-[10px] text-amber-300/80 font-mono">(${item.address})</span>
          </div>
          <div class="text-xs text-slate-400 font-semibold">${item.subject}</div>
        </div>
        <div class="flex items-center space-x-3">
          ${statusBadge}
          <button data-item-id="${item.id}" class="btn-inspect px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded">
            ${isEvaluated ? 'Xem lại' : 'Soát tin 🔍'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach Event Listeners to dynamic buttons
  document.querySelectorAll('.btn-inspect').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number((e.currentTarget as HTMLElement).getAttribute('data-item-id'));
      openInspectModal(id);
    });
  });

  // Round Advance Button state
  if (engine.isRoundComplete() && engine.currentRound <= 3 && engine.lives > 0) {
    nextRoundBtn.classList.remove('hidden');
  } else {
    nextRoundBtn.classList.add('hidden');
  }

  // Trigger End Game if Lives reach 0
  if (engine.lives <= 0) {
    finishGame();
  }
}

function openInspectModal(itemId: number) {
  engine.activeItemId = itemId;
  const item = engine.getItemById(itemId)!;

  document.getElementById('modalItemId')!.innerText = String(item.id);
  document.getElementById('modalSender')!.innerText = item.sender;
  document.getElementById('modalAddress')!.innerText = item.address;
  document.getElementById('modalSubject')!.innerText = item.subject;
  document.getElementById('modalSpf')!.innerText = item.spf;
  document.getElementById('modalBody')!.innerText = item.body;
  document.getElementById('modalAttachment')!.innerText = item.attachment;

  const isAlreadyEvaluated = engine.evaluatedItemIds.has(itemId);
  const btnActionScam = document.getElementById('btnActionScam') as HTMLButtonElement;
  const btnActionSafe = document.getElementById('btnActionSafe') as HTMLButtonElement;

  if (isAlreadyEvaluated) {
    btnActionScam.disabled = true;
    btnActionSafe.disabled = true;
    btnActionScam.classList.add('opacity-40');
    btnActionSafe.classList.add('opacity-40');
  } else {
    btnActionScam.disabled = false;
    btnActionSafe.disabled = false;
    btnActionScam.classList.remove('opacity-40');
    btnActionSafe.classList.remove('opacity-40');
  }

  inspectModal.classList.remove('hidden');
}

function closeModal() {
  inspectModal.classList.add('hidden');
}

function submitEvaluation(userChoiceIsScam: boolean) {
  if (engine.activeItemId === null) return;
  engine.evaluateAnswer(engine.activeItemId, userChoiceIsScam);
  closeModal();
  updateUI();
}

function advanceRound() {
  if (engine.currentRound < 3) {
    engine.currentRound++;
    updateUI();
  } else {
    finishGame();
  }
}

function finishGame() {
  resultScreen.classList.remove('hidden');

  document.getElementById('finalScore')!.innerText = `${engine.score} / 9`;
  const accuracy = Math.round((engine.score / 9) * 100);
  document.getElementById('finalAccuracy')!.innerText = `${accuracy}%`;
  document.getElementById('finalLives')!.innerText = `${engine.lives} / 3`;
  document.getElementById('finalRounds')!.innerText = `${engine.currentRound} / 3`;

  const container = document.getElementById('breakdownContainer')!;
  container.innerHTML = engine.userAnswers.map(ans => `
    <div class="p-3 bg-slate-950 border ${ans.isCorrect ? 'border-emerald-800/50' : 'border-rose-800/50'} rounded-lg space-y-1">
      <div class="flex justify-between text-xs">
        <span class="font-bold text-slate-200">#${ans.item.id} - ${ans.item.sender}</span>
        <span class="font-bold ${ans.isCorrect ? 'text-emerald-400' : 'text-rose-400'}">
          ${ans.isCorrect ? '✅ ĐÁNH GIÁ ĐÚNG' : '❌ ĐÁNH GIÁ SAI'}
        </span>
      </div>
      <p class="text-[11px] text-slate-400 font-sans leading-relaxed pt-1">
        💡 <strong>Giải thích kỹ thuật:</strong> ${ans.item.explanation}
      </p>
    </div>
  `).join('');
}

function restartCurrentMode() {
  resultScreen.classList.add('hidden');
  startGame();
}

function exitToMenu() {
  resultScreen.classList.add('hidden');
  modeSelectOverlay.classList.remove('hidden');
  gameApp.classList.add('opacity-30', 'pointer-events-none');
  statsBar.classList.add('hidden');
}