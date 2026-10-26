import { createSessionId } from './session';

export interface PhoneGameResult {
  score: number;
  maxScore: number;
  livesLeft: number;
  sessionId: string;
}

declare global {
  interface DocumentEventMap {
    'phone-completed': CustomEvent<PhoneGameResult>;
  }
}

interface CallCase { name: string; number: string; story: string; dialogue: string[]; choices: string[]; correct: number; lesson: string }
const calls: CallCase[] = [
  { name: 'Nhân viên ngân hàng?', number: 'Số lạ • 09xx 218 xxx', story: 'Bạn vừa nhận một cuộc gọi tự xưng là nhân viên ngân hàng.', dialogue: ['Tài khoản của bạn có giao dịch bất thường.', 'Tôi vừa gửi mã OTP. Bạn đọc mã đó để tôi hủy giao dịch ngay nhé.'], choices: ['Đọc OTP để hủy giao dịch', 'Kết thúc cuộc gọi, tự liên hệ ngân hàng qua kênh chính thức', 'Gửi ảnh thẻ ngân hàng cho họ'], correct: 1, lesson: 'OTP có thể cho phép người khác đăng nhập hoặc xác nhận giao dịch. Không đọc OTP cho người gọi; kiểm tra bằng ứng dụng ngân hàng hoặc số liên hệ chính thức.' },
  { name: 'Cơ quan điều tra?', number: 'Số lạ • +xx 810 xxx', story: 'Người gọi nói bạn liên quan đến một vụ án.', dialogue: ['Bạn phải giữ bí mật, không kể với gia đình.', 'Chuyển tiền vào tài khoản an toàn này để chúng tôi kiểm tra.'], choices: ['Chuyển một ít để chứng minh mình hợp tác', 'Giữ cuộc gọi và làm theo hướng dẫn', 'Ngắt máy, trao đổi với người tin cậy và xác minh với cơ quan qua kênh độc lập'], correct: 2, lesson: 'Đe dọa, bắt giữ bí mật và yêu cầu chuyển tiền là dấu hiệu nguy hiểm. Không chuyển tiền dựa trên lời tự xưng qua điện thoại.' },
  { name: 'Shipper', number: 'Số chưa lưu • 09xx 456 xxx', story: 'Bạn đang chờ một đơn hàng trả tiền khi nhận.', dialogue: ['Tôi đang ở cổng, bạn xuống nhận hàng được không?', 'Bạn có thể kiểm tra gói hàng theo quy định của bên bán, rồi thanh toán khi nhận.'], choices: ['Kiểm tra đơn trong ứng dụng, nhận đúng hàng rồi thanh toán', 'Chuyển thêm phí vào tài khoản lạ ngay', 'Cung cấp OTP cho shipper'], correct: 0, lesson: 'Số chưa lưu không tự động là lừa đảo. Đối chiếu đơn hàng đã đặt và thực hiện đúng quy trình nhận hàng; không đưa mã bảo mật.' },
  { name: 'Hỗ trợ kỹ thuật?', number: 'Số lạ • 08xx 721 xxx', story: 'Người gọi cảnh báo điện thoại của bạn bị nhiễm virus.', dialogue: ['Tải ứng dụng qua đường dẫn tôi gửi.', 'Bật quyền trợ năng và chia sẻ màn hình để tôi sửa từ xa.'], choices: ['Cài ứng dụng rồi cho họ điều khiển', 'Dừng cuộc gọi, kiểm tra thiết bị bằng công cụ và kênh hỗ trợ đáng tin cậy', 'Chia sẻ màn hình nhưng giấu tên'], correct: 1, lesson: 'Ứng dụng điều khiển từ xa và quyền trợ năng có thể bị lợi dụng để lấy dữ liệu hoặc thao tác tài khoản. Đừng cấp quyền theo cuộc gọi bất ngờ.' },
  { name: 'Người thân đang gặp nạn?', number: 'Số lạ • 03xx 114 xxx', story: 'Một giọng nói giống người thân gọi nhờ giúp đỡ khẩn cấp.', dialogue: ['Con đang gặp chuyện, cần tiền ngay.', 'Đừng gọi lại số cũ. Chuyển vào tài khoản này giúp con!'], choices: ['Chuyển ngay vì giọng nghe rất giống', 'Chỉ hỏi tên rồi chuyển tiền', 'Gọi lại số đã biết của người thân hoặc liên hệ người gần họ để xác minh'], correct: 2, lesson: 'Giọng nói có thể bị giả mạo. Khi có yêu cầu chuyển tiền bất thường, hãy xác minh qua số liên lạc đã biết và một kênh độc lập.' },
  { name: 'Phòng khám', number: 'Số liên hệ đã lưu', story: 'Bạn đã đặt lịch khám và nhận cuộc gọi nhắc lịch.', dialogue: ['Bạn có lịch lúc 9 giờ sáng mai.', 'Bạn muốn giữ lịch hay đổi lịch? Không cần gửi thông tin tài khoản hay mã xác thực.'], choices: ['Đối chiếu lịch đã đặt và xác nhận thời gian', 'Đọc mã OTP để xác nhận lịch', 'Gửi thông tin thẻ để giữ lịch'], correct: 0, lesson: 'Cuộc gọi phù hợp với lịch bạn đã đặt, không yêu cầu dữ liệu bảo mật. Vẫn xác minh qua kênh chính thức nếu có yêu cầu bất thường phát sinh.' },
];
let index = 0, lives = 3, score = 0, answered = false, listening = false;
let sessionId = '', finished = false;
const history: { index: number; correct: boolean }[] = [];
const content = () => document.getElementById('phoneContent')!;
const stats = () => document.getElementById('phoneStats')!;

