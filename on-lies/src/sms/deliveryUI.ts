import type { ScenarioItem, UserAnswer } from '../types';
import {
  confirmDeliveryContact, DELIVERY_ACTIONS, DELIVERY_ITEM_ID, inspectDeliveryTool, SMS_TOOL_LABELS,
} from './deliveryModel';
import type { DeliveryInvestigation, SmsTool } from './deliveryModel';
import type { SmsContinuation } from './navigation';
import './delivery.css';

const escape = (text: string) => text.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));

const SVG_SHIELD = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
const SVG_BOX = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;
const SVG_LINK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const SVG_SEARCH = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const SVG_LOCK = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

interface DeliveryUIOptions {
  item: ScenarioItem;
  round: number;
  investigation: DeliveryInvestigation;
  items: () => ScenarioItem[];
  answers: () => UserAnswer[];
  stats: () => { score: number; lives: number };
  submit: (action: string) => UserAnswer | null;
  classify: (isScam: boolean) => UserAnswer | null;
  open: (itemId: number) => void;
  continuation: () => SmsContinuation;
  continue: () => void;
  close: () => void;
}

export class DeliveryUI {
  private container: HTMLElement;
  private options: DeliveryUIOptions;
  private notice = '';
  private pendingVerification = false;
  private toolScroll: Partial<Record<SmsTool, number>> = {};

  constructor(container: HTMLElement, options: DeliveryUIOptions) {
    this.container = container;
    this.options = options;
    container.onclick = event => this.onClick(event);
    container.onkeydown = event => this.onKeyDown(event);
  }

  private get isDelivery() { return this.options.item.id === DELIVERY_ITEM_ID; }
  private get answer() { return this.options.answers().find(answer => answer.item.id === this.options.item.id); }

  public start() {
    this.render();
    this.container.scrollTop = 0;
    this.container.querySelector<HTMLElement>('[data-sms-heading]')?.focus({ preventScroll: true });
  }

  private button(action: string, text: string, className = '', attributes = '') {
    return `<button type="button" data-sms-action="${action}" class="${className}" ${attributes}>${text}</button>`;
  }

