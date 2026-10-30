import { escapeHtml } from './html';
import './family.css';

const icon = (path: string, className = '') =>
  `<svg class="${className}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

const shield = () =>
  icon('<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6z"/><path d="m8.5 12 2.3 2.3 4.7-5"/>');

const arrow = () =>
  icon('<path d="m9 5 7 7-7 7"/>');

const avatar = (relative: string, className = '') =>
  `<span class="family-portrait ${className}" aria-hidden="true">${escapeHtml(
    relative.split(/\s+/).map(word => word[0]).slice(0, 2).join('').toLocaleUpperCase('vi')
  )}</span>`;

const footer = () =>
  '<footer class="family-disclaimer">Tình huống mô phỏng can thiệp khủng hoảng gia đình · Bảo vệ người thân trước bẫy lừa đảo thời gian thực</footer>';

function livesMarkup(lives: number) {
  return `<span class="family-lives" aria-label="${lives} mạng còn lại">${[0, 1, 2]
    .map(i =>
      icon(
        '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
        i < lives ? 'is-full' : ''
      )
    )
    .join('')}</span>`;
}

function meter(label: string, value: number, kind: string) {
  return `<div class="family-meter">
    <span>${label}</span>
    <div class="family-meter-track ${kind}" role="meter" aria-label="${label}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="10">
      <i style="width:${Math.min(100, Math.max(0, value * 10))}%"></i>
    </div>
    <strong>${value}<small>/10</small></strong>
  </div>`;
}

export interface FamilySceneView {
  title: string;
  relative: string;
  relationship: string;
  intro: string;
  location: string;
  locationStatus: string;
  sceneIdx: number;
  total: number;
  score: number;
  lives: number;
  fear: number;
  trust: number;
  log: {
    who: 'family' | 'scammer' | 'me';
    text: string;
    attachment?: {
      type: 'doc' | 'image' | 'warning';
      badge: string;
      title: string;
      desc: string;
    };
  }[];
  choices: {
    text: string;
    tacticLabel: string;
  }[];
  ending?: 'win' | 'lose';
  lesson?: string;
}

export function renderFamilyScene(state: FamilySceneView): string {
  const { relative, sceneIdx, total, ending } = state;
  const compact = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 760px)').matches;

  const chat = state.log
    .map(line => {
      const isScammer = line.who === 'scammer';
      const isMe = line.who === 'me';
      const label = isMe ? 'Bạn (Lời khuyên)' : isScammer ? 'Tin nhắn chuyển tiếp từ kẻ lạ' : escapeHtml(relative);

      const attachmentHtml = line.attachment
        ? `<div class="family-attachment-card">
            <span class="attachment-badge">${escapeHtml(line.attachment.badge)}</span>
            <strong>${escapeHtml(line.attachment.title)}</strong>
            <p>${escapeHtml(line.attachment.desc)}</p>
          </div>`
        : '';

      return `<div class="family-message is-${line.who}">
        <div class="family-message-content">
          ${isScammer ? `<span class="family-forwarded">${icon('<path d="m13 5 7 7-7 7M20 12H9a5 5 0 0 0-5 5"/>')}Lời đe dọa của kẻ lừa đảo</span>` : ''}
          <div class="family-bubble">
            ${escapeHtml(line.text)}
            ${attachmentHtml}
          </div>
          <span class="family-message-label">${label}</span>
        </div>
      </div>`;
    })
    .join('');

  const response = ending
    ? `<div class="family-feedback ${ending === 'win' ? 'is-success' : 'is-warning'}" role="status">
        <span class="family-feedback-icon">${ending === 'win' ? shield() : icon('<path d="M12 9v4m0 4h.01M10.3 4.8 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z"/>')}</span>
        <div>
          <h2 tabindex="-1" data-family-feedback>${ending === 'win' ? 'Bảo vệ thành công người thân!' : 'Người thân đã bị thao túng sập bẫy'}</h2>
          <p>${escapeHtml(state.lesson || '')}</p>
          <button class="family-primary" data-family="next">
            ${state.lives === 0 || sceneIdx === total - 1 ? 'Xem báo cáo tác chiến tổng kết' : 'Ca giải cứu tiếp theo'} ${arrow()}
          </button>
        </div>
      </div>`
    : `<h2>Hành động can thiệp tiếp theo của bạn:</h2>
       <div class="family-choices">
         ${state.choices
           .map(
             (choice, i) => `
               <button class="family-choice" data-family="choose" data-choice="${i}">
                 <span class="family-choice-key" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
                 <div class="family-choice-body">
                   <span class="family-choice-tag">${escapeHtml(choice.tacticLabel)}</span>
                   <span class="family-choice-text">${escapeHtml(choice.text)}</span>
                 </div>
                 ${arrow()}
               </button>`
           )
           .join('')}
       </div>
       <p class="family-response-hint">Mỗi lời khuyên đều ảnh hưởng trực tiếp đến tâm lý và quyết định chuyển tiền của người thân.</p>`;

  return `<div class="family-stage">
    <header class="family-heading">
      <div>
        <h1 tabindex="-1">Phòng Tác chiến: Giải cứu ${escapeHtml(relative)}</h1>
        <p>Địa điểm hiện tại: <b style="color:var(--family-coral);">${escapeHtml(state.locationStatus)}</b></p>
      </div>
      <div class="family-session">
        <span class="family-step">Ca giải cứu <b>${sceneIdx + 1} / ${total}</b></span>
        <span class="family-score">${state.score * 150} XP</span>
        ${livesMarkup(state.lives)}
      </div>
    </header>

    <div class="family-workspace">
      <!-- LEFT / MAIN: LIVE CRISIS CHAT -->
      <section class="family-conversation" aria-label="Cuộc trò chuyện với ${escapeHtml(relative)}">
        <header class="family-contact">
          ${avatar(relative)}
          <div>
            <h2>${escapeHtml(relative)} <small style="font-size:12px;color:var(--family-muted);font-weight:400;">(${escapeHtml(state.relationship)})</small></h2>
            <p><span class="family-status-dot ${ending ? 'is-ended' : ''}"></span>${ending ? 'Đã kết thúc can thiệp' : 'Đang hoảng sợ · Cần bạn giúp đỡ gấp'}</p>
          </div>
          <span class="family-contact-icon">${icon('<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>')}</span>
        </header>

        <div class="family-chat" id="familyChat" role="log" aria-label="Nội dung hội thoại">
          <p class="family-chat-date">Kênh liên lạc gia đình khẩn cấp</p>
          ${chat}
        </div>

        <div class="family-response">${response}</div>
      </section>

      <!-- RIGHT: CRISIS CONTROL PANEL -->
      <aside class="family-brief" aria-label="Thông tin tình huống">
        <h2 class="family-brief-label">TÌNH HUỐNG KHẨN CẤP</h2>
        <h3 class="family-scenario-title">${escapeHtml(state.title)}</h3>

        <details class="family-brief-details" ${compact ? '' : 'open'}>
          <summary>Chi tiết bối cảnh nguy hiểm ${arrow()}</summary>
          <p class="family-context">${escapeHtml(state.intro)}</p>
          <div class="family-goal">
            ${shield()}
            <div>
              <h3>Mục tiêu tác chiến</h3>
              <p>Trấn an tâm lý, chặn việc chuyển tiền và phối hợp với bên thứ ba (giao dịch viên, công an phường, người quen) xác minh ngay lập tức.</p>
            </div>
          </div>
        </details>

        <div class="family-brief-meters">
          ${meter('Mức độ Hoảng loạn', state.fear, 'is-fear')}
          ${meter('Bị Kẻ Gian Thao Túng', state.trust, 'is-trust')}
        </div>

        <div class="family-tactic-guide">
          <strong>💡 Nguyên tắc Vàng khi Người thân Bị Lừa:</strong>
          <ul>
            <li><b>Không chỉ trích:</b> Mắng mỏ chỉ đẩy người nhà vào góc tối và bí mật chuyển tiền.</li>
            <li><b>Câu giờ:</b> Bất kỳ sự trì hoãn nào cũng giúp não bộ thoát khỏi trạng thái "chiến hay biến".</li>
            <li><b>Kích hoạt kênh độc lập:</b> Luôn xác minh qua người thứ ba tại chỗ.</li>
          </ul>
        </div>
      </aside>
    </div>
    ${footer()}
  </div>`;
}

export function renderFamilyIntro(total: number): string {
  return `<div class="family-intro">
    <div class="family-intro-copy">
      <h1>Điểm tựa Vững chắc<br>khi Gia đình gặp Nguy biến.</h1>
      <p>Kẻ lừa đảo thời 4.0 dùng đe dọa án tù, video Deepfake con cháu và ép mua thuốc dỏm để thao túng người lớn tuổi. Một lời khuyên bình tĩnh và hành động quyết đoán của bạn có thể cứu trọn tiền tích góp cả đời của người thân!</p>
      <div class="family-intro-meta">
        <span>${total} Ca Khủng hoảng</span>
        <span>3 Trái tim Bảo vệ</span>
        <span>Tác chiến Đa kênh</span>
      </div>
      <button class="family-primary" data-family="start">Bước vào Phòng Tác chiến ${arrow()}</button>
      <p class="family-intro-note">Bình tĩnh · Thấu cảm · Hành động chính xác</p>
    </div>

    <div class="family-intro-preview">
      <div class="family-contact">
        ${avatar('Mẹ')}
        <div>
          <h2>Mẹ ruột</h2>
          <p><span class="family-status-dot"></span>Đang đứng tại quầy ngân hàng rút 300 triệu...</p>
        </div>
      </div>
      <div class="family-message is-family">
        <div class="family-bubble">Con ơi, Viện kiểm sát dọa bắt mẹ, bắt rút hết 300 triệu tiết kiệm chuyển ngay... Mẹ run quá!</div>
      </div>
      <div class="family-message is-me">
        <div class="family-bubble">Mẹ hít thở sâu nhé, con ở đây rồi! Mẹ đưa máy cho cô giao dịch viên ngân hàng ngay giúp con!</div>
      </div>
      <div class="family-intro-goal">
        ${shield()}
        <p>Bảo vệ người thân · Chặn dòng tiền bẫy</p>
      </div>
    </div>
  </div>
  ${footer()}`;
}

export function renderFamilySummary(
  history: { title: string; won: boolean; lesson: string }[],
  score: number,
  lives: number,
  total: number
): string {
  return `<div class="family-summary">
    <header class="family-summary-heading">
      <span class="family-summary-icon">${shield()}</span>
      <h1>${lives === 0 ? 'Ca Tác chiến gặp Tổn thất' : 'Chiến dịch Giải cứu Gia đình Thành công!'}</h1>
      <p>Tổng kết các bài học nghiệp vụ giúp bạn và gia đình luôn an toàn trước mọi cạm bẫy.</p>
    </header>

    <div class="family-summary-metrics">
      <div><span>Ca can thiệp an toàn</span><strong>${score}<small> / ${total}</small></strong></div>
      <div><span>Trái tim còn lại</span><strong>${lives}<small> / 3</small></strong></div>
      <div><span>Tích lũy XP</span><strong>+${score * 150}<small> XP</small></strong></div>
    </div>

    <h2 class="family-review-title">Hồ sơ nghiệp vụ đã tích lũy</h2>
    <div class="family-reviews">
      ${history
        .map(
          h => `<details class="family-review ${h.won ? 'is-success' : 'is-warning'}">
            <summary>
              <span class="family-review-mark">${h.won ? icon('<path d="m5 12 4 4L19 6"/>') : icon('<path d="M12 8v5m0 4h.01"/><circle cx="12" cy="12" r="9"/>')}</span>
              <span>${escapeHtml(h.title)}</span>
              ${arrow()}
            </summary>
            <p>${escapeHtml(h.lesson)}</p>
          </details>`
        )
        .join('')}
    </div>

    <div class="family-summary-actions">
      <button class="family-primary" data-family="start">Chơi lại chiến dịch ${arrow()}</button>
      <button class="family-secondary" data-action="familyExit">Về sảnh chính</button>
    </div>
    ${footer()}
  </div>`;
}
