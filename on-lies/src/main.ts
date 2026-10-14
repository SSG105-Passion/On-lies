import { GameEngine } from './gameEngine';
import { openPhoneGame } from './phoneGame';
import { renderChannelList, renderChannelDetail } from './channelViews';
import type { ScenarioItem, GameMode } from './types';

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
const mailInspectionMarkup = inspectModal.innerHTML;
const modes: Record<GameMode, { title: string; icon: string; intro: string; noun: string; hint: string }> = {
  mail: { title: 'Thám tử hộp thư', icon: '✉', noun: 'email', intro: 'Kiểm tra người gửi, tên miền và tệp đính kèm để nhận diện bẫy lừa đảo trong hộp thư.', hint: 'SPF hợp lệ hay tệp PDF không tự chứng minh email an toàn. Hãy đối chiếu nguồn và yêu cầu trong nội dung.' },
  messages: { title: 'Lá chắn SMS', icon: '●●●', noun: 'tin nhắn', intro: 'Tin nhắn đến liên tục: phí ship, trúng thưởng, tài khoản sắp khóa. Kiểm tra nội dung và quyết định cách xử lý.', hint: 'Tên người gửi và số quen có thể bị giả mạo. Không gửi OTP hoặc bấm link khi chưa xác minh.' },
  posts: { title: 'Messenger', icon: 'ϟ', noun: 'hội thoại', intro: 'Bạn bè nhờ chuyển tiền, người lạ mời làm việc, tài khoản hỗ trợ xin đăng nhập. Đọc đoạn chat và chọn cách phản ứng.', hint: 'Tài khoản bạn bè có thể bị chiếm. Xác minh yêu cầu chuyển tiền qua số điện thoại đã biết.' },
  browser: { title: 'Kiểm tra website', icon: '◎', noun: 'website', intro: 'Logo quen và ổ khóa HTTPS có thể xuất hiện trên trang giả. Kiểm tra địa chỉ, nguồn link và quyền truy cập được yêu cầu.', hint: 'HTTPS bảo vệ kết nối; nó không chứng minh website đáng tin. Không nhập mật khẩu hoặc mã xác thực trên trang lạ.' },
  market: { title: 'Shopee · Mô phỏng', icon: '🛍', noun: 'giao dịch', intro: 'Lướt gian hàng, mở sản phẩm và đọc lời người bán. Deal giá sốc, cọc ngoài sàn hay hoàn tiền xin OTP: bạn có tiếp tục giao dịch?', hint: 'Đối chiếu đơn và giao dịch trong ứng dụng. Thanh toán theo quy trình có bảo vệ người mua.' },
};
const completedGames = new Set<string>();
try {
  const saved: unknown = JSON.parse(localStorage.getItem('on-lies-completed') || '[]');
  if (Array.isArray(saved)) saved.filter(mode => typeof mode === 'string' && ['mail','messages','posts','market','phone'].includes(mode)).forEach(mode => completedGames.add(mode));
} catch { /* Tiến độ vẫn hoạt động trong phiên nếu bộ nhớ không khả dụng. */ }
function updateProgress() {
  document.querySelector<HTMLElement>('.progress-heading span')!.textContent = `${completedGames.size}/5 kỹ năng`;
  document.querySelector<HTMLElement>('.progress-track span')!.style.width = `${completedGames.size / 5 * 100}%`;
  document.querySelector<HTMLElement>('.progress-info small')!.textContent = completedGames.size === 5 ? 'Bạn đã hoàn thành đủ 5 nhiệm vụ. Hãy tiếp tục luyện tập!' : 'Hoàn thành một mini game để ghi nhận kỹ năng.';
}
function recordCompletion(mode: string) {
  completedGames.add(mode);
  try { localStorage.setItem('on-lies-completed', JSON.stringify([...completedGames])); } catch { /* Không chặn game khi bộ nhớ bị hạn chế. */ }
  updateProgress();
}
document.addEventListener('phone-completed', () => recordCompletion('phone'));

