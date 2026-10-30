import { createSessionId } from './session';
import {
  playPhoneRingtone,
  stopPhoneRingtone,
  playPhonePickup,
  playPhoneHangup,
  playPhoneStatic,
  playActionBeep,
  beep
} from './audio';
import { escapeHtml } from './html';
import './phone.css';

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

interface CallCase {
  id: number;
  callerName: string;
  callerNumber: string;
  callerTag: string;
  isRealAlert?: boolean;
  avatar: string;
  story: string;
  dialogue: string[];
  lookupData: {
    carrier: string;
    spamReports: string;
    registeredOwner: string;
    warningNote: string;
  };
  trapQuestion: {
    label: string;
    question: string;
    callerResponse: string;
    revealedClue: string;
  };
  verdicts: {
    hangup: { isCorrect: boolean; feedback: string };
    delay: { isCorrect: boolean; feedback: string };
    cooperate: { isCorrect: boolean; feedback: string };
  };
  lesson: string;
  tactic: string;
}

const CALLS: CallCase[] = [
  {
    id: 1,
    callerName: 'Thầy Trưởng khoa Nguyễn Văn An',
    callerNumber: '0988 123 xxx • Số lạ',
    callerTag: 'Mạo danh Giọng nói Deepfake',
    avatar: '👨‍🏫',
    story: 'Bạn nhận cuộc gọi từ giọng nói giống hệt thầy Trưởng khoa, giọng hơi rè và gấp gáp.',
    dialogue: [
      'Alo em à? Thầy An đây. Thầy đang dự cuộc họp khẩn với Bộ Giáo dục tại khách sạn, đường truyền hơi chập chờn.',
      'Thầy cần thanh toán gấp 8.000.000đ tiền tài liệu hội nghị mà thẻ của thầy bị kẹt hạn mức.',
      'Em chuyển khoản tạm vào số tài khoản thủ quỹ này giúp thầy, 4h chiều họp xong thầy về trường gửi trả em ngay nhé!'
    ],
    lookupData: {
      carrier: 'Viettel SIM rác kích hoạt sẵn',
      spamReports: '19 lượt báo cáo "Giả danh sếp/thầy giáo mượn tiền"',
      registeredOwner: 'NGUYEN VAN LONG (Không khớp tên thầy An)',
      warningNote: 'Giọng nói có hiện tượng méo âm tần số cao, dấu hiệu của công nghệ giả giọng Deepfake AI.'
    },
    trapQuestion: {
      label: 'Kiểm tra vị trí & câu hỏi nội bộ',
      question: 'Dạ thầy ơi, chiều nay thầy về trường thì ký giấy ở Văn phòng tầng 3 nhà Delta đúng không ạ?',
      callerResponse: 'Ờ đúng rồi, cứ chuyển tiền nhanh đi rồi chiều gặp thầy ở đó! Thầy đang bận họp đừng hỏi lằng nhằng!',
      revealedClue: 'BẮT BÀI: Văn phòng khoa thực tế nằm ở tầng 2 nhà Beta, không phải Delta. Kẻ gian lập tức "nhận bừa" để giục chuyển tiền!'
    },
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Xuất sắc! Bạn đã bắt bài Deepfake voice AI. Thầy cô hay lãnh đạo cơ quan không bao giờ dùng số lạ gọi mượn tiền cá nhân sinh viên qua điện thoại.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Tốt! Hoãn lại để xác minh trực tiếp với văn phòng khoa đã ngăn chặn kịp thời bẫy giả danh.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Bạn đã mắc bẫy! Công nghệ Deepfake có thể sao chép giọng nói chỉ sau 3 giây mẫu âm thanh. Không chuyển tiền chỉ dựa trên giọng nói qua điện thoại.'
      }
    },
    lesson: 'Công nghệ AI có thể giả dạng giọng nói người quen rất tinh vi. Luôn hỏi những thông tin chỉ hai người biết hoặc gọi lại vào số chính thức đã lưu.',
    tactic: 'Deepfake Voice AI mạo danh'
  },
  {
    id: 2,
    callerName: 'Trung tâm Phòng chống Gian lận - Vietcombank',
    callerNumber: '1900 545413 • Hotline chính thức',
    callerTag: 'Cảnh báo An ninh Hợp pháp',
    isRealAlert: true,
    avatar: '🏦',
    story: 'Tổng đài an ninh ngân hàng gọi khẩn cấp về một giao dịch bất thường phát sinh rạng sáng.',
    dialogue: [
      'Kính chào quý khách. Đây là cuộc gọi cảnh báo tự động từ Phòng Giám sát Gian lận Thẻ Vietcombank.',
      'Hệ thống vừa ghi nhận giao dịch quẹt thẻ tín dụng của bạn tại Singapore trị giá 45.000.000đ lúc 02:15 sáng nay.',
      'Nếu bạn KHÔNG thực hiện, vui lòng mở ứng dụng ngân hàng tự bấm Khóa thẻ. LƯU Ý: Nhân viên ngân hàng KHÔNG BAO GIỜ yêu cầu bạn đọc mã OTP hay mật khẩu!'
    ],
    lookupData: {
      carrier: 'Đầu số Tổng đài Doanh nghiệp 1900 hợp pháp',
      spamReports: '0 báo cáo gian lận • Kênh xác thực ngân hàng',
      registeredOwner: 'NGÂN HÀNG TMCP NGOẠI THƯƠNG VIỆT NAM',
      warningNote: 'Cuộc gọi hoàn toàn không đòi hỏi thông tin nhạy cảm, chỉ hướng dẫn khách hàng tự bảo vệ thẻ trên ứng dụng chính thống.'
    },
    trapQuestion: {
      label: 'Hỏi về quy trình xử lý thẻ',
      question: 'Bây giờ tôi cần cung cấp thông tin gì cho bạn để hủy giao dịch này?',
      callerResponse: 'Ngân hàng tuyệt đối không nhận OTP hay mật khẩu của bạn. Bạn chỉ cần tự mở app VCB Digibank chọn mục Khóa thẻ, hoặc chúng tôi sẽ tạm thời phong tỏa thẻ chiều thanh toán quốc tế giúp bạn.',
      revealedClue: 'XÁC THỰC AN TOÀN: Nhân viên kiên quyết từ chối nhận OTP và hướng dẫn khách hàng tự chủ trên ứng dụng chính thống!'
    },
    verdicts: {
      hangup: {
        isCorrect: false,
        feedback: 'Bạn đã dập máy một cuộc gọi cảnh báo thật! Thẻ của bạn đang bị hacker nước ngoài quẹt tiền thật và ngân hàng đang hỗ trợ bạn phong tỏa kịp thời.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Hợp lý! Bạn tạm giữ máy và tự mở ứng dụng ngân hàng trên điện thoại để kiểm tra lịch sử biến động số dư.'
      },
      cooperate: {
        isCorrect: true,
        feedback: 'Chính xác! Đây là cuộc gọi an ninh hợp pháp vì họ chủ động nhắc bạn KHÔNG chia sẻ mã OTP và hướng dẫn bạn tự khóa thẻ trong app.'
      }
    },
    lesson: 'Không phải cuộc gọi nào cũng là lừa đảo. Cuộc gọi ngân hàng chân chính chỉ cảnh báo và KHÔNG BAO GIỜ hỏi mã OTP, mật khẩu hay link đăng nhập.',
    tactic: 'Cảnh báo An toàn Thật'
  },
  {
    id: 3,
    callerName: 'Cục Cảnh sát Giao thông Đà Nẵng',
    callerNumber: '+84 236 8991 xxx • Số lạ',
    callerTag: 'Dọa Phạt nguội & Lệnh bắt',
    avatar: '👮‍♂️',
    story: 'Người gọi tự xưng Trung úy CSGT, thông báo bạn liên quan vụ xe đâm va liên hoàn bỏ trốn.',
    dialogue: [
      'Tôi là Trung úy Trần Tuấn Anh, Đội Xử lý Vi phạm Giao thông Công an TP Đà Nẵng.',
      'Xe máy mang biển số tên bạn đã gây tai nạn bỏ chạy tại giao lộ Nguyễn Văn Linh vào ngày 15 vừa qua. Tòa án đã phê chuẩn Lệnh tạm giữ phương tiện và phong tỏa tài sản!',
      'Yêu cầu bạn chuyển 15.000.000đ tiền bảo lãnh vào tài khoản thanh tra để hoãn lệnh bắt khẩn cấp!'
    ],
    lookupData: {
      carrier: 'Đầu số ảo VoIP chuyển tiếp cuộc gọi',
      spamReports: '64 lượt báo cáo "Mạo danh công an đòi tiền phạt nguội"',
      registeredOwner: 'Số điện thoại qua trạm trung kế nước ngoài',
      warningNote: 'Công an giao thông không làm việc qua điện thoại và không có khái niệm "tiền bảo lãnh chuyển khoản cá nhân".'
    },
    trapQuestion: {
      label: 'Yêu cầu giấy báo văn bản chính thức',
      question: 'Tôi ở Hà Nội và chưa từng đem xe vào Đà Nẵng. Đề nghị các anh gửi biên bản phạt nguội về công an phường nơi tôi cư trú?',
      callerResponse: 'Không lằng nhằng! Giờ này là thời điểm khẩn cấp, nếu không chuyển khoản thanh tra ngay trong 30 phút nữa thì cảnh sát khu vực sẽ còng tay bạn tại nhà!',
      revealedClue: 'DẤU HIỆU LỪA ĐẢO: Đe dọa bằng vũ lực, thúc ép thời gian cực ngắn và né tránh thủ tục giấy tờ hành chính hợp pháp.'
    },
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Rất bản lĩnh! Cơ quan Công an và Viện kiểm sát chỉ làm việc trực tiếp tại trụ sở bằng giấy mời hoặc giấy triệu tập bằng văn bản, không bao giờ đòi tiền qua điện thoại.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Đúng đắn! Bạn nói sẽ trực tiếp ra công an phường sở tại xác minh khiến kẻ gian cụt đường lừa.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Mắc bẫy nghiêm trọng! Bạn vừa bị thao túng tâm lý sợ hãi trước chức danh công quyền giả mạo.'
      }
    },
    lesson: 'Lực lượng chức năng không bao giờ xử phạt giao dịch qua số tài khoản ngân hàng hoặc đe dọa lệnh bắt qua điện thoại.',
    tactic: 'Đe dọa Chức danh Công quyền'
  },
  {
    id: 4,
    callerName: 'Tổng đài Viễn thông Quốc gia',
    callerNumber: '024 9999 44xx • Đầu số ảo',
    callerTag: 'Dọa Khóa SIM 2 Chiều sau 2h',
    avatar: '📡',
    story: 'Giọng đọc tự động IVR thông báo SIM của bạn sẽ bị cắt toàn bộ liên lạc vì vi phạm an ninh.',
    dialogue: [
      'Thông báo khẩn từ Cục Viễn thông: Số thuê bao của quý khách phát tán tin nhắn rác trái phép và sẽ bị khóa liên lạc 2 chiều sau 2 giờ.',
      'Để mở khóa khẩn cấp, bấm phím 1 để gặp nhân viên hỗ trợ...',
      'Nhân viên: "Chào bạn, đọc số CCCD 2 mặt và mã OTP vừa gửi về máy để chúng tôi kích hoạt lại sóng."'
    ],
    lookupData: {
      carrier: 'Đầu số cố định ảo VoIP GigaFone',
      spamReports: '112 lượt báo cáo "Dọa khóa SIM cướp mã OTP"',
      registeredOwner: 'Công ty TNHH dịch vụ tổng đài trung gian',
      warningNote: 'Chiêu bài đánh cắp mã OTP nhằm đăng nhập tài khoản Zalo, Telegram hoặc ví điện tử liên kết số điện thoại.'
    },
    trapQuestion: {
      label: 'Hỏi về điểm giao dịch nhà mạng',
      question: 'SIM tôi đăng ký chính chủ tại cửa hàng Viettel, sao tôi không ra trực tiếp cửa hàng làm việc?',
      callerResponse: 'Hệ thống đã khóa trên cổng quốc gia rồi, ra cửa hàng không xử lý kịp đâu! Đọc ngay mã OTP 6 số đi kẻo mất số vĩnh viễn!',
      revealedClue: 'BẮT THÓP: Kẻ gian ngăn cản bạn đến quầy giao dịch chính thống vì biết hành vi lừa đảo sẽ bị nhân viên bóc mẽ ngay.'
    },
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Chuẩn xác! Các nhà mạng chỉ gửi tin nhắn SMS Brandname chính thức và mời khách hàng ra quầy, không bao giờ gọi điện đòi mã OTP.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Tốt! Tự gọi lên tổng đài chính thức của nhà mạng (Viettel 18008098, VinaPhone 18001091) để xác minh.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Nguy hiểm! Cung cấp OTP cho kẻ lạ đồng nghĩa với việc bạn tự tay giao quyền kiểm soát tài khoản cho kẻ gian.'
      }
    },
    lesson: 'Nhà mạng không bao giờ gọi điện đe dọa khóa SIM sau vài giờ hoặc đòi OTP để "mở khóa sóng". Luôn kiểm tra qua tổng đài chính thống.',
    tactic: 'Tạo áp lực Khóa dịch vụ'
  },
  {
    id: 5,
    callerName: 'Chi cục Thuế - Hỗ trợ Quyết toán',
    callerNumber: '0904 881 xxx • Số di động',
    callerTag: 'Dụ cài File .APK Dịch vụ công',
    avatar: '💻',
    story: 'Người gọi xưng cán bộ Thuế thông báo bạn có khoản hoàn thuế thu nhập cá nhân chưa nhận.',
    dialogue: [
      'Anh chào em, anh là cán bộ hỗ trợ Chi cục Thuế. Hồ sơ thuế của em có khoản tiền hoàn dư 4.850.000đ năm ngoái.',
      'Do Cổng dịch vụ công đang quá tải, anh gửi em đường link này qua Zalo để tải app Dịch vụ công 2.0 file đuôi .apk về điện thoại.',
      'Em cài xong nhớ bấm Cho phép Trợ năng (Accessibility) để ứng dụng tự nhận diện khuôn mặt và chuyển tiền hoàn thuế vào tài khoản cho em nhé.'
    ],
    lookupData: {
      carrier: 'MobiFone di động cá nhân',
      spamReports: '83 lượt báo cáo "Lừa cài app dịch vụ công chứa mã độc"',
      registeredOwner: 'LE THI MAI',
      warningNote: 'Yêu cầu bật quyền Trợ năng (Accessibility) cho phép ứng dụng ngầm theo dõi màn hình, đọc trộm OTP và tự động chuyển tiền trong app ngân hàng.'
    },
    trapQuestion: {
      label: 'Hỏi về cổng chính phủ gdt.gov.vn',
      question: 'Tại sao em không làm thủ tục trực tiếp trên website Cục Thuế gdt.gov.vn được ạ?',
      callerResponse: 'Website đang bảo trì đồng bộ dữ liệu em ơi. Chỉ có bản cập nhật app này mới duyệt được tiền hoàn ngay trong ngày thôi!',
      revealedClue: 'BẪY MÃ ĐỘC: Cơ quan thuế không bao giờ phát hành app qua link tải ngoài mà chỉ qua kho ứng dụng Google Play / App Store chính thống.'
    },
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Rất xuất sắc! File .apk từ nguồn lạ là mã độc chiếm quyền điều khiển điện thoại (Accessibility Service). Cài vào máy sẽ bị đánh cắp toàn bộ tiền trong tài khoản.'
      },
      delay: {
        isCorrect: true,
        feedback: 'An toàn! Bạn kiên quyết chỉ làm việc qua cổng dịch vụ công chính thống gdt.gov.vn.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Mất trắng tài khoản! Cấp quyền trợ năng cho app lạ cho phép kẻ gian điều khiển điện thoại từ xa như đang cầm máy trên tay.'
      }
    },
    lesson: 'Tuyệt đối KHÔNG BAO GIỜ tải app qua file .apk do người lạ gửi qua Zalo hay cấp quyền Trợ năng trên điện thoại Android.',
    tactic: 'Cài cắm Mã độc Chiếm quyền điều khiển'
  },
  {
    id: 6,
    callerName: 'Hải quan Sân bay Quốc tế Tân Sơn Nhất',
    callerNumber: '+00 84 912 345 xxx • Đầu số lạ',
    callerTag: 'Dọa Bưu kiện Chứa Hàng cấm',
    avatar: '📦',
    story: 'Người gọi thông báo bưu kiện đứng tên bạn gửi ra nước ngoài bị giữ vì chứa tài liệu cấm.',
    dialogue: [
      'Bộ phận An ninh Soi chiếu Hải quan xin thông báo: Kiện hàng gửi sang Úc mang tên bạn phát hiện có 10 thẻ căn cước và 2kg bột trắng nghi chất cấm.',
      'Đây là vụ án buôn lậu xuyên quốc gia đặc biệt nghiêm trọng. Công an cửa khẩu đang lập biên bản khởi tố.',
      'Nếu muốn chứng minh danh tính bị kẻ xấu lợi dụng, bạn phải chuyển ngay toàn bộ số dư hiện có vào tài khoản giám định của Bộ Công an để chứng minh dòng tiền sạch!'
    ],
    lookupData: {
      carrier: 'Đầu số mạo danh quốc tế caller-ID spoofing',
      spamReports: '95 lượt báo cáo "Bưu phẩm chứa hàng cấm đòi chứng minh tài chính"',
      registeredOwner: 'Không xác định (Đầu số ảo qua mạng Internet)',
      warningNote: 'Không có cơ quan an ninh nào yêu cầu "chứng minh dòng tiền sạch" bằng cách chuyển vào số tài khoản cá nhân.'
    },
    trapQuestion: {
      label: 'Hỏi mã vận đơn và bưu cục gửi',
      question: 'Tôi không gửi hàng đi Úc. Xin vui lòng cho tôi biết mã vận đơn và bưu cục tiếp nhận bưu phẩm này?',
      callerResponse: 'Mã vận đơn là hồ sơ tuyệt mật của cơ quan điều tra! Bạn đang có thái độ ngoan cố. Chúng tôi sẽ phát lệnh truy nã đỏ!',
      revealedClue: 'LỐI MÒN TÂM LÝ: Kẻ gian lập tức nâng mức đe dọa ("lệnh truy nã đỏ") khi bị hỏi trúng thông tin nghiệp vụ cơ bản!'
    },
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Quá chuẩn! Bạn đã vạch trần chiêu thức vu khống bưu phẩm cấm để dọa dẫm nạn nhân chuyển tiền giám định tài chính.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Sáng suốt! Bạn nói sẽ trực tiếp ra cơ quan hải quan và công an để phối hợp điều tra, khiến kẻ gian tự cúp máy.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Mắc bẫy lừa đảo kinh điển! Không có bất kỳ cơ quan điều tra nào yêu cầu nộp tiền để "chứng minh vô tội".'
      }
    },
    lesson: 'Bưu điện hay hải quan không tự ý chuyển máy cho công an hay yêu cầu chuyển tiền vào tài khoản để "chứng minh trong sạch".',
    tactic: 'Vu khống Bưu kiện & Đe dọa Tố tụng'
  }
];

