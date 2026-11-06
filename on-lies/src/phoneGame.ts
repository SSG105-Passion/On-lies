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
    "id": 1,
    "callerName": "Thầy Trưởng khoa Nguyễn Văn An",
    "callerNumber": "0988 123 xxx • Số cá nhân",
    "callerTag": "Thuê bao di động (0988 xxx)",
    "avatar": "👨‍🏫",
    "story": "Bạn nhận cuộc gọi từ giọng nói giống hệt thầy Trưởng khoa, giọng nghẹt mũi, thở gấp giữa tiếng micro hú rít và tiếng vỗ tay hội trường xì xào.",
    "dialogue": [
      "Alo Tuấn hả? Thầy An đây em! Thầy đang ngồi ghế chủ tọa Hội thảo Khoa học Quốc tế ở khách sạn Daewoo, mạng 4G ở đây chập chờn quá.",
      "Bên nhà in họ vừa chở 500 cuốn kỷ yếu hội thảo đến đòi thanh toán gấp 8.500.000đ mà thẻ Visa của thầy bị kẹt hạn mức thanh toán ngày!",
      "Em ứng trước bắn tạm vào tài khoản bên đối tác in ấn này hộ thầy với, 4h chiều bế mạc thầy về văn phòng khoa rút tiền mặt trả lại em ngay nhé!"
    ],
    "lookupData": {
      "carrier": "Thuê bao di động Viettel trả trước",
      "networkActivity": "Kích hoạt: 12 ngày trước • 28 cuộc gọi đi liên tục trong sáng nay",
      "registeredOwner": "NGUYEN VAN LONG",
      "audioForensics": "Chỉ số méo hài THD: 18.5% • Suy hao phi tuyến tính ở dải 2.4 - 3.2 kHz • Băng thông âm thanh cắt cụt ở 3.4 kHz"
    },
    "trapQuestions": [
      {
        "label": "Gài kèo vị trí phòng làm việc của thầy",
        "question": "Dạ thầy ơi, chiều nay thầy về trường thì em mang biên nhận sang phòng 204 nhà Beta đưa thầy hay sang văn phòng tầng 3 nhà Delta ạ?",
        "callerResponse": "Ờ đúng rồi phòng tầng 3 nhà Delta đó em! Cứ chuyển tiền nhanh đi kẻo bên in ấn họ giục kìa, thầy đang bận điều hành hội nghị đừng hỏi lằng nhằng!",
        "revealedClue": "BẮT BÀI BẪY SỐC: Văn phòng khoa thực tế nằm ở tầng 2 nhà Beta, nhà Delta là khu ký túc xá! Kẻ gian không hề biết cấu trúc trường nên \"gật bừa\" để ép chuyển tiền ngay!"
      },
      {
        "label": "Đòi Video Call hoặc chuyển số tài khoản chính chủ",
        "question": "Dạ thầy bật camera Video Call em nhìn mặt thầy 2 giây được không ạ, với lại sao thầy không gửi số tài khoản Vietcombank chính chủ của thầy?",
        "callerResponse": "Thầy đã bảo đang ngồi bàn chủ tọa hội trường lớn, micro đang bật Video Call sao được! Thầy là trưởng khoa của em mà em còn nghi ngờ linh tinh à?!",
        "revealedClue": "LỘ MẶT NẠ: Kẻ lừa đảo lập tức dùng uy thế \"thầy giáo\" để nạt nộ, chặn họng khi nạn nhân yêu cầu xác thực bằng hình ảnh trực tiếp."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": true,
        "feedback": "Bắt thóp \"Trưởng khoa Campuchia\" xuất sắc! Giọng nhái Deepfake thì giống đấy nhưng hỏi đến phòng làm việc là lòi ngay đuôi cáo. Thầy cô thật không bao giờ dùng số lạ vay nóng học trò!"
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Pha xử lý tỉnh như sáo! Hoãn lại để gọi thẳng vào số điện thoại cũ của thầy hoặc hỏi văn phòng khoa đã cứu bạn khỏi cú lừa 8.5 triệu."
      },
      "cooperate": {
        "isCorrect": false,
        "feedback": "Toang thật sự! 8.5 triệu bay màu trong 3 giây. AI giờ chỉ cần lấy 3 giây clip bạn đăng TikTok là clone được cả tông giọng lẫn tiếng thở dài. Cứ đòi tiền là phải xác minh tận mắt!"
      }
    },
    "lesson": "Công nghệ Deepfake Voice chỉ cần vài giây ghi âm giọng nói là nhái được y hệt người quen. Khi nhận cuộc gọi mượn tiền gấp từ người thân/thầy cô, luôn hỏi thông tin \"mẹo\" mà chỉ hai người biết, hoặc gọi lại số cũ để kiểm chứng.",
    "tactic": "Deepfake Voice AI nhái giọng người quen mượn tiền khẩn cấp"
  },
  {
    "id": 2,
    "callerName": "Tổng đài An ninh Ngân hàng số",
    "callerNumber": "1900 5454xx • Tổng đài CSKH",
    "callerTag": "Brandname Voice đã xác thực",
    "isRealAlert": true,
    "avatar": "🏦",
    "story": "Tổng đài viên ngân hàng gọi cảnh báo phát hiện đăng nhập bất thường từ địa chỉ IP nước ngoài vào tài khoản của bạn lúc nửa đêm.",
    "dialogue": [
      "Kính chào quý khách. Trung tâm Phòng chống Gian lận Ngân hàng phát hiện tài khoản của quý khách vừa phát sinh lượt đăng nhập bất thường lúc 02:15 sáng nay từ dải IP tại Singapore.",
      "Để bảo đảm an toàn dòng tiền, hệ thống phòng thủ tự động đã tạm khóa tính năng chuyển khoản trực tuyến trong 24 giờ.",
      "Chúng tôi xin lưu ý: Ngân hàng tuyệt đối KHÔNG BAO GIỜ yêu cầu quý khách đọc mã OTP, mật khẩu hay chuyển tiền. Kính đề nghị quý khách tự mở ứng dụng trên điện thoại để đổi mật khẩu ngay."
    ],
    "lookupData": {
      "carrier": "Hạ tầng viễn thông doanh nghiệp VNPT Brandname",
      "networkActivity": "Kích hoạt: 8 năm • Lưu lượng: 1.500 cuộc gọi xác thực/ngày",
      "registeredOwner": "NGAN HANG TMCP QUOC TE VIET NAM",
      "audioForensics": "Chỉ số méo hài THD: 1.2% • Âm thanh dải rộng chuẩn phòng thu, tiếng gõ phím đều đặn"
    },
    "trapQuestions": [
      {
        "label": "Thử đọc mã OTP xem đối phương có nhận không",
        "question": "Dạ em có cần đọc mã OTP gửi về SMS điện thoại để chị hỗ trợ hủy lệnh đăng nhập lạ kia không ạ?",
        "callerResponse": "Tuyệt đối KHÔNG quý khách nhé! Ngân hàng không bao giờ hỏi mã OTP hay mật khẩu của khách hàng. Quý khách chỉ tự thao tác bảo mật trực tiếp trên app chính thức thôi ạ.",
        "revealedClue": "DẤU HIỆU CHUẨN MỰC 100%: Nhân viên an ninh ngân hàng thật kiên quyết từ chối nhận OTP và nhắc nhở khách hàng giữ bí mật thông tin."
      },
      {
        "label": "Xin hẹn mang CCCD ra quầy chi nhánh đối soát",
        "question": "Mai em mang theo CCCD bản gốc ra thẳng phòng giao dịch chi nhánh gần nhất đối soát được không chị?",
        "callerResponse": "Dạ rất hoan nghênh quý khách ạ! Quý khách có thể mang CCCD ra bất kỳ chi nhánh nào để được giao dịch viên kiểm tra và cấp lại mật khẩu an toàn.",
        "revealedClue": "DẤU HIỆU MINH BẠCH: Khuyến khích khách hàng làm việc trực tiếp tại quầy vật lý, hoàn toàn không chèo kéo hay ép xử lý online."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": false,
        "feedback": "Hơi vội vàng rồi! Đây là cuộc gọi an ninh thật từ ngân hàng. Nếu bạn cúp máy và phớt lờ cảnh báo, tài khoản có nguy cơ bị hacker nước ngoài vét sạch tiền khi bạn đang ngủ!"
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Cực kỳ chuẩn mực! Bạn lắng nghe cảnh báo, sau đó chủ động tự mở app ngân hàng hoặc gọi lại số hotline in sau thẻ để xác minh."
      },
      "cooperate": {
        "isCorrect": true,
        "feedback": "Xuất sắc! Bạn phân biệt được thông báo an ninh chính thống (không đòi OTP, không bắt chuyển tiền) và chủ động tự bảo vệ tài khoản."
      }
    },
    "lesson": "Tổng đài an ninh ngân hàng thật CHỈ cảnh báo và hướng dẫn bạn tự thao tác trên app chính thức. Họ KHÔNG BAO GIỜ đòi mã OTP, mật khẩu hay yêu cầu chuyển tiền sang \"tài khoản đối soát\".",
    "tactic": "Cảnh báo An ninh Chính thức từ Ngân hàng"
  },
  {
    "id": 3,
    "callerName": "Cán bộ Điều tra Trần Tuấn Kiệt - C02",
    "callerNumber": "024 3825 xxxx • Đầu số cố định ảo",
    "callerTag": "Đầu số cố định 024 (Định tuyến trung kế)",
    "avatar": "👮‍♂️",
    "story": "Người gọi tự xưng Trung úy Cục Cảnh sát Hình sự C02, giọng đanh thép, quát tháo gắt gỏng trên nền tiếng rè rè của máy bộ đàm và tiếng còi xe cảnh sát hú inh ỏi.",
    "dialogue": [
      "Alo! Tôi là Thượng úy Trần Tuấn Kiệt, Cán bộ Cục Cảnh sát Hình sự C02 Bộ Công an! Anh có phải là chủ số thuê bao này không?!",
      "Ban chuyên án vừa triệt phá đường dây rửa tiền ma túy 15 tỷ xuyên quốc gia, thu giữ tại hiện trường 1 thẻ ngân hàng đứng tên anh! Lệnh bắt tạm giam và Kê biên tài sản khẩn cấp đã được Viện Kiểm sát Tối cao phê chuẩn!",
      "Yêu cầu anh tìm ngay một phòng kín đóng cửa lại, kết bạn Zalo nhận lệnh bắt, sau đó chuyển 20 triệu tiền thanh tra vào tài khoản phong tỏa của Bộ để chứng minh trong sạch trong vòng 30 phút!"
    ],
    "lookupData": {
      "carrier": "Đầu số cố định ảo qua giao thức VoIP SIP Trunking",
      "networkActivity": "Định tuyến qua Gateway máy chủ trung chuyển quốc tế (AS133xx)",
      "registeredOwner": "DNTN DICH VU TRUYEN THONG K.T",
      "audioForensics": "Chỉ số méo hài THD: 4.8% • Dải âm trầm 150-250Hz lặp lại tuần hoàn chu kỳ 2.2 giây (Âm thanh nền lặp Loop)"
    },
    "trapQuestions": [
      {
        "label": "Yêu cầu tống đạt Giấy triệu tập trực tiếp về Công an phường",
        "question": "Đề nghị cán bộ gửi Giấy triệu tập chính thức về Công an phường nơi tôi đang đăng ký thường trú, có cảnh sát khu vực đi cùng tôi mới làm việc!",
        "callerResponse": "Mày có biết đây là chuyên án mật Quốc gia không hả?! Mày đòi giấy triệu tập để mày tẩu tán tang vật à?! Tôi cho mày 15 phút, một là chuyển tiền thanh tra, hai là xe đặc nhiệm đến tận cơ quan còng tay bế mày đi!",
        "revealedClue": "LỘ BẢN CHẤT LỪA ĐẢO: Cơ quan điều tra chỉ tống đạt văn bản giấy qua bưu chính hoặc cảnh sát khu vực tận nhà. Kẻ gian lập tức hung hăng đe dọa để nạn nhân hoảng sợ!"
      },
      {
        "label": "Đề nghị có mặt luật sư cùng lên trụ sở Cục C02",
        "question": "Tôi xin phép mời luật sư riêng cùng lên trụ sở Cục C02 tại 47 Phạm Văn Đồng làm việc trực tiếp với cán bộ?",
        "callerResponse": "Anh dám báo cho người ngoài à? Vụ án này thuộc danh mục Tối mật, anh mà tiết lộ thông tin cho luật sư hay người nhà thì cả gia đình anh bị khởi tố tội Không tố giác tội phạm!",
        "revealedClue": "ĐIỂM GÃY TÂM LÝ: Kẻ lừa đảo cố tình đe dọa cô lập nạn nhân, cấm liên hệ người thân và luật sư nhằm dễ bề thao túng tâm lý sợ hãi."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": true,
        "feedback": "Đỉnh cao bản lĩnh! Đập tan chiêu trò dọa nạt của \"Thượng úy Campuchia\"! Nghe nhắc đến luật tố tụng là kẻ lừa đảo rén ngang rồi cúp máy. Dọa dân có kiến thức thì chỉ có nước \"tắt đài\"!"
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Pha xử lý dũng cảm! Bạn tuyên bố sẽ ra ngay Công an phường sở tại xác minh khiến kẻ gian biết đã gặp \"thợ săn lừa đảo\" và tự động rút lui."
      },
      "cooperate": {
        "isCorrect": false,
        "feedback": "Mắc bẫy nghẹt thở! 20 triệu bay màu sau vài câu quát nạt! Nhớ kỹ bài học sống còn: Công an thật KHÔNG BAO GIỜ gọi điện bắt chuyển tiền vào bất kỳ tài khoản nào để \"thanh tra\"!"
      }
    },
    "lesson": "Cơ quan Công an, Viện kiểm sát KHÔNG BAO GIỜ làm việc, lấy lời khai hay tống đạt lệnh bắt qua điện thoại/Zalo. Tuyệt đối không có cái gọi là \"tài khoản an toàn\" hay \"tài khoản phong tỏa của cơ quan điều tra\".",
    "tactic": "Giả danh Cơ quan Thực thi Pháp luật & Đe dọa Tống tiền"
  },
  {
    "id": 4,
    "callerName": "Bưu tá Giao Hàng Tiết Kiệm",
    "callerNumber": "0934 512 xxx • Số cá nhân",
    "callerTag": "Thuê bao di động Viettel nội mạng",
    "isRealAlert": true,
    "avatar": "📦",
    "story": "Anh shipper gọi điện thông báo đang đứng trước cổng giao kiện hàng quần áo bạn đặt trên Shopee hôm qua, giọng thở hổn hển giữa trưa nắng chang chang.",
    "dialogue": [
      "Alo anh ơi, em là shipper GHTK đây ạ! Trời nắng chang chang 40 độ mà em đứng dưới sảnh tòa nhà gọi 3 cuộc mới được nè anh!",
      "Có đơn áo sơ mi 85.000đ tiền ship COD anh đặt hôm qua, anh xuống sảnh kiểm tra hộp hàng nhận giúp em với, em chạy tuyến tiếp theo không trễ giờ mất!",
      "Nếu anh đang bận họp thì em gửi bác bảo vệ tòa nhà rồi anh quét mã QR in trên tem dán hộp hàng thanh toán sau cũng được ạ."
    ],
    "lookupData": {
      "carrier": "Mạng di động Viettel cá nhân",
      "networkActivity": "Kích hoạt: 4 năm • 75 cuộc gọi ngắn/ngày phục vụ giao nhận",
      "registeredOwner": "TRAN DINH TRUNG",
      "audioForensics": "Chỉ số méo hài THD: 2.1% • Tạp âm nền biến thiên tự nhiên: tiếng gió, còi xe máy đường phố"
    },
    "trapQuestions": [
      {
        "label": "Hỏi xem có gửi đường link SMS nào để xác nhận đơn không",
        "question": "Anh có gửi đường link nào qua tin nhắn SMS bắt em bấm vào để kích hoạt đơn không anh?",
        "callerResponse": "Trời ơi link gì anh ơi, em cầm hộp hàng tận tay đứng dưới sảnh đây nè! Bưu cục cấm shipper gửi link bậy bạ, anh xuống xem hàng rồi đưa tiền mặt hoặc quét mã QR trên hộp là xong thôi ạ!",
        "revealedClue": "DẤU HIỆU CHUẨN MỰC: Shipper chân chính giao hàng vật lý tận nơi, không bao giờ gửi link SMS đòi truy cập hay đối soát."
      },
      {
        "label": "Đối chiếu 4 số cuối mã vận đơn in trên gói hàng",
        "question": "Anh đọc giúp em 4 số cuối mã bưu kiện in trên tem với ạ?",
        "callerResponse": "Dạ mã đơn của anh là GHTK-VN-8842, đúng tên anh và số điện thoại này luôn nha anh.",
        "revealedClue": "DẤU HIỆU CHÍNH XÁC: Khớp đúng mã vận đơn, thông tin bưu kiện và địa chỉ nhận hàng thực tế trên ứng dụng mua sắm."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": false,
        "feedback": "Tội nghiệp anh shipper quá! Người ta giao hàng thật giữa trưa nắng mà bạn cúp máy chặn số là đơn hàng bị hoàn trả về bưu cục đấy."
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Rất cẩn thận! Bạn kiểm tra lại mã vận đơn trên ứng dụng mua sắm trước khi xuống nhận và thanh toán."
      },
      "cooperate": {
        "isCorrect": true,
        "feedback": "Xử lý quá chuẩn! Xuống nhận hàng kiểm tra hộp nguyên vẹn và thanh toán tiền mặt là quy trình mua sắm an toàn 100%."
      }
    },
    "lesson": "Khi nhận cuộc gọi giao hàng, kiểm tra mã vận đơn trên app mua sắm, nhận hàng trực tiếp tại cổng. Tuyệt đối không bấm vào bất kỳ link SMS nào tự xưng là bưu tá đối soát.",
    "tactic": "Giao dịch Vận chuyển Hàng hóa Thực tế"
  },
  {
    "id": 5,
    "callerName": "Cán bộ Kỹ thuật Cổng Dịch vụ công",
    "callerNumber": "0898 442 xxx • Số di động lạ",
    "callerTag": "Thuê bao di động cá nhân (0903 xxx)",
    "avatar": "💻",
    "story": "Người gọi tự xưng chuyên viên kỹ thuật Cổng Dịch vụ công Quốc gia, giọng nữ ngọt ngào tận tâm nhưng liên tục giục giã cài app vá lỗi VNeID mức 2.",
    "dialogue": [
      "Dạ em chào anh ạ, em gọi từ Cổng Dịch vụ công Quốc gia để hỗ trợ định danh mức 2. Hồ sơ CCCD của anh bị sai lệch thông tin bảo hiểm y tế, trong 24h tới nếu không cập nhật sẽ bị khóa mã định danh toàn quốc ạ.",
      "Vì máy chủ trên web đang bảo trì nghẽn mạng, em gửi anh đường link tải bản vá tệp DichVuCong_VNeID.apk qua Zalo cho anh nhé.",
      "Anh cài xong nhớ bấm Cấp quyền Trợ năng (Accessibility) để hệ thống tự động đồng bộ vân tay và quét khuôn mặt xác thực online nhé!"
    ],
    "lookupData": {
      "carrier": "Mạng di động MobiFone trả trước",
      "networkActivity": "Kích hoạt: 48 giờ trước • 65 cuộc gọi đi liên tục trong sáng nay",
      "registeredOwner": "NGUYEN THI THAO",
      "audioForensics": "Chỉ số méo hài THD: 5.6% • Âm thanh nền có tạp âm gõ bàn phím biên độ không đổi lặp lại liên tục"
    },
    "trapQuestions": [
      {
        "label": "Đòi ra trực tiếp Công an phường làm lại định danh",
        "question": "Tôi ra thẳng Công an phường gần nhà làm lại định danh mức 2 được không chị?",
        "callerResponse": "Dạ trên phường máy chủ đang mất điện không tiếp dân đâu anh ơi! Anh cài file app này mất đúng 2 phút tại nhà là xong, không làm online là bị khóa CCCD đấy ạ!",
        "revealedClue": "LỘ MẶT GIAN LẬN: Kẻ gian tìm mọi cách ngăn cản người dân đến trụ sở công quyền vì sợ bị công an phát hiện, ép nạn nhân phải cài file APK ngay lập tức."
      },
      {
        "label": "Hỏi tại sao ứng dụng không có trên Google Play / App Store",
        "question": "Ủa sao ứng dụng của Nhà nước mà không có trên Google Play/App Store mà phải tải file .apk ngoài web?",
        "callerResponse": "Dạ đây là bản vá lỗi nội bộ chuyên biệt cho các tài khoản bị lỗi hệ thống, kho ứng dụng chưa kịp duyệt cập nhật anh ơi!",
        "revealedClue": "BẪY MÃ ĐỘC NGUY HIỂM: Cơ quan nhà nước KHÔNG BAO GIỜ phát hành ứng dụng qua file .apk trôi nổi trên mạng."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": true,
        "feedback": "Bắt thóp \"nữ quái\" cài mã độc xuất sắc! Quyền Trợ năng (Accessibility) chính là \"chìa khóa vàng\" giúp hacker theo dõi màn hình, đọc trộm mã OTP và tự bấm chuyển sạch tiền trong app ngân hàng!"
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Rất tỉnh táo! Bạn nói sẽ ra công an phường kiểm tra khiến đối tượng biết đã gặp người có hiểu biết và lập tức cúp máy."
      },
      "cooperate": {
        "isCorrect": false,
        "feedback": "Thảm họa điện thoại \"ma\"! Cấp quyền Trợ năng cho file .apk lạ đồng nghĩa với việc bạn giao toàn bộ điện thoại cho hacker điều khiển từ xa. Tài khoản ngân hàng sẽ bị vét sạch trong tích tắc!"
      }
    },
    "lesson": "Ứng dụng chính phủ VNeID CHỈ phát hành trên Google Play và Apple App Store. Tuyệt đối không tải file .apk hoặc cấp quyền Trợ năng (Accessibility) cho ứng dụng ngoài kho chính thức.",
    "tactic": "Cài cắm Mã độc Chiếm quyền Điều khiển (.APK Trojan)"
  },
  {
    "id": 6,
    "callerName": "Giáo viên Thể dục Trường THPT",
    "callerNumber": "0912 884 xxx • Số khẩn cấp lạ",
    "callerTag": "Thuê bao di động cá nhân (0912 xxx)",
    "avatar": "🚑",
    "story": "Giọng nói hớt hải, hoảng loạn tột cùng thông báo con bạn vừa ngã từ tầng 3 trường học vỡ hộp sọ đang cấp cứu nguy kịch tại bệnh viện.",
    "dialogue": [
      "Alo! Chị có phải mẹ cháu Nam lớp 8B không?! Thầy là giáo viên trường đây! Cháu Nam vừa bị ngã từ tầng 3 xuống gãy xương đùi, chấn thương sọ não đang hôn mê sâu!",
      "Xe cấp cứu 115 vừa đưa vào Bệnh viện Chợ Rẫy, bác sĩ trưởng khoa bảo phải mổ cấp cứu gấp trong 15 phút không thì xuất huyết nguy kịch tính mạng!",
      "Bệnh viện yêu cầu chuyển tạm ứng 35 triệu vào tài khoản cá nhân của bác sĩ mổ này để ký giấy lên bàn mổ ngay, chị chuyển gấp đi kẻo con không qua khỏi!"
    ],
    "lookupData": {
      "carrier": "Mạng di động VinaPhone trả trước",
      "networkActivity": "Kích hoạt: 25 ngày • 8 cuộc gọi đi dồn dập trong 30 phút qua",
      "registeredOwner": "LE DUC MANH",
      "audioForensics": "Chỉ số méo hài THD: 8.2% • Tạp âm còi cấp cứu có biên độ tần số cố định lặp lại chu kỳ 1.6s từ nguồn phát phụ"
    },
    "trapQuestions": [
      {
        "label": "Kiểm tra tên cô giáo chủ nhiệm và vị trí lớp học",
        "question": "Thầy cho em hỏi cô giáo chủ nhiệm của cháu tên gì và cháu đang học phòng nào ạ?",
        "callerResponse": "Giờ này con chị sắp chết đến nơi rồi mà chị còn vặn vẹo hỏi tên cô giáo à?! Không chuyển tiền ngay là cháu có mệnh hệ gì chị ân hận cả đời đấy!",
        "revealedClue": "LỘ TẨY TÂM LÝ: Kẻ gian không trả lời được thông tin cơ bản của học sinh, lập tức dùng tính mạng đe dọa để ép chuyển tiền trong cơn hoảng loạn."
      },
      {
        "label": "Đề nghị gọi số máy bàn phòng Cấp cứu bệnh viện để đóng viện phí",
        "question": "Thầy cho em số máy bàn phòng cấp cứu bệnh viện để em gọi kế toán đóng tiền viện phí trực tiếp qua cổng bệnh viện?",
        "callerResponse": "Gọi máy bàn làm thủ tục hành chính lâu lắm con chị chết mất! Chuyển khoản ngay vào số bác sĩ mổ mới được đưa vào phòng phẫu thuật!",
        "revealedClue": "BẮT BÀI LỪA ĐẢO: Bệnh viện luôn có quy trình cấp cứu ưu tiên tính mạng người bệnh trước, viện phí làm thủ tục sau; không bao giờ bác sĩ dùng tài khoản cá nhân đòi tiền mổ khẩn cấp."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": true,
        "feedback": "Bản lĩnh thép! Thủ đoạn \"con đang cấp cứu mổ gấp\" là kịch bản tàn nhẫn nhất đánh vào tình mẫu tử. Bệnh viện luôn cứu người trước rồi mới tính viện phí, không bao giờ đòi chuyển khoản cá nhân bác sĩ!"
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Chuẩn xác tuyệt đối! Giữ bình tĩnh, dùng điện thoại khác gọi ngay cho giáo viên chủ nhiệm hoặc ban giám hiệu để kiểm tra tình hình thực tế."
      },
      "cooperate": {
        "isCorrect": false,
        "feedback": "Sập bẫy tâm lý sợ hãi! Hàng trăm phụ huynh đã mất từ 30 đến 100 triệu vì chiêu trò \"con đang cấp cứu mổ gấp\" này trong khi con vẫn đang ngồi học an toàn tại lớp!"
      }
    },
    "lesson": "Khi nhận tin dữ về người thân, hãy hít thở sâu, gọi ngay cho nhà trường hoặc người thân để đối chứng. Bệnh viện công lập không bao giờ thu tiền mổ cấp cứu qua tài khoản cá nhân của bác sĩ.",
    "tactic": "Thao túng Nỗi đau Gia đình & Khẩn cấp Giả tạo"
  },
  {
    "id": 7,
    "callerName": "Đại úy Nguyễn Văn Hưng - CSKV",
    "callerNumber": "024 3852 xxxx • Số bàn Công an phường",
    "callerTag": "Điện thoại cố định cơ quan (024 3791 xxxx)",
    "isRealAlert": true,
    "avatar": "👮",
    "story": "Cảnh sát khu vực gọi bằng số điện thoại bàn của Công an phường mời bạn lên trụ sở đối soát thông tin sổ hộ khẩu điện tử, giọng nói từ tốn, chuẩn mực.",
    "dialogue": [
      "Chào anh/chị, tôi là Đại úy Nguyễn Văn Hưng, Cảnh sát khu vực phụ trách tổ dân phố 12 phường Dịch Vọng Hậu.",
      "Sáng mai từ 8h30 đến 11h, mời anh/chị mang theo CCCD gắn chip bản gốc lên trực tiếp phòng tiếp dân Công an phường để đối soát thông tin cư trú phục vụ số hóa hồ sơ.",
      "Công an phường làm việc trực tiếp tại trụ sở, không yêu cầu làm việc qua mạng, không gửi link và không thu bất kỳ khoản phí nào."
    ],
    "lookupData": {
      "carrier": "Mạng điện thoại cố định PSTN VNPT Hà Nội",
      "networkActivity": "Kích hoạt: 12 năm • Cố định tại trạm viễn thông Cầu Giấy",
      "registeredOwner": "CONG AN PHUONG DICH VONG HAU",
      "audioForensics": "Chỉ số méo hài THD: 0.9% • Tín hiệu thoại tương tự chuẩn, tạp âm hội trường trụ sở và tiếng loa địa phương xa"
    },
    "trapQuestions": [
      {
        "label": "Hỏi xem có gửi ảnh CCCD qua Zalo được không",
        "question": "Em có thể chụp ảnh CCCD gửi qua Zalo cho anh đỡ phải lên phường được không anh?",
        "callerResponse": "Quy định ngành không cho phép làm việc qua Zalo anh/chị nhé. Mời anh/chị mang giấy tờ gốc đến trụ sở để đối chiếu nhằm bảo mật thông tin cá nhân của bà con.",
        "revealedClue": "DẤU HIỆU CHUẨN MỰC: Cảnh sát khu vực thật từ chối làm việc qua Zalo và tuân thủ đúng quy chế tiếp dân tại trụ sở."
      },
      {
        "label": "Xác nhận địa chỉ trụ sở Công an phường",
        "question": "Dạ trụ sở phường mình nằm ở đoạn nào anh nhỉ?",
        "callerResponse": "Ở số 45 phố Trần Thái Tông, đối diện trường mầm non Dịch Vọng Hậu anh/chị nhé.",
        "revealedClue": "DẤU HIỆU CHUẨN MỰC: Cung cấp chính xác địa chỉ trụ sở vật lý để người dân đến làm việc trực tiếp."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": false,
        "feedback": "Hơi nhầm lẫn rồi! Đây là cuộc gọi mời làm việc hành chính thật từ Công an phường sở tại. Bạn nên tiếp nhận và thu xếp thời gian đến trụ sở."
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Hợp lý! Bạn ghi lại thông tin và gọi lại số máy bàn niêm yết của phường để đối chứng lịch tiếp dân."
      },
      "cooperate": {
        "isCorrect": true,
        "feedback": "Rất chuẩn mực! Đồng ý mang giấy tờ gốc đến làm việc trực tiếp tại trụ sở công quyền là trách nhiệm công dân an toàn."
      }
    },
    "lesson": "Cán bộ công an thật gọi mời làm việc luôn dùng số cố định cơ quan hoặc gặp trực tiếp tại địa bàn, mời đến trụ sở và KHÔNG BAO GIỜ yêu cầu làm việc qua mạng hay chuyển tiền.",
    "tactic": "Thông báo Hành chính Trực tiếp từ Chính quyền"
  },
  {
    "id": 8,
    "callerName": "CSKH Viễn thông Nhà mạng",
    "callerNumber": "059 881 xxxx • Số di động lạ",
    "callerTag": "Thuê bao di động (0598 xxx)",
    "avatar": "📡",
    "story": "Người gọi tự xưng nhân viên chăm sóc khách hàng viễn thông, giọng hối thúc báo tin SIM bạn sắp bị khóa 2 chiều vì chưa chuẩn hóa thông tin thuê bao.",
    "dialogue": [
      "Dạ alo anh, em bên Tổng đài Hỗ trợ Viễn thông quốc gia. Thuê bao của anh nằm trong diện chưa chuẩn hóa thông tin và sẽ bị khóa liên lạc 2 chiều sau đúng 2 giờ nữa!",
      "Em đang hỗ trợ kích hoạt trực tiếp từ xa và tặng anh gói cước tri ân 60GB data 5G tốc độ cao sử dụng trong 3 tháng.",
      "Hệ thống vừa gửi 1 mã xác thực qua tin nhắn SMS, anh đọc nhanh mã số đó giúp em để em hoàn tất mở khóa thuê bao kẻo hết hạn trong 30 giây nhé!"
    ],
    "lookupData": {
      "carrier": "Mạng di động Gmobile trả trước",
      "networkActivity": "Kích hoạt: 18 ngày • Tần suất: 50 cuộc gọi đi/giờ, tỷ lệ đàm thoại dưới 10s đạt 85%",
      "registeredOwner": "BUI VAN QUY",
      "audioForensics": "Chỉ số méo hài THD: 6.4% • Mẫu tín hiệu thoại có cấu trúc ngắt nhịp tương đồng hệ thống Auto-Dialer"
    },
    "trapQuestions": [
      {
        "label": "Kiểm tra nội dung tin nhắn mã số vừa nhận",
        "question": "Tin nhắn vừa gửi về máy tôi ghi tiêu đề là \"Mã OTP thiết lập lại mật khẩu Zalo/VNeID\" mà, sao em bảo mã nâng cấp SIM?",
        "callerResponse": "Dạ đấy là do cổng viễn thông mượn giao thức bảo mật đối tác thôi anh, anh đọc nhanh mã đi kẻo hết hạn trong 30 giây là bị khóa SIM luôn đó!",
        "revealedClue": "BẮT BÀI CHIẾM ĐOẠT: Kẻ gian yêu cầu \"quên mật khẩu\" tài khoản mạng xã hội hoặc ví điện tử của bạn và dụ bạn đọc OTP để chiếm quyền đăng nhập."
      },
      {
        "label": "Đề nghị đổi SIM tại quầy giao dịch chính hãng",
        "question": "Tôi tự ra cửa hàng giao dịch chính thức của nhà mạng đổi SIM được không?",
        "callerResponse": "Ra cửa hàng mất phí 50.000đ và phải xếp hàng cả tiếng đấy anh, kích hoạt qua em chỉ 30 giây là xong miễn phí hoàn toàn!",
        "revealedClue": "BẮT BÀI CHIẾM ĐOẠT: Ngăn cản ra quầy chính hãng vì ra quầy sẽ bị nhân viên viễn thông lật tẩy ngay thủ đoạn."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": true,
        "feedback": "Xuất sắc! Tuyệt đối không đọc mã OTP cho bất kỳ ai. Đọc mã OTP cho kẻ gian đồng nghĩa với việc bạn chính tay giao tài khoản Zalo, Telegram, ví điện tử cho tội phạm!"
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Đúng đắn! Gọi trực tiếp tổng đài chính thức nhà mạng (18008098 / 18001091) để kiểm tra tình trạng thuê bao."
      },
      "cooperate": {
        "isCorrect": false,
        "feedback": "Mắc bẫy nguy hiểm! Kẻ gian chiếm quyền Zalo/SIM để nhắn tin mượn tiền toàn bộ danh bạ bạn bè người thân của bạn trong vòng 5 phút!"
      }
    },
    "lesson": "Nhà mạng KHÔNG BAO GIỜ gọi điện bảo khách đọc mã OTP gửi về máy để \"nâng cấp SIM 5G\" hay \"chuẩn hóa thuê bao\". Mọi thủ tục SIM đều làm tại quầy giao dịch chính thống.",
    "tactic": "Chiếm đoạt Mã OTP qua Bẫy Nâng cấp SIM"
  },
  {
    "id": 9,
    "callerName": "Y tá Trạm Y tế Phường",
    "callerNumber": "028 3910 xxxx • Số cố định Trạm Y tế",
    "callerTag": "Số cố định cơ sở y tế (028 3822 xxxx)",
    "isRealAlert": true,
    "avatar": "👩‍⚕️",
    "story": "Nhân viên y tế gọi nhắc bạn lịch khám sàng lọc sức khỏe cộng đồng cho người cao tuổi hoặc lịch tiêm chủng, giọng điệu ân cần, gần gũi.",
    "dialogue": [
      "Alo, em chào anh/chị. Em gọi từ Trạm Y tế phường để nhắc lịch khám sức khỏe định kỳ cho các bác trong gia đình mình vào sáng thứ Bảy này ạ.",
      "Sáng thứ Bảy từ 7h30 anh/chị nhớ đưa bác đến trạm y tế nhé. Nhớ dặn bác nhịn ăn sáng để làm xét nghiệm máu và mang theo thẻ BHYT bản cứng ạ.",
      "Chương trình này thuộc đề án chăm sóc sức khỏe ban đầu của phường, được tài trợ miễn phí 100% không thu tiền gì đâu ạ."
    ],
    "lookupData": {
      "carrier": "Mạng điện thoại cố định Viettel TP.HCM",
      "networkActivity": "Kích hoạt: 9 năm • Cố định tại trạm viễn thông cơ sở",
      "registeredOwner": "TRAM Y TE PHUONG BEN NGHE",
      "audioForensics": "Chỉ số méo hài THD: 1.1% • Tín hiệu chuẩn phòng khám, tạp âm bước chân và thiết bị y tế"
    },
    "trapQuestions": [
      {
        "label": "Hỏi về việc chuyển khoản tiền cọc xét nghiệm trước",
        "question": "Em có phải chuyển khoản tiền cọc thuốc men hay xét nghiệm trước không chị?",
        "callerResponse": "Dạ không hề anh/chị ơi! Đề án này do ngân sách y tế thành phố chi trả toàn bộ, bà con đi khám không mất một đồng nào cả ạ.",
        "revealedClue": "DẤU HIỆU CHUẨN MỰC: Chương trình y tế công cộng minh bạch, hoàn toàn miễn phí, không yêu cầu chuyển tiền."
      },
      {
        "label": "Xác nhận vị trí Trạm Y tế phường",
        "question": "Dạ địa chỉ Trạm Y tế mình ở đâu chị nhỉ?",
        "callerResponse": "Dạ ở số 12 đường Hoàng Hoa Thám, ngay cạnh trụ sở Ủy ban nhân dân phường mình đó ạ.",
        "revealedClue": "DẤU HIỆU CHUẨN MỰC: Địa chỉ cụ thể, nằm liền kề trụ sở chính quyền địa phương."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": false,
        "feedback": "Hơi nhạy cảm quá rồi! Đây là cuộc gọi y tế chính thống nhắc bạn đưa người nhà đi kiểm tra sức khỏe định kỳ miễn phí."
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Hợp lý! Bạn ghi lại lịch hẹn và kiểm tra đối chiếu thông báo trên bảng tin tổ dân phố."
      },
      "cooperate": {
        "isCorrect": true,
        "feedback": "Xuất sắc! Lắng nghe dặn dò chuyên môn (nhịn ăn sáng, mang BHYT) và sắp xếp thời gian đưa người thân đi khám đúng hẹn."
      }
    },
    "lesson": "Các cơ sở y tế công lập gọi nhắc lịch khám chỉ hướng dẫn thủ tục y tế, không bao giờ gửi link lạ hay đòi chuyển tiền trước.",
    "tactic": "Dịch vụ Y tế Cộng đồng Chính thống"
  },
  {
    "id": 10,
    "callerName": "CSKH Sàn Thương mại Điện tử",
    "callerNumber": "024 7779 xxxx • Đầu số ảo tổng đài",
    "callerTag": "Đầu số tổng đài (024 7779 xxxx)",
    "avatar": "🛒",
    "story": "Người gọi thông báo bưu tá giao nhầm đơn và lỡ kích hoạt gói Hội viên VIP tự động trừ 3.500.000đ/tháng trên tài khoản ngân hàng của bạn.",
    "dialogue": [
      "Dạ em chào anh, em là nhân viên hỗ trợ khiếu nại sàn TMĐT Shopee. Do bưu tá sơ suất khi quét mã hoàn đơn, hệ thống đã ghi nhận tài khoản anh lên gói Hội viên VIP Kim Cương!",
      "Gói này sẽ tự động trừ 3.500.000đ vào 12h đêm nay qua thẻ ngân hàng liên kết!",
      "Để hủy lệnh trừ tiền khẩn cấp, em gửi anh đường link Cổng đối soát tài chính qua Zalo, anh nhập 16 số thẻ và 3 số bí mật CVV mặt sau để hệ thống hủy trừ tiền ngay nhé!"
    ],
    "lookupData": {
      "carrier": "Đầu số cố định ảo qua trung kế số Cloud VoIP",
      "networkActivity": "Kích hoạt: 3 tháng • Lưu lượng: 120 cuộc gọi tự động một chiều/ngày",
      "registeredOwner": "CONG TY TNHH DICH VU TRUYEN THONG ASIA",
      "audioForensics": "Chỉ số méo hài THD: 7.1% • Codec nén G.729 qua đám mây, độ trễ Jitter dao động 85ms"
    },
    "trapQuestions": [
      {
        "label": "Hỏi tại sao hủy gói trên sàn mà lại đòi 3 số CVV bí mật sau thẻ",
        "question": "Tại sao hủy đơn hàng trên sàn mà lại bắt tôi nhập số CVV bí mật trên thẻ ngân hàng?",
        "callerResponse": "Đây là quy chuẩn mã hóa liên ngân hàng anh ơi! Anh không nhập thì 12h đêm nay hệ thống sẽ tự động trừ 3.5 triệu trong thẻ của anh!",
        "revealedClue": "LỘ BẢN CHẤT LỪA ĐẢO: Số CVV là mã bảo mật thanh toán quốc tế. Bất kỳ ai có số thẻ và CVV đều có thể quẹt tiền mua hàng trực tuyến mà không cần OTP!"
      },
      {
        "label": "Đề nghị tự vào ứng dụng Shopee bấm hủy trong Cài đặt",
        "question": "Tôi tự vào app sàn TMĐT bấm hủy trên phần cài đặt tài khoản được không?",
        "callerResponse": "Lỗi này thuộc về cổng thanh toán độc lập, trên app không hiển thị đâu, phải thao tác qua link đối soát em gửi mới kịp hủy anh nhé!",
        "revealedClue": "LỘ BẢN CHẤT LỪA ĐẢO: Dụ nạn nhân rời khỏi nền tảng chính thức để dẫn dụ vào trang web giả mạo câu trộm thông tin thẻ (Phishing)."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": true,
        "feedback": "Chuẩn xác tuyệt đối! Sàn TMĐT không bao giờ có gói tự trừ tiền kiểu này và KHÔNG BAO GIỜ đòi hỏi 3 số bí mật CVV mặt sau thẻ. Giữ chặt mã CVV là giữ chặt két tiền!"
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Rất tốt! Bạn chủ động mở app Shopee kiểm tra hoặc liên hệ tổng đài hỗ trợ chính thức trên app."
      },
      "cooperate": {
        "isCorrect": false,
        "feedback": "Nguy hiểm nghiêm trọng! Nhập số thẻ và CVV vào link giả mạo sẽ khiến kẻ gian quẹt sạch hạn mức thẻ tín dụng của bạn tại các cổng thanh toán quốc tế trong tích tắc!"
      }
    },
    "lesson": "3 chữ số CVV/CVC mặt sau thẻ ngân hàng là chìa khóa rút tiền. Tuyệt đối không nhập CVV vào bất kỳ đường link nào nhận qua tin nhắn hay điện thoại.",
    "tactic": "Đánh cắp Thông tin Thẻ Tín dụng (CVV Phishing)"
  },
  {
    "id": 11,
    "callerName": "Tuyển dụng Việc làm Online Shopee/Lazada",
    "callerNumber": "079 321 xxxx • Số quay tự động",
    "callerTag": "Thuê bao di động (0794 xxx)",
    "avatar": "💼",
    "story": "Mời bạn tham gia công việc \"đánh giá vote 5 sao sản phẩm, giật đơn hàng online nhận hoa hồng 15-20% kiếm 500k-2tr/ngày\", giọng điệu ngọt ngào rót mật vào tai.",
    "dialogue": [
      "Chào bạn, bên mình đang tuyển gấp cộng tác viên làm việc tại nhà cho sàn TMĐT Shopee/Lazada, ngày kiếm 500k đến 2 triệu cực kỳ nhẹ nhàng!",
      "Nhiệm vụ chỉ cần ngồi lướt điện thoại bấm like video TikTok và thả tim sản phẩm. Mỗi đơn hoàn thành nhận hoa hồng 15-20% rút tiền về tài khoản ngân hàng sau 3 phút!",
      "Đơn đầu tiên chỉ cần làm thử 100k là có tiền thưởng liền tay nè bạn, làm càng nhiều đơn lớn tiền hoa hồng càng cao!"
    ],
    "lookupData": {
      "carrier": "Mạng di động Vietnamobile trả trước",
      "networkActivity": "Kích hoạt: 14 ngày • Lưu lượng: 180 cuộc gọi đi phát tán trong ngày",
      "registeredOwner": "HOANG VAN TU",
      "audioForensics": "Chỉ số méo hài THD: 9.3% • Tần số phát âm đoạn đầu có mẫu biên độ trùng khớp với bản ghi phát lại"
    },
    "trapQuestions": [
      {
        "label": "Hỏi về hợp đồng lao động và mã số thuế doanh nghiệp",
        "question": "Công ty tuyển dụng có hợp đồng lao động và mã số thuế doanh nghiệp không bạn?",
        "callerResponse": "Công việc online tự do linh hoạt kiếm thêm thu nhập, rút tiền theo từng đơn ngay trong ngày thì cần gì hợp đồng rườm rà bạn ơi!",
        "revealedClue": "BẪY TIỀN ẢO PONZI: Các đường dây lừa đảo nhiệm vụ đơn hàng không bao giờ có pháp nhân hay hợp đồng hợp pháp."
      },
      {
        "label": "Hỏi tại sao người làm việc lại phải tự bỏ tiền túi chuyển trước",
        "question": "Tại sao làm công việc đánh giá sản phẩm mà lại bắt người lao động tự bỏ tiền túi chuyển khoản trước?",
        "callerResponse": "Đây là tiền tạo đơn thanh khoản ảo giúp shop tăng thứ hạng, hệ thống của sàn tự động hoàn tiền và cộng thêm hoa hồng ngay lập tức bạn yên tâm!",
        "revealedClue": "BẪY TIỀN ẢO PONZI: 1-2 đơn đầu vài trăm nghìn chúng sẽ trả tiền thật để lấy lòng tin. Đến khi nạp 20-50 triệu, chúng sẽ viện cớ \"sai cú pháp\", \"kẹt lệnh\" để chiếm đoạt toàn bộ."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": true,
        "feedback": "Cắt đứt giấc mộng \"việc nhẹ lương cao\" xuất sắc! Đơn 100k chúng cho bạn rút thật để \"thả con tép\", đến khi bạn nạp 20-50 triệu thì chúng \"bắt con tôm\" rồi khóa nick biến mất."
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Rất tốt! Dừng lại tìm hiểu các cảnh báo trên báo đài về chiêu trò lừa việc làm online nạp tiền giật đơn ảo."
      },
      "cooperate": {
        "isCorrect": false,
        "feedback": "Bạn đã sập bẫy tham lam! Kẻ gian sẽ trả tiền thật vài đơn nhỏ đầu tiên, sau đó dụ bạn nạp số tiền lớn vào nhóm Telegram rồi chặn liên lạc vĩnh viễn!"
      }
    },
    "lesson": "Không có công việc nào \"việc nhẹ lương cao\", chỉ ngồi bấm điện thoại giật đơn hàng mà kiếm tiền triệu mỗi ngày. Tuyệt đối không chuyển tiền làm nhiệm vụ online.",
    "tactic": "Bẫy Lừa đảo Việc làm Online & Nhiệm vụ Đơn hàng Ảo"
  },
  {
    "id": 12,
    "callerName": "Ban Tổ chức Tri ân Khách hàng",
    "callerNumber": "0865 992 xxx • Đầu số lạ",
    "callerTag": "Thuê bao di động (0356 xxx)",
    "avatar": "🎁",
    "story": "Giọng điệu hào hứng tột độ chúc mừng số điện thoại của bạn đã may mắn trúng giải Đặc biệt xe máy Honda SH 150i trị giá 110 triệu đồng kèm sổ tiết kiệm.",
    "dialogue": [
      "Xin chúc mừng thuê bao của anh đã may mắn trúng giải Đặc biệt trong chương trình Vòng quay may mắn tri ân khách hàng năm 2026!",
      "Phần thưởng của anh là 1 xe máy Honda SH 150i ABS kèm sổ tiết kiệm 30.000.000đ!",
      "Để xe được vận chuyển bàn giao về tận nhà trong 48 giờ tới, anh chỉ cần thanh toán trước 10% thuế trước bạ và phí đăng kiểm là 8.500.000đ vào tài khoản Ban tổ chức!"
    ],
    "lookupData": {
      "carrier": "Mạng di động Viettel trả trước",
      "networkActivity": "Kích hoạt: 24 giờ trước • 100% cuộc gọi đi một chiều, không nhận cuộc gọi đến",
      "registeredOwner": "HOANG TRONG NGHIA",
      "audioForensics": "Chỉ số méo hài THD: 7.8% • Dải tần nền xuất hiện chu kỳ tiếng vỗ tay lặp lại cố định 3.5s"
    },
    "trapQuestions": [
      {
        "label": "Hỏi về việc chưa từng tham gia quay số trúng thưởng nào",
        "question": "Tôi chưa từng mua sắm hay đăng ký tham gia chương trình quay thưởng nào, sao lại trúng?",
        "callerResponse": "Hệ thống quay số ngẫu nhiên trên toàn bộ thuê bao di động toàn quốc nhân dịp kỷ niệm 20 năm thành lập tập đoàn anh ạ!",
        "revealedClue": "LỘ BẢN CHẤT LỪA ĐẢO: Luật Thương mại Việt Nam quy định mọi chương trình khuyến mại trúng thưởng đều phải đăng ký với Bộ Công Thương và có danh sách công khai."
      },
      {
        "label": "Đề nghị trừ thẳng phí vào giá trị giải thưởng sổ tiết kiệm",
        "question": "Tôi đồng ý nhận xe, anh cứ trừ 8.5 triệu phí trước bạ vào sổ tiết kiệm 30 triệu trúng thưởng rồi trao xe cho tôi?",
        "callerResponse": "Không được anh ơi! Quy định tài chính nhà nước bắt buộc người trúng phải nộp tiền phí riêng qua tài khoản thủ quỹ mới được xuất xe khỏi kho!",
        "revealedClue": "LỘ BẢN CHẤT LỪA ĐẢO: Kẻ lừa đảo chỉ nhắm đến số tiền 8.5 triệu phí nộp trước của nạn nhân; không hề có chiếc xe máy nào tồn tại."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": true,
        "feedback": "Tuyệt vời! Bẫy \"Trúng thưởng xe SH đòi nộp phí trước bạ\" là chiêu trò kinh điển. Khi bạn chuyển 8.5 triệu xong, chúng sẽ tiếp tục đòi \"phí bôi trơn\", \"phí vận chuyển\" cho đến khi bạn cạn túi."
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Hợp lý! Bạn yêu cầu gửi văn bản xác nhận của Bộ Công Thương hoặc đến trực tiếp trụ sở tập đoàn đối chiếu."
      },
      "cooperate": {
        "isCorrect": false,
        "feedback": "Sập bẫy tham lam! Bạn đã chuyển tiền cho kẻ lừa đảo và sẽ không bao giờ nhận được xe hay tiền hoàn lại."
      }
    },
    "lesson": "Không có bữa trưa nào miễn phí. Nếu bạn không tham gia dự thưởng mà tự nhiên được báo trúng xe sang, 100% là bẫy lừa đảo đòi nộp phí trước.",
    "tactic": "Bẫy Lừa đảo Trúng thưởng & Đòi nộp Tiền phí Trước"
  },
  {
    "id": 13,
    "callerName": "Tổng đài Chăm sóc Khách hàng Điện lực EVN",
    "callerNumber": "028 7779 88xx • Đầu số VoIP ảo",
    "callerTag": "Đầu số dịch vụ (028 9999 xxxx)",
    "avatar": "⚡",
    "story": "Giọng đọc tự động đe dọa căn hộ của bạn đang nợ tiền điện 2.850.000đ và lệnh cắt điện khẩn cấp sẽ được thi hành sau 2 giờ nếu không chuyển tiền ngay.",
    "dialogue": [
      "Alo! Trung tâm Thu hồi nợ cước Tổng công ty Điện lực xin thông báo: Hợp đồng điện sinh hoạt tại địa chỉ của quý khách đang nợ tiền điện kỳ trước là 2.850.000đ!",
      "Lệnh cắt điện tự động sẽ được thi hành sau đúng 2 giờ nữa nếu quý khách không hoàn tất nghĩa vụ thanh toán!",
      "Để hủy lệnh cắt điện khẩn cấp và không bị phạt 1.500.000đ phí hòa lưới, quý khách vui lòng chuyển khoản trực tiếp ngay vào số tài khoản đối soát đặc biệt của cán bộ thanh tra!"
    ],
    "lookupData": {
      "carrier": "Trung kế ảo SIP Trunking đầu số 028",
      "networkActivity": "Phát tán: Hơn 160 cuộc gọi tự động ghi âm sẵn trong buổi sáng",
      "registeredOwner": "CONG TY TNHH TRUYEN THONG A CHAU",
      "audioForensics": "Chỉ số méo hài THD: 11.2% • Tần số cơ bản F0 phẳng tuyệt đối (Đặc trưng đọc máy Text-to-Speech), ngắt nghỉ cố định 120ms"
    },
    "trapQuestions": [
      {
        "label": "Hỏi Mã khách hàng sử dụng điện (Mã PE) trên hóa đơn",
        "question": "Dạ cho em hỏi Mã khách hàng sử dụng điện (Mã PE) ghi trên công tơ nhà em là số mấy ạ?",
        "callerResponse": "Hệ thống điện lực đang khóa do nợ cước nên tôi không xem chi tiết được! Anh/chị phải thanh toán ngay trước 2 tiếng rồi mang biên lai ra phòng giao dịch đối chiếu sau!",
        "revealedClue": "LỘ BẢN CHẤT LỪA ĐẢO: Nhân viên Điện lực chính thống luôn tra cứu được chính xác Mã PE và tên chủ hợp đồng. Kẻ gian gọi tự động hàng loạt hoàn toàn không có dữ liệu thật!"
      },
      {
        "label": "Đề nghị ra phòng giao dịch Điện lực quận đóng tiền mặt",
        "question": "Dạ để em chạy ra quầy giao dịch Điện lực quận đóng tiền mặt trực tiếp cho an tâm được không ạ?",
        "callerResponse": "Không kịp đâu anh/chị ơi! Chạy ra quầy làm thủ tục là bên kỹ thuật đã ngắt điện rồi! Phải chuyển khoản ngay vào số tài khoản đối soát này để giữ điện sinh hoạt!",
        "revealedClue": "LỘ BẢN CHẤT LỪA ĐẢO: Điện lực EVN không bao giờ ép khách hàng chuyển khoản vào tài khoản cá nhân và luôn khuyến khích thanh toán qua App EVN chính thức."
      }
    ],
    "verdicts": {
      "hangup": {
        "isCorrect": true,
        "feedback": "Rất chính xác! EVN chỉ gửi thông báo qua SMS định danh (Brandname EVN) hoặc ứng dụng chính thức, không gọi điện dọa cắt điện đột ngột và KHÔNG BAO GIỜ yêu cầu chuyển tiền vào tài khoản cá nhân."
      },
      "delay": {
        "isCorrect": true,
        "feedback": "Xử lý chuẩn xác! Bạn dừng cuộc gọi để mở App CSKH EVN hoặc gọi tổng đài 19001006 / 19006769 của Điện lực để tra cứu hóa đơn."
      },
      "cooperate": {
        "isCorrect": false,
        "feedback": "Mắc bẫy lừa đảo! Kẻ gian lợi dụng tâm lý lo sợ bị cúp điện sinh hoạt để ép bạn chuyển tiền vào tài khoản của chúng."
      }
    },
    "lesson": "Ngành Điện lực không thu tiền qua số tài khoản cá nhân và không gọi điện dọa cắt điện trong vài giờ. Luôn tra cứu hóa đơn qua website hoặc ứng dụng CSKH EVN chính thức.",
    "tactic": "Mạo danh Điện lực dọa cắt điện khẩn cấp để cưỡng ép chuyển tiền"
  }
];
let callIdx = 0;
let score = 0;
let lives = 3;
let finished = false;
let currentPhase: 'ringing' | 'in-call' | 'feedback' | 'summary' = 'ringing';
let selectedVerdict: 'hangup' | 'delay' | 'cooperate' | null = null;
let currentIntelTab: 'live' | 'lookup' | 'trap' | 'tip' = 'live';
let askedQuestions: Set<number> = new Set();
let lastAskedIdx: number | null = null;
let callTimer = 0;
let timerInterval: number | null = null;
let sessionId = '';
const history: { call: CallCase; correct: boolean; verdictChoice: string }[] = [];

