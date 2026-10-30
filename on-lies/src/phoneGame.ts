import { createSessionId } from './session';
import {
  playPhoneRingtone,
  stopPhoneRingtone,
  playPhonePickup,
  playPhoneHangup,
  playPhoneStatic,
  playActionBeep,
  playScannerBlip,
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

export interface TrapQuestion {
  label: string;
  question: string;
  callerResponse: string;
  revealedClue: string;
}

export interface CallCase {
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
    networkActivity: string;
    registeredOwner: string;
    audioForensics: string;
  };
  trapQuestions: TrapQuestion[];
  verdicts: {
    hangup: { isCorrect: boolean; feedback: string };
    delay: { isCorrect: boolean; feedback: string };
    cooperate: { isCorrect: boolean; feedback: string };
  };
  lesson: string;
  tactic: string;
}

export const CALLS: CallCase[] = [
  {
    id: 1,
    callerName: 'Thầy Trưởng khoa Nguyễn Văn An',
    callerNumber: '0988 123 xxx • Số cá nhân',
    callerTag: 'Đầu số di động cá nhân (Chuyển tiếp)',
    avatar: '👨‍🏫',
    story: 'Bạn nhận cuộc gọi từ giọng nói giống hệt thầy Trưởng khoa, giọng hơi rè và giục giã gấp rút.',
    dialogue: [
      'Alo em à? Thầy An đây. Thầy đang dự cuộc họp khẩn cấp tại hội trường lớn, đường truyền hơi chập chờn.',
      'Thầy cần thanh toán gấp 8.000.000đ tiền hồ sơ tài liệu hội nghị mà thẻ cá nhân bị kẹt hạn mức.',
      'Em chuyển khoản tạm vào số tài khoản thủ quỹ đối tác này giúp thầy, 4h chiều họp xong thầy về trường gửi trả lại em ngay nhé!'
    ],
    lookupData: {
      carrier: 'Mạng di động - Thuê bao kích hoạt 12 ngày trước',
      networkActivity: 'Lịch sử: 18 cuộc gọi ngắn dưới 45 giây trong sáng nay',
      registeredOwner: 'NGUYEN VAN LONG (Không trùng tên thầy An)',
      audioForensics: 'Phổ âm thanh: Xuất hiện méo hài bậc cao ở dải 2.4kHz - 3.2kHz, đặc trưng của công nghệ sao chép giọng nói Deepfake AI.'
    },
    trapQuestions: [
      {
        label: 'Kiểm tra vị trí văn phòng khoa',
        question: 'Dạ thầy ơi, chiều nay thầy về trường thì ký giấy ở Văn phòng tầng 3 nhà Delta đúng không ạ?',
        callerResponse: 'Ờ đúng rồi! Cứ chuyển tiền nhanh đi rồi chiều gặp thầy ở đó, thầy đang họp gấp đừng hỏi lằng nhằng!',
        revealedClue: 'ĐIỂM ĐỐI KHÁNG: Văn phòng khoa thực tế nằm ở tầng 2 nhà Beta. Kẻ gian lập tức "nhận bừa" vị trí sai để giục chuyển tiền!'
      },
      {
        label: 'Đề nghị chuyển số tài khoản chính chủ',
        question: 'Dạ thầy gửi số tài khoản chính chủ mang tên thầy An được không, để em lưu ủy nhiệm chi ạ?',
        callerResponse: 'Thầy đã bảo tài khoản thầy đang nghẽn hạn mức mới phải nhờ em! Chuyển ngay vào số tài khoản thủ quỹ thầy vừa gửi!',
        revealedClue: 'ĐIỂM ĐỐI KHÁNG: Kẻ lừa đảo từ chối tài khoản chính chủ và gây áp lực tinh thần để nạn nhân không kịp suy nghĩ.'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Rất chuẩn xác! Bạn đã bắt bài chiêu Deepfake Voice AI. Thầy cô, lãnh đạo cơ quan không bao giờ dùng số lạ mượn tiền cá nhân sinh viên qua điện thoại.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Đúng đắn! Hoãn lại để xác minh trực tiếp qua số hotline phòng khoa hoặc gặp mặt trực tiếp đã ngăn chặn kịp thời cú lừa.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Bạn đã mắc bẫy! Công nghệ AI hiện nay chỉ cần mẫu âm thanh 3 giây là có thể nhái giọng bất kỳ ai. Không bao giờ chuyển tiền chỉ vì giọng nói nghe giống.'
      }
    },
    lesson: 'Công nghệ AI có thể nhái giọng người thân, thầy cô rất giống. Luôn hỏi những thông tin nội bộ mà chỉ hai người biết, hoặc gọi lại số cũ đã lưu để xác thực.',
    tactic: 'Deepfake Voice AI mạo danh người quen'
  },
  {
    id: 2,
    callerName: 'Tổng đài An ninh Ngân hàng số',
    callerNumber: '1900 5454xx • Tổng đài CSKH',
    callerTag: 'Đầu số định danh đã xác thực chữ ký số',
    isRealAlert: true,
    avatar: '🏦',
    story: 'Tổng đài viên ngân hàng gọi cảnh báo phát hiện đăng nhập bất thường từ nước ngoài vào tài khoản của bạn.',
    dialogue: [
      'Kính chào quý khách. Bộ phận An ninh thông tin Ngân hàng phát hiện tài khoản của quý khách vừa có lệnh đăng nhập lạ lúc 02:15 tại Singapore.',
      'Để bảo đảm an toàn, chúng tôi đã tạm khóa chiều rút tiền và kính đề nghị quý khách tự mở ứng dụng ngân hàng chính thức trên máy để đổi mật khẩu.',
      'Xin lưu ý: Ngân hàng tuyệt đối KHÔNG bao giờ yêu cầu quý khách đọc mã OTP, mật khẩu hay chuyển tiền vào bất kỳ tài khoản nào.'
    ],
    lookupData: {
      carrier: 'Tổng đài Brandname Viễn thông cấp phép chính quy',
      networkActivity: 'Lịch sử: Đầu số chăm sóc khách hàng hoạt động 8 năm',
      registeredOwner: 'NGAN HANG TMCP QUOC TE (Chính chủ pháp nhân)',
      audioForensics: 'Tạp âm nền: Không gian tổng đài thực tế, giọng nói tự nhiên, không ghi nhận can thiệp âm thanh nhân tạo.'
    },
    trapQuestions: [
      {
        label: 'Hỏi về việc cung cấp mã OTP',
        question: 'Em có cần đọc mã OTP vừa gửi về điện thoại để anh chị hủy lệnh đăng nhập đó không ạ?',
        callerResponse: 'Tuyệt đối KHÔNG quý khách nhé! Ngân hàng không bao giờ hỏi mã OTP hay mật khẩu. Quý khách chỉ thao tác trực tiếp trên ứng dụng của chính mình.',
        revealedClue: 'DẤU HIỆU CHUẨN MỰC: Nhân viên ngân hàng chính thống luôn cảnh báo khách hàng TUYỆT ĐỐI KHÔNG đọc mã OTP.'
      },
      {
        label: 'Hẹn ra quầy giao dịch chi nhánh',
        question: 'Em có thể mang CCCD ra thẳng phòng giao dịch chi nhánh gần nhất để đối soát được không?',
        callerResponse: 'Dạ rất tốt thưa quý khách. Quý khách có thể mang CCCD bản gốc ra bất kỳ chi nhánh nào để được giao dịch viên hỗ trợ trực tiếp.',
        revealedClue: 'DẤU HIỆU CHUẨN MỰC: Khuyến khích khách hàng làm việc trực tiếp tại quầy vật lý, không hề chèo kéo hay ép giao dịch online.'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: false,
        feedback: 'Chưa tối ưu! Đây là cuộc gọi cảnh báo thật từ hệ thống phòng thủ ngân hàng. Nếu bạn cúp máy và phớt lờ, tài khoản có nguy cơ bị hacker nước ngoài tấn công.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Hợp lý! Bạn chủ động tự mở ứng dụng ngân hàng để kiểm tra lịch sử đăng nhập hoặc gọi lại hotline in sau thẻ.'
      },
      cooperate: {
        isCorrect: true,
        feedback: 'Xuất sắc! Bạn lắng nghe khuyến cáo an ninh (họ không đòi OTP hay tiền), sau đó chủ động tự vào ứng dụng chính thức đổi mật khẩu.'
      }
    },
    lesson: 'Tổng đài an ninh ngân hàng thật CHỈ cảnh báo và hướng dẫn bạn tự thao tác trên app, KHÔNG BAO GIỜ đòi mã OTP hay bảo bạn chuyển tiền sang tài khoản khác.',
    tactic: 'Cảnh báo An ninh Ngân hàng Chính thức'
  },
  {
    id: 3,
    callerName: 'Cán bộ Điều tra Trần Tuấn Kiệt - C02',
    callerNumber: '024 3825 xxxx • Đầu số cố định',
    callerTag: 'Đầu số cố định liên tỉnh (024)',
    avatar: '👮‍♂️',
    story: 'Người gọi tự xưng điều tra viên Bộ Công an, giọng đanh thép thông báo bạn dính án ma túy quốc tế.',
    dialogue: [
      'Tôi là Trung úy Trần Tuấn Kiệt, Cán bộ Cục Cảnh sát Hình sự C02. Số tài khoản của anh đang liên quan trực tiếp đến vụ án rửa tiền 15 tỷ đồng!',
      'Viện Kiểm sát Nhân dân Tối cao đã phê chuẩn Quyết định Tạm giam và Lệnh Khám xét nhà khẩn cấp đối với anh!',
      'Yêu cầu anh kết bạn Zalo nhận lệnh bắt, sau đó chuyển 20 triệu tiền thanh tra vào tài khoản phong tỏa của Kho bạc để chứng minh trong sạch!'
    ],
    lookupData: {
      carrier: 'Giao thức mạng ảo VoIP SIP Trunk quốc tế',
      networkActivity: 'Đầu số hiển thị giả mạo công nghệ Caller ID Spoofing',
      registeredOwner: 'Không xác định (Máy chủ đặt tại cụm Phnom Penh / Sihanoukville)',
      audioForensics: 'Tạp âm nền: Xuất hiện tiếng còi hú công an và tiếng bộ đàm giả lập được phát lặp lại theo vòng tua 12 giây.'
    },
    trapQuestions: [
      {
        label: 'Yêu cầu tống đạt Giấy triệu tập trực tiếp',
        question: 'Đề nghị cán bộ gửi Giấy triệu tập hoặc Giấy mời về Công an phường nơi tôi đang đăng ký thường trú?',
        callerResponse: 'Thời điểm khẩn cấp chuyên án tuyệt mật! Nếu anh không chấp hành chuyển tiền thanh tra ngay, xe đặc nhiệm sẽ đến còng tay anh tại chỗ!',
        revealedClue: 'LỘ BẢN CHẤT: Pháp luật Việt Nam quy định cơ quan điều tra chỉ tống đạt văn bản giấy qua bưu chính hoặc cảnh sát khu vực, không làm việc qua điện thoại hay Zalo!'
      },
      {
        label: 'Đề nghị có mặt luật sư',
        question: 'Tôi xin phép mời luật sư cùng lên trụ sở Cục C02 tại 47 Phạm Văn Đồng làm việc trực tiếp?',
        callerResponse: 'Anh dám báo người ngoài hả? Đây là vụ án bí mật quốc gia, anh mà tiết lộ thì cả gia đình anh sẽ bị khởi tố đồng phạm!',
        revealedClue: 'LỘ BẢN CHẤT: Kẻ lừa đảo đe dọa cô lập nạn nhân, cấm liên hệ người thân và luật sư nhằm thao túng tâm lý sợ hãi.'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Tuyệt vời! Cơ quan Công an và Viện Kiểm sát không bao giờ làm việc, lấy lời khai hay tống đạt lệnh bắt qua điện thoại, càng không có "tài khoản an toàn"!'
      },
      delay: {
        isCorrect: true,
        feedback: 'Rất tốt! Tuyên bố sẽ trực tiếp ra Công an phường địa phương xác minh khiến đối tượng lập tức cúp máy.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Sập bẫy nguy hiểm! Chuyển tiền vào "tài khoản phong tỏa" đồng nghĩa với việc bạn chuyển thẳng vào ví rửa tiền của tội phạm mạng.'
      }
    },
    lesson: 'Cơ quan thực thi pháp luật KHÔNG BAO GIỜ làm việc qua điện thoại, Zalo hay yêu cầu công dân chuyển tiền chứng minh trong sạch. Mọi vụ án đều có giấy mời/triệu tập trực tiếp.',
    tactic: 'Giả danh Cơ quan Thực thi Pháp luật & Thao túng Sợ hãi'
  },
  {
    id: 4,
    callerName: 'Bưu tá Giao Hàng Tiết Kiệm',
    callerNumber: '0934 512 xxx • Số cá nhân',
    callerTag: 'Thuê bao di động nội mạng',
    isRealAlert: true,
    avatar: '📦',
    story: 'Shipper gọi điện thông báo đang đứng trước cổng nhà giao kiện hàng bạn đặt trên sàn thương mại điện tử hôm qua.',
    dialogue: [
      'Alo anh ơi, em là shipper GHTK đây ạ. Em đang đứng trước cổng số 18 ngõ 25 giao đơn hàng áo sơ mi anh đặt hôm qua ạ.',
      'Đơn này tiền ship thu hộ COD là 85.000đ. Anh xuống cổng kiểm tra hộp hàng rồi nhận giúp em với nhé.',
      'Nếu anh bận thì em gửi bác tổ trưởng cạnh nhà rồi anh chuyển khoản vào mã QR chính thức dán trên app bưu cục sau cũng được ạ.'
    ],
    lookupData: {
      carrier: 'Mạng Viettel di động cá nhân',
      networkActivity: 'Thuê bao hoạt động 4 năm, tần suất gọi phù hợp mô hình shipper',
      registeredOwner: 'TRAN DINH TRUNG (Xác thực thông tin viễn thông chuẩn)',
      audioForensics: 'Tạp âm nền: Tiếng nổ xe máy, tiếng còi xe đường phố thực tế, không có hiện tượng chỉnh sửa hay lọc âm.'
    },
    trapQuestions: [
      {
        label: 'Hỏi về việc bấm link xác nhận qua SMS',
        question: 'Anh có gửi đường link nào qua tin nhắn bắt em bấm vào để kích hoạt đơn không anh?',
        callerResponse: 'Ơ đâu có anh, em đứng cổng gọi trực tiếp mà! Bưu cục cấm shipper gửi link lạ, anh chỉ cần xuống xem hàng tận tay thôi ạ!',
        revealedClue: 'DẤU HIỆU CHUẨN MỰC: Shipper chân chính giao hàng vật lý tận nơi, không bao giờ gửi link SMS đòi truy cập hay đối soát.'
      },
      {
        label: 'Đối chiếu mã bưu kiện',
        question: 'Anh đọc giúp em 4 số cuối mã vận đơn in trên gói hàng với ạ?',
        callerResponse: 'Dạ mã đơn của anh là GHTK-VN-8842, đúng tên người nhận là anh và số điện thoại này luôn ạ.',
        revealedClue: 'DẤU HIỆU CHUẨN MỰC: Khớp đúng mã vận đơn, thông tin bưu kiện và địa chỉ nhận hàng thực tế.'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: false,
        feedback: 'Chưa đúng! Đây là shipper giao hàng thực tế. Cúp máy chặn số sẽ khiến hàng của bạn bị hoàn trả bưu cục.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Hợp lý! Bạn đối chiếu lại mã vận đơn trên ứng dụng mua hàng trước khi xuống nhận và thanh toán.'
      },
      cooperate: {
        isCorrect: true,
        feedback: 'Chính xác! Xuống nhận hàng kiểm tra trực tiếp và thanh toán COD là quy trình mua sắm an toàn.'
      }
    },
    lesson: 'Khi nhận cuộc gọi giao hàng, kiểm tra mã vận đơn trên app mua sắm, nhận hàng trực tiếp tại cổng. Tuyệt đối không bấm vào bất kỳ link SMS nào tự xưng là bưu tá.',
    tactic: 'Giao dịch Vận chuyển Thực tế'
  },
  {
    id: 5,
    callerName: 'Cán bộ Kỹ thuật Cổng Dịch vụ công',
    callerNumber: '0898 442 xxx • Số di động',
    callerTag: 'Đầu số di động mới kích hoạt',
    avatar: '💻',
    story: 'Người gọi tự xưng hỗ trợ kỹ thuật Cổng Dịch vụ công quốc gia, giục cập nhật VNeID mức 2 online do lỗi dữ liệu.',
    dialogue: [
      'Chào công dân. Hồ sơ định danh VNeID mức 2 của bạn trên hệ thống quốc gia bị sai lệch thông tin thường trú, sẽ bị hủy định danh sau 24h.',
      'Do cổng web đang bảo trì nghẽn mạng, tôi sẽ gửi đường link tải file cài đặt Dịch vụ công bản cập nhật đuôi .apk qua Zalo cho bạn.',
      'Cài xong bạn nhớ bấm Cấp quyền Trợ năng (Accessibility) để hệ thống tự động quét khuôn mặt và đồng bộ dữ liệu vào tài khoản nhé!'
    ],
    lookupData: {
      carrier: 'MobiFone di động - Kích hoạt 48 giờ trước',
      networkActivity: 'Tần suất: 52 cuộc gọi liên tục trong sáng nay',
      registeredOwner: 'NGUYEN THI THAO (SIM rác bán lẻ)',
      audioForensics: 'Phát hiện tiếng gõ phím giả lập văn phòng, cuộc gọi thực hiện qua tai nghe giá rẻ.'
    },
    trapQuestions: [
      {
        label: 'Hỏi về việc lên trực tiếp Công an phường',
        question: 'Tôi ra trực tiếp Công an phường làm lại định danh mức 2 được không?',
        callerResponse: 'Hệ thống phường đang mất điện không tiếp dân đâu! Cứ cài file app này vào máy làm online 2 phút là xong, không cài là bị khóa CCCD đấy!',
        revealedClue: 'LỘ MẶT: Kẻ gian ngăn cản đến trụ sở công quyền vì sợ bị công an phát hiện, ép cài file ngay lập tức.'
      },
      {
        label: 'Hỏi về tải app trên Google Play / App Store',
        question: 'Tại sao ứng dụng không có trên kho Google Play chính thống mà phải tải file .apk bên ngoài?',
        callerResponse: 'Bản này là gói vá lỗi nội bộ chuyên biệt cho tài khoản lỗi, kho ứng dụng chưa kịp duyệt cập nhật em ơi!',
        revealedClue: 'BẪY MÃ ĐỘC: Cơ quan nhà nước KHÔNG BAO GIỜ phát hành ứng dụng qua file .apk trôi nổi trên mạng.'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Cực kỳ chính xác! File .apk từ nguồn lạ là mã độc ngầm. Quyền Accessibility (Trợ năng) cho phép kẻ gian theo dõi màn hình, đọc trộm OTP và tự chuyển tiền trong app ngân hàng!'
      },
      delay: {
        isCorrect: true,
        feedback: 'Đúng đắn! Bạn nói sẽ ra công an phường kiểm tra khiến đối tượng biết đã gặp người có hiểu biết và cúp máy.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Nguy hiểm chết người! Bấm cấp quyền Trợ năng cho file .apk lạ sẽ biến điện thoại thành "máy ma" (Zombie device), tài khoản ngân hàng sẽ bị vét sạch trong tích tắc.'
      }
    },
    lesson: 'Ứng dụng chính phủ VNeID CHỈ phát hành trên Google Play và Apple App Store. Tuyệt đối không tải file .apk hoặc cấp quyền Trợ năng (Accessibility) cho ứng dụng ngoài kho chính thức.',
    tactic: 'Cài cắm Mã độc Chiếm quyền Điều khiển (.APK Trojan)'
  },
  {
    id: 6,
    callerName: 'Giáo viên Thể dục Trường THPT',
    callerNumber: '0912 884 xxx • Số khẩn cấp',
    callerTag: 'Tín hiệu âm thanh: Có tiếng còi báo động',
    avatar: '🚑',
    story: 'Giọng nói hớt hải, hoảng loạn báo tin người thân của bạn vừa ngã cầu thang vỡ hộp sọ đang cấp cứu tại bệnh viện.',
    dialogue: [
      'Alo! Có phải người nhà của em Minh không? Tôi là thầy giáo trường đây! Cháu vừa bị ngã cầu thang gãy xương chấn thương sọ não!',
      'Xe cấp cứu vừa đưa cháu vào Bệnh viện Chợ Rẫy, bác sĩ trưởng khoa bảo phải mổ cấp cứu gấp trong 15 phút không thì xuất huyết nguy kịch!',
      'Bệnh viện yêu cầu chuyển khoản gấp 40 triệu tạm ứng viện phí vào số tài khoản cá nhân của bác sĩ mổ này để ký giấy lên bàn mổ ngay!'
    ],
    lookupData: {
      carrier: 'Vinaphone di động cá nhân',
      networkActivity: 'Lịch sử: 4 cuộc gọi nhắm vào phụ huynh/sinh viên',
      registeredOwner: 'Số điện thoại qua trạm trung chuyển',
      audioForensics: 'Phát hiện âm thanh còi hú cấp cứu 115 được bật lặp lại từ một thiết bị thứ hai bên cạnh micro.'
    },
    trapQuestions: [
      {
        label: 'Kiểm tra thông tin lớp học và giáo viên chủ nhiệm',
        question: 'Cháu học lớp mấy và cô giáo chủ nhiệm tên gì vậy thầy?',
        callerResponse: 'Giờ này nguy cấp lắm tính mạng con em ngàn cân treo sợi tóc mà còn hỏi vặn vẹo! Không chuyển tiền ngay là cháu chết oan đấy!',
        revealedClue: 'LỘ TẨY TÂM LÝ: Kẻ gian không trả lời được thông tin cơ bản của học sinh, lập tức dùng tính mạng đe dọa để ép chuyển tiền.'
      },
      {
        label: 'Đề nghị liên hệ quầy thu ngân bệnh viện',
        question: 'Tôi xin số máy bàn của khoa Cấp cứu bệnh viện để tôi gọi trực tiếp đóng tiền qua cổng viện phí?',
        callerResponse: 'Qua máy bàn bệnh viện thủ tục hành chính lâu lắm không kịp mổ đâu! Chuyển thẳng tài khoản cá nhân bác sĩ mới mổ được!',
        revealedClue: 'LỘ TẨY TÂM LÝ: Bệnh viện luôn có quy trình cấp cứu ưu tiên tính mạng người bệnh trước, viện phí hoàn thiện sau; không có chuyện bác sĩ dùng tài khoản cá nhân đòi tiền mổ khẩn cấp.'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Rất bản lĩnh! Đây là kịch bản "Con đang cấp cứu" đánh vào tình thương gia đình. Bệnh viện luôn ưu tiên cứu người trước thủ tục viện phí, không đòi chuyển khoản cá nhân.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Chuẩn xác! Giữ bình tĩnh, gọi điện ngay cho giáo viên chủ nhiệm hoặc người thân để kiểm tra tình hình thực tế.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Sập bẫy tâm lý sợ hãi! Hàng trăm phụ huynh đã mất từ 20 đến 100 triệu vì chiêu trò "con đang cấp cứu mổ gấp" này.'
      }
    },
    lesson: 'Khi nhận tin dữ về người thân, hãy hít thở sâu, gọi ngay cho nhà trường hoặc người thân để đối chứng. Bệnh viện công lập không bao giờ thu tiền mổ cấp cứu qua tài khoản cá nhân của bác sĩ.',
    tactic: 'Thao túng Nỗi đau Gia đình & Khẩn cấp Giả tạo'
  },
  {
    id: 7,
    callerName: 'Đại úy Nguyễn Văn Hưng - CSKV',
    callerNumber: '024 3852 xxxx • Số bàn Công an phường',
    callerTag: 'Đầu số máy bàn cơ quan hành chính',
    isRealAlert: true,
    avatar: '👮',
    story: 'Cảnh sát khu vực gọi bằng số điện thoại bàn của Công an phường mời bạn lên trụ sở đối soát thông tin sổ hộ khẩu điện tử.',
    dialogue: [
      'Chào anh/chị, tôi là Đại úy Hưng, Cảnh sát khu vực phụ trách tổ dân phố 12 phường Dịch Vọng Hậu.',
      'Sáng mai từ 8h30 đến 11h, mời anh/chị mang theo CCCD gắn chip bản gốc lên trực tiếp phòng tiếp dân Công an phường để đối soát thông tin cư trú.',
      'Công an phường làm việc trực tiếp tại trụ sở, không yêu cầu làm việc qua mạng, không gửi link và không thu bất kỳ khoản phí nào.'
    ],
    lookupData: {
      carrier: 'Mạng điện thoại cố định VNPT Hà Nội',
      networkActivity: 'Đầu số máy bàn công khai niêm yết trên cổng thông tin điện tử Quận',
      registeredOwner: 'CONG AN PHUONG DICH VONG HAU (Chính quy nhà nước)',
      audioForensics: 'Tạp âm nền: Tiếng bước chân, tiếng đóng dấu hồ sơ hành chính tự nhiên, phát âm chuẩn mực người thi hành công vụ.'
    },
    trapQuestions: [
      {
        label: 'Hỏi về việc gửi ảnh CCCD qua Zalo',
        question: 'Em có thể chụp ảnh CCCD gửi qua Zalo cho anh đỡ phải lên phường được không?',
        callerResponse: 'Quy định ngành không cho phép làm việc qua Zalo anh/chị nhé. Mời anh/chị mang giấy tờ gốc đến trụ sở để đối chiếu nhằm bảo mật thông tin cá nhân.',
        revealedClue: 'DẤU HIỆU CHUẨN MỰC: Cảnh sát khu vực thật từ chối làm việc qua Zalo và tuân thủ đúng quy chế tiếp dân tại trụ sở.'
      },
      {
        label: 'Xác nhận địa chỉ trụ sở công an phường',
        question: 'Dạ trụ sở phường mình nằm ở đoạn nào anh nhỉ?',
        callerResponse: 'Ở số 45 phố Trần Thái Tông, đối diện trường mầm non Dịch Vọng Hậu anh/chị nhé.',
        revealedClue: 'DẤU HIỆU CHUẨN MỰC: Cung cấp chính xác địa chỉ trụ sở vật lý để người dân đến làm việc trực tiếp.'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: false,
        feedback: 'Chưa phù hợp! Đây là cuộc gọi mời làm việc hành chính thật từ Công an phường sở tại. Bạn nên tiếp nhận và thu xếp thời gian đến trụ sở.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Hợp lý! Bạn ghi lại thông tin và gọi lại số máy bàn niêm yết của phường để đối chứng lịch tiếp dân.'
      },
      cooperate: {
        isCorrect: true,
        feedback: 'Rất chuẩn mực! Đồng ý mang giấy tờ gốc đến làm việc trực tiếp tại trụ sở công quyền là trách nhiệm công dân an toàn.'
      }
    },
    lesson: 'Cán bộ công an thật gọi mời làm việc luôn dùng số cố định cơ quan hoặc gặp trực tiếp tại địa bàn, mời đến trụ sở và KHÔNG BAO GIỜ yêu cầu làm việc qua mạng hay chuyển tiền.',
    tactic: 'Thông báo Hành chính Trực tiếp từ Chính quyền'
  },
  {
    id: 8,
    callerName: 'CSKH Viễn thông Nhà mạng',
    callerNumber: '059 881 xxxx • Số di động lạ',
    callerTag: 'Đầu số di động chưa định danh',
    avatar: '📡',
    story: 'Người gọi tự xưng nhân viên nhà mạng tri ân tặng gói nâng cấp SIM 5G miễn phí và tặng 60GB dung lượng data.',
    dialogue: [
      'Em chào anh, em là nhân viên chăm sóc khách hàng viễn thông. Thuê bao của anh nằm trong danh sách tri ân nâng cấp miễn phí từ SIM 4G lên 5G.',
      'Anh sẽ được tặng thêm 60GB data tốc độ cao sử dụng trong 3 tháng mà không cần đổi thẻ SIM vật lý.',
      'Để hệ thống kích hoạt từ xa, tổng đài vừa gửi 1 mã xác thực qua tin nhắn, anh đọc giúp em mã số đó để em hoàn tất chuyển đổi nhé!'
    ],
    lookupData: {
      carrier: 'Gmobile đầu số 059 di động',
      networkActivity: 'Tần suất: 45 cuộc/giờ nhắm vào mục tiêu chiếm quyền SIM',
      registeredOwner: 'Thuê bao trả trước chưa chuẩn hóa thông tin',
      audioForensics: 'Phát hiện giọng đọc theo kịch bản mẫu telesale lừa đảo chiếm đoạt tài khoản viễn thông.'
    },
    trapQuestions: [
      {
        label: 'Kiểm tra nội dung tin nhắn mã số',
        question: 'Tin nhắn vừa gửi về máy tôi ghi tiêu đề là "Mã OTP thiết lập lại mật khẩu Zalo/Ngân hàng" mà?',
        callerResponse: 'Dạ đấy là do cổng viễn thông mượn giao thức bảo mật đối tác thôi anh, anh đọc nhanh mã đi kẻo hết hạn trong 30 giây!',
        revealedClue: 'BẮT BÀI CHIẾM ĐOẠT: Kẻ gian yêu cầu "quên mật khẩu" tài khoản mạng xã hội hoặc ví điện tử của bạn và dụ bạn đọc OTP để chiếm quyền đăng nhập.'
      },
      {
        label: 'Đề nghị đổi SIM tại quầy giao dịch',
        question: 'Tôi tự ra cửa hàng giao dịch chính thức của nhà mạng đổi SIM được không?',
        callerResponse: 'Ra cửa hàng mất phí 50.000đ và không được tặng 60GB data miễn phí đâu anh, chỉ kích hoạt online qua em mới có ưu đãi!',
        revealedClue: 'BẮT BÀI CHIẾM ĐOẠT: Ngăn cản ra quầy chính hãng vì ra quầy sẽ bị nhân viên viễn thông lật tẩy ngay.'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Tuyệt vời! Tuyệt đối không cung cấp OTP cho bất kỳ ai. Đọc mã OTP cho kẻ gian đồng nghĩa với việc giao tài khoản Zalo, Telegram, ví điện tử cho tội phạm.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Đúng đắn! Gọi trực tiếp tổng đài chính thức nhà mạng (18008098 / 18001091) để kiểm tra chương trình.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Mắc bẫy nguy hiểm! Kẻ gian chiếm quyền Zalo/SIM để nhắn tin mượn tiền toàn bộ danh bạ bạn bè người thân của bạn.'
      }
    },
    lesson: 'Nhà mạng KHÔNG BAO GIỜ gọi điện bảo khách đọc mã OTP gửi về máy để "nâng cấp SIM 5G". Mọi thủ tục SIM đều làm tại quầy giao dịch chính thống.',
    tactic: 'Chiếm đoạt Mã OTP qua Bẫy Nâng cấp SIM'
  },
  {
    id: 9,
    callerName: 'Y tá Trạm Y tế Phường',
    callerNumber: '028 3910 xxxx • Số cố định Trạm Y tế',
    callerTag: 'Đầu số điện thoại bàn địa phương',
    isRealAlert: true,
    avatar: '👩‍⚕️',
    story: 'Nhân viên y tế gọi nhắc bạn lịch khám sàng lọc sức khỏe cộng đồng hoặc hiến máu tình nguyện bạn đã đăng ký.',
    dialogue: [
      'Alo, em chào anh/chị. Em gọi từ Trạm Y tế phường để nhắc lịch khám sức khỏe cộng đồng anh/chị đã đăng ký tuần trước.',
      'Sáng thứ Bảy này từ 7h30 anh/chị nhớ đến trạm y tế nhé. Nhớ nhịn ăn sáng để xét nghiệm máu và mang theo thẻ BHYT bản cứng ạ.',
      'Chương trình này thuộc đề án y tế cơ sở của phường, được hỗ trợ miễn phí 100% không thu tiền gì đâu ạ.'
    ],
    lookupData: {
      carrier: 'Mạng điện thoại cố định khu vực TP.HCM',
      networkActivity: 'Đầu số đăng ký cơ sở y tế công lập địa phương',
      registeredOwner: 'TRAM Y TE PHUONG (Hồ sơ dịch vụ công chính quy)',
      audioForensics: 'Tạp âm nền: Tiếng loa thông báo y tế, tiếng trao đổi chuyên môn khám chữa bệnh tự nhiên.'
    },
    trapQuestions: [
      {
        label: 'Hỏi về việc đóng trước phí xét nghiệm',
        question: 'Em có phải chuyển khoản tiền cọc thuốc men hay xét nghiệm trước không chị?',
        callerResponse: 'Dạ không hề anh/chị ơi! Đề án này do ngân sách y tế thành phố chi trả toàn bộ, bà con đi khám không mất một đồng nào cả.',
        revealedClue: 'DẤU HIỆU CHUẨN MỰC: Chương trình y tế công cộng minh bạch, hoàn toàn miễn phí, không yêu cầu chuyển tiền.'
      },
      {
        label: 'Xác nhận vị trí trạm y tế',
        question: 'Dạ địa chỉ Trạm Y tế mình ở đâu chị nhỉ?',
        callerResponse: 'Dạ ở số 12 đường Hoàng Hoa Thám, ngay cạnh trụ sở Ủy ban nhân dân phường mình đó ạ.',
        revealedClue: 'DẤU HIỆU CHUẨN MỰC: Địa chỉ cụ thể, nằm liền kề trụ sở chính quyền địa phương.'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: false,
        feedback: 'Chưa chuẩn! Đây là cuộc gọi y tế chính thống nhắc bạn đi khám sức khỏe đã đăng ký.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Hợp lý! Bạn kiểm tra lại lịch hẹn trên sổ sức khỏe điện tử trước khi sắp xếp thời gian đến trạm y tế.'
      },
      cooperate: {
        isCorrect: true,
        feedback: 'Xuất sắc! Lắng nghe dặn dò chuyên môn (nhịn ăn sáng, mang BHYT) và đến kiểm tra sức khỏe đúng hẹn.'
      }
    },
    lesson: 'Các cơ sở y tế công lập gọi nhắc lịch khám chỉ hướng dẫn thủ tục y tế, không bao giờ gửi link lạ hay đòi chuyển tiền trước.',
    tactic: 'Dịch vụ Y tế Cộng đồng Chính thống'
  },
  {
    id: 10,
    callerName: 'CSKH Sàn Thương mại Điện tử',
    callerNumber: '024 7779 xxxx • Đầu số ảo tổng đài',
    callerTag: 'Đầu số tổng đài ảo (VoIP SIP)',
    avatar: '🛒',
    story: 'Người gọi thông báo bưu tá giao nhầm đơn và lỡ kích hoạt gói Hội viên VIP tự động trừ 3.500.000đ/tháng trên tài khoản của bạn.',
    dialogue: [
      'Dạ em chào anh, em là nhân viên hỗ trợ khiếu nại sàn TMĐT. Do bưu tá sơ suất khi quét mã hoàn đơn, hệ thống đã ghi nhận tài khoản anh lên gói Hội viên VIP.',
      'Gói này sẽ tự động trừ 3.500.000đ vào ngày 1 hàng tháng qua thẻ ngân hàng liên kết.',
      'Để hủy lệnh trừ tiền khẩn cấp, em gửi anh đường link Cổng đối soát tài chính, anh nhập 16 số thẻ và 3 số bí mật CVV mặt sau để hệ thống hủy trừ tiền ngay nhé!'
    ],
    lookupData: {
      carrier: 'Đầu số cố định ảo VoIP GigaFone',
      networkActivity: 'Tần suất: 110 cuộc gọi tự động mỗi ngày',
      registeredOwner: 'Công ty TNHH Dịch vụ Truyền thông trung gian',
      audioForensics: 'Giọng điệu dồn dập, tạo áp lực sắp bị trừ tiền nhằm kích thích tâm lý muốn lấy lại tiền ngay.'
    },
    trapQuestions: [
      {
        label: 'Hỏi về việc cung cấp 3 số bí mật CVV sau thẻ',
        question: 'Tại sao hủy đơn hàng mà lại bắt tôi nhập số CVV bí mật trên thẻ ngân hàng?',
        callerResponse: 'Đây là quy chuẩn mã hóa liên ngân hàng anh ơi! Anh không nhập thì 12h đêm nay hệ thống sẽ tự động trừ tiền trong thẻ của anh!',
        revealedClue: 'LỘ BẢN CHẤT LỪA ĐẢO: Số CVV là mã bảo mật thanh toán quốc tế. Bất kỳ ai có số thẻ và CVV đều có thể quẹt tiền mua hàng trực tuyến mà không cần OTP!'
      },
      {
        label: 'Đề nghị hủy trực tiếp trên ứng dụng Shopee/Tiki',
        question: 'Tôi tự vào app sàn TMĐT bấm hủy trên phần cài đặt tài khoản được không?',
        callerResponse: 'Lỗi này thuộc về cổng thanh toán độc lập, trên app không hiển thị đâu, phải thao tác qua link đối soát em gửi mới kịp hủy anh nhé!',
        revealedClue: 'LỘ BẢN CHẤT LỪA ĐẢO: Dụ nạn nhân rời khỏi nền tảng chính thức để dẫn dụ vào trang web giả mạo câu trộm thông tin thẻ (Phishing).'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Chuẩn xác tuyệt đối! Sàn TMĐT không bao giờ có gói trừ tiền tự động kiểu này và KHÔNG BAO GIỜ đòi hỏi 3 số bí mật CVV mặt sau thẻ.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Rất tốt! Bạn chủ động mở app sàn TMĐT kiểm tra hoặc liên hệ tổng đài hỗ trợ chính thức trên app.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Nguy hiểm nghiêm trọng! Nhập số thẻ và CVV vào link giả mạo sẽ khiến kẻ gian quẹt sạch hạn mức thẻ tín dụng của bạn tại các cổng thanh toán nước ngoài.'
      }
    },
    lesson: '3 chữ số CVV/CVC mặt sau thẻ ngân hàng là chìa khóa rút tiền. Tuyệt đối không nhập CVV vào bất kỳ đường link nào nhận qua tin nhắn hay điện thoại.',
    tactic: 'Đánh cắp Thông tin Thẻ Tín dụng (CVV Phishing)'
  },
  {
    id: 11,
    callerName: 'Tuyển dụng Việc làm Online Shopee/Lazada',
    callerNumber: '079 321 xxxx • Số tự động',
    callerTag: 'Thuê bao di động quay số tự động',
    avatar: '💼',
    story: 'Mời bạn tham gia công việc "đánh giá vote 5 sao sản phẩm, giật đơn hàng online nhận hoa hồng 15-20% kiếm 500k-2tr/ngày".',
    dialogue: [
      'Chào bạn, bên mình đang tuyển cộng tác viên làm việc tại nhà, chỉ cần có điện thoại kết nối mạng.',
      'Nhiệm vụ rất đơn giản: Bạn bấm vào link sản phẩm Shopee, thanh toán ứng trước đơn hàng, sau 5 phút hệ thống sẽ hoàn trả cả tiền gốc lẫn 15% hoa hồng.',
      'Đơn đầu tiên chỉ 200.000đ, làm thử có tiền rút về tài khoản ngân hàng ngay trong 3 phút, làm càng nhiều đơn lớn tiền hoa hồng càng cao!'
    ],
    lookupData: {
      carrier: 'Vietnamobile đầu số 079',
      networkActivity: 'Tần suất: 180 cuộc gọi tự động mỗi ngày (Robocall phát tán lời mời)',
      registeredOwner: 'Số rác không định danh',
      audioForensics: 'Đoạn đầu là giọng ghi âm tự động (Auto-dialer), sau đó tự động chuyển hướng sang nhân viên chốt đơn.'
    },
    trapQuestions: [
      {
        label: 'Hỏi về hợp đồng lao động và pháp nhân',
        question: 'Công ty tuyển dụng có hợp đồng lao động và mã số thuế doanh nghiệp không?',
        callerResponse: 'Công việc online tự do linh hoạt kiếm thêm thu nhập, rút tiền theo từng đơn ngay trong ngày thì cần gì hợp đồng rườm rà bạn ơi!',
        revealedClue: 'BẪY TIỀN ẢO PONZI: Các đường dây lừa đảo nhiệm vụ đơn hàng không bao giờ có pháp nhân hay hợp đồng hợp pháp.'
      },
      {
        label: 'Tại sao người làm phải bỏ tiền túi chuyển trước',
        question: 'Tại sao làm công việc đánh giá sản phẩm mà lại bắt người lao động tự bỏ tiền túi chuyển khoản trước?',
        callerResponse: 'Đây là tiền tạo đơn thanh khoản ảo giúp shop tăng thứ hạng, hệ thống của sàn tự động hoàn tiền và cộng thêm hoa hồng ngay lập tức bạn yên tâm!',
        revealedClue: 'BẪY TIỀN ẢO PONZI: 1-2 đơn đầu vài trăm nghìn chúng sẽ trả tiền thật để lấy lòng tin. Đến khi nạp 20-50 triệu, chúng sẽ viện cớ "sai cú pháp", "kẹt lệnh" để chiếm đoạt toàn bộ.'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Rất sáng suốt! Đây là mô hình bẫy lừa "Làm nhiệm vụ giật đơn Shopee/Tiki". Hàng nghìn người đã mất hàng trăm triệu đến tiền tỷ vì chiêu bài này.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Tốt! Dừng lại tìm hiểu các cảnh báo trên báo đài về chiêu trò lừa việc làm online nạp tiền giật đơn.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Bạn đã sập bẫy tham lam! Kẻ gian sẽ trả tiền thật vài đơn nhỏ đầu tiên, sau đó dụ bạn nạp số tiền lớn rồi chặn liên lạc.'
      }
    },
    lesson: 'Không có công việc nào "việc nhẹ lương cao", chỉ ngồi bấm điện thoại giật đơn hàng mà kiếm tiền triệu mỗi ngày. Tuyệt đối không chuyển tiền làm nhiệm vụ online.',
    tactic: 'Bẫy Lừa đảo Việc làm Online & Nhiệm vụ Đơn hàng Ảo'
  },
  {
    id: 12,
    callerName: 'Ban Tổ chức Tri ân Khách hàng',
    callerNumber: '0865 992 xxx • Đầu số lạ',
    callerTag: 'Đầu số di động cá nhân',
    avatar: '🎁',
    story: 'Giọng điệu hào hứng chúc mừng số điện thoại của bạn đã may mắn trúng giải Đặc biệt xe máy Honda SH 150i trị giá 110 triệu đồng.',
    dialogue: [
      'Xin chúc mừng thuê bao của anh đã may mắn trúng giải Đặc biệt trong chương trình Vòng quay may mắn tri ân khách hàng năm 2026!',
      'Phần thưởng của anh là 1 xe máy Honda SH 150i ABS kèm sổ tiết kiệm 30.000.000đ!',
      'Để xe được vận chuyển bàn giao về tận nhà trong 48 giờ tới, anh chỉ cần thanh toán trước 10% thuế trước bạ và phí đăng kiểm là 8.500.000đ vào tài khoản Ban tổ chức!'
    ],
    lookupData: {
      carrier: 'Viettel di động trả trước',
      networkActivity: 'Thuê bao kích hoạt 24 giờ trước, chỉ phát cuộc gọi một chiều',
      registeredOwner: 'HOANG TRONG NGHIA (Tài khoản ngân hàng thuê mượn)',
      audioForensics: 'Phát hiện âm thanh vỗ tay và nhạc chúc mừng giả lập phát từ loa ngoài.'
    },
    trapQuestions: [
      {
        label: 'Hỏi về việc chưa từng tham gia quay số',
        question: 'Tôi chưa từng mua sắm hay đăng ký tham gia chương trình quay thưởng nào, sao lại trúng?',
        callerResponse: 'Hệ thống quay số ngẫu nhiên trên toàn bộ thuê bao di động toàn quốc nhân dịp kỷ niệm 20 năm thành lập tập đoàn anh ạ!',
        revealedClue: 'LỘ BẢN CHẤT LỪA ĐẢO: Luật Thương mại Việt Nam quy định mọi chương trình khuyến mại trúng thưởng đều phải đăng ký với Bộ Công Thương và có danh sách công khai.'
      },
      {
        label: 'Đề nghị trừ phí vào giá trị giải thưởng',
        question: 'Tôi đồng ý nhận xe, anh cứ trừ 8.5 triệu phí trước bạ vào sổ tiết kiệm 30 triệu rồi trao xe cho tôi?',
        callerResponse: 'Không được anh ơi! Quy định tài chính nhà nước bắt buộc người trúng phải nộp tiền phí riêng qua tài khoản thủ quỹ mới được xuất xe khỏi kho!',
        revealedClue: 'LỘ BẢN CHẤT LỪA ĐẢO: Kẻ lừa đảo chỉ nhắm đến số tiền 8.5 triệu phí nộp trước của nạn nhân; không hề có chiếc xe máy nào tồn tại.'
      }
    ],
    verdicts: {
      hangup: {
        isCorrect: true,
        feedback: 'Tuyệt vời! Bẫy "Trúng thưởng xe SH đòi nộp phí trước bạ" là chiêu trò kinh điển. Khi bạn chuyển 8.5 triệu xong, chúng sẽ tiếp tục đòi "phí bôi trơn", "phí vận chuyển" cho đến khi bạn hết tiền.'
      },
      delay: {
        isCorrect: true,
        feedback: 'Hợp lý! Bạn yêu cầu gửi văn bản xác nhận của Bộ Công Thương hoặc đến trực tiếp trụ sở tập đoàn.'
      },
      cooperate: {
        isCorrect: false,
        feedback: 'Sập bẫy tham lam! Bạn đã chuyển tiền cho kẻ lừa đảo và sẽ không bao giờ nhận được xe hay tiền hoàn lại.'
      }
    },
    lesson: 'Không có bữa trưa nào miễn phí. Nếu bạn không tham gia dự thưởng mà tự nhiên được báo trúng xe sang, 100% là bẫy lừa đảo đòi nộp phí trước.',
    tactic: 'Bẫy Lừa đảo Trúng thưởng & Đòi nộp Tiền phí Trước'
  }
];

