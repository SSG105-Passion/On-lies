import { InspectorEngine } from './engine';
import { CLUE_CATEGORIES } from './types';
import { recordGameScore, scoreSaveMessage } from '../supabase';
import { createSessionId } from '../session';
import './inspector.css';
import './desk.css';
import { compareRule, caseLinks, SCHOOL_CALENDAR, DIRECTORY } from './inspection';

const icon = (path: string) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const mailIcon = () => icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>');
const warningIcon = () => icon('<path d="M10.3 4.8 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>');

export class InspectorUI {
  private container: HTMLElement;
  private engine: InspectorEngine;
  private onExit: () => void;
  private timerId: number | null = null;
  private toastTimerId: number | null = null;
  private sessionId = '';
  private finalized = false;
  private selectedItem: number | null = null;
  private selectedRule: number | null = null;
  private toolTab = 'compare';
  private bookTab = 'rules';
  private displayedCaseId: number | null = null;

  constructor(container: HTMLElement, onExit: () => void) {
    this.container = container;
    this.onExit = onExit;
    this.engine = new InspectorEngine();
    this.renderLayout();
    this.setupEvents();
  }

  public start() {
    this.stop();
    this.sessionId = createSessionId();
    this.finalized = false;
    this.displayedCaseId = null;
    this.engine.newGame();
    this.updateTopBar();
    this.showDayIntroModal();
    this.startTimer();
  }

  public stop() {
    this.stopTimer();
    if (this.toastTimerId !== null) window.clearTimeout(this.toastTimerId);
    this.toastTimerId = null;
    this.engine.isRunning = false;
  }