function updateClock() {
  $('systemClock').textContent = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function showDesktop() {
  $('phoneApp').classList.add('hidden');
  $('phoneStats').classList.add('hidden');
  statsBar.classList.add('hidden');
  mailApp.classList.add('hidden');
  desktop.classList.remove('hidden');
  resultScreen.classList.add('hidden');
  inspectModal.classList.add('hidden');
  $('windowTitle').textContent = 'Mail Inspector';
}

function openMode(mode: GameMode) {
  showDesktop();
  engine.setMode(mode);
  const config = modes[mode];
  desktop.classList.add('hidden');
  mailApp.classList.remove('hidden');
  mailApp.setAttribute('aria-label', config.title);
  mailApp.dataset.mode = mode;
  inspectModal.innerHTML = mailInspectionMarkup;
  mailIntro.classList.remove('hidden');
  gameApp.classList.add('hidden');
  $('windowTitle').textContent = config.title;
  $('exitMailBtn').setAttribute('aria-label', `Đóng ${config.title}`);
  document.querySelector<HTMLElement>('.mini-mail-icon')!.textContent = config.icon;
  document.querySelector<HTMLElement>('.intro-envelope')!.innerHTML = `${config.icon}<span>!</span>`;
  document.querySelector<HTMLElement>('.intro-content h2')!.textContent = config.title;
  document.querySelector<HTMLElement>('.intro-content > p:not(.eyebrow)')!.textContent = config.intro;
  document.querySelector<HTMLElement>('.intro-content .eyebrow')!.textContent = 'NHIỆM VỤ HUẤN LUYỆN';
  document.querySelector<HTMLElement>('.rules-list')!.innerHTML = `<li><span>01</span> Đọc nội dung và đối chiếu các dấu hiệu</li><li><span>02</span> 3 vòng • 9 tình huống</li><li><span>03</span> 3 mạng • Mỗi lựa chọn sai mất 1 mạng</li>`;
}

document.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button) return;
  if (button.dataset.itemId) { openInspectModal(Number(button.dataset.itemId)); return; }

  if (button.dataset.app) {
    if (button.dataset.app === 'phone') {
      showDesktop();
      desktop.classList.add('hidden');
      $('phoneApp').classList.remove('hidden');
      openPhoneGame();
    } else {
      const mapping: Record<string, GameMode> = { mail: 'mail', sms: 'messages', social: 'posts', market: 'market' };
      const mode = mapping[button.dataset.app];
      if (mode) openMode(mode);
    }
    return;
  }

  const actions: Record<string, () => void> = {
    phoneExit: showDesktop,
    closeTipBtn: () => document.querySelector('.daily-tip')?.remove(),
    exitMailBtn: showDesktop,
    introBackBtn: showDesktop,
    startGameBtn: startGame,
    resetGameBtn: showDesktop,
    closeModalBtn: closeModal,
    btnActionScam: () => submitEvaluation(true),
    btnActionSafe: () => submitEvaluation(false),
    nextRoundBtn: advanceRound,
    restartGameBtn: startGame,
    continueAnswerBtn: continueAnswer,
    changeModeBtn: showDesktop,
  };
  actions[button.id || button.dataset.action || '']?.();
});