let callIdx = 0;
let score = 0;
let lives = 3;
let finished = false;
let currentPhase: 'ringing' | 'in-call' | 'feedback' | 'summary' = 'ringing';
let selectedVerdict: 'hangup' | 'delay' | 'cooperate' | null = null;
let currentIntelTab: 'lookup' | 'trap' | 'tip' = 'lookup';
let askedQuestions: Set<number> = new Set();
let lastAskedIdx: number | null = null;
let callTimer = 0;
let timerInterval: number | null = null;
let sessionId = '';
const history: { call: CallCase; correct: boolean; verdictChoice: string }[] = [];

function container(): HTMLElement {
  const el = document.getElementById('phoneAppContent');
  if (!el) throw new Error('#phoneAppContent not found');
  return el;
}

function stats(): HTMLElement {
  const el = document.getElementById('phoneStats');
  if (!el) throw new Error('#phoneStats not found');
  return el;
}

export function openPhoneGame(): void {
  sessionId = createSessionId();
  callIdx = 0;
  score = 0;
  lives = 3;
  finished = false;
  history.length = 0;
  stats().classList.remove('hidden');
  renderIntro();
}

function renderIntro() {
  stopPhoneRingtone();
  container().innerHTML = `
    <div class="phone-wrapper">
      <div class="phone-intro-card">
        <div class="phone-hero-avatar">📞</div>
        <h2>Trung tâm Xử lý Cuộc gọi Khẩn cấp</h2>
        <p style="color:var(--home-secondary);font-size:14px;line-height:1.7;margin:12px 0 24px;">
          Chào mừng Điều tra viên! Bạn sẽ tiếp nhận <b>12 cuộc gọi thời gian thực</b> bao gồm cả bẫy lừa đảo công nghệ cao lẫn thông báo khẩn chính thống.
          <br><br>
          🔍 <b>Nhiệm vụ:</b> Sử dụng kỹ thuật tra cứu viễn thông, tung câu hỏi bẫy đối chất và đưa ra quyết định xử lý an toàn!
        </p>
        <button class="primary-button" data-phone="start-game" style="font-size:15px;padding:12px 28px;">
          Bắt đầu ca trực Hotline (12 cuộc gọi)
        </button>
      </div>
    </div>
  `;
}

