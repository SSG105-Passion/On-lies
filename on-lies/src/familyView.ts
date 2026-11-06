import { escapeHtml } from './html';
import './family.css';

export interface TacticalAction {
  id: string;
  icon: string;
  title: string;
  desc: string;
  isFatal?: boolean;
  fatalReason?: string;
  successLog: string;
  threatMitigation: string;
}

export interface IncidentViewState {
  incidentIdx: number;
  total: number;
  code: string;
  threatLevel: 'CRITICAL' | 'EXTREME' | 'HIGH';
  title: string;
  victimName: string;
  victimDevice: string;
  targetAsset: string;
  story: string;
  timeRemaining: number;
  lives: number;
  score: number;
  networkOnline: boolean;
  screenOverlayActive: boolean;
  camActive: boolean;
  phoneStatusLabel: string;
  threatLogs: { time: string; text: string; type: 'threat' | 'success' | 'warn' }[];
  completedActions: Set<string>;
  availableActions: TacticalAction[];
  stepCurrent: number;
  stepTotal: number;
  resultStatus?: 'success' | 'fail';
  resultFeedback?: string;
  forensicLesson?: string;
}

export interface IncidentHistoryItem {
  code: string;
  title: string;
  targetAsset: string;
  won: boolean;
  timeElapsed: number;
  lesson: string;
}

export function renderIncidentIntro(total = 13): string {
  return `
    <div class="iru-stage">
      <div class="iru-intro-card">
        <div class="iru-hero-icon">🚨</div>
        <h2>Trung tâm Ứng cứu Khẩn cấp 60 Giây</h2>
        <p>
          Hệ thống ghi nhận hàng loạt người dùng đang bị <b>mã độc tấn công, bị chiếm đoạt quyền điều khiển thiết bị hoặc bị cướp quyền SIM</b>.
          Tiền trong tài khoản và dữ liệu cá nhân đang bị rút ruột từng giây!
          <br><br>
          ⚡ <b>Nhiệm vụ Chuyên viên Ứng cứu:</b> Trong 60 giây, thực hiện các bước ứng phó khẩn cấp chính xác
          để ngắt đứt đường truyền của kẻ gian, phong tỏa dòng tiền và bảo vệ an toàn thiết bị!
        </p>
        <div style="display:flex;gap:12px;justify-content:center;margin-bottom:28px;">
          <span style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;">
            ${total} Ca Sự cố Nghiêm trọng
          </span>
          <span style="background:rgba(6,182,212,0.15);color:#22d3ee;border:1px solid rgba(6,182,212,0.3);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;">
            Đếm ngược 60 Giây / Ca
          </span>
          <span style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;">
            Phản ứng Chuẩn xác
          </span>
        </div>
        <button class="iru-next-btn" data-iru="start-first" style="font-size:15px;padding:14px 34px;">
          ⚡ Tiếp nhận Ca Trực Ngay
        </button>
      </div>
    </div>
  `;
}