  private startTimer() {
    this.stopTimer();
    this.timerId = window.setInterval(() => {
      if (this.engine.isRunning) {
        const timeUp = this.engine.tickTimer();
        this.updateTopBar();
        if (timeUp) {
          this.handleTimeUp();
        }
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private renderLayout() {
    this.container.innerHTML = `
      <div class="inspector-window">
        <header class="inspector-topbar">
          <div class="inspector-stat-group">
            <h1 class="inspector-mode-tag">${mailIcon()}<span>Thanh tra Hộp thư</span></h1>
            <span>NGÀY <b id="inspDay">1</b></span>
            <span>THỜI GIAN <b id="inspTimer">02:00</b></span>
            <span>HỒ SƠ <b id="inspProgress">0/0</b></span>
          </div>
          <div class="inspector-stat-group">
            <span class="inspector-warn-icons" id="inspWarnings" aria-label="Cảnh cáo">
              <span class="warn-off">${warningIcon()}</span>
              <span class="warn-off">${warningIcon()}</span>
              <span class="warn-off">${warningIcon()}</span>
            </span>
            <span>LƯƠNG <b id="inspSalary">0 đ</b></span>
            <button class="inspector-exit-btn" id="inspExitBtn">← Màn hình chính</button>
          </div>
        </header>

        <main class="inspector-desk" id="inspDesk"></main>

        <div id="inspToast" class="inspector-toast" role="status"></div>

        <div id="inspModalOverlay" class="inspector-modal-overlay" role="dialog" aria-label="Thông tin ca trực">
          <div class="inspector-modal-box" id="inspModalBox"></div>
        </div>
      </div>
    `;
  }

  private setupEvents() {
    const desk = this.container.querySelector('#inspDesk')!;
    const exitBtn = this.container.querySelector('#inspExitBtn')!;

    exitBtn.addEventListener('click', () => {
      this.stop();
      this.onExit();
    });

    desk.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const control = target.closest<HTMLButtonElement>('[data-datum], [data-rule], [data-tool], [data-book]');
      if (control) {
        if (control.dataset.datum !== undefined) this.selectedItem = Number(control.dataset.datum);
        if (control.dataset.rule !== undefined) this.selectedRule = Number(control.dataset.rule);
        if (control.dataset.tool) this.toolTab = control.dataset.tool;
        if (control.dataset.book) this.bookTab = control.dataset.book;
        this.renderDesk();
        return;
      }

      const removeFlag = target.closest<HTMLButtonElement>('[data-remove-flag]');
      if (removeFlag && !this.engine.isCaseEvaluated) {
        const index = Number(removeFlag.dataset.removeFlag);
        this.engine.toggleFlag(index);
        this.renderDesk();
        desk.querySelector<HTMLElement>(`.insp-token[data-index="${index}"]`)?.focus({ preventScroll: true });
        return;
      }

      // Click vào token chi tiết
      const token = target.closest<HTMLElement>('.insp-token');
      if (token && !this.engine.isCaseEvaluated) {
        const index = Number(token.dataset.index);
        this.engine.toggleFlag(index);
        this.renderDesk();
        desk.querySelector<HTMLElement>(`.insp-token[data-index="${index}"]`)?.focus({ preventScroll: true });
        return;
      }

      // Click vào nút đóng dấu
      const approveBtn = target.closest<HTMLButtonElement>('#stampApprove');
      if (approveBtn) {
        this.handleStamp(false);
        return;
      }

      const rejectBtn = target.closest<HTMLButtonElement>('#stampReject');
      if (rejectBtn) {
        this.handleStamp(true);
        return;
      }

      // Click vào nút chuyển hồ sơ hoặc kết thúc ngày
      const nextBtn = target.closest<HTMLButtonElement>('#inspNextBtn');
      if (nextBtn) {
        if (!this.engine.isCaseEvaluated || this.engine.isFired() || this.finalized) return;
        if (this.engine.isDayComplete()) {
          this.showDayEndModal(false);
        } else {
          this.engine.nextCase();
          this.renderDesk();
          this.updateTopBar();
          desk.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
    desk.addEventListener('keydown', event => {
      const key = event as KeyboardEvent;
      const token = (key.target as HTMLElement).closest<HTMLElement>('.insp-token');
      if (token && (key.key === 'Enter' || key.key === ' ')) {
        key.preventDefault();
        token.click();
        desk.querySelector<HTMLElement>(`[data-index="${token.dataset.index}"]`)?.focus({ preventScroll: true });
      }
    });
  }

  private handleStamp(isReject: boolean) {
    if (this.engine.isCaseEvaluated || !this.engine.isRunning || this.engine.isFired() || this.finalized) return;

    const { needReason } = this.engine.stamp(isReject);

    if (needReason) {
      this.showToast('Từ chối cần có lý do: hãy bấm đánh dấu chi tiết đáng ngờ trên giấy!');
      return;
    }

    this.renderDesk();
    this.updateTopBar();

    const desk = this.container.querySelector('#inspDesk');
    if (desk) {
      desk.scrollTo({ top: desk.scrollHeight, behavior: 'smooth' });
      desk.querySelector<HTMLButtonElement>('#inspNextBtn')?.focus({ preventScroll: true });
    }

    if (this.engine.isFired()) {
      this.stop();
      this.showFiredModal();
    }
  }

  private handleTimeUp() {
    this.engine.isRunning = false;
    if (this.engine.isFired()) {
      this.showFiredModal();
    } else {
      this.showDayEndModal(true);
    }
  }

  private updateTopBar() {
    const dayEl = this.container.querySelector('#inspDay');
    const timerEl = this.container.querySelector('#inspTimer');
    const progEl = this.container.querySelector('#inspProgress');
    const warnEl = this.container.querySelector('#inspWarnings');
    const salEl = this.container.querySelector('#inspSalary');

    if (dayEl) dayEl.textContent = String(this.engine.day);

    if (timerEl) {
      const mins = Math.floor(this.engine.timeRemaining / 60);
      const secs = this.engine.timeRemaining % 60;
      // taste-skill-ignore: MM:SS is a clock; both fields need two digits.
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (progEl) {
      const current = Math.min(this.engine.currentCaseIndex + 1, this.engine.queue.length);
      progEl.textContent = `${current}/${this.engine.queue.length}`;
    }

    if (salEl) salEl.textContent = `${this.engine.salary} đ`;

    if (warnEl) {
      const citations = this.engine.citations;
      warnEl.textContent = 'Cảnh cáo ' + citations;
      warnEl.setAttribute('aria-label', citations + ' cảnh cáo trong ngày');
    }
  }

  private renderDesk() {
    const desk = this.container.querySelector('#inspDesk');
    const file = this.engine.getCurrentCase();
    if (!desk || !file) return;
    if (this.displayedCaseId !== file.id) {
      this.selectedItem = null;
      this.selectedRule = null;
      this.toolTab = 'compare';
      this.bookTab = 'rules';
    }
    this.displayedCaseId = file.id;
    const esc = (s: string) => this.escapeHtml(s);
    const evaluated = this.engine.isCaseEvaluated;
    const result = this.engine.currentResult;
    const token = (i: number) => '<button class="inspect-datum ' + (this.selectedItem === i ? 'selected' : '') + '" data-datum="' + i + '" ' + (evaluated ? 'disabled' : '') + '>' + esc(file.allItems[i].text) + '</button>';
    const rules = this.engine.getRulesForCurrentDay();
    const links = caseLinks(file);
    desk.innerHTML = `
      <div class="inspect-props" aria-hidden="true"><span class="inspect-note">ĐỌC KỸ<br>ĐỐI CHIẾU<br>RỒI DUYỆT</span><span class="inspect-pencil"></span><span class="inspect-badge">ON–LIES<br><b>TV</b>THANH TRA</span></div>
      <section class="inspect-left">
        <article class="inspect-sheet">
          <div class="inspect-heading"><h2>${esc(file.who)}</h2><small>${esc(file.channelLabel)} · Ngày ${this.engine.day}</small></div>
          <div class="inspect-sender"><small>Từ / Người gửi</small>${file.senderItem ? token(0) : 'Không có người gửi'}</div>
          <div class="inspect-letter">${file.allItems.map((_, i) => i === 0 && file.senderItem ? '' : token(i)).join(' ')}</div>
          <div class="inspect-note-source"><b>Thông tin người gửi hồ sơ</b><p>${esc(file.note)}</p></div>
          ${evaluated && result ? '<div class="inspect-seal">' + (result.userRejected ? 'TỪ CHỐI' : 'ĐÃ DUYỆT') + '</div>' : ''}
        </article>
        <section class="inspect-tool"><div class="inspect-tabs"><button data-tool="compare" aria-pressed="${this.toolTab === 'compare'}">Đối chiếu</button><button data-tool="link" aria-pressed="${this.toolTab === 'link'}">Phân tích link</button></div>
        <div class="inspect-tool-body">${this.toolTab === 'compare' ? `
          <div class="inspect-pair"><div><small>Dữ kiện trên hồ sơ</small><p>${this.selectedItem === null ? 'Chọn một chi tiết phía trên' : esc(file.allItems[this.selectedItem].text)}</p></div><span>↔</span><div><small>Quy định đối chiếu</small><p>${this.selectedRule === null ? 'Chọn quy định trong sổ' : esc(rules.find(r => r.id === this.selectedRule)?.text || '')}</p></div></div>
          <p class="inspect-comparison" role="status">${esc(compareRule(file, this.selectedItem, this.selectedRule))}</p>
        ` : links.length ? links.map(([label, destination]) => `<div class="inspect-link-result"><small>Đường dẫn hiển thị</small><p>${esc(label)}</p><small>Địa chỉ đích sau chuyển hướng</small><code>${esc(destination)}</code><small>Tên máy chủ</small><strong>${esc(new URL(destination).hostname)}</strong></div>`).join('') + '<p class="inspect-help">Phân tích mô phỏng, không mở website. Tự đối chiếu địa chỉ với danh bạ chính thức.</p>' : '<p>Hồ sơ này không có đường dẫn cần phân tích.</p>'}</div></section>
      </section>
      <aside class="inspect-book"><h2>Sổ tra cứu</h2><div class="inspect-tabs"><button data-book="rules" aria-pressed="${this.bookTab === 'rules'}">Quy định</button><button data-book="calendar" aria-pressed="${this.bookTab === 'calendar'}">Lịch trường</button><button data-book="directory" aria-pressed="${this.bookTab === 'directory'}">Danh bạ</button></div>
        <div class="inspect-book-body">${this.bookTab === 'rules' ? rules.map(r => `<button class="inspect-rule ${this.selectedRule === r.id ? 'selected' : ''}" data-rule="${r.id}"><b>${r.id}</b><span>${esc(r.text)}</span></button>`).join('') : this.bookTab === 'calendar' ? SCHOOL_CALENDAR.filter(r => r.day <= this.engine.day).map(r => `<section class="inspect-reference"><h3>${esc(r.title)}</h3><strong>${esc(r.date)}</strong><p>${esc(r.detail)}</p>${r.rule ? `<button class="inspect-rule" data-rule="${r.rule}">Đối chiếu thời gian này ↔</button>` : ''}</section>`).join('') : DIRECTORY.map(r => '<p class="inspect-reference">' + esc(r) + '</p>').join('')}</div>
        <section class="inspect-decision">${!evaluated ? '<div class="inspect-stamps"><button id="stampApprove">DUYỆT</button><button id="stampReject">TỪ CHỐI</button></div><p class="inspect-help">Bạn có thể đóng dấu bất cứ lúc nào. Không cần ghim bằng chứng.</p>' : result ? `<h3>${result.isCorrect ? 'Kết luận chính xác' : 'Phiếu cảnh cáo'}</h3><p>${result.isCorrect ? '+10 đ thu nhập' : this.engine.citations <= 2 ? 'Nhắc nhở — chưa trừ thu nhập.' : 'Trừ ' + 5 * (this.engine.citations - 2) + ' đ thu nhập.'}</p><div class="inspect-logs">${result.logs.map(log => '<p>' + esc(log.message) + '</p>').join('')}</div><button class="inspector-next-btn" id="inspNextBtn">${this.engine.isDayComplete() ? 'Kết thúc ngày trực' : 'Hồ sơ tiếp theo'} →</button>` : ''}</section>
      </aside>
      <footer class="inspect-footer">Đọc hồ sơ → Đối chiếu → Đóng dấu <span>Mọi thao tác đều được mô phỏng</span></footer>`;
  }

  private showDayIntroModal() {
    const newRules = this.engine.getNewRulesToday();
    const modalHtml = `
      <h2>CA TRỰC THANH TRA HỘP THƯ · NGÀY ${this.engine.day}${this.engine.day === 1 ? ' · NHẬN NHIỆM VỤ' : ''}</h2>
      ${this.engine.day === 1 ? `
        <p>Chào mừng bạn đến với <b>Đội Phản ứng nhanh – Trung tâm An toàn số</b>!</p>
        <p>Trước mặt bạn là các bức email và thông báo khẩn cấp do sinh viên, người dân gửi về cầu cứu trước các bẫy lừa đảo trực tuyến (học phí giả mạo, học bổng ảo, việc làm cọc tiền, khóa tài khoản...).</p>
        <p>Nhiệm vụ: Đối chiếu <b>Sổ tay nghiệp vụ</b>, chọn dữ kiện và quy định để đối chiếu, dùng công cụ phân tích đường dẫn, rồi dùng con dấu <b>ĐÃ DUYỆT (Hợp lệ)</b> hoặc <b>TỪ CHỐI (Lừa đảo)</b>.</p>
      ` : ''}
      <p><b>Quy định ${this.engine.day === 1 ? 'áp dụng' : 'mới bổ sung'} hôm nay:</b></p>
      <ol>
        ${newRules.map(r => `<li><b>Quy tắc ${r.id}:</b> ${this.escapeHtml(r.text)}</li>`).join('')}
      </ol>
      <p><b>Quy định xử phạt:</b> Chỉ kết luận sai mới bị cảnh cáo. Hai lỗi đầu trong ngày được nhắc nhở; lỗi thứ ba trừ 5 đ, mỗi lỗi tiếp theo tăng thêm 5 đ. Kiểm tra nhầm không bị phạt.</p>
      <button class="inspector-next-btn" id="modalStartDayBtn">BẮT ĐẦU CA TRỰC THẨM ĐỊNH →</button>
    `;

    this.showModal(modalHtml);
    const startBtn = this.container.querySelector('#modalStartDayBtn');
    startBtn?.addEventListener('click', () => {
      this.hideModal();
      this.engine.isRunning = true;
      this.renderDesk();
      this.updateTopBar();
    });
  }

  private showDayEndModal(isTimeUp: boolean) {
    this.engine.isRunning = false;
    const isFinalDay = this.engine.day >= this.engine.lastDay;
    const modalHtml = `
      <h2>BÁO CÁO KẾT THÚC NGÀY ${this.engine.day}</h2>
      ${isTimeUp ? '<p style="color:#d32f2f;font-weight:700;">Hết giờ làm việc! Các hồ sơ còn lại đã bị chuyển hoàn.</p>' : '<p>Bạn đã hoàn thành ca trực hôm nay.</p>'}
      <div class="inspector-summary-row">
        <span>Hồ sơ đã xử lý:</span>
        <b>${this.engine.dayProcessed}/${this.engine.queue.length}</b>
      </div>
      <div class="inspector-summary-row">
        <span>Số lần bị cảnh cáo:</span>
        <b style="color:${this.engine.citations > 0 ? '#d32f2f' : '#2b743c'}">${this.engine.citations}</b>
      </div>
      <div class="inspector-summary-row">
        <span>Tổng lương tích lũy:</span>
        <b>${this.engine.salary} đ</b>
      </div>
      <button class="inspector-next-btn" id="modalNextDayBtn" style="margin-top:16px;">
        ${isFinalDay ? 'XEM ĐÁNH GIÁ TỔNG KẾT →' : `SANG NGÀY ${this.engine.day + 1} →`}
      </button>
    `;

    this.showModal(modalHtml);
    const nextBtn = this.container.querySelector('#modalNextDayBtn');
    nextBtn?.addEventListener('click', () => {
      if (isFinalDay) {
        this.showFinalPerformanceModal();
      } else {
        this.engine.startDay(this.engine.day + 1);
        this.showDayIntroModal();
      }
    });
  }

  private showFiredModal() {
    this.stopTimer();
    const modalHtml = `
      <h2 style="color:#c02820;">BỊ CHO THÔI VIỆC!</h2>
      <p>Bạn đã nhận đủ <b>3 cảnh cáo</b> trong Ngày ${this.engine.day}. Ban Giám đốc kết luận bạn chưa đủ cẩn thận để bảo vệ người dân trước các chiêu trò lừa đảo.</p>
      <p>Đừng nản lòng! Hãy đọc kỹ lại Sổ tay nghiệp vụ và nhận việc lại từ đầu.</p>
      <button class="inspector-next-btn" id="modalRetryBtn">NHẬN VIỆC LẠI TỪ ĐẦU →</button>
      <button class="inspector-exit-btn" id="modalExitFiredBtn" style="width:100%;margin-top:8px;padding:12px;">Về màn hình chính</button>
    `;

    this.showModal(modalHtml);
    this.container.querySelector('#modalRetryBtn')?.addEventListener('click', () => {
      this.hideModal();
      this.start();
    });
    this.container.querySelector('#modalExitFiredBtn')?.addEventListener('click', () => {
      this.hideModal();
      this.onExit();
    });
  }

  private showFinalPerformanceModal() {
    if (this.finalized) return;
    this.finalized = true;
    this.stop();
    const sessionId = this.sessionId;
    const completed = this.engine.isTrainingComplete;
    const tally = this.engine.categoryTally;
    const cats = Object.keys(tally) as (keyof typeof tally)[];

    // Tìm nhóm hay bỏ sót nhất
    const sortedMisses = cats
      .filter(c => tally[c][1] > 0)
      .sort((a, b) => (tally[a][0] / tally[a][1]) - (tally[b][0] / tally[b][1]));
    const mostMissed = sortedMisses[0];

    const title = this.engine.correctCount >= 12
      ? 'Thanh tra viên Xuất sắc'
      : this.engine.correctCount >= 8
        ? 'Thanh tra viên Khá'
        : 'Thanh tra viên Tập sự';

    if (completed) document.dispatchEvent(new CustomEvent('mail-completed'));

    const modalHtml = `
      <h2>ĐÁNH GIÁ KẾT QUẢ THỰC TẬP</h2>
      <p>${completed ? 'Đã hoàn thành đủ hồ sơ.' : 'Ca trực chưa hoàn thành đủ hồ sơ; chưa mở huy hiệu.'}</p>
      <p>Đánh giá: <b style="color:#2b743c;font-size:16px;">${title}</b></p>
      
      <div class="inspector-summary-row">
        <span>Xử lý chính xác:</span>
        <b>${this.engine.correctCount}/${this.engine.totalProcessed} hồ sơ đã xử lý</b>
      </div>
      <p>Đã xử lý ${this.engine.totalProcessed}/${this.engine.totalCases} hồ sơ trong toàn bộ ca trực.</p>
      <p id="inspScoreSaveStatus" role="status">${this.engine.totalProcessed ? 'Đang lưu điểm…' : 'Chưa xử lý hồ sơ nào nên không nhận XP.'}</p>
      <div class="inspector-summary-row">
        <span>Tổng thu nhập đạt được:</span>
        <b>${this.engine.salary} đ</b>
      </div>

      <p style="margin-top:14px;"><b>Kết luận đúng theo nhóm hồ sơ:</b></p>
      ${cats.map(c => {
        const [hit, total] = tally[c];
        const percent = total > 0 ? Math.round((hit / total) * 100) : 0;
        return `
          <div class="tally-bar-item">
            <span>${CLUE_CATEGORIES[c]}</span>
            <div class="tally-bar-track">
              <div class="tally-bar-fill" style="width:${percent}%"></div>
            </div>
            <b>${hit}/${total}</b>
          </div>
        `;
      }).join('')}

      ${mostMissed && tally[mostMissed][0] < tally[mostMissed][1] ? `
        <p style="color:#b45309;font-size:12px;margin-top:8px;">
          <i>Nhắc nhở nghiệp vụ:</i> Bạn hay bỏ sót nhóm <b>${CLUE_CATEGORIES[mostMissed]}</b> nhất. Hãy chú ý hơn ở nhóm này!
        </p>
      ` : ''}

      <button class="inspector-next-btn" id="modalFinalRestartBtn" style="margin-top:16px;">LÀM LẠI CA TRỰC</button>
      <button class="inspector-exit-btn" id="modalFinalExitBtn" style="width:100%;margin-top:8px;padding:12px;">VỀ MÀN HÌNH CHÍNH</button>
    `;

    this.showModal(modalHtml);
    if (this.engine.totalProcessed > 0) {
      void recordGameScore('mail', this.engine.correctCount, this.engine.totalCases,
        0, sessionId).then(saved => {
        if (this.sessionId !== sessionId) return;
        const status = this.container.querySelector('#inspScoreSaveStatus');
        if (status) status.textContent = `+${saved.xpEarned} XP · ${scoreSaveMessage(saved)}`;
        document.dispatchEvent(new CustomEvent('score-saved'));
      }).catch(() => {
        if (this.sessionId !== sessionId) return;
        const status = this.container.querySelector('#inspScoreSaveStatus');
        if (status) status.textContent = 'Chưa lưu được điểm. Báo cáo vẫn hiển thị để bạn xem lại.';
      });
    }
    this.container.querySelector('#modalFinalRestartBtn')?.addEventListener('click', () => {
      this.hideModal();
      this.start();
    });
    this.container.querySelector('#modalFinalExitBtn')?.addEventListener('click', () => {
      this.hideModal();
      this.onExit();
    });
  }

  private showModal(html: string) {
    const overlay = this.container.querySelector('#inspModalOverlay');
    const box = this.container.querySelector('#inspModalBox');
    if (overlay && box) {
      box.innerHTML = html;
      overlay.classList.add('active');
      const desk = this.container.querySelector<HTMLElement>('#inspDesk');
      if (desk) desk.inert = true;
      box.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    }
  }

  private hideModal() {
    const overlay = this.container.querySelector('#inspModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      const desk = this.container.querySelector<HTMLElement>('#inspDesk');
      if (desk) desk.inert = false;
    }
  }

  private showToast(message: string) {
    const toast = this.container.querySelector('#inspToast');
    if (!toast) return;

    if (this.toastTimerId !== null) {
      window.clearTimeout(this.toastTimerId);
    }

    toast.textContent = message;
    toast.classList.add('show');

    this.toastTimerId = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  private escapeHtml(str: string): string {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c] || c));
  }
}
