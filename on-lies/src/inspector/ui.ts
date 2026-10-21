import { InspectorEngine } from './engine';
import { CLUE_CATEGORIES } from './types';
import './inspector.css';

export class InspectorUI {
  private container: HTMLElement;
  private engine: InspectorEngine;
  private onExit: () => void;
  private timerId: number | null = null;
  private toastTimerId: number | null = null;

  constructor(container: HTMLElement, onExit: () => void) {
    this.container = container;
    this.onExit = onExit;
    this.engine = new InspectorEngine();
    this.renderLayout();
    this.setupEvents();
  }

  public start() {
    this.engine.newGame();
    this.showDayIntroModal();
    this.startTimer();
  }

  public stop() {
    this.stopTimer();
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
            <span>NGÀY <b id="inspDay">1</b></span>
            <span>THỜI GIAN <b id="inspTimer">02:00</b></span>
            <span>HỒ SƠ <b id="inspProgress">0/0</b></span>
          </div>
          <div class="inspector-stat-group">
            <span class="inspector-warn-icons" id="inspWarnings" aria-label="Cảnh cáo">
              <span class="warn-off">⚠</span>
              <span class="warn-off">⚠</span>
              <span class="warn-off">⚠</span>
            </span>
            <span>LƯƠNG <b id="inspSalary">0 đ</b></span>
            <button class="inspector-exit-btn" id="inspExitBtn">← Màn hình chính</button>
          </div>
        </header>

        <main class="inspector-desk" id="inspDesk"></main>

        <div id="inspToast" class="inspector-toast" role="status"></div>

        <div id="inspModalOverlay" class="inspector-modal-overlay" role="dialog" aria-modal="true">
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

      // Click vào token chi tiết
      const token = target.closest<HTMLElement>('.insp-token');
      if (token && !this.engine.isCaseEvaluated) {
        const index = Number(token.dataset.index);
        this.engine.toggleFlag(index);
        this.renderDesk();
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
  }

  private handleStamp(isReject: boolean) {
    if (this.engine.isCaseEvaluated) return;

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
    }

    if (this.engine.isFired()) {
      this.engine.isRunning = false;
      window.setTimeout(() => this.showFiredModal(), 800);
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
        <span class="${k < citations ? 'warn-active' : 'warn-off'}">⚠</span>
      `).join(' ');
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

      return `<span class="${classes}" data-index="${index}" tabindex="${evaluated ? -1 : 0}">${this.escapeHtml(item.text)}</span>`;
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
            <span>✔ ĐÃ DUYỆT</span>
            <small>Hồ sơ an toàn</small>
          </button>
          <button class="stamp-btn stamp-reject" id="stampReject">
            <span>✖ TỪ CHỐI</span>
            <small>Có chiêu trò lừa đảo</small>
          </button>
        </div>
      `;
    } else if (res) {
      const isNextDay = this.engine.currentCaseIndex === this.engine.queue.length - 1;
      const headlineClass = res.isCorrect ? 'headline-correct' : 'headline-wrong';
      const headlineText = res.isCorrect ? '✔ KẾT LUẬN CHÍNH XÁC' : '✖ KẾT LUẬN SAI — BỊ CẢNH CÁO';

      interactionHtml = `
        <div class="inspector-feedback-card">
          <div class="feedback-headline ${headlineClass}">${headlineText}</div>
          <div class="feedback-logs">
            ${res.logs.map(log => `<div class="feedback-log-item ${log.type}">${log.message}</div>`).join('')}
          </div>
          <button class="inspector-next-btn" id="inspNextBtn">
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

    desk.innerHTML = `
      <div class="inspector-col">
        <div class="inspector-said">${this.escapeHtml(currentCase.note)}</div>

        <div class="inspector-paper">
          <div class="inspector-paper-header">
            <span>HỒ SƠ CẦU CỨU · ${this.escapeHtml(currentCase.who)}</span>
            <span>HÌNH THỨC: ${this.escapeHtml(currentCase.channelLabel)}</span>
          </div>

          ${currentCase.senderItem ? `
            <div class="inspector-from-field">
              <span class="field-label">Từ / Người gửi:</span>
              ${renderToken(0)}
            </div>
          ` : ''}

          <div class="inspector-msg-body">
            ${allItems.map((_, i) => i === 0 && currentCase.senderItem ? '' : renderToken(i)).join('')}
          </div>

          ${!evaluated ? `
            <div class="inspector-hint">
              💡 Bấm vào từ ngữ/chi tiết đáng ngờ trên giấy để đánh dấu. Nếu từ chối, bạn phải đánh dấu ít nhất một lý do.
            </div>
          ` : ''}

          ${stampMarkHtml}
        </div>

        ${interactionHtml}
      </div>

      <div class="inspector-col">
        <div class="inspector-handbook">
          <h3>📒 SỔ TAY NGHIỆP VỤ</h3>
          <ol>
            ${rules.map(rule => `
              <li class="${highlightedRules.has(rule.id) ? 'highlight-rule' : ''}" value="${rule.id}">
                ${this.escapeHtml(rule.text)}
                ${rule.day === this.engine.day ? '<span class="rule-tag-new">MỚI</span>' : ''}
              </li>
            `).join('')}
          </ol>
        </div>
      </div>
    `;
  }

  private showDayIntroModal() {
    const newRules = this.engine.getNewRulesToday();
    const modalHtml = `
      <h2>CA TRỰC NGÀY ${this.engine.day}${this.engine.day === 1 ? ' · NHẬN NHIỆM VỤ' : ''}</h2>
      ${this.engine.day === 1 ? `
        <p>Chào mừng bạn đến với <b>Đội Phản ứng nhanh – Trung tâm An toàn số</b>!</p>
        <p>Mỗi hồ sơ là một tình huống sinh viên gửi về cầu cứu. Nhiệm vụ của bạn là: đối chiếu <b>Sổ tay nghiệp vụ</b>, <b>bấm chọn các chi tiết đáng ngờ trên hồ sơ</b>, rồi dùng con dấu <b>ĐÃ DUYỆT</b> hoặc <b>TỪ CHỐI</b>.</p>
      ` : ''}
      <p><b>Quy định ${this.engine.day === 1 ? 'áp dụng' : 'mới bổ sung'} hôm nay:</b></p>
      <ol>
        ${newRules.map(r => `<li><b>Quy tắc ${r.id}:</b> ${this.escapeHtml(r.text)}</li>`).join('')}
      </ol>
      <p>⚠️ <b>Quy định xử phạt:</b> Bạn sẽ bị cảnh cáo nếu cho lọt tin lừa đảo hoặc từ chối nhầm tin an toàn. <b>Nhận đủ 3 cảnh cáo trong ngày sẽ bị sa thải ngay lập tức!</b></p>
      <button class="inspector-next-btn" id="modalStartDayBtn">BẮT ĐẦU CA TRỰC →</button>
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
    const isFinalDay = this.engine.day >= 3;
    const modalHtml = `
      <h2>BÁO CÁO KẾT THÚC NGÀY ${this.engine.day}</h2>
      ${isTimeUp ? '<p style="color:#d32f2f;font-weight:700;">Hết giờ làm việc! Các hồ sơ còn lại đã bị chuyển hoàn.</p>' : '<p>Bạn đã hoàn thành ca trực hôm nay.</p>'}
      <div class="inspector-summary-row">
        <span>Hồ sơ đã xử lý:</span>
        <b>${this.engine.totalProcessed}/${this.engine.queue.length}</b>
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

    const modalHtml = `
      <h2>ĐÁNH GIÁ KẾT QUẢ THỰC TẬP</h2>
      <p>Danh hiệu đạt được: <b style="color:#2b743c;font-size:16px;">${title}</b></p>
      
      <div class="inspector-summary-row">
        <span>Xử lý chính xác:</span>
        <b>${this.engine.correctCount}/${this.engine.totalProcessed} hồ sơ</b>
      </div>
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
          💡 <i>Nhắc nhở nghiệp vụ:</i> Bạn hay bỏ sót nhóm <b>${CLUE_CATEGORIES[mostMissed]}</b> nhất. Hãy chú ý hơn ở nhóm này!
        </p>
      ` : ''}

      <button class="inspector-next-btn" id="modalFinalRestartBtn" style="margin-top:16px;">LÀM LẠI CA TRỰC</button>
      <button class="inspector-exit-btn" id="modalFinalExitBtn" style="width:100%;margin-top:8px;padding:12px;">VỀ MÀN HÌNH CHÍNH</button>
    `;

    this.showModal(modalHtml);
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
    }
  }

  private hideModal() {
    const overlay = this.container.querySelector('#inspModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
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