  private render() {
    const { investigation } = this.options;
    const answer = this.answer;
    const stats = this.options.stats();
    const item = this.options.item;
    const items = this.options.items();
    const index = items.findIndex(entry => entry.id === item.id);
    const processedCount = items.filter(entry => this.options.answers().some(ans => ans.item.id === entry.id)).length;

    this.container.innerHTML = `<article class="smsx-shell">
      <header class="smsx-top">
        <div class="smsx-top-left">
          <span class="smsx-case-pill">CA 02</span>
          <strong data-sms-heading tabindex="-1">${this.isDelivery ? 'Điều tra SMS: Đơn hàng đang bị giữ?' : `Kiểm tra SMS: ${escape(item.subject)}`}</strong>
          <span class="smsx-tag">Vòng ${this.options.round} / 3 · Tin ${index + 1} / ${items.length}</span>
        </div>
        <div class="smsx-stats">
          <span class="smsx-stat-pill">ĐIỂM <b>${stats.score}</b></span>
          <span class="smsx-stat-pill smsx-hearts" aria-label="${stats.lives} mạng còn lại">MẠNG <b>${stats.lives}/3</b></span>
          ${this.button('close', '← Danh sách vòng', 'smsx-button smsx-btn-subtle')}
        </div>
      </header>

      <div class="smsx-workspace">
        <!-- COLUMN 1: INBOX THREAD LIST -->
        <aside class="smsx-inbox">
          <div class="smsx-inbox-header">
            <h2>Hộp tin đến</h2>
            <span class="smsx-round-badge">Vòng ${this.options.round} · ${items.length} tin</span>
          </div>
          <nav aria-label="Tin nhắn vòng hiện tại">
            ${items.map((entry, idx) => {
              const entryAns = this.options.answers().find(a => a.item.id === entry.id);
              const isSelected = entry.id === item.id;
              const isDeliv = entry.id === DELIVERY_ITEM_ID;
              const statusText = !entryAns
                ? (isDeliv ? 'Điều tra' : 'Chưa xử lý')
                : entryAns.smsAction?.outcome === 'cautious'
                  ? 'Chưa xác minh'
                  : entryAns.isCorrect
                    ? 'Đã xử lý'
                    : 'Cần lưu ý';
              const statusClass = !entryAns
                ? (isDeliv ? 'tag-investigate' : 'tag-pending')
                : entryAns.isCorrect
                  ? 'tag-done'
                  : 'tag-warn';
              const avaClass = idx % 3 === 0 ? 'ava-bank' : idx % 3 === 1 ? 'ava-ship' : 'ava-gift';
              const initials = escape(entry.sender.trim().slice(0, 2).toUpperCase());

              return `<button type="button" data-sms-action="item" data-item-id="${entry.id}" class="smsx-inbox-row ${isSelected ? 'is-selected' : ''}" ${isSelected ? 'aria-current="true"' : ''}>
                <span class="smsx-avatar ${avaClass}">${initials}</span>
                <span class="smsx-inbox-body">
                  <span class="smsx-inbox-top">
                    <strong>${escape(entry.sender)}</strong>
                    <em class="smsx-status-tag ${statusClass}">${statusText}</em>
                  </span>
                  <small>${escape(entry.body.slice(0, 68))}…</small>
                </span>
              </button>`;
            }).join('')}
          </nav>
          <footer class="smsx-inbox-footer">
            <span class="smsx-inbox-tip" role="status" aria-atomic="true">Đã xử lý: ${processedCount}/${items.length} tin</span>
            <div class="smsx-nav-arrows" role="group" aria-label="Chuyển tin nhắn">
              ${this.button('previous', '← Trước', 'smsx-button smsx-btn-mini', index <= 0 ? 'disabled' : '')}
              ${this.button('next', 'Kế →', 'smsx-button smsx-btn-mini', index >= items.length - 1 ? 'disabled' : '')}
            </div>
          </footer>
        </aside>

        <!-- COLUMN 2: REALISTIC SMARTPHONE FRAME -->
        <section class="smsx-conversation" aria-label="Nội dung tin nhắn">
          <div class="smsx-phone-bezel">
            <div class="smsx-phone-statusbar" aria-hidden="true">
              <span>09:41</span>
              <span class="smsx-phone-notch"></span>
              <span>5G · 94%</span>
            </div>

            <header class="smsx-phone-header">
              <span class="smsx-avatar ${this.isDelivery ? 'ava-ship' : 'ava-bank'}">${this.isDelivery ? 'GH' : escape(item.sender.slice(0, 2).toUpperCase())}</span>
              <div class="smsx-phone-contact">
                <strong>${escape(item.sender)}</strong>
                <small>${escape(item.address)}</small>
              </div>
              <span class="smsx-sender-pill">${this.isDelivery ? 'Chưa lưu' : 'SMS'}</span>
            </header>

            <div class="smsx-timeline">
              <p class="smsx-time">Hôm nay · Tin nhắn SMS</p>
              ${this.isDelivery
                ? `<div class="smsx-bubble">[TB-KHO] Đơn hàng của bạn đang bị giữ do chưa thanh toán phí giao lại.</div>
                   <div class="smsx-bubble">Thanh toán <strong>18.000đ trong 30 phút</strong> để nhận hàng:<br>${this.button('link-preview', `${SVG_LINK} https://giao-lai.example/phi`, 'smsx-link')}</div>
                   <p class="smsx-simulation">Liên kết mô phỏng — bấm để soi tên miền ở cột bên phải.</p>
                   <div class="smsx-bubble smsx-pressure">Cảnh báo: Quá thời hạn 30 phút, đơn hàng sẽ bị chuyển hoàn về kho tổng!</div>`
                : item.body.split(/(?<=[.!?])\s+(?!\d)/).filter(Boolean).map(line => `<div class="smsx-bubble">${escape(line)}</div>`).join('')}
              <span class="smsx-time smsx-received">Nội dung mô phỏng · Không gửi tin nhắn thật</span>
            </div>

            ${this.isDelivery
              ? `<div class="smsx-toolbar">
                  <span>CÔNG CỤ KIỂM TRA ĐỘC LẬP TRÊN ĐIỆN THOẠI</span>
                  <div class="smsx-toolbar-btns">
                    ${this.button('tool', 'Mở App Đơn Hàng', investigation.activeTool === 'order' ? 'is-active' : '', 'data-tool="order"')}
                    ${this.button('tool', 'Soi Tên Miền', investigation.activeTool === 'link' ? 'is-active' : '', 'data-tool="link"')}
                    ${this.button('tool', 'Lịch Sử Đơn', investigation.activeTool === 'history' ? 'is-active' : '', 'data-tool="history"')}
                  </div>
                </div>`
              : `<div class="smsx-toolbar smsx-toolbar-hint">
                  <span>${SVG_LOCK} Nguyên tắc an toàn: Không bấm link lạ hoặc đọc mã OTP qua SMS</span>
                </div>`}
          </div>
        </section>

        <!-- COLUMN 3: INDEPENDENT VERIFICATION + DECISION PANEL -->
        <div class="smsx-right-col">
          <aside class="smsx-inspector">
            <div class="smsx-inspector-heading">
              <h2>${this.isDelivery ? 'Trạm Kiểm chứng Độc lập' : 'Phân tích Kỹ thuật & Nguồn gửi'}</h2>
              ${this.isDelivery
                ? `<span class="smsx-counter">${investigation.inspected.length}/3 nguồn đã xem${investigation.contactConfirmed ? ' · Đã liên hệ CSKH' : ''}</span>`
                : `<span class="smsx-counter">Kiểm tra dấu hiệu</span>`}
              ${this.button('back-message', '↑ Về tin nhắn', 'smsx-back-message')}
            </div>

            ${this.isDelivery
              ? `<div class="smsx-tools" role="group" aria-label="Nguồn kiểm tra">
                  ${(['order', 'link', 'history'] as SmsTool[]).map(tool =>
                    this.button(
                      'tool',
                      `${SMS_TOOL_LABELS[tool]}${investigation.inspected.includes(tool) ? ' <span class="smsx-seen-dot" aria-label="đã xem">(Đã xem)</span>' : ''}`,
                      investigation.activeTool === tool ? 'is-active' : '',
                      `data-tool="${tool}" aria-pressed="${investigation.activeTool === tool}"`
                    )
                  ).join('')}
                </div>
                <section class="smsx-tool-panel" aria-label="Thông tin kiểm tra">${this.toolPanel()}</section>`
              : `<section class="smsx-tool-panel" aria-label="Thông tin phân tích">${this.standardAnalysisPanel(item)}</section>`}
          </aside>

          <section class="smsx-decision">
            <div class="smsx-decision-title">
              <h2>Bạn sẽ xử lý tin nhắn này thế nào?</h2>
              <p>${this.isDelivery ? 'Chọn cách ứng xử sau khi đã đối chiếu thông tin trên ứng dụng chính thức:' : 'Đánh giá mức độ an toàn dựa trên đầu số gửi và yêu cầu bên trong:'}</p>
            </div>
            ${answer
              ? this.feedback(answer)
              : this.isDelivery
                ? `<div class="smsx-choices">
                    ${DELIVERY_ACTIONS.map((choice, idx) =>
                      this.button(
                        'choose',
                        `<b>${String.fromCharCode(65 + idx)}</b><span><strong>${escape(choice.label)}</strong><small>${escape(
                          choice.id === 'ignore' && investigation.contactConfirmed
                            ? 'Không làm theo SMS sau khi đã xác minh.'
                            : choice.id === 'ignore' && investigation.inspected.length
                              ? 'Không bấm link, chưa xác minh người gửi.'
                              : choice.caption
                        )}</small></span>`,
                        `smsx-choice ${choice.id === 'verify' ? 'smsx-choice-highlight' : ''}`,
                        `data-choice="${choice.id}"`
                      )
                    ).join('')}
                  </div>`
                : `<div class="smsx-classifications">
                    ${this.button('classify', '<b>A</b><span><strong>Hợp lệ trong tình huống này</strong><small>Thông báo an toàn, không yêu cầu bấm link giả hay cung cấp OTP.</small></span>', 'smsx-choice smsx-choice-safe', 'data-verdict="safe"')}
                    ${this.button('classify', '<b>B</b><span><strong>Có dấu hiệu lừa đảo</strong><small>Giả mạo đầu số, thúc ép bấm link lạ hoặc chiếm đoạt tài khoản.</small></span>', 'smsx-choice smsx-choice-scam', 'data-verdict="scam"')}
                  </div>`}
            <p class="smsx-notice" role="status" aria-live="polite">${escape(this.notice)}</p>
          </section>
        </div>
      </div>

      <footer class="smsx-footer">Mọi thao tác đều được mô phỏng. Không gọi điện, mở trang thanh toán hoặc thực hiện giao dịch thật.</footer>
    </article>`;
  }

