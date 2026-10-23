import { GameEngine } from './gameEngine';
import { openPhoneGame } from './phoneGame';
import { renderChannelList } from './channelViews';
import { InspectorUI } from './inspector/ui';
import { DeliveryUI } from './sms/deliveryUI';
import { createDeliveryInvestigation, DELIVERY_ITEM_ID } from './sms/deliveryModel';
import { getSmsContinuation } from './sms/navigation';
import type { ScenarioItem, GameMode } from './types';
import {
  fetchLeaderboard,
  getCurrentProfile,
  recordGameScore,
  signIn,
  signUp,
  signOut,
  subscribeToLeaderboard,
  onAuthStateChange,
  isSupabaseConfigured,
  type LeaderboardEntry,
  type UserProfile
} from './supabase';

const engine = new GameEngine();
let deliveryInvestigation = createDeliveryInvestigation();
let inspectorUI: InspectorUI | null = null;
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
const authModal = $('authModal');
const mailInspectionMarkup = inspectModal.innerHTML;

let currentUserProfile: UserProfile | null = null;
let isSignUpMode = false;

const modes: Record<GameMode, { title: string; icon: string; intro: string; noun: string; hint: string }> = {
  mail: {
    title: 'Ca trực Thanh tra: Thẩm định Hộp thư',
    icon: '✉',
    noun: 'hồ sơ email',
    intro: 'Chào mừng Thanh tra viên! Tiếp nhận 9 hồ sơ email khẩn cấp từ người dân và sinh viên gửi về cầu cứu. Đối chiếu Sổ tay nghiệp vụ an toàn thông tin để vạch trần bẫy lừa đảo tinh vi.',
    hint: 'Domain trường/cơ quan phải chuẩn xác (@fpt.edu.vn,...). Bản ghi SPF PASS nhưng gửi từ Gmail công cộng hay đòi cọc tiền, STK cá nhân vẫn là lừa đảo.'
  },
  messages: {
    title: 'Lá chắn SMS',
    icon: '💬',
    noun: 'tin nhắn',
    intro: 'Tin nhắn đến liên tục: phí ship, trúng thưởng, tài khoản sắp khóa. Kiểm tra nội dung và quyết định cách xử lý.',
    hint: 'Tên người gửi và số quen có thể bị giả mạo. Không gửi OTP hoặc bấm link khi chưa xác minh.'
  },
  browser: {
    title: 'Kiểm tra website',
    icon: '🌐',
    noun: 'website',
    intro: 'Logo quen và ổ khóa HTTPS có thể xuất hiện trên trang giả. Kiểm tra địa chỉ, nguồn link và quyền truy cập được yêu cầu.',
    hint: 'HTTPS bảo vệ kết nối; nó không chứng minh website đáng tin. Không nhập mật khẩu hoặc mã xác thực trên trang lạ.'
  },
  posts: {
    title: 'Đoạn chat',
    icon: '💬',
    noun: 'tin nhắn',
    intro: '',
    hint: ''
  },
  market: {
    title: 'Giao dịch',
    icon: '🛒',
    noun: 'giao dịch',
    intro: '',
    hint: ''
  }
};

const completedGames = new Set<string>();
try {
  const saved: unknown = JSON.parse(localStorage.getItem('on-lies-completed') || '[]');
  if (Array.isArray(saved)) {
    saved
      .filter(mode => typeof mode === 'string' && ['mail', 'messages', 'phone', 'inspector'].includes(mode))
      .forEach(mode => completedGames.add(mode));
  }
} catch {
  /* Tiến độ vẫn hoạt động trong phiên nếu bộ nhớ không khả dụng. */
}