export function openPhoneGame() {
  stats().classList.add('hidden');
  content().innerHTML = `<div class="phone-intro"><div class="call-avatar">☎</div><p class="eyebrow">MINI GAME • ĐIỆN THOẠI</p><h2>Alo, ai đang gọi?</h2><p>6 cuộc gọi. Có người thật, có kẻ mạo danh. Nghe lời người gọi và chọn cách xử lý để bảo vệ tiền và thông tin của bạn.</p><p class="phone-note">Mô phỏng trong game • Không thực hiện cuộc gọi hay giao dịch thật.</p><button class="primary-button" data-phone="start">Nhận nhiệm vụ →</button></div>`;
}
function start() { index = 0; lives = 3; score = 0; history.length = 0; sessionId = createSessionId(); finished = false; stats().classList.remove('hidden'); renderCall(); }
function renderCall() {
  answered = false; listening = false;
  stats().innerHTML = `<span>Cuộc gọi ${index + 1}/${calls.length}</span><span>${score} điểm</span><span class="call-lives" aria-label="${lives} mạng còn lại">${'♥'.repeat(lives)}${'♡'.repeat(3-lives)}</span>`;
  const item = calls[index];
  content().innerHTML = `<div class="call-layout"><aside class="call-guide"><p class="eyebrow">HỒ SƠ TÌNH HUỐNG</p><h3>${item.story}</h3><p>Người gọi tự xưng là ai không chứng minh được danh tính của họ.</p><div class="phone-note">💡 Đừng vội quyết định. Bạn có quyền kết thúc cuộc gọi và tự xác minh.</div></aside><article class="call-device"><p class="eyebrow">CUỘC GỌI ĐẾN</p><div class="call-avatar ringing">☎</div><h2>${item.name}</h2><p>${item.number}</p><button class="safe-button" data-phone="listen">Xem hội thoại</button><div id="callConversation" class="hidden"><div class="call-transcript">${item.dialogue.map(line=>`<p>“${line}”</p>`).join('')}</div><h3>Bạn sẽ xử lý thế nào?</h3><div class="call-choices">${item.choices.map((choice,i)=>`<button class="secondary-button" data-phone="answer" data-choice="${i}">${choice}</button>`).join('')}</div></div><div id="callFeedback" role="status"></div></article></div>`;
}
function answer(choice: number) {
  if (answered || !listening) return;
  answered = true;
  const item = calls[index], correct = choice === item.correct;
  if (correct) score++; else lives--;
  history.push({ index, correct });
  document.querySelectorAll<HTMLButtonElement>('[data-phone="answer"]').forEach(button=>{ button.disabled = true; button.classList.toggle('correct-choice', Number(button.dataset.choice) === item.correct); });
  stats().innerHTML = `<span>Cuộc gọi ${index+1}/${calls.length}</span><span>${score} điểm</span><span class="call-lives">${'♥'.repeat(lives)}${'♡'.repeat(3-lives)}</span>`;
  document.getElementById('callFeedback')!.innerHTML = `<div class="call-feedback ${correct?'good':'bad'}"><strong>${correct?'✓ Xử lý đúng!':'✕ Bạn vừa mắc bẫy.'}</strong><p>${item.lesson}</p><button class="primary-button" data-phone="next">${lives === 0 || index === calls.length-1?'Xem kết quả':'Cuộc gọi tiếp theo →'}</button></div>`;
}
function finish() {
  if (finished) return;
  finished = true;
  if (lives > 0 && history.length === calls.length) {
    document.dispatchEvent(new CustomEvent<PhoneGameResult>('phone-completed', {
      detail: { score, maxScore: calls.length, livesLeft: lives, sessionId },
    }));
  }
  stats().classList.add('hidden');
content().innerHTML = `<div class="phone-summary"><div class="call-avatar">🛡</div><p class="eyebrow">BÁO CÁO NHIỆM VỤ</p><h2>${lives===0?'Cùng ôn lại cách tự bảo vệ':'Bạn đã xử lý các cuộc gọi!'}</h2><p>${score}/${history.length} lựa chọn đúng • ${lives}/3 mạng còn lại</p>${history.map(entry=>`<div class="call-review"><strong>${entry.correct?'✓':'✕'} ${calls[entry.index].name}</strong><p>${calls[entry.index].lesson}</p></div>`).join('')}<button class="primary-button" data-phone="start">Chơi lại</button><button class="secondary-button" data-action="phoneExit">Về màn hình chính</button></div>`;
}
document.addEventListener('click', event=>{
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-phone]');
  if (!button || button.disabled) return;
  switch (button.dataset.phone) {
    case 'start': start(); break;
    case 'listen': listening = true; button.classList.add('hidden'); document.querySelector('.ringing')?.classList.remove('ringing'); document.getElementById('callConversation')!.classList.remove('hidden'); break;
    case 'answer': answer(Number(button.dataset.choice)); break;
    case 'next': if (!answered) return; if (lives===0 || index===calls.length-1) finish(); else { index++; renderCall(); } break;
  }
});
