import { escapeHtml } from './html';
import './family.css';

const icon = (path: string, className = '') => `<svg class="${className}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const shield = () => icon('<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6z"/><path d="m8.5 12 2.3 2.3 4.7-5"/>');
const arrow = () => icon('<path d="m9 5 7 7-7 7"/>');

const avatar = (relative: string, className = '') => `<span class="family-portrait ${className}" aria-hidden="true">${escapeHtml(relative.split(/\s+/).map(word => word[0]).slice(0, 2).join('').toLocaleUpperCase('vi'))}</span>`;
const footer = () => '<footer class="family-disclaimer">Tình huống mô phỏng · Không thực hiện cuộc gọi hoặc giao dịch thật</footer>';

function livesMarkup(lives: number) {
  return `<span class="family-lives" aria-label="${lives} mạng còn lại">${[0, 1, 2].map(i =>
    icon('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>', i < lives ? 'is-full' : '')).join('')}</span>`;
}

function meter(label: string, value: number, kind: string) {
  return `<div class="family-meter"><span>${label}</span><div class="family-meter-track ${kind}" role="meter" aria-label="${label}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="10"><i style="width:${value * 10}%"></i></div><strong>${value}<small>/10</small></strong></div>`;
}

export interface FamilySceneView {
  title: string;
  relative: string;
  intro: string;
  sceneIdx: number;
  total: number;
  score: number;
  lives: number;
  fear: number;
  trust: number;
  log: { who: 'family' | 'scammer' | 'me'; text: string }[];
  choices: string[];
  ending?: 'win' | 'lose';
  lesson?: string;
}

export function renderFamilyScene(state: FamilySceneView): string {
  const { relative, sceneIdx, total, ending } = state;
  const compact = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 760px)').matches;
  const chat = state.log.map(line => `<div class="family-message is-${line.who}">
    <div class="family-message-content">${line.who === 'scammer' ? `<span class="family-forwarded">${icon('<path d="m13 5 7 7-7 7M20 12H9a5 5 0 0 0-5 5"/>')}Tin nhắn người thân nhận được</span>` : ''}
      <div class="family-bubble">${escapeHtml(line.text)}</div><span class="family-message-label">${line.who === 'me' ? 'Bạn' : line.who === 'family' ? escapeHtml(relative) : 'Nội dung được chuyển tiếp'}</span>
    </div></div>`).join('');
  const response = ending ? `<div class="family-feedback ${ending === 'win' ? 'is-success' : 'is-warning'}" role="status">
    <span class="family-feedback-icon">${ending === 'win' ? shield() : icon('<path d="M12 9v4m0 4h.01M10.3 4.8 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z"/>')}</span>
    <div><h2 tabindex="-1" data-family-feedback>${ending === 'win' ? 'Người thân đã dừng lại an toàn' : 'Người thân đã làm theo yêu cầu'}</h2><p>${escapeHtml(state.lesson)}</p>
    <button class="family-primary" data-family="next">${state.lives === 0 || sceneIdx === total - 1 ? 'Xem báo cáo nhiệm vụ' : 'Tình huống tiếp theo'}${arrow()}</button></div></div>`
    : `<h2>Bạn sẽ nói gì tiếp theo?</h2><div class="family-choices">${state.choices.map((text, i) =>
      `<button class="family-choice" data-family="choose" data-choice="${i}"><span class="family-choice-key" aria-hidden="true">${String.fromCharCode(65 + i)}</span><span class="family-choice-text">${escapeHtml(text)}</span>${arrow()}</button>`).join('')}</div><p class="family-response-hint">Lựa chọn của bạn sẽ thay đổi cuộc trò chuyện.</p>`;
  return `<div class="family-stage">
    <header class="family-heading"><div><h1 tabindex="-1">${escapeHtml(relative)} đang cần bạn</h1><p>Lắng nghe câu chuyện. Cùng người thân xác minh.</p></div>
      <div class="family-session"><span class="family-step">Tình huống <b>${sceneIdx + 1} / ${total}</b></span><span class="family-score">${state.score} điểm</span>${livesMarkup(state.lives)}</div></header>
    <div class="family-workspace">
      <section class="family-conversation" aria-label="Cuộc trò chuyện với ${escapeHtml(relative)}"><header class="family-contact">${avatar(relative)}<div><h2>${escapeHtml(relative)}</h2><p><span class="family-status-dot ${ending ? 'is-ended' : ''}"></span>${ending ? 'Đã kết thúc tình huống' : 'Đang trò chuyện'}</p></div><span class="family-contact-icon">${icon('<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>')}</span></header>
        <div class="family-chat" id="familyChat" role="log" aria-label="Nội dung hội thoại"><p class="family-chat-date">Cuộc trò chuyện mô phỏng</p>${chat}</div>
        <div class="family-response">${response}</div>
      </section>
      <aside class="family-brief" aria-label="Thông tin tình huống"><h2 class="family-brief-label">Tình huống</h2><h3 class="family-scenario-title">${escapeHtml(state.title)}</h3>
        <details class="family-brief-details" ${compact ? '' : 'open'}><summary>Chi tiết tình huống${arrow()}</summary><p class="family-context">${escapeHtml(state.intro)}</p>
          <div class="family-goal">${shield()}<div><h3>Mục tiêu của bạn</h3><p>Giúp người thân dừng chuyển tiền và kiểm tra qua nguồn độc lập.</p></div></div></details>
        <div class="family-brief-meters">${meter('Hoảng sợ', state.fear, 'is-fear')}${meter('Tin người gọi', state.trust, 'is-trust')}</div>
        <p class="family-brief-tip">Khi mức tin người gọi chạm 10, người thân sẽ làm theo họ. Hãy lắng nghe trước khi đưa lời khuyên.</p>
      </aside>
    </div>${footer()}</div>`;
}