function updateProgress() {
  const total = 4;
  const count = completedGames.size;
  const headingSpan = document.querySelector<HTMLElement>('.progress-heading span');
  if (headingSpan) headingSpan.textContent = `${count}/${total} kỹ năng`;

  const trackSpan = document.querySelector<HTMLElement>('.progress-track span');
  if (trackSpan) trackSpan.style.width = `${Math.min(100, (count / total) * 100)}%`;

  const infoSmall = $('progressSubtext');
  if (infoSmall) {
    infoSmall.textContent = count === total
      ? 'Xuất sắc! Bạn đã hoàn thành tất cả các nhiệm vụ an toàn.'
      : 'Hoàn thành thêm nhiệm vụ để thăng hạng trên Bảng xếp hạng.';
  }
}

function recordCompletion(mode: string) {
  completedGames.add(mode);
  try {
    localStorage.setItem('on-lies-completed', JSON.stringify([...completedGames]));
  } catch {
    /* Không chặn game khi bộ nhớ bị hạn chế. */
  }
  updateProgress();
}

document.addEventListener('phone-completed', event => {
  const { score, maxScore, livesLeft } = event.detail;
  recordCompletion('phone');
  recordGameScore('phone', score, maxScore, livesLeft).then(renderLeaderboard);
});

function updateClock() {
  $('systemClock').textContent = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function initTheme() {
  const saved = localStorage.getItem('on-lies-theme') || 'dark';
  applyTheme(saved);
}

function applyTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = $('themeIcon');
  const text = $('themeText');
  if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
  if (text) text.textContent = theme === 'light' ? 'Sáng' : 'Tối';
  localStorage.setItem('on-lies-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

$('themeToggleBtn')?.addEventListener('click', toggleTheme);

document.addEventListener('mail-completed', () => {
  recordCompletion('mail');
  renderLeaderboard();
});

function showDesktop() {
  clearDeliveryModal();
  $('phoneApp').classList.add('hidden');
  $('phoneStats').classList.add('hidden');
  $('inspectorApp')?.classList.add('hidden');
  inspectorUI?.stop();
  statsBar.classList.add('hidden');
  mailApp.classList.add('hidden');
  desktop.classList.remove('hidden');
  resultScreen.classList.add('hidden');
  inspectModal.classList.add('hidden');
  $('windowTitle').textContent = 'Mail Inspector';
  updateDockActive('desktop');
}

function updateDockActive(appName: string) {
  document.querySelectorAll<HTMLButtonElement>('.dock-item').forEach(item => {
    item.classList.toggle('dock-active', item.dataset.app === appName);
  });
}

function toggleLeaderboard(force?: boolean) {
  const sidebar = document.getElementById('leaderboardSidebar');
  const toggleBtn = document.getElementById('toggleLeaderboardBtn');
  if (!sidebar) return;
  const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
  const shouldCollapse = force !== undefined ? !force : !isCurrentlyCollapsed;

  sidebar.classList.toggle('collapsed', shouldCollapse);
  if (toggleBtn) {
    toggleBtn.classList.toggle('active', !shouldCollapse);
  }
}

// ==============================================================================
// DYNAMIC LEADERBOARD & AUTH CONNECTIONS
// ==============================================================================

async function renderLeaderboard() {
  currentUserProfile = await getCurrentProfile();

  // Update top bar auth button
  const authBtnText = $('authBtnText');
  if (authBtnText) {
    authBtnText.textContent = currentUserProfile.is_authenticated
      ? currentUserProfile.username.slice(0, 12)
      : 'Đăng nhập';
  }

  // Update greeting name
  const welcomeAgentName = $('welcomeAgentName');
  if (welcomeAgentName) {
    welcomeAgentName.textContent = `${currentUserProfile.username}!`;
  }

  // Update user profile card in leaderboard
  const userProfileName = $('userProfileName');
  const userProfileRankTitle = $('userProfileRankTitle');
  const userProfileXP = $('userProfileXP');
  const userProfileNextXP = $('userProfileNextXP');
  const userProfileXPTrack = $('userProfileXPTrack');
  const sidebarAuthBtn = $('sidebarAuthBtn');
  const dbStatusSubtitle = $('dbStatusSubtitle');

  if (dbStatusSubtitle) {
    dbStatusSubtitle.textContent = isSupabaseConfigured
      ? 'Supabase Cloud • Trực tiếp'
      : 'Dữ liệu cục bộ • Sẵn sàng kết nối';
  }

  if (userProfileName) userProfileName.textContent = currentUserProfile.username;
  if (userProfileRankTitle) {
    userProfileRankTitle.textContent = `Cấp ${currentUserProfile.level} • ${currentUserProfile.role_title}`;
  }
  if (userProfileXP) userProfileXP.textContent = `${currentUserProfile.total_xp.toLocaleString()} XP`;

  const nextThreshold = currentUserProfile.level * 1000;
  const progressPercent = Math.min(100, Math.round((currentUserProfile.total_xp / nextThreshold) * 100));
  if (userProfileNextXP) {
    userProfileNextXP.textContent = `${nextThreshold.toLocaleString()} XP tới Cấp ${currentUserProfile.level + 1}`;
  }
  if (userProfileXPTrack) {
    userProfileXPTrack.style.width = `${progressPercent}%`;
  }

  if (sidebarAuthBtn) {
    sidebarAuthBtn.textContent = currentUserProfile.is_authenticated ? 'Tài khoản' : 'Lưu điểm';
  }

  // Fetch and render leaderboard entries
  const listContainer = $('leaderboardList');
  if (!listContainer) return;

  try {
    const entries = await fetchLeaderboard();
    if (entries.length === 0) {
      listContainer.innerHTML = '<div class="leaderboard-loading">Chưa có người chơi nào. Hãy là người đầu tiên!</div>';
      return;
    }

    listContainer.innerHTML = entries.map((entry: LeaderboardEntry) => {
      const isCurrent = entry.user_id === currentUserProfile?.id;
      const rankBadge = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `${entry.rank}`;
      const avatarText = entry.avatar_url && entry.avatar_url.length <= 3
        ? entry.avatar_url
        : entry.username.slice(0, 2).toUpperCase();

      return `<div class="rank-row ${isCurrent ? 'rank-current' : ''} rank-${entry.rank}">
        <span class="rank-num">${rankBadge}</span>
        <div class="agent-avatar ${isCurrent ? 'current' : ''}">${avatarText}</div>
        <div class="rank-info">
          <strong>${entry.username} ${isCurrent ? '(Bạn)' : ''}</strong>
          <small>${entry.role_title} • Cấp ${entry.level}</small>
        </div>
        <div class="rank-score">
          <strong>${entry.total_xp.toLocaleString()}</strong>
          <small>XP</small>
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    listContainer.innerHTML = '<div class="leaderboard-loading">Không thể tải dữ liệu bảng xếp hạng.</div>';
  }
}

function openAuthModal() {
  const authProfileView = $('authProfileView');
  const authForm = $('authForm');
  const authModalHeading = $('authModalHeading');
  const authErrorMsg = $('authErrorMsg');

  if (authErrorMsg) authErrorMsg.classList.add('hidden');

  if (currentUserProfile && currentUserProfile.is_authenticated) {
    authProfileView?.classList.remove('hidden');
    authForm?.classList.add('hidden');
    if (authModalHeading) authModalHeading.textContent = 'Hồ sơ Đặc vụ';
    $('authCurrentUsername').textContent = currentUserProfile.username;
    $('authCurrentEmail').textContent = currentUserProfile.email || 'Tài khoản nội bộ';
    $('authCurrentLevel').textContent = `${currentUserProfile.level}`;
    $('authCurrentXP').textContent = `${currentUserProfile.total_xp} XP`;
    $('authCurrentRole').textContent = currentUserProfile.role_title;
  } else {
    authProfileView?.classList.add('hidden');
    authForm?.classList.remove('hidden');
    if (authModalHeading) authModalHeading.textContent = isSignUpMode ? 'Đăng ký Đặc vụ' : 'Đăng nhập';
  }

  authModal.classList.remove('hidden');
}

function closeAuthModal() {
  authModal.classList.add('hidden');
}

function setAuthMode(signUp: boolean) {
  isSignUpMode = signUp;
  $('tabSignIn').classList.toggle('active', !signUp);
  $('tabSignUp').classList.toggle('active', signUp);
  const usernameGroup = $('usernameGroup');
  if (usernameGroup) {
    usernameGroup.classList.toggle('hidden', !signUp);
  }
  $('authSubmitBtn').textContent = signUp ? 'Tạo tài khoản & Lưu điểm' : 'Đăng nhập ngay';
  $('authModalHeading').textContent = signUp ? 'Đăng ký Đặc vụ' : 'Đăng nhập';
  $('authErrorMsg').classList.add('hidden');
}

// Setup Auth form handlers
$('tabSignIn')?.addEventListener('click', () => setAuthMode(false));
$('tabSignUp')?.addEventListener('click', () => setAuthMode(true));
$('closeAuthModalBtn')?.addEventListener('click', closeAuthModal);
$('authBtn')?.addEventListener('click', openAuthModal);
$('sidebarAuthBtn')?.addEventListener('click', openAuthModal);
$('promptLoginBtn')?.addEventListener('click', openAuthModal);

$('signOutBtn')?.addEventListener('click', async () => {
  await signOut();
  closeAuthModal();
  await renderLeaderboard();
});

$('refreshLeaderboardBtn')?.addEventListener('click', () => {
  renderLeaderboard();
});

$('authForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const email = ($('authEmailInput') as HTMLInputElement).value.trim();
  const password = ($('authPasswordInput') as HTMLInputElement).value;
  const username = ($('authUsernameInput') as HTMLInputElement)?.value.trim() || '';
  const errorMsg = $('authErrorMsg');
  const submitBtn = $('authSubmitBtn') as HTMLButtonElement;

  if (!email || !password) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Đang xử lý...';
  if (errorMsg) errorMsg.classList.add('hidden');

  const result = isSignUpMode
    ? await signUp(email, password, username)
    : await signIn(email, password);

  submitBtn.disabled = false;
  submitBtn.textContent = isSignUpMode ? 'Tạo tài khoản & Lưu điểm' : 'Đăng nhập ngay';

  if (!result.success) {
    if (errorMsg) {
      errorMsg.textContent = result.error || 'Thao tác không thành công';
      errorMsg.classList.remove('hidden');
    }
    return;
  }

  closeAuthModal();
  await renderLeaderboard();
});

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

  const miniMailIcon = document.querySelector<HTMLElement>('.mini-mail-icon');
  if (miniMailIcon) miniMailIcon.textContent = config.icon;

  const introEnvelope = document.querySelector<HTMLElement>('.intro-envelope');
  if (introEnvelope) introEnvelope.innerHTML = `${config.icon}<span>!</span>`;

  const introH2 = document.querySelector<HTMLElement>('.intro-content h2');
  if (introH2) introH2.textContent = config.title;

  const introP = document.querySelector<HTMLElement>('.intro-content > p:not(.eyebrow)');
  if (introP) introP.textContent = config.intro;
  const missionDetail = document.querySelectorAll<HTMLElement>('.intro-content > p:not(.eyebrow)')[1];
  if (missionDetail) missionDetail.textContent = mode === 'messages'
    ? 'Đọc từng SMS và kiểm tra yêu cầu. Tin shipper có thêm đơn hàng, liên kết và lịch sử để bạn tự xác minh trước khi chọn cách xử lý. Bỏ qua tin nhắn tránh được rủi ro nhưng chưa được điểm xác minh.'
    : 'Mở từng hồ sơ email, đối chiếu sổ tay nghiệp vụ và đưa ra kết luận dựa trên thông tin trong tình huống.';
  $('startGameBtn').textContent = mode === 'messages' ? 'Bắt đầu kiểm tra SMS →' : 'Nhận ca trực & Bắt đầu thẩm định →';

  const introEyebrow = document.querySelector<HTMLElement>('.intro-content .eyebrow');
  if (introEyebrow) {
    introEyebrow.textContent = mode === 'mail' ? 'LỆNH ĐIỀU ĐỘNG · TRUNG TÂM AN TOÀN SỐ' : 'NHIỆM VỤ HUẤN LUYỆN';
  }

  const rulesList = document.querySelector<HTMLElement>('.rules-list');
  if (rulesList) {
    if (mode === 'mail') {
      rulesList.innerHTML = `
        <li><span>01</span> <b>Hồ sơ thẩm định:</b> Tiếp nhận 9 email khẩn cấp qua 3 ca phân loại.</li>
        <li><span>02</span> <b>Sổ tay nghiệp vụ:</b> Soi kỹ tên miền nguồn (@fpt.edu.vn,...), SPF/DKIM, link lạ và đuôi file kép (.pdf.exe).</li>
        <li><span>03</span> <b>Kỷ luật ca trực:</b> Tối đa 3 lần cảnh cáo vi phạm (3 trái tim). Bỏ lọt email lừa đảo hoặc chặn nhầm thư công vụ sẽ bị trừ điểm nghiệp vụ!</li>
      `;
    } else {
      rulesList.innerHTML = `<li><span>01</span> Đọc nội dung và đối chiếu các dấu hiệu</li><li><span>02</span> 3 vòng • 9 tình huống thực tế</li><li><span>03</span> 3 mạng • Mỗi lựa chọn sai mất 1 mạng</li>`;
    }
  }

  updateDockActive(mode === 'messages' ? 'sms' : mode);
}

document.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button) return;
  if (button.dataset.itemId) {
    openInspectModal(Number(button.dataset.itemId));
    return;
  }

  if (button.dataset.app) {
    const app = button.dataset.app;
    if (app === 'mail' || app === 'inspector') {
      showDesktop();
      desktop.classList.add('hidden');
      $('inspectorApp').classList.remove('hidden');
      if (!inspectorUI) {
        inspectorUI = new InspectorUI($('inspectorApp'), showDesktop);
      }
      inspectorUI.start();
      updateDockActive('mail');
    } else if (app === 'phone') {
      showDesktop();
      desktop.classList.add('hidden');
      $('phoneApp').classList.remove('hidden');
      openPhoneGame();
      updateDockActive('phone');
    } else if (app === 'sms') {
      openMode('messages');
    } else if (app === 'leaderboard') {
      toggleLeaderboard();
    }
    return;
  }

  const actions: Record<string, () => void> = {
    phoneExit: showDesktop,
    closeTipBtn: () => {
      const tip = document.getElementById('dailyTip') || document.querySelector('.daily-tip');
      if (tip) tip.classList.add('hidden');
    },
    toggleLeaderboardBtn: () => toggleLeaderboard(),
    closeLeaderboardBtn: () => toggleLeaderboard(false),
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
  deliveryInvestigation = createDeliveryInvestigation();
  mailIntro.classList.add('hidden');
  resultScreen.classList.add('hidden');
  gameApp.classList.remove('hidden');
  statsBar.classList.remove('hidden');
  const activeLink = document.querySelector<HTMLElement>('.sidebar-link.active');
  if (activeLink) {
    const label = engine.currentMode === 'mail' ? 'Hồ sơ chờ duyệt' : modes[engine.currentMode].noun;
    activeLink.innerHTML = `<span>${modes[engine.currentMode].icon}</span>${label} <b>9</b>`;
  }
  const lessonP = document.querySelector<HTMLElement>('.sidebar-lesson p');
  if (lessonP) {
    lessonP.textContent = modes[engine.currentMode].hint;
  }
  const lessonTitle = document.querySelector<HTMLElement>('.sidebar-lesson strong');
  if (lessonTitle) lessonTitle.textContent = engine.currentMode === 'messages' ? 'Sổ tay an toàn SMS' : 'Sổ tay nghiệp vụ Email';
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

  if (engine.currentMode === 'messages') {
    itemList.innerHTML = renderChannelList(engine.currentMode, items, engine.userAnswers);
  } else {
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
  }

  nextRoundBtn.classList.toggle('hidden', !engine.isRoundComplete() || engine.lives <= 0);
}

function openInspectModal(itemId: number) {
  const item = engine.getItemById(itemId);
  if (!item) return;
  clearDeliveryModal();
  engine.activeItemId = itemId;
  if (engine.currentMode === 'messages') {
      inspectModal.classList.add('sms-investigation-active');
      inspectModal.classList.remove('hidden');
      inspectModal.setAttribute('role', 'dialog');
      inspectModal.setAttribute('aria-modal', 'true');
      inspectModal.setAttribute('aria-label', `SMS: ${item.subject}`);
      new DeliveryUI(inspectModal, {
        item,
        round: engine.currentRound,
        investigation: deliveryInvestigation,
        items: () => engine.getCurrentRoundItems(),
        answers: () => engine.userAnswers,
        stats: () => ({ score: engine.score, lives: engine.lives }),
        submit: action => {
          const answer = engine.evaluateSmsDeliveryAction(action, deliveryInvestigation);
          if (answer) updateUI();
          return answer;
        },
        classify: isScam => {
          if (item.id === DELIVERY_ITEM_ID || engine.lives <= 0 || engine.evaluatedItemIds.has(item.id)) return null;
          engine.evaluateAnswer(item.id, isScam);
          updateUI();
          return engine.userAnswers.find(answer => answer.item.id === item.id) || null;
        },
        open: openInspectModal,
        continuation: () => getSmsContinuation(engine.getCurrentRoundItems(), engine.userAnswers, item.id, engine.currentRound, engine.lives),
        continue: continueSms,
        close: closeModal,
      }).start();
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
  $('modalAttachment').textContent = mail ? (item.attachment === 'none' ? 'Không có' : item.attachment) : 'Chỉ mô phỏng trong game';

  const firstSignal = document.querySelector<HTMLElement>('.signal-grid small');
  if (firstSignal) firstSignal.textContent = mail ? 'XÁC THỰC NGƯỜI GỬI' : 'BỐI CẢNH';

  const signals = document.querySelectorAll<HTMLElement>('.signal-grid small');
  if (signals.length > 1) signals[1].textContent = mail ? 'TỆP ĐÍNH KÈM' : 'TƯƠNG TÁC';

  const bodySmall = document.querySelector<HTMLElement>('.email-body small');
  if (bodySmall) bodySmall.textContent = `NỘI DUNG ${modes[engine.currentMode].noun.toUpperCase()}`;

  const promptP = document.querySelector<HTMLElement>('.inspect-card footer > p');
  if (promptP) promptP.textContent = `Tình huống này có dấu hiệu lừa đảo không?`;

  $('btnActionSafe').textContent = '✓ Hợp lệ trong tình huống này';
  $('btnActionScam').textContent = '⚑ Có dấu hiệu lừa đảo';
  $('answerFeedback').classList.add('hidden');
  $('answerButtons').classList.remove('hidden');

  const evaluated = engine.evaluatedItemIds.has(itemId);
  [$<HTMLButtonElement>('btnActionScam'), $<HTMLButtonElement>('btnActionSafe')].forEach(btn => {
    if (btn) btn.disabled = evaluated;
  });
  inspectModal.classList.remove('hidden');
  if (evaluated) showFeedback(item);
}

function continueSms() {
  const next = getSmsContinuation(engine.getCurrentRoundItems(), engine.userAnswers, engine.activeItemId!, engine.currentRound, engine.lives);
  if (next.kind === 'item') { openInspectModal(next.itemId!); return; }
  if (next.kind === 'round' && engine.isRoundComplete()) {
    engine.currentRound++;
    updateUI();
    openInspectModal(engine.getCurrentRoundItems()[0].id);
    return;
  }
  inspectModal.classList.add('hidden');
  clearDeliveryModal();
  finishGame();
}

function clearDeliveryModal() {
  inspectModal.onclick = null;
  inspectModal.onkeydown = null;
  inspectModal.classList.remove('sms-investigation-active');
  inspectModal.removeAttribute('role');
  inspectModal.removeAttribute('aria-modal');
  inspectModal.removeAttribute('aria-label');
}

function closeModal() {
  inspectModal.classList.add('hidden');
  clearDeliveryModal();
  if (engine.lives <= 0) finishGame();
  else itemList.querySelector<HTMLButtonElement>(`button[data-item-id="${engine.activeItemId}"]`)?.focus();
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

function continueAnswer() {
  closeModal();
}

function advanceRound() {
  if (!engine.isRoundComplete() || engine.lives <= 0) return;
  if (engine.currentRound < 3) {
    engine.currentRound++;
    updateUI();
    return;
  }
  finishGame();
}

async function finishGame() {
  if (engine.lives > 0 && engine.userAnswers.length === 9) {
    recordCompletion(engine.currentMode);
  }

  // Record score into database / local profile
  const scoreResult = await recordGameScore(
    engine.currentMode === 'messages' ? 'sms' : (engine.currentMode as any),
    engine.score,
    9,
    engine.lives
  );

  resultScreen.classList.remove('hidden');
  $('finalScore').textContent = `${engine.score} / 9`;
  $('finalAccuracy').textContent = `${Math.round((engine.score / Math.max(1, engine.userAnswers.length)) * 100)}%`;
  $('finalLives').textContent = `${engine.lives} / 3`;
  $('finalRounds').textContent = `${engine.currentRound} / 3`;
  $('finalXPEarned').textContent = `+${scoreResult.xpEarned} XP`;
  $('resultStatusIcon').textContent = engine.score >= 7 ? '🏆' : engine.score >= 5 ? '🛡️' : '🎓';
  $('resultTitle').textContent = `${modes[engine.currentMode].title} — ${engine.lives <= 0 ? 'Cùng luyện tập thêm' : 'Hoàn thành!'}`;

  const saveScorePrompt = $('saveScorePrompt');
  if (saveScorePrompt) {
    saveScorePrompt.classList.toggle('hidden', !scoreResult.requiresLogin);
  }

  const subTitle = document.querySelector<HTMLElement>('.result-subtitle');
  if (subTitle) {
    subTitle.textContent = `Bạn đã xử lý ${engine.userAnswers.length}/9 tình huống. Ôn lại các dấu hiệu và cách tự bảo vệ bên dưới.`;
  }
  $('breakdownContainer').innerHTML = engine.userAnswers.map(answer => {
    const cautious = answer.smsAction?.outcome === 'cautious';
    const label = cautious ? 'Tránh rủi ro, chưa xác minh' : answer.isCorrect ? 'Xử lý đúng' : 'Cần lưu ý';
    return `<div class="breakdown-item ${cautious ? 'cautious' : answer.isCorrect ? '' : 'wrong'}"><strong>${cautious ? '△' : answer.isCorrect ? '✓' : '✕'} ${answer.item.sender} — ${label}</strong><p>${answer.smsAction?.feedback || answer.item.explanation}</p></div>`;
  }).join('');

  // Update leaderboard in real time
  await renderLeaderboard();
}

// Initializations
initTheme();
updateClock();
updateProgress();
renderLeaderboard();
subscribeToLeaderboard(() => renderLeaderboard());
onAuthStateChange(() => renderLeaderboard());
window.setInterval(updateClock, 30_000);