  private standardAnalysisPanel(item: ScenarioItem): string {
    return `<div class="smsx-order-heading">
        <span class="smsx-package">${SVG_SHIELD}</span>
        <div>
          <h3>Hồ sơ kỹ thuật tin nhắn #${item.id}</h3>
          <p>${escape(item.subject)}</p>
          <small>Đối chiếu nhanh trước khi phân loại</small>
        </div>
      </div>
      <dl class="smsx-record">
        <div><dt>Tên hiển thị người gửi</dt><dd>${escape(item.sender)}</dd></div>
        <div><dt>Đầu số / Địa chỉ gửi</dt><dd>${escape(item.address)}</dd></div>
        <div><dt>Bối cảnh xác thực</dt><dd>${escape(item.spf)}</dd></div>
        <div><dt>Yêu cầu tương tác</dt><dd>${escape(item.attachment === 'none' ? 'Không đính kèm tệp' : item.attachment)}</dd></div>
      </dl>
      <div class="smsx-support smsx-guide-callout">
        <span class="smsx-meta-line">Sổ tay nhanh Lá chắn SMS</span>
        <p>• Ngân hàng và dịch vụ chính thức <strong>không bao giờ</strong> yêu cầu bấm link lạ để nhận quà, nộp phạt hay hủy giao dịch.<br>• Luôn kiểm tra kỹ đuôi tên miền (cảnh giác với <b>.cc</b>, <b>.top</b>, <b>.vip</b>, <b>.xyz</b>).</p>
      </div>`;
  }

