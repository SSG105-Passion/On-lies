import type { ScenarioItem, UserAnswer } from '../types';
import {
  confirmDeliveryContact, DELIVERY_ACTIONS, DELIVERY_ITEM_ID, inspectDeliveryTool, SMS_TOOL_LABELS,
} from './deliveryModel';
import type { DeliveryInvestigation, SmsTool } from './deliveryModel';
import './delivery.css';

const escape = (text: string) => text.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));

interface DeliveryUIOptions {
  investigation: DeliveryInvestigation;
  items: () => ScenarioItem[];
  answers: () => UserAnswer[];
  stats: () => { score: number; lives: number };
  submit: (action: string) => UserAnswer | null;
  close: () => void;
}

export class DeliveryUI {
  private container: HTMLElement;
  private options: DeliveryUIOptions;
  private notice = '';

  constructor(container: HTMLElement, options: DeliveryUIOptions) {
    this.container = container;
    this.options = options;
    container.onclick = event => this.onClick(event);
    container.onkeydown = event => this.onKeyDown(event);
  }

  private get answer() { return this.options.answers().find(answer => answer.item.id === DELIVERY_ITEM_ID); }

  public start() {
    this.render();
    this.container.querySelector<HTMLElement>('[data-sms-heading]')?.focus({ preventScroll: true });
  }

  private button(action: string, text: string, className = '', attributes = '') {
    return `<button type="button" data-sms-action="${action}" class="${className}" ${attributes}>${text}</button>`;
  }

  private render() {
    const { investigation } = this.options;
    const answer = this.answer;
    const stats = this.options.stats();
    this.container.innerHTML = `<article class="smsx-shell">
      <header class="smsx-top"><div><span class="smsx-brand">OL</span><strong>Lá chắn SMS</strong><span class="smsx-tag">Tình huống điều tra</span></div>
      <div class="smsx-stats"><span>${stats.score} điểm</span><span aria-label="${stats.lives} mạng còn lại">${'♥'.repeat(stats.lives)}${'♡'.repeat(3 - stats.lives)}</span>${this.button('close', '← Danh sách', 'smsx-button')}</div></header>
      <div class="smsx-title"><div><p class="smsx-eyebrow">TÌNH HUỐNG 02 / 09</p><h1 tabindex="-1" data-sms-heading>Đơn hàng đang bị giữ?</h1><p>Kiểm tra thông tin trước khi chọn cách xử lý.</p></div><span class="smsx-counter">${investigation.inspected.length}/3 nguồn đã xem${investigation.contactConfirmed ? ' · Đã liên hệ từ đơn' : ''}</span></div>
      <div class="smsx-workspace">
        <aside class="smsx-inbox"><h2>Tin nhắn đến <span>${this.options.items().length}</span></h2><nav aria-label="Tin nhắn vòng hiện tại">${this.options.items().map(item => {
          const answer = this.options.answers().find(answer => answer.item.id === item.id);
          const status = !answer ? 'Chưa xử lý' : answer.smsAction?.outcome === 'cautious' ? 'Chưa xác minh' : answer.isCorrect ? 'Đã xử lý đúng' : 'Cần lưu ý';
          return `<button type="button" data-item-id="${item.id}" class="smsx-inbox-row ${item.id === DELIVERY_ITEM_ID ? 'is-selected' : ''}" ${item.id === DELIVERY_ITEM_ID ? 'aria-current="true"' : ''}><span class="smsx-avatar">${escape(item.sender.trim().slice(0, 2).toUpperCase())}</span><span><strong>${escape(item.sender)}</strong><small>${escape(item.body.slice(0, 66))}…</small><em>${status}</em></span></button>`;
        }).join('')}</nav><p class="smsx-inbox-tip">${this.options.items().filter(item => this.options.answers().some(answer => answer.item.id === item.id)).length}/${this.options.items().length} tin đã xử lý trong vòng này.<br>Có thể mở tin khác rồi quay lại.</p></aside>
        <section class="smsx-conversation" aria-label="Nội dung tin nhắn"><header><span class="smsx-avatar">GH</span><div><strong>Giao hàng nhanh</strong><small>Số chưa lưu · 09xx 224 xxx</small></div><span class="smsx-dots" aria-hidden="true">•••</span></header>
          <div class="smsx-timeline"><p class="smsx-time">Hôm nay, 10:32</p><div class="smsx-bubble">Đơn hàng của bạn đang bị giữ do chưa thanh toán phí giao lại.</div><div class="smsx-bubble">Thanh toán <strong>18.000đ trong 30 phút</strong> để nhận hàng:<br>${this.button('link-preview', 'https://giao-lai.example/phi ↗', 'smsx-link')}</div><p class="smsx-simulation">Liên kết mô phỏng, chỉ mở bảng xem địa chỉ trong game.</p><div class="smsx-bubble smsx-pressure">Quá thời hạn, đơn sẽ được chuyển hoàn.</div><span class="smsx-time smsx-received">10:33 · SMS nhận được</span></div>
          <div class="smsx-toolbar"><span>Trước khi quyết định</span>${this.button('tool', '▣ Kiểm tra đơn', '', 'data-tool="order"')}${this.button('tool', '↗ Xem liên kết', '', 'data-tool="link"')}${this.button('tool', '◷ Lịch sử', '', 'data-tool="history"')}</div>
        </section>
        <aside class="smsx-inspector"><h2>Kiểm tra độc lập</h2><div class="smsx-tools" role="group" aria-label="Nguồn kiểm tra">${(['order', 'link', 'history'] as SmsTool[]).map(tool => this.button('tool', `${SMS_TOOL_LABELS[tool]}${investigation.inspected.includes(tool) ? ' <span aria-label="đã xem">✓</span>' : ''}`, investigation.activeTool === tool ? 'is-active' : '', `data-tool="${tool}" aria-pressed="${investigation.activeTool === tool}"`)).join('')}</div>
          <section class="smsx-tool-panel" aria-label="Thông tin kiểm tra">${this.toolPanel()}</section>
        </aside>
      </div>
      <section class="smsx-decision"><div class="smsx-decision-title"><h2>Bạn sẽ xử lý thế nào?</h2><p>Chọn hành động dựa trên thông tin bạn đã kiểm tra.</p></div>
        ${answer?.smsAction ? this.feedback(answer) : `<div class="smsx-choices">${DELIVERY_ACTIONS.map((choice, index) => this.button('choose', `<b>${String.fromCharCode(65 + index)}</b><span><strong>${escape(choice.label)}</strong><small>${escape(choice.id === 'ignore' && investigation.contactConfirmed ? 'Không làm theo SMS sau khi đã xác minh.' : choice.id === 'ignore' && investigation.inspected.length ? 'Không bấm link, chưa xác minh người gửi.' : choice.caption)}</small></span>`, 'smsx-choice', `data-choice="${choice.id}"`)).join('')}</div>`}
        <p class="smsx-notice" role="status" aria-live="polite">${escape(this.notice)}</p>
      </section><footer class="smsx-footer">Mọi thao tác đều được mô phỏng. Không gọi điện, mở trang thanh toán hoặc thực hiện giao dịch thật.</footer>
    </article>`;
  }