export function renderFamilyIntro(total: number): string {
  return `<div class="family-intro"><div class="family-intro-copy"><h1>Là chỗ dựa<br>khi người thân lo lắng.</h1><p>Một lời khuyên đúng lúc có thể giúp người thân dừng lại. Lắng nghe câu chuyện, chọn cách nói và cùng họ xác minh.</p>
    <div class="family-intro-meta"><span>${total} tình huống</span><span>3 mạng</span><span>Hội thoại nhiều nhánh</span></div>
    <button class="family-primary" data-family="start">Bắt đầu trò chuyện${arrow()}</button><p class="family-intro-note">Bình tĩnh lắng nghe. Không gây thêm áp lực.</p></div>
    <div class="family-intro-preview"><div class="family-contact">${avatar('Bà ngoại')}<div><h2>Bà ngoại</h2><p><span class="family-status-dot"></span>Đang cần bạn giúp đỡ</p></div></div>
      <div class="family-message is-family"><div class="family-bubble">Con ơi, có người gọi bảo bà phải chuyển tiền để xác minh. Bà sợ quá…</div></div><div class="family-message is-me"><div class="family-bubble">Bà bình tĩnh nhé, con đang ở đây với bà.</div></div>
      <div class="family-intro-goal">${shield()}<p>Trấn an. Hỏi rõ. Cùng xác minh.</p></div></div></div>${footer()}`;
}

export function renderFamilySummary(history: { title: string; won: boolean; lesson: string }[], score: number, lives: number, total: number): string {
  return `<div class="family-summary"><header class="family-summary-heading"><span class="family-summary-icon">${shield()}</span><h1>${lives === 0 ? 'Cùng luyện cách giúp người thân' : 'Bạn là chỗ dựa cho gia đình'}</h1><p>Xem lại từng cuộc trò chuyện và những điều bạn đã học.</p></header>
    <div class="family-summary-metrics"><div><span>Đã giúp an toàn</span><strong>${score}<small> / ${history.length}</small></strong></div><div><span>Mạng còn lại</span><strong>${lives}<small> / 3</small></strong></div><div><span>Tình huống đã chơi</span><strong>${history.length}<small> / ${total}</small></strong></div></div>
    <h2 class="family-review-title">Những điều bạn vừa học</h2><div class="family-reviews">${history.map(h => `<details class="family-review ${h.won ? 'is-success' : 'is-warning'}"><summary><span class="family-review-mark">${h.won ? icon('<path d="m5 12 4 4L19 6"/>') : icon('<path d="M12 8v5m0 4h.01"/><circle cx="12" cy="12" r="9"/>')}<span class="sr-only">${h.won ? 'Đã giúp an toàn: ' : 'Chưa giúp an toàn: '}</span></span><span>${escapeHtml(h.title)}</span>${arrow()}</summary><p>${escapeHtml(h.lesson)}</p></details>`).join('')}</div>
    <div class="family-summary-actions"><button class="family-primary" data-family="start">Chơi lại${arrow()}</button><button class="family-secondary" data-action="familyExit">Về màn hình chính</button></div>${footer()}</div>`;
}
