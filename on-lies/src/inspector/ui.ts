import { InspectorEngine } from './engine';
import { CLUE_CATEGORIES } from './types';
import { recordGameScore, scoreSaveMessage } from '../supabase';
import { createSessionId } from '../session';
import './inspector.css';

const icon = (path: string) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const mailIcon = () => icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>');
const bookIcon = () => icon('<path d="M12 5v16M12 5C9 2 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-2-1-7-2-10 1Z"/>');
const warningIcon = () => icon('<path d="M10.3 4.8 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>');
const checkIcon = () => icon('<path d="m5 12 4 4L19 6"/>');
const closeIcon = () => icon('<path d="m6 6 12 12M6 18 18 6"/>');

export class InspectorUI {
  private container: HTMLElement;
  private engine: InspectorEngine;
  private onExit: () => void;
  private timerId: number | null = null;
  private toastTimerId: number | null = null;
  private sessionId = '';
  private finalized = false;
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
      warnEl.innerHTML = [0, 1, 2].map(k => `
        <span class="${k < citations ? 'warn-active' : 'warn-off'}">${warningIcon()}</span>
      `).join(' ');
      warnEl.setAttribute('aria-label', `${citations} trên 3 cảnh cáo`);
    }
  }

  private renderDesk() {
    const desk = this.container.querySelector('#inspDesk');
    if (!desk) return;

    const currentCase = this.engine.getCurrentCase();
    if (!currentCase) {
      desk.innerHTML = '<div class="inspector-col"><p>Không có hồ sơ nào.</p></div>';
      return;
    }

    const { allItems } = currentCase;
    const evaluated = this.engine.isCaseEvaluated;
    const res = this.engine.currentResult;
    const sameCase = this.displayedCaseId === currentCase.id;
    const paperScroll = sameCase ? desk.querySelector('.inspector-paper')?.scrollTop ?? 0 : 0;
    const bookScroll = sameCase ? desk.querySelector('.inspector-handbook')?.scrollTop ?? 0 : 0;
    const bookOpen = sameCase ? desk.querySelector<HTMLDetailsElement>('.inspector-handbook')?.open ?? true : true;
    this.displayedCaseId = currentCase.id;

    // Render các token chữ
    const renderToken = (index: number) => {
      const item = allItems[index];
      let classes = 'insp-token';

      if (evaluated) {
        const isFlagged = this.engine.flaggedIndices.has(index);
        if (isFlagged) {
          classes += item.clue ? ' hit' : ' wrong-flag';
        } else if (item.clue) {
          classes += ' miss';
        }
      } else if (this.engine.flaggedIndices.has(index)) {
        classes += ' flagged';
      }

      return `<span class="${classes}" data-index="${index}" role="button" aria-pressed="${this.engine.flaggedIndices.has(index)}" aria-disabled="${evaluated}" tabindex="${evaluated ? -1 : 0}">${this.escapeHtml(item.text)}</span>`;
    };

    // Vết mực đóng dấu
    let stampMarkHtml = '';
    if (evaluated && res) {
      const markClass = res.userRejected ? 'stamp-mark mark-reject' : 'stamp-mark mark-approve';
      const markText = res.userRejected ? 'TỪ CHỐI' : 'ĐÃ DUYỆT';
      stampMarkHtml = `<div class="${markClass}">${markText}</div>`;
    }

    // Khu vực tương tác: Con dấu hoặc Báo cáo kết quả
    let interactionHtml = '';
    if (!evaluated) {
      interactionHtml = `
        <div class="inspector-stamps">
          <button class="stamp-btn stamp-approve" id="stampApprove">
            <span class="stamp-handle">${checkIcon()}</span>
            <span>ĐÃ DUYỆT</span>
            <small>Hồ sơ an toàn</small>
          </button>
          <button class="stamp-btn stamp-reject" id="stampReject">
            <span class="stamp-handle">${closeIcon()}</span>
            <span>TỪ CHỐI</span>
            <small>Có chiêu trò lừa đảo</small>
          </button>
        </div>
      `;
    } else if (res) {
      const isNextDay = this.engine.currentCaseIndex === this.engine.queue.length - 1;
      const headlineClass = res.isCorrect ? 'headline-correct' : 'headline-wrong';
      const headlineText = res.isCorrect ? `${checkIcon()} Kết luận chính xác` : `${warningIcon()} Kết luận sai — bị cảnh cáo`;

      interactionHtml = `
        <div class="inspector-feedback-card">
          <div class="feedback-headline ${headlineClass}">${headlineText}</div>
          <div class="feedback-logs">
            ${res.logs.map(log => `<div class="feedback-log-item ${log.type}">${log.message}</div>`).join('')}
          </div>
          <button class="inspector-next-btn" id="inspNextBtn" ${this.engine.isFired() ? 'disabled' : ''}>
            ${isNextDay ? 'KẾT THÚC NGÀY TRỰC →' : 'HỒ SƠ TIẾP THEO →'}
          </button>
        </div>
      `;
    }

    // Active rules cho handbook
    const rules = this.engine.getRulesForCurrentDay();
    const highlightedRules = new Set<number>();
    if (evaluated) {
      [...this.engine.flaggedIndices].forEach(i => {
        const r = allItems[i]?.clue?.rule;
        if (r) highlightedRules.add(r);
      });
    }

    const flags = [...this.engine.flaggedIndices];
    desk.innerHTML = `
      <section class="inspector-col inspector-case-column" aria-label="Hồ sơ kiểm duyệt">
        <div class="inspector-paper">
          <div class="inspector-paper-header">
            <h2>${this.escapeHtml(currentCase.who)}</h2>
            <span>${this.escapeHtml(currentCase.channelLabel)} · Ngày ${this.engine.day}</span>
          </div>

          ${currentCase.senderItem ? `
            <div class="inspector-from-field">
              <span class="field-label">Từ / Người gửi:</span>
              ${renderToken(0)}
            </div>
          ` : ''}

          <div class="inspector-msg-body">${allItems.map((_, i) => i === 0 && currentCase.senderItem ? '' : renderToken(i)).join('')}</div>

          ${!evaluated ? `
            <div class="inspector-hint">
              Bấm vào chi tiết đáng ngờ để ghim bằng chứng. Muốn từ chối, hãy đánh dấu ít nhất một lý do.
            </div>
          ` : ''}

          <div class="inspector-paper-bottom"><div class="inspector-said"><span>Người gửi nhờ bạn kiểm tra</span><p>${this.escapeHtml(currentCase.note)}</p></div>${stampMarkHtml}</div>
        </div>

        <section class="inspector-evidence" aria-label="Bằng chứng đã ghim">
          <h2>${icon('<path d="m21 11-8.5 8.5a6 6 0 0 1-8.5-8.5L13 2.5a4 4 0 0 1 5.7 5.7l-8.5 8.5a2 2 0 0 1-2.8-2.8L15 6.3"/>')}Bằng chứng đã ghim <span>${flags.length}</span></h2>
          <div class="inspector-evidence-list">${flags.length ? flags.map(i => `<div class="inspector-evidence-item"><p>${this.escapeHtml(allItems[i].text)}</p>${!evaluated ? `<button data-remove-flag="${i}" aria-label="Bỏ ghim: ${this.escapeHtml(allItems[i].text)}">${closeIcon()}</button>` : ''}</div>`).join('') : '<p class="inspector-evidence-empty">Chưa ghim chi tiết nào. Chọn trực tiếp trên hồ sơ để đối chiếu trước khi đóng dấu.</p>'}</div>
        </section>
      </section>

      <aside class="inspector-col inspector-tools-column" aria-label="Sổ tay và quyết định">
        <details class="inspector-handbook" ${bookOpen ? 'open' : ''}>
          <summary>${bookIcon()}<span>Sổ tay nghiệp vụ<small>Quy định ngày ${this.engine.day}</small></span>${icon('<path d="m9 5 7 7-7 7"/>')}</summary>
          <ol>
            ${rules.map(rule => `
              <li class="${highlightedRules.has(rule.id) ? 'highlight-rule' : ''}" value="${rule.id}">
                <span class="inspector-rule-number">${rule.id}</span><p>${this.escapeHtml(rule.text)}</p>
                ${rule.day === this.engine.day && this.engine.day > 1 ? '<span class="rule-tag-new">MỚI</span>' : ''}
              </li>
            `).join('')}
          </ol>
        </details>
        <section class="inspector-decision" aria-label="Kết luận hồ sơ"><h2>Quyết định của bạn</h2>${interactionHtml}</section>
      </aside>
      <footer class="inspector-desk-footer">Đọc hồ sơ <span aria-hidden="true">→</span> Đối chiếu sổ tay <span aria-hidden="true">→</span> Đóng dấu <small>Tình huống mô phỏng</small></footer>
    `;
    const paper = desk.querySelector('.inspector-paper');
    const handbook = desk.querySelector('.inspector-handbook');
    if (paper) paper.scrollTop = paperScroll;
    if (handbook) handbook.scrollTop = bookScroll;
  }

  private showDayIntroModal() {
    const newRules = this.engine.getNewRulesToday();
    const modalHtml = `
      <h2>CA TRỰC THANH TRA HỘP THƯ · NGÀY ${this.engine.day}${this.engine.day === 1 ? ' · NHẬN NHIỆM VỤ' : ''}</h2>
      ${this.engine.day === 1 ? `
        <p>Chào mừng bạn đến với <b>Đội Phản ứng nhanh – Trung tâm An toàn số</b>!</p>
        <p>Trước mặt bạn là các bức email và thông báo khẩn cấp do sinh viên, người dân gửi về cầu cứu trước các bẫy lừa đảo trực tuyến (học phí giả mạo, học bổng ảo, việc làm cọc tiền, khóa tài khoản...).</p>
        <p>Nhiệm vụ: Đối chiếu <b>Sổ tay nghiệp vụ</b>, <b>bấm chọn các chi tiết đáng ngờ trên lá thư</b>, rồi dùng con dấu <b>ĐÃ DUYỆT (Hợp lệ)</b> hoặc <b>TỪ CHỐI (Lừa đảo)</b>.</p>
      ` : ''}
      <p><b>Quy định ${this.engine.day === 1 ? 'áp dụng' : 'mới bổ sung'} hôm nay:</b></p>
      <ol>
        ${newRules.map(r => `<li><b>Quy tắc ${r.id}:</b> ${this.escapeHtml(r.text)}</li>`).join('')}
      </ol>
      <p><b>Quy định xử phạt:</b> Kết luận sai hoặc đánh dấu nhầm chi tiết bình thường đều bị cảnh cáo. <b>Nhận đủ 3 cảnh cáo trong ngày sẽ kết thúc ca trực.</b></p>
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
        <b style="color:${this.engine.citations > 0 ? '#d32f2f' : '#2b743c'}">${this.engine.citations}/3</b>
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

      <p style="margin-top:14px;"><b>Tỷ lệ phát hiện theo nhóm dấu hiệu:</b></p>
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
        completed ? Math.max(0, 3 - this.engine.citations) : 0, sessionId).then(saved => {
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