function startGame() {
  engine.resetGame();
  mailIntro.classList.add('hidden');
  resultScreen.classList.add('hidden');
  gameApp.classList.remove('hidden');
  statsBar.classList.remove('hidden');
  document.querySelector<HTMLElement>('.sidebar-link.active')!.innerHTML = `<span>${modes[engine.currentMode].icon}</span>${modes[engine.currentMode].noun} <b>9</b>`;
  document.querySelector<HTMLElement>('.sidebar-lesson p')!.textContent = modes[engine.currentMode].hint;
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
  $('currentModeTitle').textContent = modes[engine.currentMode].title;
  $('channelLabel').textContent = modes[engine.currentMode].noun;
  $('roundProgressBar').style.width = `${(completed / items.length) * 100}%`;

  itemList.innerHTML = engine.currentMode === 'messages' || engine.currentMode === 'posts' || engine.currentMode === 'market' ? renderChannelList(engine.currentMode, items, engine.userAnswers) : items.map((item: ScenarioItem) => {
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

  nextRoundBtn.classList.toggle('hidden', !engine.isRoundComplete() || engine.lives <= 0);
}

function openInspectModal(itemId: number) {
  const item = engine.getItemById(itemId);
  if (!item) return;
  engine.activeItemId = itemId;
  if (engine.currentMode === 'messages' || engine.currentMode === 'posts' || engine.currentMode === 'market') {
    inspectModal.innerHTML = renderChannelDetail(engine.currentMode, item);
    inspectModal.classList.remove('hidden');
    if (engine.evaluatedItemIds.has(itemId)) showFeedback(item);
    return;
  }
  $('modalItemId').textContent = `#${item.id}`;
  $('modalSender').textContent = item.sender;
  $('senderAvatar').textContent = getInitials(item.sender);
  $('modalAddress').textContent = item.address;
  $('modalSubject').textContent = item.subject;
  $('modalSpf').textContent = item.spf;
  $('modalBody').textContent = item.body;
  const mail = engine.currentMode === 'mail';
  $('modalAttachment').textContent = mail ? item.attachment === 'none' ? 'Không có' : item.attachment : 'Chỉ mô phỏng trong game';
  document.querySelector<HTMLElement>('.signal-grid small')!.textContent = mail ? 'XÁC THỰC NGƯỜI GỬI' : 'BỐI CẢNH';
  document.querySelectorAll<HTMLElement>('.signal-grid small')[1].textContent = mail ? 'TỆP ĐÍNH KÈM' : 'TƯƠNG TÁC';
  document.querySelector<HTMLElement>('.email-body small')!.textContent = `NỘI DUNG ${modes[engine.currentMode].noun.toUpperCase()}`;
  document.querySelector<HTMLElement>('.inspect-card footer > p')!.textContent = `Tình huống này có dấu hiệu lừa đảo không?`;
  $('btnActionSafe').textContent = '✓ Hợp lệ trong tình huống này';
  $('btnActionScam').textContent = '⚑ Có dấu hiệu lừa đảo';
  $('answerFeedback').classList.add('hidden');
  $('answerButtons').classList.remove('hidden');

  const evaluated = engine.evaluatedItemIds.has(itemId);
  [$<HTMLButtonElement>('btnActionScam'), $<HTMLButtonElement>('btnActionSafe')].forEach(button => button.disabled = evaluated);
  inspectModal.classList.remove('hidden');
  if (evaluated) showFeedback(item);
}

function closeModal() {
  inspectModal.classList.add('hidden');
  if (engine.lives <= 0) finishGame();
}

function submitEvaluation(userChoiceIsScam: boolean) {
  if (engine.activeItemId === null || engine.evaluatedItemIds.has(engine.activeItemId)) return;
  const result = engine.evaluateAnswer(engine.activeItemId, userChoiceIsScam);
  updateUI();
  showFeedback(result.item);
}

function showFeedback(item: ScenarioItem) {
  const answer = engine.userAnswers.find(entry => entry.item.id === item.id)!;
  $('answerButtons').classList.add('hidden');
  $('answerFeedback').classList.remove('hidden');
  $('answerFeedback').innerHTML = `<strong>${answer.isCorrect ? '✓ Nhận diện đúng!' : '✕ Chưa đúng — mất 1 mạng'}</strong><p>${item.explanation}</p><button id="continueAnswerBtn" class="primary-button">${engine.lives <= 0 ? 'Xem kết quả' : 'Tiếp tục →'}</button>`;
}

function continueAnswer() { closeModal(); }

function advanceRound() {
  if (!engine.isRoundComplete() || engine.lives <= 0) return;
  if (engine.currentRound < 3) {
    engine.currentRound++;
    updateUI();
    return;
  }
  finishGame();
}

function finishGame() {
  if (engine.lives > 0 && engine.userAnswers.length === 9) recordCompletion(engine.currentMode);
  resultScreen.classList.remove('hidden');
  $('finalScore').textContent = `${engine.score} / 9`;
  $('finalAccuracy').textContent = `${Math.round((engine.score / Math.max(1, engine.userAnswers.length)) * 100)}%`;
  $('finalLives').textContent = `${engine.lives} / 3`;
  $('finalRounds').textContent = `${engine.currentRound} / 3`;
  $('resultStatusIcon').textContent = engine.score >= 7 ? '🏆' : engine.score >= 5 ? '🛡️' : '🎓';
  $('resultTitle').textContent = `${modes[engine.currentMode].title} — ${engine.lives <= 0 ? 'Cùng luyện tập thêm' : 'Hoàn thành!'}`;
  document.querySelector<HTMLElement>('.result-subtitle')!.textContent = `Bạn đã xử lý ${engine.userAnswers.length}/9 tình huống. Ôn lại các dấu hiệu và cách tự bảo vệ bên dưới.`;
  $('breakdownContainer').innerHTML = engine.userAnswers.map(answer => `<div class="breakdown-item ${answer.isCorrect ? '' : 'wrong'}"><strong>${answer.isCorrect ? '✓' : '✕'} ${answer.item.sender} — ${answer.isCorrect ? 'Nhận diện đúng' : 'Cần lưu ý'}</strong><p>${answer.item.explanation}</p></div>`).join('');
}

updateClock();
updateProgress();
window.setInterval(updateClock, 30_000);
