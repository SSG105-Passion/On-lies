import { createSessionId } from './session';
import {
  beep,
  playActionBeep,
  playTacticalSuccess,
  playSirenAlert,
  playTickTock,
  playSystemHalt,
  playEmergencyHeartbeat
} from './audio';
import {
  renderIncidentIntro,
  renderIncidentDashboard,
  renderIncidentSummary
} from './familyView';
import type {
  IncidentViewState,
  IncidentHistoryItem,
  TacticalAction
} from './familyView';

export interface FamilyGameResult {
  score: number;
  maxScore: number;
  livesLeft: number;
  sessionId: string;
}

declare global {
  interface DocumentEventMap {
    'family-completed': CustomEvent<FamilyGameResult>;
  }
}

export interface IncidentCase {
  id: number;
  code: string;
  title: string;
  victimName: string;
  victimDevice: string;
  threatLevel: 'CRITICAL' | 'EXTREME' | 'HIGH';
  targetAsset: string;
  initialTime: number;
  story: string;
  initialPhoneStatus: string;
  actions: TacticalAction[];
  requiredSequence: string[];
  forensicLesson: string;
}

const INCIDENTS: IncidentCase[] = [
  {
    "id": 1,
    "code": "INCIDENT #01",
    "title": "Mã Độc Chiếm Quyền Trợ Năng (Accessibility Trojan)",
    "victimName": "Chị Ngọc Mai (31 tuổi • Kế toán viên)",
    "victimDevice": "Samsung Galaxy A54 • Android 14",
    "threatLevel": "CRITICAL",
    "targetAsset": "85.000.000 VNĐ (Tài khoản thanh toán lương công ty)",
    "initialTime": 60,
    "initialPhoneStatus": "Mã độc đang tự động mở App Techcombank ngầm qua cổng 443...",
    "story": "Chị Mai vừa bấm cài tệp \"DichVuCong_CapNhat.apk\". BÙM! Màn hình điện thoại tối sầm lại, các phím cảm ứng bị vô hiệu hóa! Phía sau lớp màn hình đen mờ, app Techcombank đang tự động mở lên, form chuyển 85.000.000 VNĐ sang tài khoản lạ vừa tự động điền xong! Hacker từ xa đang đếm ngược chờ lệnh chuyển tự động hoàn tất trong 60 giây!",
    "actions": [
      {
        "id": "act_airplane",
        "icon": "✈️",
        "title": "⚡ GẠT CẦN CẮT MẠNG KHẨN CẤP (Bật Chế độ máy bay)",
        "desc": "Vuốt ngay thanh thông báo gạt Chế độ máy bay, bẻ gãy tức khắc đường truyền Internet nối tới máy chủ C2 của hacker.",
        "successLog": "ĐÃ CẮT SÓNG INTERNET! Mất kết nối C2, màn hình app ngân hàng của hacker hiện lỗi: \"Mất kết nối mạng. Giao dịch bị hủy!\"",
        "threatMitigation": "Hacker bị văng khỏi phiên điều khiển từ xa. Lệnh chuyển 85 triệu bị kẹt cứng."
      },
      {
        "id": "act_revoke_accessibility",
        "icon": "🛑",
        "title": "🛑 TƯỚC QUYỀN TRỢ NĂNG (Kill Accessibility Service)",
        "desc": "Truy cập Cài đặt hệ thống tước quyền tự đọc màn hình và tự bấm phím ngầm của tệp APK độc.",
        "successLog": "ĐÃ TƯỚC ĐOẠT QUYỀN TRỢ NĂNG! Lớp phủ đen biến mất, chị Mai giành lại 100% quyền làm chủ màn hình cảm ứng.",
        "threatMitigation": "Mã độc bị tước vũ khí thao tác ngầm, không thể tự bấm chuyển tiền được nữa."
      },
      {
        "id": "act_lock_card_secondary",
        "icon": "🔒",
        "title": "💳 RÚT PHÍCH DÒNG TIỀN (Hạ hạn mức về 0đ từ máy tính phụ)",
        "desc": "Dùng laptop sạch đăng nhập Internet Banking độc lập, khóa khẩn cấp thẻ và hạ hạn mức chuyển khoản về 0đ.",
        "successLog": "ĐÃ KHÓA KÉT TIỀN! Két sắt tài khoản bị phong tỏa hoàn toàn. Dù hacker có bẻ khóa cũng không rút được 1 xu.",
        "threatMitigation": "Toàn bộ 85.000.000 VNĐ quỹ lương công ty được bảo toàn tuyệt đối."
      },
      {
        "id": "act_safe_mode_clean",
        "icon": "🧹",
        "title": "🧹 NHỔ TẬN RỄ MÃ ĐỘC (Safe Mode Sweep & Uninstall)",
        "desc": "Khởi động điện thoại vào Safe Mode để bốc tệp APK độc hại ra khỏi máy mà không cho nó kích hoạt lại.",
        "successLog": "ĐÃ TIÊU DIỆT MÃ ĐỘC! Tệp DichVuCong_CapNhat.apk bị xóa sổ vĩnh viễn khỏi bộ nhớ hệ thống.",
        "threatMitigation": "Thiết bị sạch bóng 100%, hệ điều hành khôi phục an toàn nguyên bản."
      },
      {
        "id": "act_fatal_enter_pwd",
        "icon": "🔑",
        "title": "Vội vã mở app ngân hàng gõ mật khẩu mới để đổi ngay trên máy nhiễm",
        "desc": "Cố gắng đổi mật khẩu mới trực tiếp trên chiếc màn hình đang bị theo dõi.",
        "isFatal": true,
        "fatalReason": "TOANG NẶNG! Mã độc đang chạy Keylogger ghi lại từng phím gõ và quay lén màn hình! Bạn vừa gõ mật khẩu mới thì trên màn hình máy tính của hacker hiện nguyên văn từng ký tự! Hacker mừng rỡ bấm chuyển sạch 85 triệu sang ví tiền ảo!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_call_scammer",
        "icon": "📞",
        "title": "Gọi điện thoại lại cho số lạ vừa gửi link để chửi bới dọa báo công an",
        "desc": "Mất thời gian đôi co với kẻ lừa đảo trong cơn giận dữ.",
        "isFatal": true,
        "fatalReason": "MẮC BẪY NGUY HIỂM! Kẻ gian nhận ra bạn đã phát hiện, lập tức kích hoạt lệnh rút tiền tự động dự phòng khẩn cấp còn lại trong 5 giây cuối! 85 triệu bốc hơi trong chớp mắt trong khi bạn vẫn mải chửi bới vô ích!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_airplane",
      "act_revoke_accessibility",
      "act_lock_card_secondary",
      "act_safe_mode_clean"
    ],
    "forensicLesson": "Quy tắc vàng khi dính mã độc Trợ năng (Accessibility Trojan): BƯỚC 1 BẮT BUỘC PHẢI LÀ NGẮT MẠNG (Chế độ máy bay) để bẻ gãy quyền điều khiển từ xa của hacker. Tuyệt đối không gõ bất kỳ mật khẩu nào trên máy đang nhiễm!"
  },
  {
    "id": 2,
    "code": "INCIDENT #02",
    "title": "Cướp Quyền SIM & Đột Nhập Ví Điện Tử (SIM Swap Attack)",
    "victimName": "Anh Tuấn (36 tuổi • Chủ shop thời trang)",
    "victimDevice": "iPhone 15 Pro • iOS 18",
    "threatLevel": "EXTREME",
    "targetAsset": "120.000.000 VNĐ (Ví MoMo & Tài khoản ngân hàng liên kết)",
    "initialTime": 60,
    "initialPhoneStatus": "Cột sóng iPhone hiện \"Không có dịch vụ\" • Kẻ gian đang yêu cầu mã OTP đổi mật khẩu ví...",
    "story": "SIM điện thoại của anh Tuấn đột ngột mất sóng, màn hình hiện \"Không có dịch vụ\". Cùng lúc đó, email thông báo: \"Mã OTP đặt lại mật khẩu ví MoMo và Internet Banking vừa được gửi về số điện thoại của bạn!\". Kẻ gian đã dùng CMND giả chiếm đoạt SIM vật lý và đang đăng nhập vào ví tiền của anh!",
    "actions": [
      {
        "id": "act_revoke_sessions",
        "icon": "🌐",
        "title": "⚡ ĐĂNG XUẤT TẤT CẢ PHIÊN ĐĂNG NHẬP (Terminate All Sessions)",
        "desc": "Dùng máy tính đăng nhập vào cổng tài khoản Apple ID / Email kích hoạt \"Đăng xuất khỏi tất cả các thiết bị\".",
        "successLog": "ĐÃ HỦY TOÀN BỘ PHIÊN LẠ: Kẻ gian bị đá văng khỏi hòm thư và tài khoản Apple ID.",
        "threatMitigation": "Hacker không thể đọc lén email thông báo và mã kích hoạt dịch vụ."
      },
      {
        "id": "act_lock_sim",
        "icon": "📞",
        "title": "🛑 GỌI TỔNG ĐÀI NHÀ MẠNG KHÓA SIM KHẨN CẤP (Freeze Telecom Line)",
        "desc": "Mượn ngay điện thoại của người bên cạnh gọi hotline nhà mạng (18008098) yêu cầu khóa một chiều SIM lập tức.",
        "successLog": "ĐÃ KHÓA SÓNG THUÊ BAO: Thẻ SIM bị cướp trong tay kẻ gian biến thành cục gạch vô dụng!",
        "threatMitigation": "Mọi mã xác thực OTP gửi về SMS đều bị chặn đứng hoàn toàn."
      },
      {
        "id": "act_freeze_wallet",
        "icon": "❄️",
        "title": "🔒 ĐÓNG BĂNG VÍ ĐIỆN TỬ & TÀI KHOẢN NGÂN HÀNG (Freeze Banking & Wallet)",
        "desc": "Gọi tổng đài hỗ trợ khẩn cấp của ngân hàng và ví điện tử phong tỏa tài khoản trong 48 giờ.",
        "successLog": "ĐÃ ĐÓNG BĂNG VÍ TIỀN: Cổng thanh toán chuyển sang trạng thái phong tỏa bảo mật.",
        "threatMitigation": "Két tiền 120.000.000 VNĐ an toàn 100%, không một đồng nào lọt ra ngoài."
      },
      {
        "id": "act_hardware_2fa",
        "icon": "🛡️",
        "title": "🔑 NÂNG CẤP XÁC THỰC HARDWARE 2FA (Chuyển sang Google Authenticator)",
        "desc": "Gỡ bỏ hoàn toàn bảo mật bằng SMS OTP yếu ớt, thay bằng ứng dụng sinh mã phần cứng chuyên dụng.",
        "successLog": "ĐÃ GIA CỐ TẦNG PHÒNG THỦ: Mã xác thực hiện được sinh độc lập trên thiết bị phần cứng.",
        "threatMitigation": "Triệt tiêu vĩnh viễn nguy cơ bị cướp tài khoản qua sóng viễn thông."
      },
      {
        "id": "act_fatal_sms_reset",
        "icon": "📩",
        "title": "Bấm yêu cầu gửi lại mã xác thực OTP qua SMS liên tục để giành lại quyền",
        "desc": "Ngồi bấm nút gửi lại mã OTP về số điện thoại đang bị mất sóng.",
        "isFatal": true,
        "fatalReason": "TIẾP TAY CHO GIẶC! SIM của bạn đã bị cướp quyền điều khiển, bạn bấm gửi lại OTP bao nhiêu lần thì kẻ gian bên kia nhận bấy nhiêu mã! Kẻ gian dùng mã OTP đó đổi mật khẩu thành công và rút sạch 120 triệu trong 10 giây!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_wait_tomorrow",
        "icon": "⏳",
        "title": "Nghĩ do trạm sóng nhà mạng chập chờn, chờ sáng mai ra quầy viễn thông hỏi",
        "desc": "Chủ quan đợi đến sáng hôm sau mới xử lý.",
        "isFatal": true,
        "fatalReason": "MẤT TRẮNG TRONG ĐÊM! Trong các vụ cướp SIM (SIM Swap), 15 phút đầu tiên là \"thời gian vàng\"! Chỉ cần chậm 5 phút, kẻ gian đã kịp rút sạch tiền ngân hàng và vay thêm 50 triệu trên app tín dụng!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_revoke_sessions",
      "act_lock_sim",
      "act_freeze_wallet",
      "act_hardware_2fa"
    ],
    "forensicLesson": "Khi điện thoại đột ngột hiện \"Không có dịch vụ\" không rõ nguyên nhân: HÃY NGHĨ NGAY ĐẾN SIM SWAP! Gọi nhà mạng khóa SIM ngay lập tức và chuyển đổi toàn bộ OTP ngân hàng sang ứng dụng Authenticator."
  },
  {
    "id": 3,
    "code": "INCIDENT #03",
    "title": "Tống Tiền Video / Ảnh Nhạy Cảm Ghép Deepfake AI (Sextortion)",
    "victimName": "Hà Linh (20 tuổi • Nữ sinh viên)",
    "victimDevice": "iPhone 13 • iOS 17",
    "threatLevel": "HIGH",
    "targetAsset": "Danh dự nhân phẩm & 20.000.000 VNĐ tiền chuộc",
    "initialTime": 60,
    "initialPhoneStatus": "Hộp thư ngập tràn ảnh khỏa thân ghép mặt nạn nhân • Kẻ tống tiền đếm ngược 60s...",
    "story": "Một tài khoản ẩn danh trên Telegram gửi cho Linh 5 tấm ảnh nhạy cảm ghép khuôn mặt của cô với lời đe dọa: \"Mày có 60 giây để chuyển 20 triệu vào ví USDT này! Quá thời gian tao sẽ phát tán ảnh lên group trường và gửi cho toàn bộ bạn bè trong danh bạ Facebook của mày!\"",
    "actions": [
      {
        "id": "act_cover_cam_air",
        "icon": "✈️",
        "title": "⚡ CHẶN KÊNH LIÊN LẠC & BẢO VỆ DANH BẠ (Privacy Lockdown)",
        "desc": "Chuyển toàn bộ tài khoản mạng xã hội sang chế độ Riêng tư (Private), khóa danh sách bạn bè và ngắt tin nhắn từ người lạ.",
        "successLog": "ĐÃ KHÓA KÊNH RIÊNG TƯ: Kẻ gian bị chặn đứng khả năng quét danh bạ và bạn bè của nạn nhân.",
        "threatMitigation": "Kẻ tống tiền mất đi công cụ phát tán ảnh tới người quen."
      },
      {
        "id": "act_reboot_safe",
        "icon": "📸",
        "title": "🛑 LƯU GIỮ BẰNG CHỨNG ĐIỆN TỬ (Capture Digital Evidence)",
        "desc": "Chụp lại toàn bộ tin nhắn tống tiền, địa chỉ ví USDT, tài khoản Telegram và mã băm ảnh trước khi kẻ gian thu hồi.",
        "successLog": "ĐÃ THU THẬP BẰNG CHỨNG: Bộ hồ sơ chứng cứ số đầy đủ sẵn sàng chuyển giao cho cơ quan điều tra.",
        "threatMitigation": "Bảo đảm căn cứ pháp lý để khởi tố vụ án hình sự cưỡng đoạt tài sản."
      },
      {
        "id": "act_remove_device_admin",
        "icon": "🛑",
        "title": "✋ TUYỆT ĐỐI KHÔNG CHUYỂN TIỀN CHUỘC (Never Pay Extortion)",
        "desc": "Tuân thủ khuyến cáo của Cục An ninh mạng: Không thương lượng, không chuyển một xu nào cho kẻ tống tiền.",
        "successLog": "TỪ CHỐI TIỀN CHUỘC: Chặn đứng vòng xoáy tống tiền liên hoàn.",
        "threatMitigation": "Bảo toàn 20.000.000 VNĐ tiền tiết kiệm của sinh viên."
      },
      {
        "id": "act_report_cyber",
        "icon": "🏛️",
        "title": "🏛️ BÁO CÁO CỤC AN NINH MẠNG & TỔ CHỨC BẢO VỆ (Report to Cyber Police)",
        "desc": "Gửi hồ sơ tố giác tội phạm tới Phòng An ninh mạng (PA05) và báo cáo vi phạm bản quyền hình ảnh lên nền tảng.",
        "successLog": "ĐÃ TIẾP NHẬN BẢO VỆ: Cơ quan chức năng đưa tài khoản đối tượng vào danh sách truy vết nghiệp vụ.",
        "threatMitigation": "Nạn nhân được hỗ trợ tâm lý và bảo vệ an toàn thông tin danh dự."
      },
      {
        "id": "act_fatal_pay_ransom",
        "icon": "💸",
        "title": "Hoảng sợ chuyển ngay 20 triệu với hy vọng kẻ gian sẽ xóa ảnh thật",
        "desc": "Lén lút vay mượn tiền chuyển ngay cho kẻ tống tiền để mong bình yên.",
        "isFatal": true,
        "fatalReason": "SAI LẦM CHẾT NGƯỜI! Kẻ tống tiền KHÔNG BAO GIỜ xóa ảnh sau khi nhận tiền! Ngược lại, chúng biết bạn có tiền và quá sợ hãi, ngày mai chúng sẽ tiếp tục đòi 50 triệu, rồi 100 triệu, biến bạn thành \"con mồi rút ruột\" không lối thoát!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_delete_all_photos",
        "icon": "🗑️",
        "title": "Xóa toàn bộ cuộc trò chuyện và vội vã khóa tài khoản mạng xã hội",
        "desc": "Xóa sạch tin nhắn để trốn tránh nỗi sợ.",
        "isFatal": true,
        "fatalReason": "TỰ HỦY BẰNG CHỨNG! Xóa chat làm mất toàn bộ ID tài khoản, ví nhận tiền và bằng chứng tống tiền. Khi kẻ gian phát tán ảnh thật, công an sẽ không còn dấu vết số nào để truy bắt thủ phạm!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_cover_cam_air",
      "act_reboot_safe",
      "act_remove_device_admin",
      "act_report_cyber"
    ],
    "forensicLesson": "Nguyên tắc bất di bất dịch khi bị tống tiền Deepfake ảnh nhạy cảm: TUYỆT ĐỐI KHÔNG CHUYỂN TIỀN! Kẻ gian chỉ nhắm vào nỗi sợ hãi. Khóa riêng tư mạng xã hội, lưu lại bằng chứng và báo ngay cho cơ quan công an."
  },
  {
    "id": 4,
    "code": "INCIDENT #04",
    "title": "Lộ Thẻ Quốc Tế Qua Quét Mã QR Bàn Ăn Bị Dán Đè (QR Phishing)",
    "victimName": "Bác Nam (52 tuổi • Kinh doanh)",
    "victimDevice": "iPad Pro • iPadOS 17",
    "threatLevel": "HIGH",
    "targetAsset": "50.000.000 VNĐ (Hạn mức thẻ tín dụng Visa Signature)",
    "initialTime": 60,
    "initialPhoneStatus": "Điện thoại liên tục nổ thông báo trừ tiền: $199 quẹt tại Apple Store Dublin...",
    "story": "Bác Nam vừa quét mã QR dán trên bàn ăn nhà hàng để thanh toán hóa đơn. Hóa ra mã QR thật đã bị kẻ gian lén dán đè mã QR độc hại! Trang web giả mạo câu trộm toàn bộ số thẻ Visa và mã CVV. Điện thoại đang nổ ting ting thông báo trừ tiền quốc tế liên tiếp!",
    "actions": [
      {
        "id": "act_lock_online_pay",
        "icon": "🔒",
        "title": "⚡ KHÓA CHIỀU THANH TOÁN ONLINE TRÊN APP (Freeze E-Commerce)",
        "desc": "Mở app ngân hàng chính thống gạt tắt ngay tính năng \"Thanh toán trực tuyến / Chi tiêu quốc tế\" của thẻ Visa.",
        "successLog": "ĐÃ KHÓA CHIỀU THANH TOÁN TRỰC TUYẾN! Lệnh quẹt tiền $350 tiếp theo của hacker bị ngân hàng từ chối tức thì!",
        "threatMitigation": "Chặn đứng dòng tiền bị quẹt trộm tại các sàn thương mại nước ngoài."
      },
      {
        "id": "act_zero_limit",
        "icon": "📉",
        "title": "🛑 HẠ HẠN MỨC GIAO DỊCH NGÀY VỀ 0 VNĐ (Drop Limit to Zero)",
        "desc": "Hạ toàn bộ hạn mức quẹt thẻ tín dụng xuống mức tối thiểu 0 VNĐ để phong tỏa rủi ro.",
        "successLog": "ĐÃ HẠ HẠN MỨC VỀ 0Đ! Toàn bộ các cổng thanh toán quốc tế đều báo lỗi hạn mức không đủ.",
        "threatMitigation": "Bảo toàn hạn mức 50.000.000 VNĐ của thẻ tín dụng."
      },
      {
        "id": "act_dispute_bank",
        "icon": "📞",
        "title": "🏦 GỌI HOTLINE KHẨN CẤP YÊU CẦU TRA SOÁT (Chargeback / Dispute)",
        "desc": "Gọi số điện thoại in sau thẻ yêu cầu ngân hàng ghi nhận các giao dịch vừa phát sinh là Gian lận không ủy quyền.",
        "successLog": "ĐÃ KÍCH HOẠT HỒ SƠ TRA SOÁT: Ngân hàng đóng băng lệnh thanh toán chờ Visa quốc tế hoàn tiền lại.",
        "threatMitigation": "Nạn nhân được bảo hiểm gian lận bồi hoàn 100% số tiền đã quẹt."
      },
      {
        "id": "act_reissue_card",
        "icon": "💳",
        "title": "✂️ HỦY THẺ VÀ YÊU CẦU PHÁT HÀNH THẺ MỚI (Reissue New Card)",
        "desc": "Hủy vĩnh viễn số thẻ và mã CVV cũ đã bị lộ, phát hành lại phôi thẻ mới an toàn.",
        "successLog": "ĐÃ HỦY PHÔI THẺ BỊ LỘ: Số thẻ và mã CVV cũ biến thành rác vô giá trị.",
        "threatMitigation": "Triệt tiêu hoàn toàn nguy cơ rò rỉ dữ liệu thẻ trong tương lai."
      },
      {
        "id": "act_fatal_provide_otp",
        "icon": "📩",
        "title": "Nhập tiếp mã OTP ngân hàng gửi về để \"xác nhận hủy lệnh trừ tiền\"",
        "desc": "Làm theo hướng dẫn của trang web giả mạo để mong hủy giao dịch.",
        "isFatal": true,
        "fatalReason": "CHÍNH TAY DÂNG TIỀN CHO HACKER! Mã OTP đó chính là mã xác thực cho lệnh quẹt thẻ 30 triệu tiếp theo! Bạn nhập mã vào là tiền bay thẳng sang tài khoản mua hàng nước ngoài của hacker!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_wait_see",
        "icon": "⏳",
        "title": "Nghĩ hệ thống trừ nhầm, để sáng mai ra quầy ngân hàng khiếu nại",
        "desc": "Chần chừ chờ đợi qua đêm mới xử lý.",
        "isFatal": true,
        "fatalReason": "MẤT SẠCH HẠN MỨC! Thẻ tín dụng quốc tế quẹt tiền tự động không cần OTP chỉ mất vài giây một giao dịch. Sau 15 phút, kẻ gian đã quẹt sạch toàn bộ hạn mức 50 triệu!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_lock_online_pay",
      "act_zero_limit",
      "act_dispute_bank",
      "act_reissue_card"
    ],
    "forensicLesson": "Mã QR thanh toán tại quán ăn rất dễ bị kẻ gian dán đè mã lừa đảo. Khi phát hiện thẻ bị quẹt tiền bất thường: KHÓA TÍNH NĂNG THANH TOÁN ONLINE TRÊN APP NGAY LẬP TỨC và gọi hotline ngân hàng yêu cầu Tra soát (Dispute)."
  },
  {
    "id": 5,
    "code": "INCIDENT #05",
    "title": "Ransomware Khóa Dữ Liệu Tống Tiền USDT (Mobile Ransomware)",
    "victimName": "Chú Bình (55 tuổi • Giám đốc xưởng sản xuất)",
    "victimDevice": "Oppo Reno10 • ColorOS",
    "threatLevel": "EXTREME",
    "targetAsset": "1.450 tệp hợp đồng công nợ & Hóa đơn điện tử công ty",
    "initialTime": 60,
    "initialPhoneStatus": "Màn hình đỏ thẫm bị khóa cứng • Đếm ngược nộp tiền chuộc AES-256...",
    "story": "Màn hình điện thoại của chú Bình bị khóa cứng bởi cảnh báo tống tiền: \"Tất cả tài liệu công việc và danh bạ đã bị mã hóa AES-256. Nộp 10.000.000 VNĐ vào ví USDT sau 60s để nhận chìa khóa giải mã, quá thời gian khóa giải mã sẽ bị hủy vĩnh viễn!\"",
    "actions": [
      {
        "id": "act_cut_cloud_sync",
        "icon": "✈️",
        "title": "⚡ GẠT CHẾ ĐỘ MÁY BAY NGĂN MÃ ĐỘC LÂY LÊN CLOUD (Cut Cloud Sync)",
        "desc": "Cách ly thiết bị ngay lập tức để ngăn tiến trình mã hóa lây lan sang Google Drive / OneDrive của công ty.",
        "successLog": "ĐÃ CÁCH LY THIẾT BỊ! Tiến trình đồng bộ đám mây bị cắt đứt, cứu nguy toàn bộ kho dữ liệu sao lưu trên Cloud.",
        "threatMitigation": "Kho dữ liệu hợp đồng dự phòng trên Google Drive được bảo vệ an toàn."
      },
      {
        "id": "act_refuse_ransom",
        "icon": "🛑",
        "title": "✋ TỪ CHỐI NỘP TIỀN CHUỘC (Never Pay Ransom)",
        "desc": "Tuyệt đối không chuyển tiền vào ví USDT theo khuyến cáo của Cục An toàn thông tin.",
        "successLog": "TỪ CHỐI TIỀN CHUỘC! Không tiếp tay cho tội phạm mạng phát triển mã độc.",
        "threatMitigation": "Bảo toàn 10.000.000 VNĐ quỹ tài chính công ty."
      },
      {
        "id": "act_recovery_clean",
        "icon": "🔄",
        "title": "🧹 FORMAT PHÂN VÙNG BỊ NHIỄM TRONG RECOVERY MODE (Factory Wipe)",
        "desc": "Đưa máy về chế độ Recovery Mode xóa sạch phân vùng hệ thống bị chiếm đóng bởi mã độc tống tiền.",
        "successLog": "ĐÃ XÓA SỔ MÃ ĐỘC! Phân vùng nhiễm tệp mã độc khóa màn hình bị xóa sạch 100%.",
        "threatMitigation": "Màn hình đỏ tống tiền biến mất, thiết bị trở về trạng thái sạch sẽ."
      },
      {
        "id": "act_restore_clean_backup",
        "icon": "☁️",
        "title": "📥 KHÔI PHỤC DỮ LIỆU TỪ BẢN SAO LƯU SẠCH (Restore 3-2-1 Backup)",
        "desc": "Đồng bộ lại toàn bộ hợp đồng và danh bạ từ bản sao lưu an toàn trên đám mây định kỳ.",
        "successLog": "ĐÃ KHÔI PHỤC TOÀN DIỆN! Toàn bộ 1.450 tệp hợp đồng công việc được phục hồi nguyên vẹn.",
        "threatMitigation": "Doanh nghiệp hoạt động bình thường, không tổn thất một đồng nào."
      },
      {
        "id": "act_fatal_pay_ransom_usdt",
        "icon": "💸",
        "title": "Chuyển 10 triệu nộp tiền chuộc mua mã mở khóa khẩn cấp",
        "desc": "Chuyển tiền vào ví USDT của tin tặc để xin khóa giải mã.",
        "isFatal": true,
        "fatalReason": "BỊ LỪA TRẮNG TAY! Thống kê của cơ quan an ninh mạng chỉ ra hơn 80% nạn nhân nộp tiền chuộc ransomware không bao giờ nhận được khóa giải mã! Bạn vừa mất 10 triệu, vừa mất trắng toàn bộ dữ liệu!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_plug_usb_pc",
        "icon": "💻",
        "title": "Cắm cáp USB vào máy tính văn phòng để copy dữ liệu ra",
        "desc": "Kết nối máy điện thoại bị nhiễm với máy tính công ty qua cáp USB.",
        "isFatal": true,
        "fatalReason": "LÂY NHIỄM THẢM HỌA! Mã độc tự động lây lan qua giao thức MTP/USB sang máy tính văn phòng, làm tê liệt toàn bộ mạng máy tính của xưởng sản xuất!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_cut_cloud_sync",
      "act_refuse_ransom",
      "act_recovery_clean",
      "act_restore_clean_backup"
    ],
    "forensicLesson": "Đối phó Ransomware: Nguyên tắc số 1 là KHÔNG TRẢ TIỀN CHUỘC và CÁCH LY MẠNG ngay lập tức để bảo vệ dữ liệu đám mây. Luôn duy trì chiến lược sao lưu dữ liệu dự phòng định kỳ (Quy tắc 3-2-1 Backup)."
  },
  {
    "id": 6,
    "code": "INCIDENT #06",
    "title": "Chiếm Đoạt Phiên Zalo / Lừa Đảo Danh Bạ Họ Hàng (Session Hijack)",
    "victimName": "Bác Hùng (58 tuổi • Cán bộ hưu trí)",
    "victimDevice": "iPad Air • iPadOS 17",
    "threatLevel": "CRITICAL",
    "targetAsset": "Danh dự cá nhân & 45.000.000 VNĐ (Tiền họ hàng chuẩn bị chuyển giúp)",
    "initialTime": 60,
    "initialPhoneStatus": "Kẻ gian đang gửi tin nhắn vay tiền gấp tới 12 người trong danh bạ Zalo...",
    "story": "Bác Hùng vừa bấm vào đường link \"Bình chọn ảnh cháu gái thi tài năng nhí\" và quét mã QR. Kẻ gian lập tức đánh cắp phiên đăng nhập (Cookie Session), đang nhắn tin cho anh chị em ruột mượn 15 triệu với lý do chuyển tiền viện phí cấp cứu! Người thân đang hoang mang chuẩn bị bấm chuyển khoản!",
    "actions": [
      {
        "id": "act_zalo_terminate_sessions",
        "icon": "🛑",
        "title": "⚡ ĐĂNG XUẤT TẤT CẢ THIẾT BỊ LẠ TRÊN ZALO (Terminate Remote Sessions)",
        "desc": "Mở Cài đặt Zalo trên điện thoại chính > Quản lý thiết bị đăng nhập > Bấm \"Đăng xuất khỏi thiết bị khác\".",
        "successLog": "ĐÃ ĐĂNG XUẤT PHIÊN LẠ! Kẻ gian bị đá văng khỏi tài khoản Zalo ngay lập tức.",
        "threatMitigation": "Chặn đứng hành vi gửi thêm tin nhắn lừa tiền tới bạn bè, người thân."
      },
      {
        "id": "act_zalo_broadcast_call",
        "icon": "📢",
        "title": "📞 GỌI ĐIỆN & ĐĂNG BÀI CẢNH BÁO KHẨN CẤP (Broadcast Emergency Alert)",
        "desc": "Gọi điện thoại trực tiếp hoặc nhờ người thân đăng bài cảnh báo khẩn cấp lên Facebook/mạng xã hội.",
        "successLog": "ĐÃ BÁO ĐỘNG KỊP THỜI! Hai người thân vừa chuẩn bị bấm chuyển tiền đã kịp thời dừng lại.",
        "threatMitigation": "Bảo toàn 45.000.000 VNĐ cho người thân và gia đình."
      },
      {
        "id": "act_zalo_enable_pin",
        "icon": "🔒",
        "title": "🔑 GIA CỐ MÃ PIN BẢO VỆ ZALO & ĐỔI MẬT KHẨU (Enable App Lock & PIN)",
        "desc": "Bật tính năng Khóa ứng dụng Zalo bằng mã PIN riêng biệt và đổi mật khẩu mới.",
        "successLog": "ĐÃ GIA CỐ BẢO MẬT! Mật khẩu mới và mã PIN bảo vệ Zalo được kích hoạt thành công.",
        "threatMitigation": "Tài khoản được bảo vệ vững chắc với 2 lớp xác thực."
      },
      {
        "id": "act_zalo_revoke_permissions",
        "icon": "🧹",
        "title": "🧹 THU HỒI TẤT CẢ MINI APP & LIÊN KẾT LẠ (Revoke Third-party Tokens)",
        "desc": "Kiểm tra và hủy toàn bộ các tiện ích / Mini App liên kết từ trang bình chọn độc hại.",
        "successLog": "ĐÃ THU HỒI ỦY QUYỀN! Xóa sạch các Mini App và token ủy quyền bên thứ ba.",
        "threatMitigation": "Triệt tiêu hoàn toàn mã độc thu thập dữ liệu ngầm."
      },
      {
        "id": "act_fatal_zalo_delete_account",
        "icon": "🗑️",
        "title": "Xóa ngay vĩnh viễn tài khoản Zalo để kẻ gian không nhắn tin được nữa",
        "desc": "Vội vã xóa tài khoản trong cơn hoảng loạn.",
        "isFatal": true,
        "fatalReason": "SAI LẦM TAI HẠI! Xóa tài khoản làm mất toàn bộ lịch sử trò chuyện và bằng chứng đối soát! Phiên đăng nhập trên máy tính của kẻ gian vẫn kịp gửi tin nhắn lừa thêm 2 người thân trước khi tài khoản bị vô hiệu hóa!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_zalo_chat_fight",
        "icon": "💬",
        "title": "Nhắn tin vào tài khoản bị hack đe dọa báo công an nếu không trả lại nick",
        "desc": "Đấu khẩu với kẻ lừa đảo qua ô chat.",
        "isFatal": true,
        "fatalReason": "MẮC BẪY KẺ GIAN! Kẻ lừa đảo biết bạn đã phát hiện, lập tức đổi mật khẩu chiếm đoạt toàn bộ tài khoản và tăng tốc nhắn tin lừa tiền tất cả bạn bè còn lại trong danh bạ!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_zalo_terminate_sessions",
      "act_zalo_broadcast_call",
      "act_zalo_enable_pin",
      "act_zalo_revoke_permissions"
    ],
    "forensicLesson": "Không quét mã QR hoặc đăng nhập Zalo/Facebook trên trang web lạ (bình chọn, trúng thưởng). Khi bị chiếm quyền, BƯỚC 1 PHẢI LÀ \"Đăng xuất khỏi các thiết bị khác\" từ ứng dụng chính thống và lập tức gọi điện báo cho người thân."
  },
  {
    "id": 7,
    "code": "INCIDENT #07",
    "title": "Bẫy Tuyển Dụng \"Like Video / Đánh Giá Sản Phẩm Nạp Tiền\"",
    "victimName": "Minh Anh (19 tuổi • Sinh viên năm nhất)",
    "victimDevice": "Xiaomi Redmi Note 13 • MIUI",
    "threatLevel": "HIGH",
    "targetAsset": "35.000.000 VNĐ (Tiền đóng học phí cả năm của gia đình)",
    "initialTime": 60,
    "initialPhoneStatus": "Trưởng nhóm Telegram đang hối thúc nạp thêm 15 triệu để kích hoạt mã rút tiền...",
    "story": "Minh Anh tham gia làm nhiệm vụ kiếm tiền online. Sau khi nạp 5 triệu, hệ thống báo \"sai cú pháp lệnh chuyển, tiền bị treo\", yêu cầu nạp thêm 15 triệu trong 60 giây để \"thông tắc hệ thống và rút cả gốc lẫn lãi 35 triệu\". Cô bé đang khóc nấc, chuẩn bị vay nóng bạn bè nạp nốt!",
    "actions": [
      {
        "id": "act_task_stop_transfer",
        "icon": "🛑",
        "title": "⚡ DỪNG DỨT KHOÁT TOÀN BỘ GIAO DỊCH (Halt All Transfers)",
        "desc": "Cắt lỗ ngay lập tức, tuyệt đối không nạp thêm bất kỳ một đồng nào theo lời dụ dỗ của trưởng nhóm.",
        "successLog": "ĐÃ CHẶN DÒNG TIỀN! Ngăn chặn kịp thời khoản nạp 15.000.000 VNĐ tiền vay nóng.",
        "threatMitigation": "Bảo toàn số tiền học phí còn lại của sinh viên."
      },
      {
        "id": "act_task_export_evidence",
        "icon": "📸",
        "title": "🛑 CHỤP ẢNH TOÀN BỘ BẰNG CHỨNG & SAO KÊ (Capture Forensic Logs)",
        "desc": "Chụp lại toàn bộ tin nhắn nhóm Telegram, sao kê chuyển khoản và thông tin tài khoản ngân hàng thụ hưởng.",
        "successLog": "ĐÃ THU THẬP BẰNG CHỨNG! Toàn bộ lịch sử chat và số tài khoản lừa đảo được sao lưu đầy đủ.",
        "threatMitigation": "Hồ sơ tố giác tội phạm sẵn sàng chuyển cho cơ quan chức năng."
      },
      {
        "id": "act_task_report_bank",
        "icon": "🏦",
        "title": "🏦 BÁO CÁO TÀI KHOẢN THỤ HƯỞNG LỪA ĐẢO TỚI NGÂN HÀNG (Report Beneficiary)",
        "desc": "Gọi hotline ngân hàng báo cáo số tài khoản nhận tiền lừa đảo để kích hoạt cờ cảnh báo gian lận.",
        "successLog": "ĐÃ GẮN CỜ GIAN LẬN! Tài khoản nhận tiền lừa đảo bị ngân hàng đưa vào danh sách đen theo dõi.",
        "threatMitigation": "Hạn chế khả năng tẩu tán tiền mặt của kẻ lừa đảo qua cây ATM."
      },
      {
        "id": "act_task_exit_groups",
        "icon": "🚪",
        "title": "🚪 THOÁT TOÀN BỘ NHÓM TELEGRAM CHIM MỒI (Exit Fraud Groups)",
        "desc": "Rời khỏi các nhóm Telegram chim mồi khoe nhận tiền giả và chặn liên lạc kẻ cầm đầu.",
        "successLog": "ĐÃ RỜI KHỎI NHÓM! Cắt đứt hoàn toàn sự thao túng tâm lý của nhóm tội phạm.",
        "threatMitigation": "Tâm lý nạn nhân ổn định, thoát khỏi bẫy thao túng nạp tiền liên hoàn."
      },
      {
        "id": "act_fatal_borrow_pay",
        "icon": "💸",
        "title": "Đi vay nóng bạn bè nạp nốt 15 triệu với hy vọng rút được số tiền 35 triệu",
        "desc": "Cố gắng làm theo yêu cầu của trưởng nhóm để cứu vãn tiền cũ.",
        "isFatal": true,
        "fatalReason": "MẤT TRẮNG TOÀN BỘ! Đây là bẫy lừa đảo nhiệm vụ nạp tiền kinh điển! Càng nạp kẻ gian càng bịa ra lý do \"phí bảo hiểm\", \"thuế thu nhập cá nhân\". 15 triệu vay nóng biến mất vĩnh viễn!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_hire_recovery",
        "icon": "🕵️",
        "title": "Lên Facebook thuê \"Luật sư / Hacker hỗ trợ lấy lại tiền treo trên app\"",
        "desc": "Tin vào các dịch vụ cam kết lấy lại tiền lừa đảo trên mạng xã hội.",
        "isFatal": true,
        "fatalReason": "BẪY LỪA ĐẢO TẬP 2! Các dịch vụ lấy lại tiền treo thực chất là cùng một đường dây lừa đảo, yêu cầu nạn nhân đóng thêm \"phí thụ lý hồ sơ\" rồi biến mất!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_task_stop_transfer",
      "act_task_export_evidence",
      "act_task_report_bank",
      "act_task_exit_groups"
    ],
    "forensicLesson": "Không có công việc nào \"ngồi nhà bấm like nhận tiền triệu\". Khi đối tượng yêu cầu nạp tiền để rút tiền cũ, 100% đó là bẫy lừa đảo. Hãy cắt lỗ ngay lập tức và bảo toàn số tiền còn lại."
  },
  {
    "id": 8,
    "code": "INCIDENT #08",
    "title": "Chiếm Quyền Telegram Qua Mã QR \"Vé Du Lịch Tri Ân\"",
    "victimName": "Cô Lan (48 tuổi • Giáo viên cấp 2)",
    "victimDevice": "iPhone 13 • iOS 17",
    "threatLevel": "CRITICAL",
    "targetAsset": "Nhóm chat nội bộ nhà trường & Danh bạ phụ huynh học sinh",
    "initialTime": 60,
    "initialPhoneStatus": "Thiết bị lạ tại nước ngoài vừa kết nối thành công vào Telegram qua QR...",
    "story": "Cô Lan vừa quét mã QR trên màn hình hội thảo để nhận \"mã vé du lịch tri ân\". Telegram báo có thiết bị lạ \"Windows Desktop - IP Nga\" vừa kết nối và đang đồng bộ toàn bộ lịch sử tin nhắn cùng danh bạ phụ huynh học sinh!",
    "actions": [
      {
        "id": "act_qr_disconnect_net",
        "icon": "✈️",
        "title": "⚡ GẠT CHẾ ĐỘ MÁY BAY CHẶN ĐỒNG BỘ DỮ LIỆU (Cut Internet Link)",
        "desc": "Bật Chế độ máy bay ngắt mạng tức thì để ngăn kẻ gian tiếp tục trích xuất tin nhắn và danh bạ.",
        "successLog": "ĐÃ CẮT KẾT NỐI MẠNG! Tiến trình đồng bộ tin nhắn của kẻ gian bị gián đoạn.",
        "threatMitigation": "Bảo vệ dữ liệu phụ huynh và đề thi học kỳ chưa bị tải hết."
      },
      {
        "id": "act_qr_terminate_devices",
        "icon": "🛑",
        "title": "🛑 CHẤM DỨT TẤT CẢ PHIÊN LẠ TRÊN TELEGRAM (Terminate All Other Sessions)",
        "desc": "Mở Telegram > Cài đặt > Thiết bị (Devices) > Bấm \"Chấm dứt tất cả các phiên khác\".",
        "successLog": "ĐÃ HỦY PHIÊN LẠ! Thiết bị Windows của kẻ gian bị đăng xuất khỏi Telegram.",
        "threatMitigation": "Kẻ gian mất hoàn toàn quyền truy cập tài khoản."
      },
      {
        "id": "act_qr_enable_2step",
        "icon": "🔒",
        "title": "🔑 KÍCH HOẠT XÁC THỰC 2 BƯỚC BẰNG MẬT KHẨU (Two-Step Verification)",
        "desc": "Thiết lập mật khẩu Xác thực 2 bước (Two-Step Verification) có kèm email khôi phục bí mật.",
        "successLog": "ĐÃ BẬT BẢO MẬT 2 BƯỚC! Mật khẩu bảo vệ Telegram được thiết lập thành công.",
        "threatMitigation": "Kẻ gian không thể đăng nhập lại kể cả khi có mã QR."
      },
      {
        "id": "act_qr_revoke_autodownload",
        "icon": "🧹",
        "title": "🧹 RÀ SOÁT TIN NHẮN MẠO DANH & TẮT TỰ TẢI TỆP (Security Audit)",
        "desc": "Tắt tính năng tự động tải tệp lạ và kiểm tra xóa tin nhắn mạo danh nếu có.",
        "successLog": "ĐÃ RÀ SOÁT TÀI KHOẢN! Không có tin nhắn lừa đảo nào kịp phát tán tới phụ huynh.",
        "threatMitigation": "Danh dự giáo viên và uy tín nhà trường được bảo toàn."
      },
      {
        "id": "act_fatal_qr_send_otp",
        "icon": "💬",
        "title": "Đọc mã xác nhận 5 chữ số vừa gửi về SMS cho bên phát vé kiểm tra",
        "desc": "Cung cấp mã xác nhận theo yêu cầu của đối tượng.",
        "isFatal": true,
        "fatalReason": "MẤT TRẮNG TÀI KHOẢN! Mã 5 chữ số đó chính là mã đăng nhập tài khoản Telegram! Bạn đã chính tay dâng toàn quyền sở hữu tài khoản cho kẻ gian!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_qr_ignore",
        "icon": "⏳",
        "title": "Bỏ qua cảnh báo vì thấy trên điện thoại mình Telegram vẫn dùng bình thường",
        "desc": "Chủ quan không xử lý khi thấy thiết bị lạ kết nối.",
        "isFatal": true,
        "fatalReason": "THẢM HỌA DANH DỰ! Kẻ gian âm thầm đọc toàn bộ tin nhắn riêng tư và dùng tài khoản của cô nhắn tin vay tiền tất cả phụ huynh trong lớp!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_qr_disconnect_net",
      "act_qr_terminate_devices",
      "act_qr_enable_2step",
      "act_qr_revoke_autodownload"
    ],
    "forensicLesson": "Không dùng camera ứng dụng Telegram/Zalo quét mã QR không rõ nguồn gốc. Luôn bật tính năng Xác thực 2 bước (Two-Step Verification) với mật khẩu riêng biệt cho Telegram."
  },
  {
    "id": 9,
    "code": "INCIDENT #09",
    "title": "Giả Danh Cán Bộ Công An Gửi \"Lệnh Bắt Tạm Giam\" Qua Zalo",
    "victimName": "Bác Thành (62 tuổi • Bác sĩ về hưu)",
    "victimDevice": "iPad Mini 6 • iPadOS 17",
    "threatLevel": "CRITICAL",
    "targetAsset": "300.000.000 VNĐ (Sổ tiết kiệm hưu trí tích lũy cả đời)",
    "initialTime": 60,
    "initialPhoneStatus": "Nạn nhân đang hoảng loạn chuẩn bị ra quầy ngân hàng rút sổ tiết kiệm...",
    "story": "Một kẻ tự xưng là cán bộ Cục Cảnh sát điều tra gọi điện và gửi \"Lệnh bắt tạm giam có mộc đỏ\" qua Zalo, dọa bác có liên quan đường dây rửa tiền ma túy. Yêu cầu bác giữ bí mật tuyệt đối, ra ngân hàng rút toàn bộ 300 triệu chuyển vào \"Tài khoản tạm giữ của Viện kiểm sát\" để thanh tra trong 1 giờ!",
    "actions": [
      {
        "id": "act_police_stop_call",
        "icon": "🛑",
        "title": "⚡ CÚP MÁY NGAY & CHẶN SỐ ĐIỆN THOẠI KẺ TỰ XƯNG (Cut Telecom Intimidation)",
        "desc": "Yêu cầu bác cúp máy ngay lập tức và chặn hoàn toàn liên lạc với kẻ lừa đảo.",
        "successLog": "ĐÃ CẮT LIÊN LẠC! Bác dừng cuộc gọi, kẻ lừa đảo không thể tiếp tục khủng bố tinh thần.",
        "threatMitigation": "Chặn đứng ý định ra ngân hàng rút tiền của nạn nhân."
      },
      {
        "id": "act_police_reassure",
        "icon": "🤝",
        "title": "🤝 GIẢI THÍCH RÕ: CÔNG AN KHÔNG LÀM VIỆC QUA ZALO (Reassure Legal Facts)",
        "desc": "Trấn an tinh thần và giải thích rõ: Cơ quan công an KHÔNG BAO GIỜ làm việc hay gửi lệnh bắt qua Zalo.",
        "successLog": "ĐÃ TRẤN AN NẠN NHÂN! Bác nhận ra văn bản có dấu mộc đỏ là tài liệu giả mạo.",
        "threatMitigation": "Tâm lý nạn nhân bình tĩnh trở lại, thoát khỏi trạng thái sợ hãi."
      },
      {
        "id": "act_police_verify_station",
        "icon": "🏛️",
        "title": "🏛️ ĐƯA BÁC ĐẾN CÔNG AN PHƯỜNG ĐỐI CHIẾU THỰC TẾ (Verify at Local Police)",
        "desc": "Đưa bác đến trực tiếp trụ sở Công an Phường sở tại để đối chiếu thông tin chính thức.",
        "successLog": "XÁC MINH CHÍNH THỨC! Công an phường khẳng định bác hoàn toàn không có lệnh bắt nào.",
        "threatMitigation": "Xóa bỏ 100% hoài nghi, bảo đảm an toàn tuyệt đối."
      },
      {
        "id": "act_police_report_hotline",
        "icon": "📞",
        "title": "📞 PHẢN ÁNH ĐẦU SỐ LỪA ĐẢO TỚI TỔNG ĐÀI 156 (Report Fraud Hotlines)",
        "desc": "Báo cáo số điện thoại và tài khoản mạo danh lên Tổng đài 156 của Bộ TT&TT.",
        "successLog": "ĐÃ BÁO CÁO VI PHẠM! Thông tin đầu số lừa đảo được gửi đến hệ thống quản lý viễn thông.",
        "threatMitigation": "Góp phần bảo vệ cộng đồng khỏi kẻ lừa đảo."
      },
      {
        "id": "act_fatal_police_transfer",
        "icon": "💸",
        "title": "Chuyển tiền vào tài khoản cán bộ để chứng minh mình trong sạch rồi nhận lại sau",
        "desc": "Chuyển 300 triệu vào tài khoản chỉ định để cơ quan chức năng kiểm tra.",
        "isFatal": true,
        "fatalReason": "MẤT TRẮNG 300 TRIỆU! Cơ quan Công an, Viện kiểm sát KHÔNG BAO GIỜ có tài khoản cá nhân để tạm giữ tiền! Số tiền chuyển đi bị nhóm lừa đảo rút sạch tại cây ATM trong vòng 3 phút!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_police_send_id",
        "icon": "🪪",
        "title": "Chụp 2 mặt Căn cước công dân và sổ hộ khẩu gửi qua Zalo cho cán bộ làm hồ sơ",
        "desc": "Cung cấp ảnh giấy tờ tùy thân theo yêu cầu của kẻ mạo danh.",
        "isFatal": true,
        "fatalReason": "LỘ DỮ LIỆU ĐỊNH DANH! Kẻ gian sử dụng ảnh CCCD của bác để mở hàng loạt tài khoản ngân hàng ảo và vay tiền trên các ứng dụng tín dụng đen!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_police_stop_call",
      "act_police_reassure",
      "act_police_verify_station",
      "act_police_report_hotline"
    ],
    "forensicLesson": "Cơ quan Công an, Viện kiểm sát, Tòa án KHÔNG BAO GIỜ làm việc qua điện thoại, KHÔNG gửi văn bản tố tụng qua Zalo/mạng xã hội và TUYỆT ĐỐI KHÔNG yêu cầu chuyển tiền vào tài khoản để \"chứng minh trong sạch\"."
  },
  {
    "id": 10,
    "code": "INCIDENT #10",
    "title": "Bẫy Đầu Tư Sàn Forex / Tiền Ảo \"Lãi Suất 25%/Tuần\"",
    "victimName": "Chú Quang (42 tuổi • Kỹ sư xây dựng)",
    "victimDevice": "iPhone 14 • iOS 18",
    "threatLevel": "EXTREME",
    "targetAsset": "200.000.000 VNĐ (Tiền tích lũy chuẩn bị sửa nhà)",
    "initialTime": 60,
    "initialPhoneStatus": "Nạn nhân chuẩn bị chuyển tiền nạp gói VIP \"Bảo hiểm thanh khoản\"...",
    "story": "Quen một người qua mạng hẹn hò, được hướng dẫn nạp 50 triệu vào sàn giao dịch ngoại hối ảo. Màn hình app hiển thị tài khoản đã lãi lên 120 triệu. Khi muốn rút tiền, sàn yêu cầu nộp thêm 40 triệu tiền bảo hiểm thanh khoản và 30 triệu tiền thuế trong 60 giây.",
    "actions": [
      {
        "id": "act_crypto_freeze_transfer",
        "icon": "🛑",
        "title": "⚡ KHÓA NGAY ỨNG DỤNG NGÂN HÀNG (Freeze Bank App Transfers)",
        "desc": "Dừng ngay ứng dụng ngân hàng, chặn dứt khoát mọi thao tác chuyển thêm tiền cho kẻ gian.",
        "successLog": "ĐÃ CHẶN GIAO DỊCH! Ngăn chặn kịp thời khoản nạp 70.000.000 VNĐ tiền thuế và phí ảo.",
        "threatMitigation": "Bảo vệ an toàn 200 triệu quỹ tiền sửa nhà của gia đình."
      },
      {
        "id": "act_crypto_check_domain",
        "icon": "🔍",
        "title": "🔍 VẠCH TRẦN TÊN MIỀN TRÊN TINNHIEMMANG.VN (Domain Legitimacy Audit)",
        "desc": "Tra cứu tên miền sàn trên Cổng Tín nhiệm mạng (tinnhiemmang.vn) để chỉ ra sàn lừa đảo không phép.",
        "successLog": "VẠCH TRẦN GIAN LẬN! Cổng Tín nhiệm mạng xác nhận tên miền là website lừa đảo không phép.",
        "threatMitigation": "Nạn nhân tỉnh ngộ, nhận ra số dư lãi 120 triệu chỉ là đồ họa ảo."
      },
      {
        "id": "act_crypto_save_chats",
        "icon": "📸",
        "title": "🛑 LƯU GIỮ BẰNG CHỨNG GIAO DỊCH VÀ TIN NHẮN (Archive Chat History)",
        "desc": "Lưu lại toàn bộ lịch sử trò chuyện, ảnh chân dung kẻ lừa đảo và số tài khoản ngân hàng thụ hưởng.",
        "successLog": "ĐÃ LƯU BẰNG CHỨNG! Trích xuất toàn bộ dữ liệu giao dịch và thông tin kẻ cầm đầu.",
        "threatMitigation": "Chứng cứ đầy đủ cho hồ sơ tố giác tội phạm công nghệ cao."
      },
      {
        "id": "act_crypto_report_cyber",
        "icon": "🏛️",
        "title": "🏛️ GỬI ĐƠN TỐ GIÁC TỚI CỤC AN NINH MẠNG PA05 (Report Fraud Ring)",
        "desc": "Làm đơn tố giác tội phạm gửi Phòng An ninh mạng & Phòng chống tội phạm công nghệ cao.",
        "successLog": "ĐÃ TIẾP NHẬN TỐ GIÁC! Phòng An ninh mạng ghi nhận hồ sơ và đưa tài khoản vào danh sách theo dõi.",
        "threatMitigation": "Hỗ trợ lực lượng chức năng truy quét đường dây lừa đảo quốc tế."
      },
      {
        "id": "act_fatal_crypto_pay_tax",
        "icon": "💸",
        "title": "Vội vã nộp 30 triệu tiền thuế để giải cứu số tiền lãi 120 triệu trên sàn",
        "desc": "Cố gắng chuyển thêm tiền để rút được tiền lãi hiển thị.",
        "isFatal": true,
        "fatalReason": "SẬP BẪY RÚT RUỘT! Con số 120 triệu lãi trên màn hình hoàn toàn là đồ họa ảo do kẻ gian tự nhập vào! Sau khi bạn nộp 30 triệu thuế, chúng sẽ tiếp tục vẽ ra lý do \"lỗi thanh khoản\" đòi nộp thêm 50 triệu nữa!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_crypto_threaten",
        "icon": "💬",
        "title": "Nhắn tin đe dọa sẽ báo công an nếu sàn không cho rút tiền ngay",
        "desc": "Cảnh báo đối tượng lừa đảo qua khung chat hỗ trợ.",
        "isFatal": true,
        "fatalReason": "ĐÁNH ĐỘNG KẺ GIAN! Kẻ lừa đảo lập tức xóa tài khoản của bạn trên hệ thống, đóng khung chat và cắt đứt toàn bộ dấu vết, khiến việc truy tìm trở nên bất khả thi!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_crypto_freeze_transfer",
      "act_crypto_check_domain",
      "act_crypto_save_chats",
      "act_crypto_report_cyber"
    ],
    "forensicLesson": "Cảnh giác với chiêu trò lừa đảo tình cảm dẫn dụ đầu tư tài chính (Pig Butchering Scam). Mọi sàn giao dịch Forex, tiền mã hóa cam kết lợi nhuận khủng tại Việt Nam đều là bất hợp pháp và lừa đảo 100%."
  },
  {
    "id": 11,
    "code": "INCIDENT #11",
    "title": "Mã Độc Infostealer Đánh Cắp Cookie & Mật Khẩu Trình Duyệt",
    "victimName": "Huy Hoàng (22 tuổi • Lập trình viên tự do)",
    "victimDevice": "Laptop Dell XPS • Windows 11",
    "threatLevel": "CRITICAL",
    "targetAsset": "Toàn bộ tài khoản Google, GitHub, ví tiền số & Mật khẩu lưu trên Chrome",
    "initialTime": 60,
    "initialPhoneStatus": "Mã độc đang trích xuất tệp SQLite cookies của Chrome và gửi về máy chủ C2...",
    "story": "Vừa tải và giải nén tệp \"Photoshop_Crack_Full.zip\". Màn hình nháy đen trong 1 giây. Ngay sau đó, điện thoại liên tục nhận thông báo: Tài khoản Google bị truy cập từ IP lạ tại nước ngoài, mã 2FA bị vượt qua nhờ đánh cắp phiên đăng nhập (Cookie Session).",
    "actions": [
      {
        "id": "act_stealer_pull_cable",
        "icon": "🔌",
        "title": "⚡ RÚT CÁP MẠNG LAN & TẮT WI-FI NGAY LẬP TỨC (Physical Air-Gap)",
        "desc": "Ngắt ngay đường truyền Internet để cách ly máy tính đang nhiễm, chặn mã độc gửi tiếp dữ liệu.",
        "successLog": "ĐÃ CÁCH LY MÁY TÍNH! Quá trình trích xuất cookie và mật khẩu trình duyệt bị chặn đứng.",
        "threatMitigation": "Bảo vệ các tài khoản còn lại chưa bị gửi tệp dữ liệu về máy chủ hacker."
      },
      {
        "id": "act_stealer_phone_reset",
        "icon": "📱",
        "title": "📱 ĐỔI MẬT KHẨU TỪ ĐIỆN THOẠI SẠCH (Reset Credentials via Clean Device)",
        "desc": "Dùng điện thoại cá nhân sạch đổi mật khẩu Google chính và đăng xuất khỏi mọi thiết bị.",
        "successLog": "ĐÃ ĐỔI MẬT KHẨU TỪ MÁY SẠCH! Toàn bộ phiên cookie cũ của hacker bị vô hiệu hóa.",
        "threatMitigation": "Lấy lại quyền làm chủ tài khoản Google và GitHub."
      },
      {
        "id": "act_stealer_revoke_tokens",
        "icon": "🔒",
        "title": "🛑 THU HỒI TOKEN & ĐỔI MẬT KHẨU VÍ TIỀN SỐ (Revoke API Tokens & Wallets)",
        "desc": "Thu hồi toàn bộ API tokens, khóa thẻ ngân hàng và chuyển tài sản sang ví an toàn mới.",
        "successLog": "ĐÃ BẢO VỆ TÀI SẢN SỐ! Token thanh toán và khóa thẻ ngân hàng được phong tỏa kịp thời.",
        "threatMitigation": "Không có giao dịch tài chính trái phép nào phát sinh."
      },
      {
        "id": "act_stealer_reinstall_os",
        "icon": "💻",
        "title": "🧹 CÀI LẠI WINDOWS TỪ USB CỨU HỘ SẠCH (Clean OS Reinstallation)",
        "desc": "Khởi động máy tính vào USB cứu hộ sạch để sao lưu dữ liệu thô và cài lại Windows.",
        "successLog": "ĐÃ LÀM SẠCH HOÀN TOÀN! Hệ điều hành mới được cài đặt sạch sẽ, triệt tiêu mã độc.",
        "threatMitigation": "Máy tính an toàn 100%, sẵn sàng làm việc trở lại."
      },
      {
        "id": "act_fatal_stealer_login_same_pc",
        "icon": "🔑",
        "title": "Đăng nhập vào ngân hàng trên chính chiếc máy tính vừa dính mã độc để kiểm tra tiền",
        "desc": "Kiểm tra tài khoản ngân hàng trực tiếp trên máy đang nhiễm.",
        "isFatal": true,
        "fatalReason": "THẢM HỌA BẢO MẬT! Mã độc Infostealer đang chạy ngầm trên máy sẽ lập tức ghi lại toàn bộ tên đăng nhập và mật khẩu ngân hàng bạn vừa gõ! Tài khoản bị rút sạch trong chớp mắt!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_stealer_antivirus_only",
        "icon": "🛡️",
        "title": "Chỉ chạy phần mềm diệt virus miễn phí quét qua loa rồi tiếp tục dùng máy làm việc",
        "desc": "Chủ quan cho rằng phần mềm diệt virus quét xong là an toàn.",
        "isFatal": true,
        "fatalReason": "MÃ ĐỘC VẪN TỒN TẠI! Dòng mã độc Lumma/RedLine Stealer thường cài backdoor ẩn sâu trong Registry/WMI. Hacker tiếp tục theo dõi và đánh cắp dữ liệu mới của bạn!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_stealer_pull_cable",
      "act_stealer_phone_reset",
      "act_stealer_revoke_tokens",
      "act_stealer_reinstall_os"
    ],
    "forensicLesson": "Không cài đặt phần mềm crack, tệp bẻ khóa không rõ nguồn gốc. Khi máy tính bị dính mã độc đánh cắp dữ liệu (Infostealer), PHẢI ngắt mạng ngay lập tức và dùng một thiết bị sạch khác để đổi toàn bộ mật khẩu quan trọng."
  },
  {
    "id": 12,
    "code": "INCIDENT #12",
    "title": "Bẫy Mã QR \"Bưu Phẩm COD Lạ\" Kèm Cổng Thanh Toán Ngân Hàng Giả",
    "victimName": "Cô Hạnh (51 tuổi • Nội trợ)",
    "victimDevice": "Samsung Galaxy S23 • Android 14",
    "threatLevel": "HIGH",
    "targetAsset": "60.000.000 VNĐ trong tài khoản thanh toán",
    "initialTime": 60,
    "initialPhoneStatus": "Trang web giả mạo cổng thanh toán ngân hàng đang chờ nhập mã Smart OTP...",
    "story": "Nhận một gói hàng COD 30.000đ mà cô không hề đặt. Shipper bảo \"nếu không có tiền mặt thì quét mã QR trên hộp để chuyển khoản\". Mã QR mở ra một trang web có logo ngân hàng, yêu cầu nhập số tài khoản, mật khẩu và mã Smart OTP để \"xác thực giao dịch\".",
    "actions": [
      {
        "id": "act_cod_refuse_pkg",
        "icon": "📦",
        "title": "⚡ TỪ CHỐI GÓI HÀNG LẠ & ĐÓNG NGAY TRANG WEB (Refuse Unordered Package)",
        "desc": "Từ chối nhận gói hàng không rõ nguồn gốc và đóng ngay lập tức trang web trên điện thoại.",
        "successLog": "ĐÃ TỪ CHỐI ĐƠN HÀNG LẠ! Gói hàng giả mạo bị trả về, trang web lừa đảo bị đóng.",
        "threatMitigation": "Chặn đứng bẫy lừa thu thập thông tin tài khoản."
      },
      {
        "id": "act_cod_never_otp",
        "icon": "🛑",
        "title": "🛑 TUYỆT ĐỐI KHÔNG NHẬP MÃ SMART OTP (Never Input Bank OTPs)",
        "desc": "Tuyệt đối không nhập tên đăng nhập, mật khẩu hay bất kỳ mã OTP nào vào trang web lạ.",
        "successLog": "BẢO MẬT OTP THÀNH CÔNG! Kẻ gian không thu thập được bất kỳ thông tin xác thực nào.",
        "threatMitigation": "Tài khoản ngân hàng của cô Hạnh được bảo vệ nguyên vẹn."
      },
      {
        "id": "act_cod_change_pwd",
        "icon": "🔒",
        "title": "🔑 KHÓA CHIỀU THANH TOÁN TRỰC TUYẾN TRÊN APP (Lock Online Payments)",
        "desc": "Mở ứng dụng ngân hàng chính thống đổi mật khẩu và khóa chức năng thanh toán trực tuyến.",
        "successLog": "ĐÃ KHÓA THANH TOÁN TRỰC TUYẾN! Thẻ và tài khoản được đưa về chế độ an toàn tối đa.",
        "threatMitigation": "Ngăn ngừa mọi nguy cơ phát sinh từ mã độc web."
      },
      {
        "id": "act_cod_report_carrier",
        "icon": "📞",
        "title": "📞 PHẢN ÁNH ĐƠN VỊ VẬN CHUYỂN VÀ SỐ SHIPPER (Report Delivery Scam)",
        "desc": "Báo cáo số điện thoại shipper và đơn vị vận chuyển mạo danh lên tổng đài bảo vệ người tiêu dùng.",
        "successLog": "ĐÃ GỬI BÁO CÁO! Thông tin đối tượng được lưu giữ phục vụ phòng ngừa lừa đảo COD.",
        "threatMitigation": "Giúp ngăn chặn kẻ lừa đảo tiếp tục nhắm vào người dân khu vực."
      },
      {
        "id": "act_fatal_cod_enter_smart_otp",
        "icon": "🔑",
        "title": "Nhập mã Smart OTP hiển thị trên app ngân hàng vào trang web để shipper hủy lệnh trừ tiền",
        "desc": "Cung cấp mã xác thực OTP theo lời dỗ dành của đối tượng.",
        "isFatal": true,
        "fatalReason": "MẤT SẠCH TIỀN TIẾT KIỆM! Mã Smart OTP chính là bước xác thực cuối cùng để kẻ gian chuyển toàn bộ 60 triệu trong tài khoản của bạn sang tài khoản khác! Tiền bị rút sạch ngay khi bạn bấm xác nhận!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_cod_click_help_link",
        "icon": "🔗",
        "title": "Bấm vào đường link \"Hỗ trợ hủy đơn hàng miễn phí\" do shipper gửi qua tin nhắn SMS",
        "desc": "Nhấn vào liên kết hỗ trợ từ tin nhắn người lạ.",
        "isFatal": true,
        "fatalReason": "CÀI MÃ ĐỘC VÀO MÁY! Đường link dẫn đến trang web độc hại tự động tải tệp APK chứa trojan gián điệp, âm thầm đọc trộm toàn bộ tin nhắn SMS trên điện thoại!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_cod_refuse_pkg",
      "act_cod_never_otp",
      "act_cod_change_pwd",
      "act_cod_report_carrier"
    ],
    "forensicLesson": "Tuyệt đối không nhận các đơn hàng COD không rõ nguồn gốc. Không quét mã QR lạ trên bao bì hàng hóa. KHÔNG BAO GIỜ nhập mật khẩu ngân hàng hoặc mã Smart OTP lên bất kỳ trang web nào ngoài ứng dụng chính thức."
  },
  {
    "id": 13,
    "code": "INCIDENT #13",
    "title": "Cuộc Gọi Khẩn Cấp \"Con Đang Cấp Cứu Cần Chuyển Viện Phí Gấp\"",
    "victimName": "Chị Thu Hà (40 tuổi • Nhân viên văn phòng)",
    "victimDevice": "iPhone 14 Plus • iOS 17",
    "threatLevel": "EXTREME",
    "targetAsset": "50.000.000 VNĐ tiền viện phí khẩn cấp",
    "initialTime": 60,
    "initialPhoneStatus": "Nạn nhân đang vô cùng hoảng loạn, mở sẵn app ngân hàng chuẩn bị bấm chuyển tiền...",
    "story": "Chị nhận cuộc gọi từ người tự xưng là bác sĩ khoa cấp cứu Bệnh viện Chợ Rẫy, báo con trai chị bị tai nạn chấn thương sọ não nghiêm trọng tại trường, đang ở phòng mổ cấp cứu. Bác sĩ yêu cầu chuyển gấp 50 triệu vào số tài khoản cá nhân của bác sĩ để xuất thuốc đặc trị mổ ngay trong 15 phút, nếu chậm trễ sẽ nguy hiểm tính mạng!",
    "actions": [
      {
        "id": "act_hospital_stay_calm",
        "icon": "🛑",
        "title": "⚡ GIỮ BÌNH TĨNH & DỪNG NGAY THAO TÁC CHUYỂN TIỀN (Hold Transfers)",
        "desc": "Giữ bình tĩnh, tuyệt đối KHÔNG chuyển tiền ngay vào tài khoản cá nhân của người gọi.",
        "successLog": "ĐÃ KIỂM SOÁT TÌNH HÌNH! Chị Hà giữ bình tĩnh, dừng ngón tay trước nút xác nhận chuyển tiền.",
        "threatMitigation": "Bảo vệ an toàn 50.000.000 VNĐ trong tài khoản."
      },
      {
        "id": "act_hospital_call_school",
        "icon": "📞",
        "title": "📞 DÙNG MÁY KHÁC GỌI NGAY CHO GIÁO VIÊN CHỦ NHIỆM (Verify with School)",
        "desc": "Giữ nguyên máy và dùng ngay một điện thoại khác gọi cho giáo viên chủ nhiệm hoặc ban giám hiệu.",
        "successLog": "XÁC MINH NHÀ TRƯỜNG! Cô giáo chủ nhiệm khẳng định con đang ngồi học thể dục hoàn toàn khỏe mạnh!",
        "threatMitigation": "Vạch trần 100% kịch bản lừa đảo bắt cóc online / cấp cứu giả."
      },
      {
        "id": "act_hospital_call_hotline",
        "icon": "🏥",
        "title": "🏥 GỌI ĐƯỜNG DÂY NÓNG CHÍNH THỨC CỦA BỆNH VIỆN (Check Hospital Hotline)",
        "desc": "Gọi đường dây nóng chính thức của bệnh viện để đối chiếu danh sách bệnh nhân cấp cứu.",
        "successLog": "BỆNH VIỆN XÁC NHẬN! Bệnh viện khẳng định không có bác sĩ nào gọi điện xin tiền qua tài khoản cá nhân.",
        "threatMitigation": "Quy trình cấp cứu bệnh viện luôn ưu tiên cứu người trước thủ tục viện phí."
      },
      {
        "id": "act_hospital_report_cyber",
        "icon": "🏛️",
        "title": "🏛️ BÁO NGAY SỐ ĐIỆN THOẠI ĐỐI TƯỢNG CHO CÔNG AN (Report Extortion Line)",
        "desc": "Báo ngay số điện thoại và số tài khoản của kẻ lừa đảo tới cơ quan công an.",
        "successLog": "ĐÃ BÁO CÁO CƠ QUAN CHỨC NĂNG! Hồ sơ cuộc gọi lừa đảo được chuyển đến cơ quan điều tra.",
        "threatMitigation": "Chung tay ngăn chặn kẻ gian tiếp tục lừa đảo các phụ huynh khác."
      },
      {
        "id": "act_fatal_hospital_quick_transfer",
        "icon": "💸",
        "title": "Vì quá lo sợ tính mạng của con nên chuyển ngay 50 triệu vào tài khoản cá nhân của bác sĩ",
        "desc": "Vội vã chuyển tiền mà không xác minh lại với nhà trường.",
        "isFatal": true,
        "fatalReason": "SẬP BẪY TÂM LÝ! Kẻ gian lợi dụng triệt để tình mẫu tử để lừa đảo! Sau khi bạn chuyển 50 triệu, chúng sẽ tiếp tục gọi báo \"cần thêm 100 triệu mua máy thở\" cho đến khi bạn kiệt quệ tài chính!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_hospital_rush_alone",
        "icon": "🛵",
        "title": "Tự lái xe máy một mình chạy bạt mạng đến bệnh viện trong tình trạng mất kiểm soát",
        "desc": "Bỏ đi trong hoảng loạn mà không liên lạc với ai.",
        "isFatal": true,
        "fatalReason": "NGUY HIỂM TÍNH MẠNG! Lái xe trong trạng thái hoảng loạn cực độ rất dễ gây tai nạn giao thông nghiêm trọng cho chính bản thân, đồng thời bỏ lỡ thời điểm vàng xác minh thông tin với nhà trường!",
        "successLog": "",
        "threatMitigation": ""
      }
    ],
    "requiredSequence": [
      "act_hospital_stay_calm",
      "act_hospital_call_school",
      "act_hospital_call_hotline",
      "act_hospital_report_cyber"
    ],
    "forensicLesson": "Thủ đoạn lừa đảo \"Con đang cấp cứu cần tiền mổ gấp\" là kịch bản độc ác đánh vào tâm lý hoảng loạn của phụ huynh. Bệnh viện luôn ưu tiên cứu chữa tính mạng trước và KHÔNG BAO GIỜ yêu cầu chuyển tiền vào tài khoản cá nhân bác sĩ. Luôn gọi ngay cho giáo viên để xác minh."
  }
];
let incidentIdx = 0;
let score = 0;
let lives = 3;
let timeRemaining = 60;
let timerInterval: number | null = null;
let currentPhase: 'intro' | 'active' | 'result' | 'summary' = 'intro';

// Incident State
let networkOnline = true;
let screenOverlayActive = true;
let camActive = false;
let phoneStatusLabel = '';
let threatLogs: { time: string; text: string; type: 'threat' | 'success' | 'warn' }[] = [];
let completedActions: Set<string> = new Set();
let resultStatus: 'success' | 'fail' | undefined;
let resultFeedback = '';
let forensicLesson = '';
let sessionId = '';
const history: IncidentHistoryItem[] = [];

function content(): HTMLElement {
  const el = document.getElementById('familyContent') || document.getElementById('familyAppContent');
  if (!el) throw new Error('#familyContent not found');
  return el;
}

function stats(): HTMLElement | null {
  return document.getElementById('familyStats');
}

export function openFamilyGame(): void {
  sessionId = createSessionId();
  incidentIdx = 0;
  score = 0;
  lives = 3;
  history.length = 0;
  currentPhase = 'intro';
  clearTimer();
  stats()?.classList.remove('hidden');
  render();
}

function startAll(): void {
  incidentIdx = 0;
  score = 0;
  lives = 3;
  history.length = 0;
  startIncident(0);
}

function clearTimer(): void {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startIncident(index: number): void {
  clearTimer();
  incidentIdx = index;
  const inc = INCIDENTS[index];
  currentPhase = 'active';
  timeRemaining = inc.initialTime;
  networkOnline = true;
  screenOverlayActive = true;
  camActive = inc.id === 3; // camera active on spyware incident
  phoneStatusLabel = inc.initialPhoneStatus;
  completedActions.clear();
  resultStatus = undefined;
  resultFeedback = '';
  forensicLesson = inc.forensicLesson;

  threatLogs = [
    { time: '00:00', text: `PHÁT HIỆN SỰ CỐ: ${inc.title}`, type: 'threat' },
    { time: '00:01', text: `Tài sản gặp nguy biến: ${inc.targetAsset}`, type: 'warn' },
    { time: '00:02', text: 'Kẻ gian đang điều khiển tiến trình hệ thống...', type: 'threat' }
  ];

  playSirenAlert();
  render();

  // Start Real-Time 60s Countdown Timer
  timerInterval = window.setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      const isUrgent = timeRemaining <= 15;
      playTickTock(isUrgent);

      if (timeRemaining === 15) {
        playSirenAlert();
        playEmergencyHeartbeat();
      }

      // Update timer DOM element directly for smooth 60fps countdown
      const digitsEl = document.getElementById('iruTimerDigits');
      if (digitsEl) {
        const timeFormatted = `${String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:${String(timeRemaining % 60).padStart(2, '0')}`;
        digitsEl.textContent = timeFormatted;
      }

      if (timeRemaining === 0) {
        handleTimeout();
      }
    }
  }, 1000);
}

function handleTimeout(): void {
  clearTimer();
  lives--;
  beep('G2', '8n');
  const inc = INCIDENTS[incidentIdx];
  resultStatus = 'fail';
  resultFeedback = 'HẾT GIỜ (00:00)! Bạn không kịp thực hiện các biện pháp ngắt mạng & đóng băng dòng tiền trong 60 giây. Kẻ gian đã kịp rút sạch toàn bộ tài sản!';
  threatLogs.push({ time: '00:60', text: 'THẤT BẠI: Lệnh chuyển tiền hoàn tất. Tài sản bị đánh cắp!', type: 'threat' });

  history.push({
    code: inc.code,
    title: inc.title,
    targetAsset: inc.targetAsset,
    won: false,
    timeElapsed: inc.initialTime,
    lesson: inc.forensicLesson
  });

  render();
}

function executeAction(actionId: string): void {
  if (currentPhase !== 'active' || resultStatus) return;
  const inc = INCIDENTS[incidentIdx];
  const action = inc.actions.find(a => a.id === actionId);
  if (!action || completedActions.has(actionId)) return;

  const timeFormatted = `${String(Math.floor((inc.initialTime - timeRemaining) / 60)).padStart(2, '0')}:${String((inc.initialTime - timeRemaining) % 60).padStart(2, '0')}`;

  // Check Fatal Blunder
  if (action.isFatal) {
    clearTimer();
    lives--;
    beep('G2', '8n');
    playEmergencyHeartbeat();
    resultStatus = 'fail';
    resultFeedback = action.fatalReason || 'Sai lầm chiến thuật nghiêm trọng!';
    threatLogs.push({ time: timeFormatted, text: `LỖI TAI HẠI: ${action.title}`, type: 'threat' });

    history.push({
      code: inc.code,
      title: inc.title,
      targetAsset: inc.targetAsset,
      won: false,
      timeElapsed: inc.initialTime - timeRemaining,
      lesson: inc.forensicLesson
    });

    render();
    return;
  }

  // Check sequence order requirement
  const currentStepIdx = completedActions.size;
  const expectedActionId = inc.requiredSequence[currentStepIdx];

  if (action.id !== expectedActionId) {
    playActionBeep();
    beep('F3', '16n');
    threatLogs.push({
      time: timeFormatted,
      text: `CHƯA THỂ THỰC HIỆN: Cần tuân thủ quy trình SOP ưu tiên trước (${action.title} chưa phù hợp lúc này).`,
      type: 'warn'
    });
    render();
    return;
  }

  // Valid step in sequence executed!
  completedActions.add(action.id);
  playActionBeep();

  // Specific state transitions
  if (action.id === 'act_airplane' || action.id === 'act_cut_cloud_sync') {
    networkOnline = false;
    phoneStatusLabel = 'Đã ngắt toàn bộ Wifi/4G • Tín hiệu hacker bị cắt đứt';
    playSystemHalt();
  }
  if (action.id === 'act_revoke_accessibility' || action.id === 'act_reboot_safe' || action.id === 'act_recovery_clean') {
    screenOverlayActive = false;
    camActive = false;
    phoneStatusLabel = 'Đã tước quyền chiếm đoạt • Màn hình an toàn';
    beep('C5', '8n');
  }

  threatLogs.push({
    time: timeFormatted,
    text: action.successLog,
    type: 'success'
  });

  // Check if all steps in sequence completed -> SUCCESS!
  if (completedActions.size === inc.requiredSequence.length) {
    clearTimer();
    score++;
    playTacticalSuccess();
    resultStatus = 'success';
    const elapsed = inc.initialTime - timeRemaining;
    resultFeedback = `XUẤT SẮC! Bạn đã xử lý chuẩn xác 100% quy trình SOP chỉ trong ${elapsed} giây! Bảo toàn trọn vẹn ${inc.targetAsset}!`;

    history.push({
      code: inc.code,
      title: inc.title,
      targetAsset: inc.targetAsset,
      won: true,
      timeElapsed: elapsed,
      lesson: inc.forensicLesson
    });
  }

  render();
}

function nextIncident(): void {
  if (lives === 0 || incidentIdx === INCIDENTS.length - 1) {
    finishGame();
  } else {
    startIncident(incidentIdx + 1);
  }
}

function finishGame(): void {
  clearTimer();
  currentPhase = 'summary';

  if (lives > 0 && history.length === INCIDENTS.length) {
    document.dispatchEvent(new CustomEvent<FamilyGameResult>('family-completed', {
      detail: { score, maxScore: INCIDENTS.length, livesLeft: lives, sessionId },
    }));
  }

  stats()?.classList.add('hidden');
  render();
}

function render(): void {
  const root = content();
  if (!root) return;

  if (currentPhase === 'intro') {
    root.innerHTML = renderIncidentIntro(INCIDENTS.length);
    return;
  }

  if (currentPhase === 'summary') {
    root.innerHTML = renderIncidentSummary(history, score, lives, INCIDENTS.length);
    return;
  }

  const inc = INCIDENTS[incidentIdx];

  const viewState: IncidentViewState = {
    incidentIdx,
    total: INCIDENTS.length,
    code: inc.code,
    threatLevel: inc.threatLevel,
    title: inc.title,
    victimName: inc.victimName,
    victimDevice: inc.victimDevice,
    targetAsset: inc.targetAsset,
    story: inc.story,
    timeRemaining,
    lives,
    score,
    networkOnline,
    screenOverlayActive,
    camActive,
    phoneStatusLabel,
    threatLogs,
    completedActions,
    availableActions: inc.actions,
    stepCurrent: completedActions.size,
    stepTotal: inc.requiredSequence.length,
    resultStatus,
    resultFeedback,
    forensicLesson
  };

  root.innerHTML = renderIncidentDashboard(viewState);

  // Auto scroll threat feed on phone
  const feedEl = document.getElementById('iruThreatFeed');
  if (feedEl) feedEl.scrollTop = feedEl.scrollHeight;
}

// Global click event delegation for Incident Response Unit (IRU)
document.addEventListener('click', event => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>('[data-iru]');
  if (!button || button.disabled) return;

  const action = button.dataset.iru;
  switch (action) {
    case 'start-first':
      startAll();
      break;
    case 'execute-action': {
      const actionId = button.dataset.actionId;
      if (actionId) executeAction(actionId);
      break;
    }
    case 'next-incident':
      nextIncident();
      break;
    case 'restart-all':
      startAll();
      break;
  }
});