export function renderIncidentDashboard(state: IncidentViewState): string {
  const isUrgent = state.timeRemaining <= 15 && !state.resultStatus;
  const timeFormatted = `${String(Math.floor(state.timeRemaining / 60)).padStart(2, '0')}:${String(state.timeRemaining % 60).padStart(2, '0')}`;

  return `
    <div class="iru-stage">
      <!-- TOP STATUS BAR -->
      <div class="iru-top-header">
        <div class="iru-pill">
          <span class="pulse-red"></span>
          <span>TRỰC BAN PHẢN ỨNG NHANH · CA ${state.incidentIdx + 1} / ${state.total}</span>
        </div>
        <div class="iru-session-metrics">
          <span>Điểm tích lũy: <b style="color:var(--iru-cyan);">${state.score * 150} XP</b></span>
          <span class="iru-lives">${'♥'.repeat(state.lives)}${'♡'.repeat(3 - state.lives)}</span>
        </div>
      </div>

      <!-- MAIN GRID: PHONE SIMULATOR vs TACTICAL CONSOLE -->
      <div class="iru-grid">
        <!-- LEFT: HACKED SMARTPHONE FRAME -->
        <div class="iru-phone-frame">
          <div class="iru-phone-notch">
            <div class="iru-notch-cam ${state.camActive ? 'active-cam' : ''}" title="${state.camActive ? 'Camera đang bị truy cập lén' : 'Camera an toàn'}"></div>
          </div>

          <div class="iru-phone-status-bar">
            <span>${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            <span class="iru-status-badge ${state.networkOnline ? 'online' : 'airplane'}">
              ${state.networkOnline ? '📶 4G/Wifi: ĐANG NỐI MẠNG' : '✈️ CHẾ ĐỘ MÁY BAY: CẮT MẠNG'}
            </span>
          </div>

          <!-- COUNTDOWN TIMER BANNER -->
          <div class="iru-countdown-banner ${isUrgent ? 'is-urgent' : ''}">
            <div class="iru-countdown-label">
              ${state.resultStatus === 'success' ? 'ĐÃ NGĂN CHẶN THÀNH CÔNG' : state.resultStatus === 'fail' ? 'SỰ CỐ THẤT THOÁT' : 'THỜI GIAN VÀNG TRƯỚC KHI BỊ CHIẾM ĐOẠT'}
            </div>
            <div class="iru-countdown-digits" id="iruTimerDigits">${timeFormatted}</div>
            <div style="font-size:10.5px;color:#cbd5e1;">
              ${state.phoneStatusLabel}
            </div>
          </div>

          <!-- TARGET ASSET AT RISK -->
          <div class="iru-asset-box">
            <span style="color:#94a3b8;display:block;margin-bottom:2px;">Tài sản đang bị nhắm tới:</span>
            <strong>${escapeHtml(state.targetAsset)}</strong>
          </div>

          <!-- PHONE SCREEN DISPLAY -->
          <div class="iru-phone-screen">
            ${state.screenOverlayActive ? `
              <div class="iru-screen-overlay">
                <span style="font-size:32px;">⚠️</span>
                <span>MÀN HÌNH BỊ CHIẾM QUYỀN ĐIỀU KHIỂN (OVERLAY)</span>
                <span style="font-size:11px;font-weight:400;color:#cbd5e1;">Mã độc đang chặn thao tác cảm ứng và tự động thao tác ngầm</span>
              </div>
            ` : ''}

            <div class="iru-malware-dialog">
              <div class="iru-malware-header">
                <span>⚡</span>
                <span>CẢNH BÁO TIẾN TRÌNH HỆ THỐNG</span>
              </div>
              <p style="color:#e2e8f0;font-size:11.5px;line-height:1.5;">
                Thiết bị: <b>${escapeHtml(state.victimDevice)}</b><br>
                Chủ máy: <b>${escapeHtml(state.victimName)}</b>
              </p>
            </div>

            <div style="font-size:11px;font-weight:700;color:var(--iru-muted);margin-top:4px;">
              NHẬT KÝ THIẾT BỊ THỜI GIAN THỰC:
            </div>

            <!-- LIVE THREAT FEED ON PHONE -->
            <div class="iru-threat-log-feed" id="iruThreatFeed">
              ${state.threatLogs.map(log => `
                <div class="log-${log.type}">
                  <b>[${escapeHtml(log.time)}]</b> ${escapeHtml(log.text)}
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT: TACTICAL ACTION CONSOLE -->
        <div class="iru-console">
          <!-- DOSSIER CARD -->
          <div class="iru-case-dossier">
            <div class="iru-case-meta">
              <span class="iru-case-code">${escapeHtml(state.code)}</span>
              <span class="iru-threat-pill ${state.threatLevel}">CẤP ĐỘ NGUY HIỂM: ${state.threatLevel}</span>
            </div>
            <h3 class="iru-case-title">${escapeHtml(state.title)}</h3>
            <p class="iru-victim-info">
              👤 Nạn nhân: <b>${escapeHtml(state.victimName)}</b> · Thiết bị: <b>${escapeHtml(state.victimDevice)}</b>
            </p>
            <div class="iru-case-story">
              <b>Diễn biến sự cố:</b> ${escapeHtml(state.story)}
            </div>
          </div>

          <!-- ACTION DECK -->
          ${!state.resultStatus ? `
            <div class="iru-action-deck-title">
              <span>BẢNG ĐIỀU KHIỂN THAO TÁC ỨNG CỨU</span>
              <span class="iru-step-counter">Tiến độ xử lý: <b>${state.stepCurrent} / ${state.stepTotal} bước</b></span>
            </div>

            <div class="iru-action-grid">
              ${state.availableActions.map(action => {
                const isDone = state.completedActions.has(action.id);
                return `
                  <button class="iru-action-btn ${isDone ? 'is-completed' : ''}"
                          data-iru="execute-action" data-action-id="${escapeHtml(action.id)}"
                          ${isDone ? 'disabled' : ''}>
                    <span class="iru-action-icon">${action.icon}</span>
                    <div class="iru-action-body">
                      <strong>${escapeHtml(action.title)}</strong>
                      <p>${escapeHtml(action.desc)}</p>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
          ` : `
            <!-- RESULT CARD WHEN INCIDENT FINISHES -->
            <div class="iru-result-card ${state.resultStatus}">
              <div class="iru-result-badge">
                ${state.resultStatus === 'success' ? '🛡️' : '💥'}
              </div>
              <h3 class="iru-result-title">
                ${state.resultStatus === 'success' ? 'GIẢI CỨU THÀNH CÔNG! BẢO TOÀN TÀI SẢN!' : 'SỰ CỐ THẤT BẠI: NẠN NHÂN ĐÃ BỊ THIỆT HẠI!'}
              </h3>
              <p class="iru-result-desc">${escapeHtml(state.resultFeedback || '')}</p>

              <div class="iru-forensic-box">
                <strong>📋 Hồ sơ Nghiệp vụ &amp; Quy tắc Ứng phó Chuẩn:</strong>
                ${escapeHtml(state.forensicLesson || '')}
              </div>

              <button class="iru-next-btn" data-iru="next-incident">
                ${state.lives === 0 || state.incidentIdx === state.total - 1 ? 'Xem Báo cáo Tổng kết Toàn bộ Ca trực →' : 'Tiếp nhận Ca Ứng cứu Tiếp theo →'}
              </button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

export function renderIncidentSummary(
  history: IncidentHistoryItem[],
  score: number,
  lives: number,
  total: number
): string {
  const isWon = lives > 0;
  return `
    <div class="iru-stage">
      <div class="iru-intro-card" style="max-width:800px;">
        <div class="iru-hero-icon" style="background:${isWon ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #991b1b)'};">
          ${isWon ? '🛡️' : '⚠️'}
        </div>
        <h2>${isWon ? 'Hoàn thành Xuất sắc Ca trực Cứu hộ Khẩn cấp!' : 'Ca trực Bị Tạm đình chỉ do Mắc Sai lầm Nghiêm trọng'}</h2>
        <p>Tổng kết thành tích bảo vệ tài sản và thiết bị người dùng trước các đợt tấn công mạng thời gian thực.</p>

        <div class="iru-summary-metrics">
          <div class="iru-metric-item">
            <span>Ca cứu hộ thành công</span>
            <strong style="color:#34d399;">${score} / ${total}</strong>
          </div>
          <div class="iru-metric-item">
            <span>Trái tim còn lại</span>
            <strong style="color:#f87171;">${lives} / 3</strong>
          </div>
          <div class="iru-metric-item">
            <span>Tổng XP thu được</span>
            <strong style="color:#22d3ee;">+${score * 150} XP</strong>
          </div>
        </div>

        <div style="text-align:left;margin-bottom:24px;">
          <h4 style="font-size:13px;font-weight:700;color:var(--iru-cyan);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">
            Nhật ký Hồ sơ Sự cố đã xử lý:
          </h4>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${history.map(item => `
              <div style="background:rgba(15,23,42,0.8);border:1px solid ${item.won ? '#10b981' : '#ef4444'};border-radius:10px;padding:12px 16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                  <span style="font-weight:700;color:#fff;font-size:13.5px;">${escapeHtml(item.code)}: ${escapeHtml(item.title)}</span>
                  <span style="font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;background:${item.won ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'};color:${item.won ? '#34d399' : '#f87171'};">
                    ${item.won ? '✓ THÀNH CÔNG' : '✕ THẤT BẠI'}
                  </span>
                </div>
                <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">Tài sản bảo vệ: <b style="color:#f87171;">${escapeHtml(item.targetAsset)}</b> · Thời gian xử lý: <b>${item.timeElapsed}s</b></div>
                <p style="font-size:11.5px;color:#cbd5e1;line-height:1.5;">💡 <b>Bài học:</b> ${escapeHtml(item.lesson)}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display:flex;gap:14px;justify-content:center;">
          <button class="iru-next-btn" data-iru="restart-all">⚡ Nhận Ca Trực Mới</button>
          <button class="family-back" data-action="familyExit" style="font-size:13px;padding:12px 20px;">Về màn hình chính</button>
        </div>
      </div>
    </div>
  `;
}