let callIdx = 0;
let lives = 3;
let score = 0;
let sessionId = '';
let finished = false;
let callTimer = 0;
let timerInterval: number | null = null;
let currentPhase: 'intro' | 'ringing' | 'in-call' | 'feedback' | 'summary' = 'intro';
let currentIntelTab: 'lookup' | 'trap' | 'tip' = 'lookup';
let trapConfronted = false;
let selectedVerdict: 'hangup' | 'delay' | 'cooperate' | null = null;

const history: { call: CallCase; correct: boolean; verdictChoice: string }[] = [];

const content = () => document.getElementById('phoneContent')!;
const stats = () => document.getElementById('phoneStats')!;

export function openPhoneGame() {
  stats().classList.add('hidden');
  currentPhase = 'intro';
  render();
}

function start() {
  callIdx = 0;
  lives = 3;
  score = 0;
  history.length = 0;
  sessionId = createSessionId();
  finished = false;
  stats().classList.remove('hidden');
  startCall(callIdx);
}

function startCall(idx: number) {
  callIdx = idx;
  currentPhase = 'ringing';
  trapConfronted = false;
  currentIntelTab = 'lookup';
  selectedVerdict = null;
  callTimer = 0;
  clearCallTimer();
  playPhoneRingtone();
  render();
}