function container(): HTMLElement {
  const el = document.getElementById('phoneContent') || document.getElementById('phoneAppContent');
  if (!el) throw new Error('#phoneContent not found');
  return el;
}

function stats(): HTMLElement | null {
  return document.getElementById('phoneStats');
}

export function openPhoneGame(): void {
  sessionId = createSessionId();
  callIdx = 0;
  score = 0;
  lives = 3;
  finished = false;
  history.length = 0;
  stats()?.classList.remove('hidden');
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
          Chào mừng Điều tra viên! Bạn sẽ tiếp nhận <b>${CALLS.length} cuộc gọi thời gian thực</b> bao gồm cả bẫy lừa đảo công nghệ cao lẫn thông báo khẩn chính thống.
          <br><br>
          🔍 <b>Nhiệm vụ:</b> Sử dụng kỹ thuật tra cứu viễn thông, tung câu hỏi bẫy đối chất và đưa ra quyết định xử lý an toàn!
        </p>
        <button class="primary-button" data-phone="start-game" style="font-size:15px;padding:12px 28px;">
          Bắt đầu ca trực Hotline (${CALLS.length} cuộc gọi)
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
  currentIntelTab = 'live';
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

  stats()?.classList.add('hidden');
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
                <button class="phone-tool-btn ${currentIntelTab === 'live' ? 'is-active' : ''}" data-phone="tab-live">
                  <span class="tool-icon">📡</span>
                  <span>Giám sát</span>
                </button>
                <button class="phone-tool-btn ${currentIntelTab === 'lookup' ? 'is-active' : ''}" data-phone="tab-lookup">
                  <span class="tool-icon">🔍</span>
                  <span>Tra cứu sóng</span>
                </button>
                <button class="phone-tool-btn ${currentIntelTab === 'trap' ? 'is-active' : ''} ${askedQuestions.size > 0 ? 'is-confronted' : ''}" data-phone="tab-trap">
                  <span class="tool-icon">🎙️</span>
                  <span>Tra vấn bẫy (${askedQuestions.size}/2)</span>
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
            <span class="intel-badge">
              ${currentPhase === 'feedback' ? escapeHtml(call.tactic) : 'Đang giám sát luồng'}
            </span>
          </div>

          <div class="intel-box">
            <strong>Bối cảnh cuộc gọi:</strong>
            <p style="margin-top:4px;">${escapeHtml(call.story)}</p>
          </div>

          ${currentIntelTab === 'live' ? `
            <div class="intel-box" style="border-left:3px solid #10b981;">
              <strong class="intel-title-green">📡 Kênh Giám sát Đàm thoại Trực tiếp:</strong>
              <p style="margin:8px 0;font-size:12.5px;color:var(--home-secondary);line-height:1.6;">
                Đang kết nối đàm thoại trực tiếp với thuê bao. Hãy lắng nghe kỹ từng câu nói của đối phương ở màn hình điện thoại bên trái.
              </p>
              <div class="intel-guide-box">
                💡 <b>Thao tác nghiệp vụ:</b>
                <ul style="margin:6px 0 0;padding-left:18px;">
                  <li>Bấm <b>"Tra cứu sóng"</b> để yêu cầu hệ thống truy xuất dữ liệu kỹ thuật từ nhà mạng & trạm BTS.</li>
                  <li>Bấm <b>"Tra vấn bẫy"</b> để chọn các câu hỏi nghiệp vụ thử phản ứng của người gọi.</li>
                  <li>Đưa ra 1 trong 3 phán quyết: <b>Cúp máy &amp; Khóa số</b>, <b>Hoãn để xác minh</b>, hoặc <b>Tiếp nhận</b>.</li>
                </ul>
              </div>
            </div>
          ` : currentIntelTab === 'lookup' ? `
            <div class="intel-box" style="border-left:3px solid #3b82f6;">
              <strong class="intel-title-blue">Dữ liệu Viễn thông &amp; Trạm phát sóng:</strong>
              <table class="intel-data-table">
                <tr><td>Công nghệ kết nối:</td><td>${escapeHtml(call.lookupData.carrier)}</td></tr>
                <tr><td>Hoạt động thuê bao:</td><td>${escapeHtml(call.lookupData.networkActivity)}</td></tr>
                <tr><td>Chủ thể đăng ký:</td><td>${escapeHtml(call.lookupData.registeredOwner)}</td></tr>
              </table>
              <div class="intel-forensic-box">
                📡 <b>Phân tích tín hiệu &amp; Codec:</b> ${escapeHtml(call.lookupData.audioForensics)}
              </div>
            </div>
          ` : currentIntelTab === 'trap' ? `
            <div class="intel-box" style="border-left:3px solid #f59e0b;">
              <strong class="intel-title-amber">Nghiệp vụ Tra vấn &amp; Bắt bài tâm lý:</strong>
              <p style="margin:6px 0 10px;font-size:12px;color:var(--home-secondary);">
                Chọn câu hỏi tác chiến để kiểm tra tính xác thực của đối tượng:
              </p>

              <div style="display:flex;flex-direction:column;gap:8px;">
                ${call.trapQuestions.map((q, idx) => `
                  <button class="phone-verdict-btn phone-trap-btn ${askedQuestions.has(idx) ? 'is-asked' : ''}"
                          data-phone="ask-question" data-idx="${idx}" ${askedQuestions.has(idx) ? 'disabled' : ''}>
                    <b>${idx + 1}. ${escapeHtml(q.label)}:</b> “${escapeHtml(q.question)}”
                    ${askedQuestions.has(idx) ? ' <span style="color:#10b981;">(Đã hỏi)</span>' : ''}
                  </button>
                `).join('')}
              </div>

              ${lastAskedIdx !== null ? `
                <div class="intel-trap-result">
                  💡 <b>Phân tích phản hồi [Câu ${lastAskedIdx + 1}]:</b> ${escapeHtml(call.trapQuestions[lastAskedIdx].revealedClue)}
                </div>
              ` : `
                <p style="color:#64748b;font-size:11.5px;margin-top:10px;">Bấm một trong các câu hỏi trên để thử phản ứng của người gọi.</p>
              `}
            </div>
          ` : `
            <div class="intel-box" style="border-left:3px solid #10b981;">
              <strong class="intel-title-green">Nguyên tắc Tác chiến Cốt lõi:</strong>
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
    case 'tab-live':
      currentIntelTab = 'live';
      playActionBeep();
      render();
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