  private toolPanel(): string {
    const state = this.options.investigation;
    switch (state.activeTool) {
      case 'order':
        return `<div class="smsx-order-heading"><span class="smsx-package" aria-hidden="true">▣</span><div><h3>Tai nghe không dây</h3><p>Đơn hàng #DH204</p><small>Bạn đã đặt hôm qua · Trong ứng dụng mua hàng</small></div></div>
          <dl class="smsx-record"><div><dt>Thanh toán</dt><dd>Đã thanh toán</dd></div><div><dt>Vận chuyển</dt><dd>Đang giao</dd></div><div><dt>Phí phát sinh</dt><dd>Không có</dd></div><div><dt>Mã vận đơn</dt><dd>DH204</dd></div><div><dt>Tên miền trong thông tin đơn</dt><dd>vanchuyen.example</dd></div></dl>
          ${state.contactConfirmed ? `<div class="smsx-support"><span class="smsx-eyebrow">HỖ TRỢ TỪ ĐƠN #DH204 · MÔ PHỎNG</span><p>“Đơn của bạn vẫn đang được giao, không có phí giao lại 18.000đ. Chúng tôi không gửi yêu cầu thanh toán qua tên miền giao-lai.example. Bạn có thể lưu SMS để phản ánh qua mục hỗ trợ trong ứng dụng.”</p></div>` : this.button('contact', 'Liên hệ bên vận chuyển từ đơn ↗', 'smsx-button smsx-contact')}
          <p class="smsx-source-note">Thông tin ở đây được lấy từ đơn trong ứng dụng bạn tự mở, không phải đường dẫn trong SMS.</p>`;
      case 'link':
        return `<p class="smsx-eyebrow">XEM ĐỊA CHỈ · KHÔNG TRUY CẬP TRANG</p><h3>Liên kết trong SMS</h3><div class="smsx-url">https://<strong>giao-lai.example</strong>/phi</div><dl class="smsx-record"><div><dt>Giao thức</dt><dd>HTTPS</dd></div><div><dt>Tên miền</dt><dd>giao-lai.example</dd></div><div><dt>Đường dẫn</dt><dd>/phi</dd></div></dl>
          ${state.inspected.includes('order') ? '<div class="smsx-link-comparison"><small>Tên miền trong thông tin đơn đã xem</small><strong>vanchuyen.example</strong></div>' : this.button('tool', 'Mở đơn để tìm nguồn đối chiếu →', 'smsx-button smsx-contact', 'data-tool="order"')}
          <p class="smsx-source-note">HTTPS bảo vệ kết nối, không tự xác thực danh tính bên gửi. Đuôi .example ở đây chỉ dùng cho mô phỏng.</p>`;
      case 'history':
        return `<p class="smsx-eyebrow">LỊCH SỬ TRONG ỨNG DỤNG MUA HÀNG</p><h3>Đơn #DH204</h3><ol class="smsx-history"><li><time>Hôm qua · 18:40</time><strong>Bạn đã đặt tai nghe</strong><p>Thanh toán đủ 320.000đ, đã bao gồm phí giao hàng.</p></li><li><time>Hôm nay · 09:05</time><strong>Đơn được bàn giao vận chuyển</strong><p>Dự kiến giao hôm nay. Chưa có lần giao thất bại được ghi nhận.</p></li><li><time>Hiện tại</time><strong>Chưa có yêu cầu trả thêm phí</strong><p>Thông tin này được ghi trong đơn, không lấy từ SMS vừa nhận.</p></li></ol>`;
      default:
        return `<div class="smsx-tool-empty"><span aria-hidden="true">⌕</span><h3>Bạn muốn kiểm tra điều gì?</h3><p>Mở đơn hàng, xem tên miền hoặc đối chiếu lịch sử trước khi quyết định.</p>${this.button('tool', 'Mở đơn hàng →', 'smsx-button', 'data-tool="order"')}<small>Các nguồn chỉ cung cấp dữ kiện. Bạn là người đưa ra quyết định.</small></div>`;
    }
  }