function start() {
  callIdx = 0;
  score = 0;
  lives = 3;
  finished = false;
  history.length = 0;
  startCall(0);
}

function startCall(index: number) {
  callIdx = index;
  currentPhase = 'ringing';
  selectedVerdict = null;
  currentIntelTab = 'lookup';
  askedQuestions.clear();
  lastAskedIdx = null;
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

function triggerTrapQuestion(questionIndex: number) {
  if (askedQuestions.has(questionIndex)) return;
  askedQuestions.add(questionIndex);
  lastAskedIdx = questionIndex;
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
  }, 300);
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
  const el = container();
  if (!el) return;

  if (currentPhase === 'summary') {
    el.innerHTML = `
      <div class="phone-wrapper">
        <div class="phone-summary-card">
          <div class="phone-hero-avatar" style="background:${lives > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #b91c1c)'}">
            ${lives > 0 ? '🛡️' : '⚠️'}
          </div>
          <h2>${lives > 0 ? 'Hoàn thành Xuất sắc Ca trực Hotline!' : 'Ca trực bị Đình chỉ do Mắc bẫy'}</h2>
          <p style="color:var(--home-secondary);font-size:14px;margin-bottom:16px;">
            Xử lý an toàn: <strong>${score} / ${CALLS.length} cuộc gọi</strong> · Trái tim còn lại: <strong>${lives}/3</strong>
          </p>

          <div class="phone-summary-reviews">
            ${history.map(item => `
              <div class="review-item">
                <div class="review-badge ${item.correct ? 'pass' : 'fail'}">${item.correct ? '✓' : '✕'}</div>
                <div class="review-text">
                  <strong>${escapeHtml(item.call.callerName)} · Thủ đoạn: ${escapeHtml(item.call.tactic)}</strong>
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

  el.innerHTML = `
    <div class="phone-wrapper">
      <div class="phone-top-status">
        <div class="phone-pill">
          <span class="pulse-dot"></span>
          <span>HỆ THỐNG TRỰC BAN VIỄN THÔNG · CUỘC GỌI ${callIdx + 1}/${CALLS.length}</span>
        </div>
        <div class="phone-session-info">
          <span>Kỹ năng: <b>Phát hiện bẫy tâm lý & Thao túng</b></span>
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
              <span class="phone-caller-tag">${escapeHtml(call.callerTag)}</span>

              <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin-bottom:28px;">
                Đang có cuộc gọi đến... Hãy bấm máy nhận cuộc gọi để thẩm tra và xử lý.
              </p>

              <div class="phone-call-actions">
                <button class="phone-btn-round btn-decline" data-phone="decline" title="Từ chối cuộc gọi">
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
                <div class="phone-active-timer" id="activeCallTimer">00:01</div>
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

                ${Array.from(askedQuestions).map(qIdx => `
                  <div class="speech-line is-question">
                    <b>Bạn tra vấn:</b> “${escapeHtml(call.trapQuestions[qIdx].question)}”
                  </div>
                  <div class="speech-line is-reaction">
                    <b>Phản hồi:</b> “${escapeHtml(call.trapQuestions[qIdx].callerResponse)}”
                  </div>
                `).join('')}
              </div>

              <!-- Tactical Tools Bar -->
              <div class="phone-tactical-tools">
                <button class="phone-tool-btn ${currentIntelTab === 'lookup' ? 'is-active' : ''}" data-phone="tab-lookup">
                  <span class="tool-icon">🔍</span>
                  <span>Tra cứu sóng</span>
                </button>
                <button class="phone-tool-btn ${currentIntelTab === 'trap' ? 'is-active' : ''} ${askedQuestions.size > 0 ? 'is-confronted' : ''}" data-phone="tab-trap">
                  <span class="tool-icon">🎙️</span>
                  <span>Tra vấn bẫy (${askedQuestions.size}/2)</span>
                </button>
                <button class="phone-tool-btn ${currentIntelTab === 'tip' ? 'is-active' : ''}" data-phone="tab-tip">
                  <span class="tool-icon">💡</span>
                  <span>Khuyến cáo</span>
                </button>
              </div>

              <!-- Verdict Decisions (Always all 3 options, no giveaway labels) -->
              ${currentPhase === 'in-call' ? `
                <div class="phone-verdict-section">
                  <div class="phone-verdict-title">Quyết định xử lý cuộc gọi</div>
                  <div class="phone-verdict-buttons">
                    <button class="phone-verdict-btn btn-hangup" data-phone="verdict" data-action="hangup">
                      🔴 Cúp máy &amp; Khóa số
                    </button>
                    <button class="phone-verdict-btn btn-delay" data-phone="verdict" data-action="delay">
                      🟡 Hoãn để xác minh
                    </button>
                    <button class="phone-verdict-btn btn-cooperate" data-phone="verdict" data-action="cooperate">
                      🟢 Tiếp nhận &amp; Xử lý
                    </button>
                  </div>
                </div>
              ` : ''}
            </div>
          `}
        </div>

        <!-- RIGHT: FORENSIC INVESTIGATION & INTEL DOSSIER -->
        <div class="phone-intel-panel">
          <div class="intel-header">
            <h3>🛡️ Hồ sơ Nghiệp vụ Viễn thông</h3>
            <span class="intel-badge" style="background:#0f172a;color:#94a3b8;">
              ${currentPhase === 'feedback' ? escapeHtml(call.tactic) : 'Đang giám sát luồng'}
            </span>
          </div>

          <div class="intel-box">
            <strong>Bối cảnh cuộc gọi:</strong>
            <p style="margin-top:4px;">${escapeHtml(call.story)}</p>
          </div>

          ${currentIntelTab === 'lookup' ? `
            <div class="intel-box" style="border-left:3px solid #3b82f6;">
              <strong style="color:#2563eb;">Dữ liệu Viễn thông &amp; Trạm phát sóng:</strong>
              <table class="intel-data-table">
                <tr><td>Công nghệ kết nối:</td><td>${escapeHtml(call.lookupData.carrier)}</td></tr>
                <tr><td>Hoạt động thuê bao:</td><td>${escapeHtml(call.lookupData.networkActivity)}</td></tr>
                <tr><td>Chủ thể đăng ký:</td><td>${escapeHtml(call.lookupData.registeredOwner)}</td></tr>
              </table>
              <div style="margin-top:10px;padding:8px;background:rgba(59,130,246,0.08);border-radius:8px;font-size:12px;color:#1e3a8a;">
                📡 <b>Phân tích tín hiệu &amp; Codec:</b> ${escapeHtml(call.lookupData.audioForensics)}
              </div>
            </div>
          ` : currentIntelTab === 'trap' ? `
            <div class="intel-box" style="border-left:3px solid #f59e0b;">
              <strong style="color:#d97706;">Nghiệp vụ Tra vấn &amp; Bắt bài tâm lý:</strong>
              <p style="margin:6px 0 10px;font-size:12px;color:var(--home-secondary);">
                Chọn câu hỏi tác chiến để kiểm tra tính xác thực của đối tượng:
              </p>

              <div style="display:flex;flex-direction:column;gap:8px;">
                ${call.trapQuestions.map((q, idx) => `
                  <button class="phone-verdict-btn" style="text-align:left;font-size:12px;padding:8px 10px;background:${askedQuestions.has(idx) ? '#f1f5f9' : '#ffffff'};border:1px solid #cbd5e1;cursor:pointer;"
                          data-phone="ask-question" data-idx="${idx}" ${askedQuestions.has(idx) ? 'disabled' : ''}>
                    <b>${idx + 1}. ${escapeHtml(q.label)}:</b> “${escapeHtml(q.question)}”
                    ${askedQuestions.has(idx) ? ' <span style="color:#10b981;">(Đã hỏi)</span>' : ''}
                  </button>
                `).join('')}
              </div>

              ${lastAskedIdx !== null ? `
                <div style="margin-top:12px;background:rgba(16,185,129,0.08);padding:10px;border-radius:8px;border:1px solid rgba(16,185,129,0.25);color:#065f46;font-size:12.5px;">
                  💡 <b>Phân tích phản hồi [Câu ${lastAskedIdx + 1}]:</b> ${escapeHtml(call.trapQuestions[lastAskedIdx].revealedClue)}
                </div>
              ` : `
                <p style="color:#64748b;font-size:11.5px;margin-top:10px;">Bấm một trong các câu hỏi trên để thử phản ứng của người gọi.</p>
              `}
            </div>
          ` : `
            <div class="intel-box" style="border-left:3px solid #10b981;">
              <strong style="color:#059669;">Nguyên tắc Tác chiến Cốt lõi:</strong>
              <p style="margin-top:6px;font-size:13px;line-height:1.6;">${escapeHtml(call.lesson)}</p>
            </div>
          `}

          <!-- RESULT FEEDBACK CARD (AFTER VERDICT) -->
          ${currentPhase === 'feedback' && selectedVerdict ? `
            <div class="phone-feedback-card ${call.verdicts[selectedVerdict].isCorrect ? 'is-correct' : 'is-wrong'}">
              <h4>
                ${call.verdicts[selectedVerdict].isCorrect ? '✓ Xử lý nghiệp vụ rất chính xác!' : '✕ Quyết định chưa an toàn!'}
              </h4>
              <p>${escapeHtml(call.verdicts[selectedVerdict].feedback)}</p>
              <div style="margin-top:8px;font-size:12px;color:var(--home-secondary);">
                <b>Thủ đoạn thực tế:</b> ${escapeHtml(call.tactic)}
              </div>
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
      playScannerBlip();
      render();
      break;
    case 'tab-trap':
      currentIntelTab = 'trap';
      playActionBeep();
      render();
      break;
    case 'tab-tip':
      currentIntelTab = 'tip';
      playActionBeep();
      render();
      break;
    case 'ask-question': {
      const idx = Number(button.dataset.idx);
      if (!isNaN(idx)) triggerTrapQuestion(idx);
      break;
    }
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
