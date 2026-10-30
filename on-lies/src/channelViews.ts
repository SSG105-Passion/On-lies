import { escapeHtml } from './html';
import type { GameMode, ScenarioItem, UserAnswer } from './types';

const state = (answer?: UserAnswer) => answer?.smsAction?.outcome === 'cautious'
  ? '△ Chưa xác minh' : answer ? (answer.isCorrect ? '✓ Đã xử lý' : '✕ Cần lưu ý') : 'Chưa đọc';

export function renderChannelList(_mode: GameMode, items: ScenarioItem[], answers: UserAnswer[]): string {
  return `<div class="conversation-home sms-home">
    <header class="conversation-heading">
      <div class="conversation-heading-text">
        <h2>Tin nhắn SMS</h2>
        <p>Phát hiện liên kết nguy hiểm & tin nhắn giả mạo</p>
      </div>
      <div class="sms-app-badge">💬</div>
    </header>
    <input class="chat-search" data-sms-search type="search" aria-label="Tìm kiếm tin nhắn trong vòng" placeholder="Tìm người gửi hoặc nội dung…" />
    <div class="conversation-list">
      ${items.map(item => {
        const answer = answers.find(a => a.item.id === item.id);
        const initial = item.sender.trim().slice(0, 1).toUpperCase();
        return `<button class="conversation-row ${answer ? 'evaluated' : ''}" data-item-id="${item.id}" data-search-text="${escapeHtml(item.sender + ' ' + item.body)}">
          <span class="chat-avatar avatar-${item.id % 4}">${initial}</span>
          <div class="conversation-body">
            <div class="conversation-topline">
              <strong>${item.sender}${item.id === 202 ? ' <span class="sms-investigation-label">Điều tra</span>' : ''}</strong>
              <span class="conversation-time">${answer ? state(answer) : 'Hôm nay'}</span>
            </div>
            <p>${item.body.slice(0, 72)}…</p>
          </div>
          <i class="unread-dot ${answer ? 'hidden' : ''}"></i>
        </button>`;
      }).join('')}
    </div>
    <p data-sms-empty hidden role="status">Không tìm thấy tin nhắn phù hợp trong vòng này.</p>
    <div class="conversation-bottom">💬 Chạm vào tin nhắn để mở chi tiết và phân tích độ an toàn</div>
  </div>`;
}

const dialogue = (item: ScenarioItem) => item.body.split(/(?<=[.!?])\s+(?!\d)/).filter(Boolean);

export function renderChannelDetail(_mode: GameMode, item: ScenarioItem): string {
  const buttons = `<div id="answerButtons" class="sms-answer-buttons">
    <button id="btnActionSafe" class="safe-button">✓ Hợp lệ trong tình huống này</button>
    <button id="btnActionScam" class="scam-button">⚑ Báo cáo tin nhắn lừa đảo</button>
  </div>
  <div id="answerFeedback" class="hidden" role="status"></div>`;

  const initial = item.sender.trim().slice(0, 1).toUpperCase();

  return `<article class="chat-detail sms-detail">
    <header>
      <button id="closeModalBtn" class="chat-back-btn" aria-label="Quay lại danh sách">‹ Quay lại</button>
      <div class="chat-header-center">
        <span class="chat-avatar avatar-${item.id % 4}">${initial}</span>
        <div>
          <strong>${item.sender}</strong>
          <small>${item.address}</small>
        </div>
      </div>
      <span class="chat-header-info">ℹ️</span>
    </header>
    <div class="chat-timeline">
      <div class="chat-day">Hôm nay • Tin nhắn văn bản (SMS)</div>
      ${dialogue(item).map(line => `<div class="chat-incoming">${line}</div>`).join('')}
      <div class="chat-delivered">Mô phỏng an toàn • Cảnh giác với link rút gọn và yêu cầu OTP</div>
    </div>
    <footer>
      <p class="chat-prompt">Tin nhắn này có dấu hiệu lừa đảo không?</p>
      ${buttons}
    </footer>
  </article>`;
}