  private toolPanel(): string {
    const state = this.options.investigation;
    switch (state.activeTool) {
      case 'order':
        return `<div class="smsx-order-heading"><span class="smsx-package">${SVG_BOX}</span><div><h3>Tai nghe không dây Bluetooth</h3><p>Đơn hàng #DH204 · Mở trực tiếp từ ứng dụng mua hàng</p><small>Bạn đã đặt hôm qua · Không phải link trong SMS</small></div></div>
          <dl class="smsx-record"><div><dt>Trạng thái thanh toán</dt><dd class="dd-safe">Đã thanh toán đủ 320.000đ</dd></div><div><dt>Tình trạng vận chuyển</dt><dd>Đang giao đúng hẹn</dd></div><div><dt>Phí giao lại phát sinh</dt><dd class="dd-safe">0đ (Không có phụ phí)</dd></div><div><dt>Mã vận đơn</dt><dd>DH204</dd></div><div><dt>Tên miền chính thức của hãng</dt><dd>vanchuyen.example</dd></div></dl>
          ${state.contactConfirmed ? `<div class="smsx-support"><span class="smsx-meta-line">Phản hồi từ tổng đài vận chuyển trong ứng dụng</span><p>“Đơn #DH204 của bạn vẫn đang được giao bình thường, không có phí giao lại 18.000đ. Chúng tôi không gửi yêu cầu thanh toán qua tên miền giao-lai.example.”</p></div>` : this.button('contact', 'Liên hệ bên vận chuyển từ đơn #DH204 →', 'smsx-button smsx-contact')}
          <p class="smsx-source-note">Thông tin ở đây được lấy từ đơn trong ứng dụng bạn tự mở, không phải đường dẫn trong SMS.</p>`;
      case 'link':
        return `<p class="smsx-meta-line">Xem địa chỉ · Không truy cập trang</p><h3>Phân tích liên kết trong SMS</h3><div class="smsx-url">https://<strong>giao-lai.example</strong>/phi</div><dl class="smsx-record"><div><dt>Giao thức</dt><dd>HTTPS (Chỉ mã hóa đường truyền)</dd></div><div><dt>Tên miền trong SMS</dt><dd class="dd-warn">giao-lai.example (Tên miền lạ)</dd></div><div><dt>Đường dẫn</dt><dd>/phi (Trang thu tiền)</dd></div></dl>
          ${state.inspected.includes('order') ? '<div class="smsx-link-comparison"><small>Tên miền chính thức trong đơn #DH204 đã xem:</small><strong>vanchuyen.example (Khác hoàn toàn!)</strong></div>' : this.button('tool', 'Mở đơn hàng để đối chiếu tên miền gốc →', 'smsx-button smsx-contact', 'data-tool="order"')}
          <p class="smsx-source-note">HTTPS bảo vệ kết nối, không tự xác thực danh tính bên gửi. Đuôi .example ở đây chỉ dùng cho mô phỏng.</p>`;
      case 'history':
        return `<p class="smsx-meta-line">Lịch sử trong ứng dụng mua hàng</p><h3>Hành trình đơn #DH204</h3><ol class="smsx-history"><li><time>Hôm qua · 18:40</time><strong>Bạn đã đặt tai nghe không dây</strong><p>Thanh toán đủ 320.000đ, đã bao gồm phí giao hàng tận nơi.</p></li><li><time>Hôm nay · 09:05</time><strong>Đơn được bàn giao vận chuyển</strong><p>Dự kiến giao hôm nay. Chưa có bất kỳ lần giao thất bại nào được ghi nhận.</p></li><li><time>Hiện tại</time><strong>Không có yêu cầu thu thêm phí</strong><p>Thông tin này được ghi trong ứng dụng gốc, hoàn toàn trái ngược với SMS hù dọa.</p></li></ol>`;
      default:
        return `<div class="smsx-tool-empty"><span class="smsx-empty-icon">${SVG_SEARCH}</span><h3>Kiểm chứng độc lập trước khi quyết định</h3><p>Tin nhắn yêu cầu đóng 18.000đ phí giao lại. Hãy mở ứng dụng mua hàng để kiểm tra đơn #DH204, soi tên miền liên kết hoặc xem lịch sử vận đơn.</p>${this.button('tool', 'Mở đơn hàng #DH204 ngay →', 'smsx-button smsx-contact', 'data-tool="order"')}<small>Các nguồn chỉ cung cấp dữ kiện độc lập. Bạn là người đưa ra quyết định cuối cùng.</small></div>`;
    }
  }