function acceptCall() {
  stopPhoneRingtone();
  playPhonePickup();
  currentPhase = 'in-call';
  startCallTimer();
  render();
}

function declineCallEarly() {
  stopPhoneRingtone();
  playPhoneHangup();
  // Prompt player to answer to learn interrogation, but if it's obvious spam, let them analyze
  acceptCall();
}

function startCallTimer() {
  clearCallTimer();
  timerInterval = window.setInterval(() => {
    callTimer++;
    const timerEl = document.getElementById('activeCallTimer');
    if (timerEl) {
      const min = String(Math.floor(callTimer / 60)).padStart(2, '0');
      const sec = String(callTimer % 60).padStart(2, '0');
      timerEl.textContent = `${min}:${sec}`;
    }
  }, 1000);
}

function clearCallTimer() {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
}

function triggerTrapQuestion() {
  if (trapConfronted) return;
  trapConfronted = true;
  currentIntelTab = 'trap';
  playActionBeep();
  setTimeout(() => {
    const call = CALLS[callIdx];
    if (call.isRealAlert) {
      beep('C5', '8n');
    } else {
      playPhoneStatic();
    }
    render();
  }, 350);
}

function selectVerdict(verdict: 'hangup' | 'delay' | 'cooperate') {
  if (currentPhase !== 'in-call') return;
  clearCallTimer();
  playPhoneHangup();
  selectedVerdict = verdict;
  currentPhase = 'feedback';

  const call = CALLS[callIdx];
  const result = call.verdicts[verdict];
  const isCorrect = result.isCorrect;

  if (isCorrect) {
    score++;
    beep('E5', '8n');
  } else {
    lives--;
    beep('G2', '8n');
  }

  history.push({ call, correct: isCorrect, verdictChoice: verdict });
  render();
}