  private feedback(answer: UserAnswer) {
    const result = answer.smsAction!;
    const consequence = result.outcome === 'verified' ? '+1 điểm · Không mất mạng' : result.outcome === 'cautious' ? '0 điểm · Không mất mạng' : '0 điểm · Mất 1 mạng';
    return `<div class="smsx-feedback smsx-${result.outcome}" role="status"><div><h2 tabindex="-1" data-sms-feedback>${escape(result.title)}</h2><span class="smsx-consequence">${consequence}</span></div><p>${escape(result.feedback)}</p><p class="smsx-reviewed">Bạn chọn: ${escape(result.actionLabel)}<br>Nguồn đã xem trước khi quyết định: ${result.inspected.length ? result.inspected.map(tool => SMS_TOOL_LABELS[tool]).join(' · ') : 'Chưa mở nguồn kiểm tra'}.</p>${this.button('close', this.options.stats().lives <= 0 ? 'Xem kết quả →' : 'Về danh sách tin nhắn →', 'smsx-button smsx-continue')}</div>`;
  }

  private onClick(event: MouseEvent) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-sms-action]');
    if (!button || button.disabled) return;
    const { investigation } = this.options;
    const action = button.dataset.smsAction;
    this.notice = '';
    let focus: string | null = null;
    if (action === 'close') { this.options.close(); return; }
    if (action === 'tool' || action === 'link-preview') {
      inspectDeliveryTool(investigation, action === 'link-preview' ? 'link' : button.dataset.tool!);
      focus = `.smsx-tool-panel`;
    } else if (action === 'contact') {
      if (confirmDeliveryContact(investigation)) {
        this.notice = 'Bạn đã nhận phản hồi qua thông tin trong đơn. Hãy chọn cách xử lý để chốt tình huống.';
        focus = '.smsx-support';
      }
    } else if (action === 'choose' && !this.answer) {
      if (button.dataset.choice === 'verify' && !investigation.contactConfirmed) {
        inspectDeliveryTool(investigation, 'order');
        this.notice = 'Hãy bấm “Liên hệ bên vận chuyển từ đơn” ở bảng kiểm tra để nhận phản hồi, rồi xác nhận lựa chọn của bạn.';
        focus = '[data-sms-action="contact"]';
      } else {
        const result = this.options.submit(button.dataset.choice!);
        if (result) focus = '[data-sms-feedback]';
      }
    }
    const positions = [...this.container.querySelectorAll<HTMLElement>('.smsx-timeline, .smsx-tool-panel, .smsx-shell')].map(node => node.scrollTop);
    this.render();
    this.container.querySelectorAll<HTMLElement>('.smsx-timeline, .smsx-tool-panel, .smsx-shell').forEach((node, index) => { node.scrollTop = positions[index] || 0; });
    if (focus) {
      const target = this.container.querySelector<HTMLElement>(focus);
      if (target) {
        target.tabIndex = target.matches('button') ? 0 : -1;
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); this.options.close(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...this.container.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]')]
      .filter(element => element.getClientRects().length > 0);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
}