  private feedback(answer: UserAnswer) {
    const next = this.options.continuation();
    const result = answer.smsAction;
    if (!result) {
      return `<div class="smsx-feedback smsx-${answer.isCorrect ? 'verified' : 'unsafe'}" role="status"><div><h2 tabindex="-1" data-sms-feedback>${answer.isCorrect ? 'Nhận diện đúng' : 'Chưa đúng — mất 1 mạng'}</h2><span class="smsx-consequence">${answer.isCorrect ? '+1 điểm' : '0 điểm'}</span></div><p>${escape(answer.item.explanation)}</p>${this.button('continue', next.label, 'smsx-button smsx-continue')}</div>`;
    }
    const consequence = result.outcome === 'verified' ? '+1 điểm · Không mất mạng' : result.outcome === 'cautious' ? '0 điểm · Không mất mạng' : '0 điểm · Mất 1 mạng';
    return `<div class="smsx-feedback smsx-${result.outcome}" role="status"><div><h2 tabindex="-1" data-sms-feedback>${escape(result.title)}</h2><span class="smsx-consequence">${consequence}</span></div><p>${escape(result.feedback)}</p><p class="smsx-reviewed">Bạn chọn: ${escape(result.actionLabel)}<br>Nguồn đã xem trước khi quyết định: ${result.inspected.length ? result.inspected.map(tool => SMS_TOOL_LABELS[tool]).join(' · ') : 'Chưa mở nguồn kiểm tra'}.</p>${this.button('continue', next.label, 'smsx-button smsx-continue')}</div>`;
  }