function nextCall() {
  if (lives === 0 || callIdx === CALLS.length - 1) {
    finish();
  } else {
    startCall(callIdx + 1);
  }
}

function finish() {
  if (finished) return;
  finished = true;
  clearCallTimer();
  stopPhoneRingtone();
  currentPhase = 'summary';

  if (lives > 0 && history.length === CALLS.length) {
    document.dispatchEvent(new CustomEvent<PhoneGameResult>('phone-completed', {
      detail: { score, maxScore: CALLS.length, livesLeft: lives, sessionId },
    }));
  }

  stats().classList.add('hidden');
  render();
}

function render() {
  const container = content();
  if (!container) return;

  // Update top bar stats
  const statsEl = stats();
  if (currentPhase !== 'intro' && currentPhase !== 'summary') {
    statsEl.classList.remove('hidden');
    statsEl.innerHTML = `
      <span>Cuộc gọi ${callIdx + 1}/${CALLS.length}</span>
      <span>${score * 120} XP</span>
      <span class="phone-lives" aria-label="${lives} mạng còn lại">${'♥'.repeat(lives)}${'♡'.repeat(3 - lives)}</span>
    `;
  } else {
    statsEl.classList.add('hidden');
  }

  if (currentPhase === 'intro') {
    container.innerHTML = `
      <div class="phone-wrapper">
        <div class="phone-intro-card">
          <div class="phone-hero-avatar">☎</div>
          <h2>Hotline Tác chiến: Vạch trần Cuộc gọi</h2>
          <p>Điện thoại đang đổ chuông liên tục. Kẻ gian sử dụng Deepfake giọng nói, lệnh bắt giam giả và áp lực thời gian để thao túng bạn. Hãy giữ cái đầu lạnh, tra cứu dữ liệu và bắt bài thủ đoạn!</p>
          
          <div class="phone-feature-grid">
            <div class="phone-feature-item">
              <span>🔍</span>
              <strong>Tra cứu số lạ</strong>
              <small>Kiểm tra dữ liệu nhà mạng và lượt báo cáo spam tức thời.</small>
            </div>
            <div class="phone-feature-item">
              <span>🎙️</span>
              <strong>Hỏi câu hỏi bẫy</strong>
              <small>Chất vấn thông tin nội bộ để phát hiện sơ hở kẻ lừa đảo.</small>
            </div>
            <div class="phone-feature-item">
              <span>🛑</span>
              <strong>Phán quyết dứt khoát</strong>
              <small>Dập máy, hoãn xác minh hoặc phối hợp với cảnh báo thật.</small>
            </div>
          </div>

          <button class="primary-button" data-phone="start-game" style="font-size:15px;padding:12px 28px;">
            Nhận ca trực Hotline (${CALLS.length} cuộc gọi) →
          </button>
        </div>
      </div>
    `;
    return;
  }

  if (currentPhase === 'summary') {
    container.innerHTML = `
      <div class="phone-wrapper">
        <div class="phone-summary-card">
          <div class="phone-hero-avatar" style="background:${lives > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #b91c1c)'}">
            ${lives > 0 ? '🛡️' : '⚠️'}
          </div>
          <h2>${lives > 0 ? 'Hoàn thành Ca trực Hotline!' : 'Ca trực bị gián đoạn do mắc bẫy'}</h2>
          <p style="color:var(--home-secondary);font-size:14px;margin-bottom:16px;">
            Xử lý thành công: <strong>${score} / ${CALLS.length} cuộc gọi</strong> · Còn lại <strong>${lives}/3 mạng</strong>
          </p>

          <div class="phone-summary-reviews">
            ${history.map(item => `
              <div class="review-item">
                <div class="review-badge ${item.correct ? 'pass' : 'fail'}">${item.correct ? '✓' : '✕'}</div>
                <div class="review-text">
                  <strong>${escapeHtml(item.call.callerName)} (${escapeHtml(item.call.tactic)})</strong>
                  <p>${escapeHtml(item.call.lesson)}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;">
            <button class="primary-button" data-phone="start-game">Chơi lại ca trực</button>
            <button class="secondary-button" data-action="phoneExit">Về màn hình chính</button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const call = CALLS[callIdx];

  container.innerHTML = `
    <div class="phone-wrapper">
      <div class="phone-top-status">
        <div class="phone-pill">
          <span class="pulse-dot"></span>
          <span>TỔNG ĐÀI ĐANG KẾT NỐI · CA ${callIdx + 1}/${CALLS.length}</span>
        </div>
        <div class="phone-session-info">
          <span>Kỹ năng: <b>Bắt bài thao túng tâm lý</b></span>
          <span class="phone-lives">${'♥'.repeat(lives)}${'♡'.repeat(3 - lives)}</span>
        </div>
      </div>

      <div class="phone-stage-grid">
        <!-- LEFT: SMARTPHONE TERMINAL CHASSIS -->
        <div class="phone-device-shell">
          <div class="phone-notch"></div>

          ${currentPhase === 'ringing' ? `
            <div class="phone-incoming-view">
              <div class="phone-ring-avatar">${call.avatar}</div>
              <div class="phone-caller-name">${escapeHtml(call.callerName)}</div>
              <div class="phone-caller-number">${escapeHtml(call.callerNumber)}</div>
              <span class="phone-caller-tag ${call.isRealAlert ? 'is-real' : ''}">${escapeHtml(call.callerTag)}</span>

              <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin-bottom:28px;">
                Đang có cuộc gọi đến... Hãy nhận máy để nghe nội dung và dùng nghiệp vụ điều tra.
              </p>

              <div class="phone-call-actions">
                <button class="phone-btn-round btn-decline" data-phone="decline" title="Bắt máy kiểm tra">
                  📞
                </button>
                <button class="phone-btn-round btn-accept" data-phone="accept" title="Bắt máy nhận cuộc gọi">
                  📱
                </button>
              </div>
            </div>
          ` : `
            <div class="phone-active-call">
              <div class="phone-active-header">
                <div class="phone-active-timer" id="activeCallTimer">00:05</div>
                <div style="font-weight:700;font-size:15px;color:#fff;">${escapeHtml(call.callerName)}</div>
                <div style="font-size:11px;color:#94a3b8;font-family:'JetBrains Mono', monospace;">${escapeHtml(call.callerNumber)}</div>
              </div>

              <!-- Live Audio Waveform -->
              <div class="phone-waveform">
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
                <div class="wave-bar"></div>
              </div>

              <!-- Caller Speech Stream -->
              <div class="phone-speech-stream" id="speechStream">
                ${call.dialogue.map((line, idx) => `
                  <div class="speech-line ${idx === call.dialogue.length - 1 ? 'is-threat' : ''}">
                    “${escapeHtml(line)}”
                  </div>
                `).join('')}

                ${trapConfronted ? `
                  <div class="speech-line is-reaction">
                    <b>Phản ứng của người gọi:</b> “${escapeHtml(call.trapQuestion.callerResponse)}”
                  </div>
                ` : ''}
              </div>

              <!-- Tactical Tools Bar -->
              <div class="phone-tactical-tools">
                <button class="phone-tool-btn ${currentIntelTab === 'lookup' ? 'is-active' : ''}" data-phone="tab-lookup">
                  <span class="tool-icon">🔍</span>
                  <span>Tra cứu số</span>
                </button>
                <button class="phone-tool-btn ${currentIntelTab === 'trap' ? 'is-active' : ''} ${trapConfronted ? 'is-confronted' : ''}" data-phone="trap-question">
                  <span class="tool-icon">🎙️</span>
                  <span>${trapConfronted ? 'Đã hỏi bẫy' : 'Hỏi câu bẫy'}</span>
                </button>
                <button class="phone-tool-btn ${currentIntelTab === 'tip' ? 'is-active' : ''}" data-phone="tab-tip">
                  <span class="tool-icon">💡</span>
                  <span>Cảnh báo</span>
                </button>
              </div>

              <!-- Verdict Decisions -->
              ${currentPhase === 'in-call' ? `
                <div class="phone-verdict-section">
                  <div class="phone-verdict-title">Quyết định xử lý cuộc gọi</div>
                  <div class="phone-verdict-buttons">
                    <button class="phone-verdict-btn btn-hangup" data-phone="verdict" data-action="hangup">
                      🔴 Dập máy &amp; Chặn
                    </button>
                    <button class="phone-verdict-btn btn-delay" data-phone="verdict" data-action="delay">
                      🟡 Hoãn để xác minh
                    </button>
                    ${call.isRealAlert ? `
                      <button class="phone-verdict-btn btn-cooperate" data-phone="verdict" data-action="cooperate">
                        🟢 Tiếp tục hợp tác (Cảnh báo thật)
                      </button>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
          `}
        </div>

        <!-- RIGHT: FORENSIC INVESTIGATION & INTEL DOSSIER -->
        <div class="phone-intel-panel">
          <div class="intel-header">
            <h3>🛡️ Hồ sơ Tình báo &amp; Phản hồi Nghiệp vụ</h3>
            <span class="intel-badge">${escapeHtml(call.tactic)}</span>
          </div>

          <div class="intel-box">
            <strong>Bối cảnh cuộc gọi:</strong>
            <p style="margin-top:4px;">${escapeHtml(call.story)}</p>
          </div>

          ${currentIntelTab === 'lookup' ? `
            <div class="intel-box" style="border-left:3px solid #3b82f6;">
              <strong style="color:#2563eb;">Dữ liệu Tra cứu Nhà mạng &amp; Cảnh báo Cộng đồng:</strong>
              <table class="intel-data-table">
                <tr><td>Đầu số mạng:</td><td>${escapeHtml(call.lookupData.carrier)}</td></tr>
                <tr><td>Báo cáo lừa đảo:</td><td style="color:#ef4444;font-weight:700;">${escapeHtml(call.lookupData.spamReports)}</td></tr>
                <tr><td>Chủ thuê bao:</td><td>${escapeHtml(call.lookupData.registeredOwner)}</td></tr>
              </table>
              <div style="margin-top:10px;padding:8px;background:rgba(239,68,68,0.08);border-radius:8px;font-size:12px;color:#991b1b;">
                ⚠️ <b>Đánh giá an ninh:</b> ${escapeHtml(call.lookupData.warningNote)}
              </div>
            </div>
          ` : currentIntelTab === 'trap' ? `
            <div class="intel-box" style="border-left:3px solid #f59e0b;">
              <strong style="color:#d97706;">Nghiệp vụ Bắt bài &amp; Hỏi câu hỏi bẫy:</strong>
              <p style="margin:8px 0;font-size:13px;color:var(--home-ink);">
                <b>Câu hỏi đối chất bạn vừa đưa ra:</b><br>
                <i>“${escapeHtml(call.trapQuestion.question)}”</i>
              </p>
              ${trapConfronted ? `
                <div style="background:rgba(16,185,129,0.1);padding:10px;border-radius:8px;border:1px solid rgba(16,185,129,0.3);color:#065f46;font-size:12.5px;">
                  💡 <b>Phân tích phản ứng:</b> ${escapeHtml(call.trapQuestion.revealedClue)}
                </div>
              ` : `
                <p style="color:#64748b;font-size:12px;">Bấm nút <b>"Hỏi câu bẫy"</b> trên điện thoại để quan sát phản ứng của đối tượng!</p>
              `}
            </div>
          ` : `
            <div class="intel-box" style="border-left:3px solid #10b981;">
              <strong style="color:#059669;">Nguyên tắc Ứng phó Cốt lõi:</strong>
              <p style="margin-top:6px;">${escapeHtml(call.lesson)}</p>
            </div>
          `}

          <!-- RESULT FEEDBACK CARD (AFTER VERDICT) -->
          ${currentPhase === 'feedback' && selectedVerdict ? `
            <div class="phone-feedback-card ${call.verdicts[selectedVerdict].isCorrect ? 'is-correct' : 'is-wrong'}">
              <h4>
                ${call.verdicts[selectedVerdict].isCorrect ? '✓ Xử lý nghiệp vụ rất chính xác!' : '✕ Quyết định chưa an toàn!'}
              </h4>
              <p>${escapeHtml(call.verdicts[selectedVerdict].feedback)}</p>
              <button class="phone-next-btn" data-phone="next-call">
                ${callIdx === CALLS.length - 1 ? 'Xem báo cáo tổng kết ca trực →' : 'Tiếp nhận cuộc gọi tiếp theo →'}
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Global click delegation for Phone game
document.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-phone]');
  if (!button || button.disabled) return;

  const action = button.dataset.phone;
  switch (action) {
    case 'start-game':
      start();
      break;
    case 'accept':
      acceptCall();
      break;
    case 'decline':
      declineCallEarly();
      break;
    case 'tab-lookup':
      currentIntelTab = 'lookup';
      playActionBeep();
      render();
      break;
    case 'trap-question':
      triggerTrapQuestion();
      break;
    case 'tab-tip':
      currentIntelTab = 'tip';
      playActionBeep();
      render();
      break;
    case 'verdict': {
      const verdict = button.dataset.action as 'hangup' | 'delay' | 'cooperate';
      if (verdict) selectVerdict(verdict);
      break;
    }
    case 'next-call':
      nextCall();
      break;
  }
});