  private onClick(event: MouseEvent) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-sms-action]');
    if (!button || button.disabled) return;
    const { investigation } = this.options;
    const action = button.dataset.smsAction;
    this.notice = '';
    let focus: string | null = null;
    if (action === 'close') { this.options.close(); return; }
    if (action === 'continue') { this.options.continue(); return; }
    if (action === 'item') {
      const id = Number(button.dataset.itemId);
      if (id && id !== this.options.item.id) this.options.open(id);
      return;
    }
    if (action === 'previous' || action === 'next') {
      const items = this.options.items();
      const current = items.findIndex(item => item.id === this.options.item.id);
      const next = items[current + (action === 'next' ? 1 : -1)];
      if (next) this.options.open(next.id);
      return;
    }
    if (action === 'back-message') {
      const conversation = this.container.querySelector<HTMLElement>('.smsx-conversation');
      conversation?.scrollIntoView({ block: 'start' });
      this.container.querySelector<HTMLElement>('[data-sms-heading]')?.focus({ preventScroll: true });
      return;
    }
    const previousTool = investigation.activeTool;
    const panel = this.container.querySelector<HTMLElement>('.smsx-tool-panel');
    if (previousTool && panel) this.toolScroll[previousTool] = panel.scrollTop;
    const clickedToolTab = !!button.closest('.smsx-tools');
    if (action === 'tool' || action === 'link-preview') {
      if (action === 'tool' && previousTool === button.dataset.tool) return;
      inspectDeliveryTool(investigation, action === 'link-preview' ? 'link' : button.dataset.tool!);
      focus = clickedToolTab ? `.smsx-tools [data-tool="${investigation.activeTool}"]` : '.smsx-tool-panel';
    } else if (action === 'contact') {
      if (confirmDeliveryContact(investigation)) {
        this.notice = 'Bạn đã nhận phản hồi qua thông tin trong đơn. Hãy chọn cách xử lý để chốt tình huống.';
        focus = '.smsx-support';
        if (this.pendingVerification && !this.answer) {
          this.pendingVerification = false;
          if (this.options.submit('verify')) { focus = '[data-sms-feedback]'; this.notice = ''; }
        }
      }
    } else if (action === 'classify' && !this.answer) {
      if (this.options.classify(button.dataset.verdict === 'scam')) focus = '[data-sms-feedback]';
    } else if (action === 'choose' && !this.answer) {
      if (button.dataset.choice === 'verify' && !investigation.contactConfirmed) {
        this.pendingVerification = true;
        inspectDeliveryTool(investigation, 'order');
        this.notice = 'Chọn “Liên hệ bên vận chuyển từ đơn #DH204” ở khung trên để hoàn tất xác minh. Không cần chọn lại đáp án.';
        focus = '[data-sms-action="contact"]';
      } else {
        const result = this.options.submit(button.dataset.choice!);
        if (result) focus = '[data-sms-feedback]';
      }
    }
    const positions = [...this.container.querySelectorAll<HTMLElement>('.smsx-timeline, .smsx-tool-panel, .smsx-shell, .smsx-inbox nav')].map(node => node.scrollTop);
    const outerScroll = this.container.scrollTop;
    this.render();
    this.container.scrollTop = outerScroll;
    this.container.querySelectorAll<HTMLElement>('.smsx-timeline, .smsx-tool-panel, .smsx-shell, .smsx-inbox nav').forEach((node, index) => {
      node.scrollTop = index === 1 && investigation.activeTool !== previousTool ? this.toolScroll[investigation.activeTool!] || 0 : positions[index] || 0;
    });
    if (focus) {
      const target = this.container.querySelector<HTMLElement>(focus);
      if (target) {
        target.tabIndex = target.matches('button') ? 0 : -1;
        target.focus({ preventScroll: true });
        if (!clickedToolTab) target.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); this.options.close(); return; }
  }
}
