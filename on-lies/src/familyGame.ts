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
    id: 1,
    code: 'INCIDENT #01',
    title: 'Mã Độc Chiếm Quyền Trợ Năng (Accessibility Trojan)',
    victimName: 'Chị Ngọc Mai (31 tuổi • Kế toán viên)',
    victimDevice: 'Samsung Galaxy A54 • Android 14',
    threatLevel: 'CRITICAL',
    targetAsset: '85.000.000 VNĐ (Tài khoản thanh toán lương)',
    initialTime: 60,
    initialPhoneStatus: 'Mã độc đang gửi lệnh chuyển tiền ngầm qua cổng 443...',
    story: 'Nạn nhân vừa bấm vào đường link cài file "DichVuCong_CapNhat.apk". Màn hình điện thoại đột nhiên bị đen mờ, các nút cảm ứng bị vô hiệu hóa. Kẻ gian từ xa đang tự động mở app ngân hàng, tạo lệnh chuyển 80.000.000 VNĐ sang tài khoản lạ và đếm ngược chờ hoàn tất!',
    actions: [
      {
        id: 'act_airplane',
        icon: '✈️',
        title: 'Bật Chế độ máy bay / Ngắt Wifi & 4G',
        desc: 'Cắt đứt ngay lập tức đường truyền Internet kết nối máy chủ điều khiển C2 của hacker.',
        successLog: 'ĐÃ CẮT KẾT NỐI MẠNG: Tín hiệu C2 của hacker bị ngắt hoàn toàn! Lệnh chuyển tiền bị kẹt.',
        threatMitigation: 'Hacker mất quyền điều khiển từ xa. Form chuyển tiền báo lỗi Network Connection.'
      },
      {
        id: 'act_revoke_accessibility',
        icon: '🛑',
        title: 'Thu hồi quyền Trợ năng (Accessibility) & Buộc dừng App',
        desc: 'Tước đoạt quyền tự đọc màn hình và tự điều khiển cảm ứng của tệp APK độc.',
        successLog: 'ĐÃ THU HỒI TRỢ NĂNG: Lớp phủ đen biến mất, tệp APK độc bị đình chỉ quyền hệ thống.',
        threatMitigation: 'Màn hình cảm ứng sáng rõ trở lại, nạn nhân lấy lại quyền làm chủ máy.'
      },
      {
        id: 'act_lock_card_secondary',
        icon: '🔒',
        title: 'Dùng thiết bị phụ (Laptop) đăng nhập khóa khẩn cấp thẻ & tài khoản',
        desc: 'Đóng băng dòng tiền ngân hàng từ một kênh độc lập an toàn chưa bị nhiễm mã độc.',
        successLog: 'ĐÃ KHÓA TÀI SẢN: Tài khoản ngân hàng và thẻ được đặt hạn mức 0 VNĐ.',
        threatMitigation: 'Mọi giao dịch phát sinh đều bị hệ thống ngân hàng từ chối.'
      },
      {
        id: 'act_safe_mode_clean',
        icon: '🧹',
        title: 'Khởi động vào Safe Mode & Gỡ bỏ tận gốc tệp .APK độc',
        desc: 'Quét sạch mã độc khỏi hệ điều hành mà không cho mã độc tự kích hoạt lại.',
        successLog: 'ĐÃ LÀM SẠCH: Gỡ bỏ hoàn toàn DichVuCong_CapNhat.apk khỏi bộ nhớ máy.',
        threatMitigation: 'Thiết bị hoàn toàn sạch bóng mã độc, hệ thống an toàn 100%.'
      },
      {
        id: 'act_fatal_enter_pwd',
        icon: '🔑',
        title: 'Mở trực tiếp App ngân hàng trên máy đổi mật khẩu ngay',
        desc: 'Đổi mật khẩu mới ngay trên màn hình điện thoại đang bị nhiễm mã độc.',
        isFatal: true,
        fatalReason: 'SAI LẦM CHẾT NGƯỜI: Mã độc đang chạy ngầm và ghi lại toàn bộ thao tác phím (Keylogger) & quay video màn hình. Bạn nhập mật khẩu mới vào chính là dâng mật khẩu mới cho hacker! 80 triệu bị rút sạch ngay lập tức!',
        successLog: '',
        threatMitigation: ''
      },
      {
        id: 'act_fatal_call_scammer',
        icon: '📞',
        title: 'Gọi điện thoại cho số lạ chửi bới yêu cầu dừng lại',
        desc: 'Cố gắng tranh luận bằng điện thoại để đe dọa kẻ gian.',
        isFatal: true,
        fatalReason: 'SAI LẦM TAI HẠI: Kẻ lừa đảo biết nạn nhân đã phát hiện, lập tức kích hoạt lệnh rút tiền khẩn cấp từ xa. Tiền bị tẩu tán trong chớp mắt!',
        successLog: '',
        threatMitigation: ''
      }
    ],
    requiredSequence: ['act_airplane', 'act_revoke_accessibility', 'act_lock_card_secondary', 'act_safe_mode_clean'],
    forensicLesson: 'Quy tắc vàng khi bị mã độc Trợ năng (Accessibility Trojan): BƯỚC 1 PHẢI LÀ NGẮT MẠNG (Chế độ máy bay) để cắt quyền điều khiển từ xa của hacker. Tuyệt đối không nhập bất kỳ mật khẩu nào trên máy đang nhiễm.'
  },
  {
    id: 2,
    code: 'INCIDENT #02',
    title: 'Chiếm Đoạt Quyền SIM & Hack Phiên Đăng Nhập (SIM Swap)',
    victimName: 'Anh Tuấn (36 tuổi • Chủ shop thời trang)',
    victimDevice: 'iPhone 15 Pro • iOS 18',
    threatLevel: 'EXTREME',
    targetAsset: 'Ví MoMo 40.000.000 VNĐ & Danh bạ 500 khách hàng',
    initialTime: 60,
    initialPhoneStatus: 'SIM báo Không có Dịch vụ • Hacker đang yêu cầu mã xác thực...',
    story: 'SIM điện thoại đột ngột mất sóng ("Không có dịch vụ"). Thông báo Telegram/Email trên máy tính cảnh báo có phiên đăng nhập mới từ IP Campuchia. Kẻ gian vừa cướp số SIM và đang chuẩn bị đổi tài khoản ví điện tử liên kết số điện thoại!',
    actions: [
      {
        id: 'act_revoke_sessions',
        icon: '💻',
        title: 'Dùng máy tính bấm "Đăng xuất khỏi tất cả phiên làm việc khác"',
        desc: 'Đá văng ngay lập tức kết nối của hacker khỏi tài khoản Telegram/Zalo/Email.',
        successLog: 'ĐÃ ĐĂNG XUẤT: Phiên đăng nhập trái phép tại Campuchia bị cắt đứt tức thì.',
        threatMitigation: 'Hacker bị mất phiên truy cập vào hòm thư và ứng dụng nhắn tin.'
      },
      {
        id: 'act_lock_sim',
        icon: '📞',
        title: 'Dùng điện thoại bàn gọi tổng đài nhà mạng khóa khẩn cấp số SIM bị cướp',
        desc: 'Yêu cầu nhà mạng vô hiệu hóa ngay phôi SIM rác mà kẻ gian vừa chiếm quyền.',
        successLog: 'ĐÃ KHÓA SỐ SIM: Phôi SIM giả mạo bị cắt chiều nhận cuộc gọi và tin nhắn SMS OTP.',
        threatMitigation: 'Kẻ gian không thể nhận thêm bất kỳ mã xác thực OTP nào.'
      },
      {
        id: 'act_freeze_wallet',
        icon: '🔒',
        title: 'Đăng nhập ví điện tử & App ngân hàng trên máy tính đóng băng tài khoản',
        desc: 'Tạm khóa tính năng liên kết ví và chuyển tiền từ website ngân hàng.',
        successLog: 'ĐÃ ĐÓNG BĂNG VÍ: Mọi giao dịch chuyển tiền từ ví MoMo tạm thời bị khóa cứng.',
        threatMitigation: 'Toàn bộ 40.000.000 VNĐ trong ví được bảo toàn an toàn.'
      },
      {
        id: 'act_hardware_2fa',
        icon: '🛡️',
        title: 'Kích hoạt xác thực 2 yếu tố (2FA) qua ứng dụng Authenticator',
        desc: 'Loại bỏ hoàn toàn cơ chế nhận OTP qua SMS dễ bị đánh cắp.',
        successLog: 'ĐÃ NÂNG CẤP 2FA: Tài khoản được bảo vệ bằng mã bảo mật Authenticator.',
        threatMitigation: 'Triệt tiêu hoàn toàn nguy cơ bị chiếm đoạt tài khoản trong tương lai.'
      },
      {
        id: 'act_fatal_sms_reset',
        icon: '📩',
        title: 'Bấm "Quên mật khẩu" nhận mã OTP về số SIM đang mất sóng',
        desc: 'Cố gắng khôi phục tài khoản bằng cách nhận mã OTP về số điện thoại.',
        isFatal: true,
        fatalReason: 'SAI LẦM NGHIÊM TRỌNG: SIM của bạn đã bị kẻ gian nhân bản cướp sóng! Bạn bấm gửi OTP là mã sẽ nhảy thẳng về máy của hacker, giúp chúng đổi mật khẩu ví nhanh hơn!',
        successLog: '',
        threatMitigation: ''
      },
      {
        id: 'act_fatal_wait_tomorrow',
        icon: '⏳',
        title: 'Chờ đến sáng mai ra quầy giao dịch nhà mạng làm lại SIM',
        desc: 'Để qua đêm rồi sáng mai mới ra cửa hàng viễn thông.',
        isFatal: true,
        fatalReason: 'SAI LẦM CHẬM TRỄ: Tội phạm SIM Swap chuyên hành động vào ban đêm! Trong lúc bạn ngủ, kẻ gian đã dùng SIM rút sạch 40 triệu và nhắn tin lừa tiền toàn bộ người thân trong danh bạ!',
        successLog: '',
        threatMitigation: ''
      }
    ],
    requiredSequence: ['act_revoke_sessions', 'act_lock_sim', 'act_freeze_wallet', 'act_hardware_2fa'],
    forensicLesson: 'Khi SIM đột ngột mất sóng ("Không có dịch vụ") kèm cảnh báo đăng nhập lạ: 100% là bẫy SIM Swap. Hãy lập tức đăng xuất phiên làm việc từ máy tính, gọi hotline nhà mạng khóa SIM và chuyển sang dùng ứng dụng Authenticator thay cho SMS OTP.'
  },
  {
    id: 3,
    code: 'INCIDENT #03',
    title: 'Phần Mềm Gián Điệp Tống Tiền (Spyware Blackmail)',
    victimName: 'Em Hoàng (20 tuổi • Sinh viên đại học)',
    victimDevice: 'Xiaomi 13 • Android 14',
    threatLevel: 'HIGH',
    targetAsset: '30.000.000 VNĐ tiền học phí & Album ảnh riêng tư',
    initialTime: 60,
    initialPhoneStatus: 'Camera trước đang bật ngầm • Tin nhắn tống tiền đếm ngược 60s...',
    story: 'Sau khi tải một ứng dụng xem phim lậu, đèn camera trước tự động bật sáng liên tục. Kẻ gian gửi thông báo đe dọa lên màn hình: "Đã sao chép danh bạ và video riêng tư. Chuyển 30 triệu vào ví USDT sau 60s nếu không video sẽ được phát tán cho toàn trường!"',
    actions: [
      {
        id: 'act_cover_cam_air',
        icon: '✈️',
        title: 'Bật Chế độ máy bay + Che vật lý camera trước & sau',
        desc: 'Chặn ngay lập tức việc truyền dữ liệu ra máy chủ ngoài và ngắt luồng quay lén.',
        successLog: 'ĐÃ CẮT LUỒNG TRUYỀN DỮ LIỆU: Hacker không thể trích xuất thêm bất kỳ tệp tin nào.',
        threatMitigation: 'Luồng livestream của camera bị ngắt kết nối hoàn toàn.'
      },
      {
        id: 'act_reboot_safe',
        icon: '🔄',
        title: 'Khởi động thiết bị vào Chế độ An toàn (Safe Mode)',
        desc: 'Ngăn chặn ứng dụng gián điệp tự khởi chạy cùng hệ điều hành.',
        successLog: 'ĐÃ VÀO SAFE MODE: Toàn bộ tiến trình gián điệp chạy ngầm bị hệ thống đóng băng.',
        threatMitigation: 'Đèn camera tắt hẳn, phần mềm độc hại mất quyền kiểm soát thiết bị.'
      },
      {
        id: 'act_remove_device_admin',
        icon: '🛑',
        title: 'Hủy quyền Quản trị viên thiết bị (Device Admin) & Gỡ bỏ App độc',
        desc: 'Tước quyền cao nhất trong cài đặt bảo mật và xóa sổ ứng dụng theo dõi.',
        successLog: 'ĐÃ XÓA TẬN GỐC: Ứng dụng gián điệp bị gỡ bỏ hoàn toàn khỏi hệ thống Android.',
        threatMitigation: 'Mã độc bị tiêu diệt, không còn khả năng hoạt động trở lại.'
      },
      {
        id: 'act_report_cyber',
        icon: '🚨',
        title: 'Sao lưu ảnh chụp chứng cứ tống tiền & Báo cơ quan An ninh mạng',
        desc: 'Lưu lại số ví, tin nhắn đe dọa và trình báo cơ quan công an thụ lý.',
        successLog: 'ĐÃ BÁO CÁO PHÁP LUẬT: Hồ sơ vụ tống tiền được chuyển giao cơ quan chức năng.',
        threatMitigation: 'Nạn nhân được bảo vệ an toàn, bảo toàn 30 triệu tiền học phí.'
      },
      {
        id: 'act_fatal_pay_ransom',
        icon: '💸',
        title: 'Chuyển khoản 30 triệu tiền chuộc cho kẻ gian để chúng xóa clip',
        desc: 'Thỏa hiệp chuyển tiền với hy vọng kẻ gian giữ lời hứa xóa dữ liệu.',
        isFatal: true,
        fatalReason: 'SAI LẦM CHÍ MẠNG: Tội phạm tống tiền KHÔNG BAO GIỜ xóa dữ liệu sau khi nhận tiền! Ngay khi bạn chuyển 30 triệu, chúng sẽ tiếp tục đòi 50 triệu, 100 triệu cho đến khi bạn kiệt quệ tài chính!',
        successLog: '',
        threatMitigation: ''
      },
      {
        id: 'act_fatal_delete_all_photos',
        icon: '🗑️',
        title: 'Vội vã tự xóa toàn bộ ảnh trong máy điện thoại',
        desc: 'Xóa album ảnh trên điện thoại với hy vọng kẻ gian không lấy được.',
        isFatal: true,
        fatalReason: 'VÔ TÁC DỤNG: Kẻ gian đã sao chép dữ liệu lên máy chủ của chúng từ trước! Bạn xóa ảnh trên máy chỉ làm mất tài liệu của mình mà không ngăn chặn được hành vi tống tiền!',
        successLog: '',
        threatMitigation: ''
      }
    ],
    requiredSequence: ['act_cover_cam_air', 'act_reboot_safe', 'act_remove_device_admin', 'act_report_cyber'],
    forensicLesson: 'Tuyệt đối KHÔNG BAO GIỜ chuyển tiền chuộc cho kẻ tống tiền. Hành động ngay lập tức là ngắt mạng, vào Safe Mode gỡ bỏ quyền Quản trị viên của ứng dụng độc và liên hệ cơ quan công an an ninh mạng hỗ trợ.'
  },
  {
    id: 4,
    code: 'INCIDENT #04',
    title: 'Bẫy Quét Mã QR Rút Ruột Thẻ Tín Dụng (Quishing Drain)',
    victimName: 'Chị Thanh Hương (42 tuổi • Doanh nhân)',
    victimDevice: 'Samsung Galaxy Z Fold5',
    threatLevel: 'CRITICAL',
    targetAsset: 'Thẻ tín dụng Visa hạn mức 150.000.000 VNĐ (Đang chờ lệnh 65 triệu)',
    initialTime: 60,
    initialPhoneStatus: 'Lệnh thanh toán quốc tế 65.000.000đ đang chờ duyệt OTP...',
    story: 'Nạn nhân vừa quét mã QR in trên giấy thông báo cước giả mạo dán trước cửa nhà. Ngay lập tức thẻ bị trừ 65.000.000 VNĐ qua cổng thanh toán quốc tế mua thẻ quà tặng điện tử. Tin nhắn mã OTP xác thực đang nhảy về thanh thông báo điện thoại!',
    actions: [
      {
        id: 'act_lock_online_pay',
        icon: '🔒',
        title: 'Mở App ngân hàng khóa ngay tính năng "Thanh toán Trực tuyến / Quốc tế"',
        desc: 'Tắt ngay luồng quẹt thẻ E-commerce qua các cổng thanh toán nước ngoài.',
        successLog: 'ĐÃ KHÓA THANH TOÁN ONLINE: Tính năng thanh toán trực tuyến của thẻ bị vô hiệu.',
        threatMitigation: 'Cổng thanh toán quốc tế không thể khớp lệnh trừ tiền.'
      },
      {
        id: 'act_zero_limit',
        icon: '🛑',
        title: 'Hạ hạn mức giao dịch ngày của thẻ tín dụng về 0 VNĐ',
        desc: 'Đóng băng hoàn toàn khả năng phát sinh thêm bất kỳ giao dịch quẹt tiền nào.',
        successLog: 'ĐÃ HẠ HẠN MỨC: Hạn mức thẻ tín dụng giảm về 0 VNĐ.',
        threatMitigation: 'Mọi giao dịch tiếp theo tự động bị ngân hàng từ chối.'
      },
      {
        id: 'act_dispute_bank',
        icon: '🚨',
        title: 'Gọi hotline ngân hàng báo cáo giao dịch gian lận (Dispute Fraud)',
        desc: 'Yêu cầu phòng chống gian lận ngân hàng treo lệnh đối soát và hủy thanh toán.',
        successLog: 'ĐÃ BÁO CÁO FRAUD: Ngân hàng ghi nhận tranh chấp và giữ lại 65 triệu đồng.',
        threatMitigation: 'Tiền không bị chuyển ra khỏi hệ thống thanh toán liên ngân hàng.'
      },
      {
        id: 'act_reissue_card',
        icon: '💳',
        title: 'Yêu cầu ngân hàng hủy thẻ cũ & Phát hành thẻ mới với số CVV mới',
        desc: 'Triệt tiêu hoàn toàn nguy cơ bị lộ thông tin thẻ và mã CVV mặt sau.',
        successLog: 'ĐÃ HỦY THẺ LỘ THÔNG TIN: Thẻ cũ bị khóa vĩnh viễn, phát hành thẻ mới an toàn.',
        threatMitigation: 'Kẻ gian hoàn toàn không còn dữ liệu thẻ để lạm dụng.'
      },
      {
        id: 'act_fatal_provide_otp',
        icon: '📲',
        title: 'Đọc mã OTP gửi về máy cho người gọi để họ "hỗ trợ hủy lệnh"',
        desc: 'Cung cấp mã xác thực cho đối tượng lạ tự xưng nhân viên hỗ trợ cước.',
        isFatal: true,
        fatalReason: 'MẮC BẪY NGHIÊM TRỌNG: Mã OTP đó CHÍNH LÀ mã xác nhận giao dịch trừ tiền 65 triệu! Bạn vừa đọc OTP xong là 65 triệu bốc hơi khỏi thẻ tín dụng ngay lập tức!',
        successLog: '',
        threatMitigation: ''
      },
      {
        id: 'act_fatal_wait_see',
        icon: '⏳',
        title: 'Đợi xem thẻ có bị trừ tiền thật không rồi mới tính tiếp',
        desc: 'Chờ đợi kết quả trừ tiền từ ngân hàng.',
        isFatal: true,
        fatalReason: 'SAI LẦM CHẬM TRỄ: Giao dịch thanh toán quốc tế diễn ra tự động trong vòng 60 giây. Chậm trễ đồng nghĩa với việc tiền chuyển sang cổng nước ngoài và cực kỳ khó đòi lại!',
        successLog: '',
        threatMitigation: ''
      }
    ],
    requiredSequence: ['act_lock_online_pay', 'act_zero_limit', 'act_dispute_bank', 'act_reissue_card'],
    forensicLesson: 'Mã QR lạ có thể dẫn đến trang thanh toán ngầm. Khi phát hiện lệnh quẹt thẻ bất thường: khóa ngay tính năng thanh toán quốc tế trên app, hạ hạn mức về 0đ và gọi hotline ngân hàng tra soát (Dispute). TUYỆT ĐỐI KHÔNG đọc mã OTP cho bất kỳ ai.'
  },
  {
    id: 5,
    code: 'INCIDENT #05',
    title: 'Ransomware Khóa Màn Hình & Tống Tiền Dữ Liệu (Mobile Ransomware)',
    victimName: 'Chú Bình (55 tuổi • Giám đốc xưởng sản xuất)',
    victimDevice: 'Oppo Reno10 • ColorOS',
    threatLevel: 'EXTREME',
    targetAsset: '1.450 tệp hợp đồng công nợ & Hóa đơn điện tử công ty',
    initialTime: 60,
    initialPhoneStatus: 'Màn hình đỏ thẫm bị khóa cứng • Yêu cầu nộp tiền chuộc AES-256...',
    story: 'Màn hình điện thoại bị khóa cứng bởi cảnh báo tống tiền: "Tất cả tài liệu và danh bạ đã bị khóa mã hóa AES-256. Nộp 10.000.000 VNĐ vào ví USDT sau 60s để nhận chìa khóa giải mã, quá thời gian khóa giải mã sẽ bị hủy vĩnh viễn!"',
    actions: [
      {
        id: 'act_cut_cloud_sync',
        icon: '✈️',
        title: 'Bật Chế độ máy bay / Tắt Wifi ngăn lây lan sang Google Drive / Cloud',
        desc: 'Cách ly hoàn toàn thiết bị để ngăn mã độc lây nhiễm tệp mã hóa lên kho lưu trữ đám mây.',
        successLog: 'ĐÃ CÁCH LY THIẾT BỊ: Tiến trình đồng bộ đám mây bị ngắt, cứu dữ liệu lưu trữ trên Cloud.',
        threatMitigation: 'Kho dữ liệu hợp đồng trên Google Drive của công ty được bảo vệ an toàn.'
      },
      {
        id: 'act_refuse_ransom',
        icon: '🛑',
        title: 'Tuyệt đối từ chối nộp tiền chuộc theo khuyến cáo Cục An toàn thông tin',
        desc: 'Không thương lượng hay chuyển bất kỳ khoản tiền nào cho nhóm tin tặc.',
        successLog: 'TỪ CHỐI TIỀN CHUỘC: Không tiếp tay cho tội phạm mạng phát triển phần mềm độc hại.',
        threatMitigation: 'Bảo toàn 10.000.000 VNĐ quỹ tài chính công ty.'
      },
      {
        id: 'act_recovery_clean',
        icon: '🔄',
        title: 'Khởi động máy vào Recovery Mode & Format phân vùng nhiễm mã độc',
        desc: 'Xóa sạch phân vùng hệ thống bị chiếm đóng bởi mã độc tống tiền.',
        successLog: 'ĐÃ XÓA MÃ ĐỘC: Phân vùng nhiễm tệp mã độc khóa màn hình bị xóa sạch.',
        threatMitigation: 'Màn hình đỏ tống tiền biến mất, thiết bị trở về trạng thái sạch sẽ.'
      },
      {
        id: 'act_restore_clean_backup',
        icon: '☁️',
        title: 'Khôi phục lại toàn bộ hợp đồng từ bản sao lưu đám mây định kỳ',
        desc: 'Đồng bộ lại tài liệu công việc từ bản backup an toàn của công ty.',
        successLog: 'ĐÃ KHÔI PHỤC DỮ LIỆU: Toàn bộ 1.450 tệp hợp đồng được phục hồi 100%.',
        threatMitigation: 'Doanh nghiệp hoạt động bình thường, không tổn thất một xu.'
      },
      {
        id: 'act_fatal_pay_ransom_usdt',
        icon: '💸',
        title: 'Chuyển 10 triệu nộp tiền chuộc mua mã mở khóa khẩn cấp',
        desc: 'Chuyển tiền vào ví USDT của tin tặc để xin khóa giải mã.',
        isFatal: true,
        fatalReason: 'BỊ LỪA TRẮNG TAY: Khảo sát của cơ quan an ninh mạng cho thấy hơn 80% nạn nhân nộp tiền chuộc ransomware không bao giờ nhận được khóa giải mã! Tiền mất tật mang!',
        successLog: '',
        threatMitigation: ''
      },
      {
        id: 'act_fatal_plug_usb_pc',
        icon: '💻',
        title: 'Cắm cáp USB vào máy tính văn phòng để copy dữ liệu ra',
        desc: 'Kết nối máy điện thoại bị nhiễm với máy tính công ty qua cáp USB.',
        isFatal: true,
        fatalReason: 'LÂY NHIỄM NGUY HIỂM: Mã độc tự động lây lan qua giao thức MTP/USB sang máy tính văn phòng, làm tê liệt toàn bộ hệ thống máy tính công ty!',
        successLog: '',
        threatMitigation: ''
      }
    ],
    requiredSequence: ['act_cut_cloud_sync', 'act_refuse_ransom', 'act_recovery_clean', 'act_restore_clean_backup'],
    forensicLesson: 'Đối phó Ransomware: Nguyên tắc số 1 là KHÔNG TRẢ TIỀN CHUỘC và CÁCH LY MẠNG ngay lập tức để bảo vệ dữ liệu đám mây. Luôn duy trì chiến lược sao lưu dự phòng định kỳ (3-2-1 Backup Rule).'
  },
  {
    "id": 6,
    "code": "INCIDENT #06",
    "title": "Chiếm Đoạt Phiên Đăng Nhập Zalo / Nhắn Tin Vay Tiền Họ Hàng",
    "victimName": "Bác Hùng (58 tuổi • Cán bộ hưu trí)",
    "victimDevice": "iPad Air • iPadOS 17",
    "threatLevel": "CRITICAL",
    "targetAsset": "Danh dự cá nhân & 45.000.000 VNĐ (Tiền người thân chuẩn bị chuyển giúp)",
    "initialTime": 60,
    "initialPhoneStatus": "Kẻ gian đang gửi tin nhắn mượn tiền gấp tới 12 người trong danh bạ...",
    "story": "Bác vừa bấm vào liên kết \"Bình chọn ảnh cháu gái thi tài năng nhí\" và quét mã QR. Kẻ gian lập tức đánh cắp phiên đăng nhập (Cookie Session), đang nhắn tin cho anh chị em ruột mượn 15 triệu với lý do chuyển tiền viện phí cấp cứu.",
    "actions": [
      {
        "id": "act_zalo_terminate_sessions",
        "icon": "🛑",
        "title": "Mở Cài đặt Zalo trên máy chính > Quản lý thiết bị đăng nhập > Đăng xuất tất cả thiết bị lạ",
        "desc": "Hủy ngay lập tức phiên đăng nhập của kẻ gian đang mạo danh trên máy tính lạ.",
        "successLog": "ĐÃ ĐĂNG XUẤT PHIÊN LẠ: Kẻ gian bị đá khỏi tài khoản Zalo ngay lập tức.",
        "threatMitigation": "Chặn đứng hành vi gửi thêm tin nhắn lừa tiền tới danh bạ."
      },
      {
        "id": "act_zalo_broadcast_call",
        "icon": "📢",
        "title": "Gọi điện thoại trực tiếp & nhờ người thân đăng bài cảnh báo khẩn cấp lên mạng xã hội",
        "desc": "Báo động cho họ hàng, bạn bè biết tài khoản đang bị kẻ gian mạo danh vay tiền.",
        "successLog": "ĐÃ CẢNH BÁO KỊP THỜI: Hai người thân vừa chuẩn bị bấm chuyển tiền đã kịp thời dừng lại.",
        "threatMitigation": "Bảo toàn 45.000.000 VNĐ cho người thân và gia đình."
      },
      {
        "id": "act_zalo_enable_pin",
        "icon": "🔒",
        "title": "Đổi mật khẩu Zalo & Bật tính năng Khóa ứng dụng (Mã PIN bảo vệ)",
        "desc": "Gia cố tầng bảo vệ, ngăn kẻ gian đăng nhập lại kể cả khi có mã OTP.",
        "successLog": "ĐÃ GIA CỐ BẢO MẬT: Mật khẩu mới và mã PIN bảo vệ Zalo được kích hoạt thành công.",
        "threatMitigation": "Tài khoản được bảo vệ vững chắc với 2 lớp xác thực."
      },
      {
        "id": "act_zalo_revoke_permissions",
        "icon": "🧹",
        "title": "Kiểm tra và hủy toàn bộ tiện ích / Mini App liên kết không rõ nguồn gốc",
        "desc": "Dọn sạch các cổng ủy quyền của trang bình chọn ảnh độc hại.",
        "successLog": "ĐÃ THU HỒI LIÊN KẾT: Xóa sạch các Mini App và token ủy quyền bên thứ ba.",
        "threatMitigation": "Triệt tiêu hoàn toàn mã độc thu thập dữ liệu ngầm."
      },
      {
        "id": "act_fatal_zalo_delete_account",
        "icon": "🗑️",
        "title": "Xóa ngay vĩnh viễn tài khoản Zalo để kẻ gian không nhắn tin được nữa",
        "desc": "Xóa tài khoản ngay lập tức trong cơn hoảng loạn.",
        "isFatal": true,
        "fatalReason": "SAI LẦM TAI HẠI: Xóa tài khoản làm mất toàn bộ lịch sử trò chuyện và bằng chứng đối soát! Phiên đăng nhập trên máy tính của kẻ gian vẫn kịp gửi tin nhắn lừa thêm 2 người thân trước khi tài khoản bị vô hiệu hóa!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_zalo_chat_fight",
        "icon": "💬",
        "title": "Nhắn tin vào tài khoản bị hack đe dọa báo công an nếu không trả lại nick",
        "desc": "Đấu khẩu với kẻ lừa đảo qua ô chat.",
        "isFatal": true,
        "fatalReason": "MẮC BẪY KẺ GIAN: Kẻ lừa đảo biết bạn đã phát hiện, lập tức đổi mật khẩu chiếm đoạt toàn bộ tài khoản và tăng tốc nhắn tin lừa tiền tất cả bạn bè còn lại trong danh bạ!",
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
    "story": "Nạn nhân tham gia làm nhiệm vụ kiếm tiền online. Sau khi nạp 5 triệu, hệ thống báo \"sai cú pháp lệnh chuyển, tiền bị treo\", yêu cầu nạp thêm 15 triệu trong 60 giây để \"thông tắc hệ thống và rút cả gốc lẫn lãi 35 triệu\".",
    "actions": [
      {
        "id": "act_task_stop_transfer",
        "icon": "🛑",
        "title": "Dừng dứt khoát mọi giao dịch chuyển khoản, tuyệt đối không nạp thêm tiền",
        "desc": "Cắt lỗ ngay lập tức, từ chối nạp thêm bất kỳ khoản tiền nào.",
        "successLog": "ĐÃ CHẶN DÒNG TIỀN: Ngăn chặn kịp thời khoản chuyển 15.000.000 VNĐ.",
        "threatMitigation": "Bảo toàn số tiền học phí còn lại của sinh viên."
      },
      {
        "id": "act_task_export_evidence",
        "icon": "📸",
        "title": "Chụp ảnh màn hình toàn bộ tin nhắn nhóm Telegram và xuất sao kê ngân hàng",
        "desc": "Thu thập đầy đủ bằng chứng pháp lý trước khi kẻ lừa đảo kịp xóa tin nhắn thu hồi.",
        "successLog": "ĐÃ THU THẬP BẰNG CHỨNG: Lưu giữ toàn bộ số tài khoản thụ hưởng và lịch sử chat.",
        "threatMitigation": "Hồ sơ tố giác tội phạm sẵn sàng chuyển cơ quan chức năng."
      },
      {
        "id": "act_task_report_bank",
        "icon": "🏦",
        "title": "Gọi hotline ngân hàng báo cáo số tài khoản thụ hưởng lừa đảo để yêu cầu tra soát",
        "desc": "Kích hoạt cờ cảnh báo tài khoản lừa đảo trên liên minh ngân hàng.",
        "successLog": "ĐÃ BÁO CÁO NGÂN HÀNG: Tài khoản nhận tiền lừa đảo bị gắn cờ rủi ro gian lận.",
        "threatMitigation": "Hạn chế khả năng tẩu tán tiền mặt của kẻ lừa đảo qua cây ATM."
      },
      {
        "id": "act_task_exit_groups",
        "icon": "🚪",
        "title": "Thoát toàn bộ nhóm Telegram \"chim mồi\" và chặn liên lạc kẻ cầm đầu",
        "desc": "Cắt đứt áp lực thao túng tâm lý từ các tài khoản chim mồi tạo bằng chứng nhận tiền giả.",
        "successLog": "ĐÃ RỜI KHỎI NHÓM: Chấm dứt hoàn toàn sự thao túng của nhóm lừa đảo.",
        "threatMitigation": "Tâm lý nạn nhân ổn định, không bị dẫn dụ thêm."
      },
      {
        "id": "act_fatal_borrow_pay",
        "icon": "💸",
        "title": "Đi vay nóng bạn bè nạp nốt 15 triệu với hy vọng rút được số tiền 35 triệu",
        "desc": "Cố gắng làm theo yêu cầu của trưởng nhóm để cứu vãn tiền cũ.",
        "isFatal": true,
        "fatalReason": "MẤT TRẮNG TOÀN BỘ: Đây là bẫy lừa đảo nhiệm vụ nạp tiền điển hình! Càng nạp kẻ gian càng bịa ra lý do \"phí bảo hiểm\", \"thuế thu nhập cá nhân\". 15 triệu vay nóng biến mất vĩnh viễn!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_hire_recovery",
        "icon": "🕵️",
        "title": "Lên Facebook thuê \"Luật sư / Hacker hỗ trợ lấy lại tiền treo trên app\"",
        "desc": "Tin vào các dịch vụ cam kết lấy lại tiền lừa đảo trên mạng xã hội.",
        "isFatal": true,
        "fatalReason": "BẪY LỪA ĐẢO TẬP 2: Các dịch vụ lấy lại tiền treo thực chất là cùng một đường dây lừa đảo, yêu cầu nạn nhân đóng thêm \"phí thụ lý hồ sơ\" rồi biến mất!",
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
    "story": "Cô Lan vừa quét mã QR trên màn hình hội thảo để nhận \"mã vé du lịch tri ân\". Telegram báo có thiết bị lạ \"Windows Desktop\" vừa kết nối và đang đồng bộ toàn bộ lịch sử tin nhắn cùng danh bạ.",
    "actions": [
      {
        "id": "act_qr_disconnect_net",
        "icon": "✈️",
        "title": "Bật Chế độ máy bay ngắt mạng để chặn kẻ gian tiếp tục trích xuất tin nhắn",
        "desc": "Cắt đứt ngay đường truyền tải dữ liệu của phiên đăng nhập từ xa.",
        "successLog": "ĐÃ CẮT KẾT NỐI MẠNG: Tiến trình đồng bộ tin nhắn của kẻ gian bị gián đoạn.",
        "threatMitigation": "Bảo vệ dữ liệu phụ huynh và đề thi học kỳ chưa bị tải hết."
      },
      {
        "id": "act_qr_terminate_devices",
        "icon": "🛑",
        "title": "Mở Telegram > Cài đặt > Thiết bị (Devices) > Nhấn \"Chấm dứt tất cả các phiên khác\"",
        "desc": "Tước quyền truy cập của tất cả các phiên đăng nhập lạ trên máy tính từ xa.",
        "successLog": "ĐÃ HỦY PHIÊN LẠ: Thiết bị Windows của kẻ gian bị đăng xuất khỏi Telegram.",
        "threatMitigation": "Kẻ gian mất hoàn toàn quyền truy cập tài khoản."
      },
      {
        "id": "act_qr_enable_2step",
        "icon": "🔒",
        "title": "Thiết lập mật khẩu Xác thực 2 bước (Two-Step Verification) có kèm email khôi phục",
        "desc": "Đặt mật khẩu thứ hai ngăn chặn việc đăng nhập chỉ bằng mã QR hoặc SMS.",
        "successLog": "ĐÃ BẬT BẢO MẬT 2 BƯỚC: Mật khẩu bảo vệ Telegram được thiết lập thành công.",
        "threatMitigation": "Kẻ gian không thể đăng nhập lại kể cả khi có mã xác thực."
      },
      {
        "id": "act_qr_revoke_autodownload",
        "icon": "🧹",
        "title": "Tắt tính năng tự động tải tệp lạ và kiểm tra xóa tin nhắn mạo danh",
        "desc": "Rà soát các nhóm chat và thu hồi kịp thời tin nhắn giả mạo nếu có.",
        "successLog": "ĐÃ RÀ SOÁT TÀI KHOẢN: Không có tin nhắn lừa đảo nào kịp phát tán tới phụ huynh.",
        "threatMitigation": "Danh dự giáo viên và uy tín nhà trường được bảo toàn."
      },
      {
        "id": "act_fatal_qr_send_otp",
        "icon": "💬",
        "title": "Đọc mã xác nhận 5 chữ số vừa gửi về SMS cho bên phát vé kiểm tra",
        "desc": "Cung cấp mã xác nhận theo yêu cầu của đối tượng.",
        "isFatal": true,
        "fatalReason": "MẤT TRẮNG TÀI KHOẢN: Mã 5 chữ số đó chính là mã đăng nhập tài khoản Telegram! Bạn đã chính tay dâng toàn quyền sở hữu tài khoản cho kẻ gian!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_qr_ignore",
        "icon": "⏳",
        "title": "Bỏ qua cảnh báo vì thấy trên điện thoại mình Telegram vẫn dùng bình thường",
        "desc": "Chủ quan không xử lý khi thấy thiết bị lạ kết nối.",
        "isFatal": true,
        "fatalReason": "THẢM HỌA DANH DỰ: Kẻ gian âm thầm đọc toàn bộ tin nhắn riêng tư và dùng tài khoản của cô nhắn tin vay tiền tất cả phụ huynh trong lớp!",
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
        "title": "Yêu cầu bác cúp máy ngay lập tức và chặn hoàn toàn liên lạc với kẻ tự xưng",
        "desc": "Cắt đứt ngay luồng thao túng tâm lý và đe dọa của kẻ lừa đảo.",
        "successLog": "ĐÃ CẮT LIÊN LẠC: Bác dừng cuộc gọi, kẻ lừa đảo không thể tiếp tục khủng bố tinh thần.",
        "threatMitigation": "Chặn đứng ý định ra ngân hàng rút tiền của nạn nhân."
      },
      {
        "id": "act_police_reassure",
        "icon": "🤝",
        "title": "Trấn an tinh thần và giải thích rõ: Cơ quan công an KHÔNG BAO GIỜ làm việc qua mạng",
        "desc": "Khẳng định văn bản pháp lý chỉ được tống đạt trực tiếp tại nơi cư trú có công an khu vực đi cùng.",
        "successLog": "ĐÃ TRẤN AN NẠN NHÂN: Bác nhận ra văn bản có dấu mộc đỏ là tài liệu giả mạo.",
        "threatMitigation": "Tâm lý nạn nhân bình tĩnh trở lại, thoát khỏi trạng thái sợ hãi."
      },
      {
        "id": "act_police_verify_station",
        "icon": "🏛️",
        "title": "Đưa bác đến trực tiếp trụ sở Công an Phường sở tại để đối chiếu thông tin",
        "desc": "Xác minh sự việc với lực lượng công an chính quy tại địa bàn cư trú.",
        "successLog": "XÁC MINH CHÍNH THỨC: Công an phường khẳng định bác hoàn toàn không có lệnh bắt nào.",
        "threatMitigation": "Xóa bỏ 100% hoài nghi, đảm bảo an toàn tuyệt đối."
      },
      {
        "id": "act_police_report_hotline",
        "icon": "📞",
        "title": "Báo cáo số điện thoại và tài khoản mạo danh lên Tổng đài 156 của Bộ TT&TT",
        "desc": "Cung cấp thông tin đối tượng cho cơ quan quản lý viễn thông chặn đầu số.",
        "successLog": "ĐÃ BÁO CÁO VI PHẠM: Thông tin đầu số lừa đảo được gửi đến hệ thống quản lý viễn thông.",
        "threatMitigation": "Góp phần bảo vệ cộng đồng khỏi kẻ lừa đảo."
      },
      {
        "id": "act_fatal_police_transfer",
        "icon": "💸",
        "title": "Chuyển tiền vào tài khoản cán bộ để chứng minh mình trong sạch rồi nhận lại sau",
        "desc": "Chuyển 300 triệu vào tài khoản chỉ định để cơ quan chức năng kiểm tra.",
        "isFatal": true,
        "fatalReason": "MẤT TRẮNG 300 TRIỆU: Cơ quan Công an, Viện kiểm sát KHÔNG BAO GIỜ có tài khoản cá nhân để tạm giữ tiền! Số tiền chuyển đi bị nhóm lừa đảo rút sạch tại cây ATM trong vòng 3 phút!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_police_send_id",
        "icon": "🪪",
        "title": "Chụp 2 mặt Căn cước công dân và sổ hộ khẩu gửi qua Zalo cho cán bộ làm hồ sơ",
        "desc": "Cung cấp ảnh giấy tờ tùy thân theo yêu cầu của kẻ mạo danh.",
        "isFatal": true,
        "fatalReason": "LỘ DỮ LIỆU ĐỊNH DANH: Kẻ gian sử dụng ảnh CCCD của bác để mở hàng loạt tài khoản ngân hàng ảo và vay tiền trên các ứng dụng tín dụng đen!",
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
        "title": "Dừng ngay ứng dụng ngân hàng, chặn dứt khoát mọi thao tác chuyển thêm tiền",
        "desc": "Cắt đứt ngay luồng nạp tiền tiếp tay cho sàn lừa đảo.",
        "successLog": "ĐÃ CHẶN GIAO DỊCH: Ngăn chặn kịp thời khoản nạp 70.000.000 VNĐ tiền thuế và phí ảo.",
        "threatMitigation": "Bảo vệ an toàn 200 triệu quỹ tiền sửa nhà của gia đình."
      },
      {
        "id": "act_crypto_check_domain",
        "icon": "🔍",
        "title": "Tra cứu tên miền sàn trên Cổng Tín nhiệm mạng (tinnhiemmang.vn) để vạch trần gian lận",
        "desc": "Kiểm tra thông tin giấy phép hoạt động và cảnh báo rủi ro lừa đảo chính thức.",
        "successLog": "VẠCH TRẦN GIAN LẬN: Cổng Tín nhiệm mạng xác nhận tên miền là website lừa đảo không phép.",
        "threatMitigation": "Nạn nhân tỉnh ngộ, nhận ra số dư lãi 120 triệu chỉ là đồ họa ảo."
      },
      {
        "id": "act_crypto_save_chats",
        "icon": "📸",
        "title": "Lưu lại toàn bộ lịch sử trò chuyện, ảnh chân dung kẻ lừa đảo và số tài khoản thụ hưởng",
        "desc": "Bảo toàn chứng cứ điện tử phục vụ công tác điều tra phá án.",
        "successLog": "ĐÃ LƯU BẰNG CHỨNG: Trích xuất toàn bộ dữ liệu giao dịch và thông tin kẻ cầm đầu.",
        "threatMitigation": "Chứng cứ đầy đủ cho hồ sơ tố giác tội phạm công nghệ cao."
      },
      {
        "id": "act_crypto_report_cyber",
        "icon": "🏛️",
        "title": "Làm đơn tố giác tội phạm gửi Phòng An ninh mạng & Phòng chống tội phạm công nghệ cao",
        "desc": "Trình báo sự việc tới cơ quan chuyên trách có thẩm quyền.",
        "successLog": "ĐÃ TIẾP NHẬN TỐ GIÁC: Phòng An ninh mạng ghi nhận hồ sơ và đưa tài khoản vào danh sách theo dõi.",
        "threatMitigation": "Hỗ trợ lực lượng chức năng truy quét đường dây lừa đảo quốc tế."
      },
      {
        "id": "act_fatal_crypto_pay_tax",
        "icon": "💸",
        "title": "Vội vã nộp 30 triệu tiền thuế để giải cứu số tiền lãi 120 triệu trên sàn",
        "desc": "Cố gắng chuyển thêm tiền để rút được tiền lãi hiển thị.",
        "isFatal": true,
        "fatalReason": "SẬP BẪY RÚT RUỘT: Con số 120 triệu lãi trên màn hình hoàn toàn là đồ họa ảo do kẻ gian tự nhập vào! Sau khi bạn nộp 30 triệu thuế, chúng sẽ tiếp tục vẽ ra lý do \"lỗi thanh khoản\" đòi nộp thêm 50 triệu nữa!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_crypto_threaten",
        "icon": "💬",
        "title": "Nhắn tin đe dọa sẽ báo công an nếu sàn không cho rút tiền ngay",
        "desc": "Cảnh báo đối tượng lừa đảo qua khung chat hỗ trợ.",
        "isFatal": true,
        "fatalReason": "ĐÁNH ĐỘNG KẺ GIAN: Kẻ lừa đảo lập tức xóa tài khoản của bạn trên hệ thống, đóng khung chat và cắt đứt toàn bộ dấu vết, khiến việc truy tìm trở nên bất khả thi!",
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
        "title": "Rút cáp mạng LAN / Tắt Wi-Fi máy tính ngay lập tức để chặn mã độc gửi tiếp dữ liệu",
        "desc": "Ngắt ngay đường truyền Internet để cách ly máy tính đang nhiễm.",
        "successLog": "ĐÃ CÁCH LY MÁY TÍNH: Quá trình trích xuất cookie và mật khẩu trình duyệt bị chặn đứng.",
        "threatMitigation": "Bảo vệ các tài khoản còn lại chưa bị gửi tệp dữ liệu về máy chủ hacker."
      },
      {
        "id": "act_stealer_phone_reset",
        "icon": "📱",
        "title": "Dùng điện thoại cá nhân (thiết bị sạch) đổi mật khẩu Google chính và đăng xuất mọi nơi",
        "desc": "Hủy toàn bộ phiên đăng nhập cũ từ một thiết bị hoàn toàn an toàn.",
        "successLog": "ĐÃ ĐỔI MẬT KHẨU TỪ MÁY SẠCH: Toàn bộ phiên cookie cũ của hacker bị vô hiệu hóa.",
        "threatMitigation": "Lấy lại quyền làm chủ tài khoản Google và GitHub."
      },
      {
        "id": "act_stealer_revoke_tokens",
        "icon": "🔒",
        "title": "Thu hồi toàn bộ API tokens, khóa thẻ ngân hàng và chuyển tài sản sang ví an toàn mới",
        "desc": "Bảo vệ các tài sản số và kênh thanh toán liên kết.",
        "successLog": "ĐÃ BẢO VỆ TÀI SẢN SỐ: Token thanh toán và khóa thẻ ngân hàng được phong tỏa kịp thời.",
        "threatMitigation": "Không có giao dịch tài chính trái phép nào phát sinh."
      },
      {
        "id": "act_stealer_reinstall_os",
        "icon": "💻",
        "title": "Khởi động máy tính vào USB cứu hộ sạch để sao lưu dữ liệu thô và cài lại Windows",
        "desc": "Xóa sạch tận gốc mã độc Infostealer đã cài cắm vào Registry và tiến trình hệ thống.",
        "successLog": "ĐÃ LÀM SẠCH HOÀN TOÀN: Hệ điều hành mới được cài đặt sạch sẽ, triệt tiêu mã độc.",
        "threatMitigation": "Máy tính an toàn 100%, sẵn sàng làm việc trở lại."
      },
      {
        "id": "act_fatal_stealer_login_same_pc",
        "icon": "🔑",
        "title": "Đăng nhập vào ngân hàng trên chính chiếc máy tính vừa dính mã độc để kiểm tra tiền",
        "desc": "Kiểm tra tài khoản ngân hàng trực tiếp trên máy đang nhiễm.",
        "isFatal": true,
        "fatalReason": "THẢM HỌA BẢO MẬT: Mã độc Infostealer đang chạy ngầm trên máy sẽ lập tức ghi lại toàn bộ tên đăng nhập và mật khẩu ngân hàng bạn vừa gõ! Tài khoản bị rút sạch trong chớp mắt!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_stealer_antivirus_only",
        "icon": "🛡️",
        "title": "Chỉ chạy phần mềm diệt virus miễn phí quét qua loa rồi tiếp tục dùng máy làm việc",
        "desc": "Chủ quan cho rằng phần mềm diệt virus quét xong là an toàn.",
        "isFatal": true,
        "fatalReason": "MÃ ĐỘC VẪN TỒN TẠI: Dòng mã độc Lumma/RedLine Stealer thường cài backdoor ẩn sâu trong Registry/WMI. Hacker tiếp tục theo dõi và đánh cắp dữ liệu mới của bạn!",
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
        "title": "Từ chối nhận gói hàng không rõ nguồn gốc và đóng ngay lập tức trang web trên điện thoại",
        "desc": "Từ chối tiếp nhận đơn hàng ảo và chặn đứng trang web giả mạo.",
        "successLog": "ĐÃ TỪ CHỐI ĐƠN HÀNG LẠ: Gói hàng giả mạo bị trả về, trang web lừa đảo bị đóng.",
        "threatMitigation": "Chặn đứng bẫy lừa thu thập thông tin tài khoản."
      },
      {
        "id": "act_cod_never_otp",
        "icon": "🛑",
        "title": "Tuyệt đối không nhập tên đăng nhập, mật khẩu hay bất kỳ mã OTP nào vào trang web lạ",
        "desc": "Bảo vệ nguyên vẹn các lớp xác thực bí mật của ngân hàng.",
        "successLog": "BẢO MẬT OTP THÀNH CÔNG: Kẻ gian không thu thập được bất kỳ thông tin xác thực nào.",
        "threatMitigation": "Tài khoản ngân hàng của cô Hạnh được bảo vệ nguyên vẹn."
      },
      {
        "id": "act_cod_change_pwd",
        "icon": "🔒",
        "title": "Mở ứng dụng ngân hàng chính thống đổi mật khẩu và khóa chức năng thanh toán trực tuyến",
        "desc": "Phòng ngừa rủi ro và tăng cường bảo vệ tài khoản thanh toán.",
        "successLog": "ĐÃ KHÓA THANH TOÁN TRỰC TUYẾN: Thẻ và tài khoản được đưa về chế độ an toàn tối đa.",
        "threatMitigation": "Ngăn ngừa mọi nguy cơ phát sinh từ mã độc web."
      },
      {
        "id": "act_cod_report_carrier",
        "icon": "📞",
        "title": "Báo cáo số điện thoại shipper và đơn vị vận chuyển mạo danh lên tổng đài bảo vệ người tiêu dùng",
        "desc": "Cảnh báo thủ đoạn giao hàng lừa đảo cho đơn vị chuyển phát và cơ quan quản lý.",
        "successLog": "ĐÃ GỬI BÁO CÁO: Thông tin đối tượng được lưu giữ phục vụ phòng ngừa lừa đảo COD.",
        "threatMitigation": "Giúp ngăn chặn kẻ lừa đảo tiếp tục nhắm vào người dân khu vực."
      },
      {
        "id": "act_fatal_cod_enter_smart_otp",
        "icon": "🔑",
        "title": "Nhập mã Smart OTP hiển thị trên app ngân hàng vào trang web để shipper hủy lệnh trừ tiền",
        "desc": "Cung cấp mã xác thực OTP theo lời dỗ dành của đối tượng.",
        "isFatal": true,
        "fatalReason": "MẤT SẠCH TIỀN TIẾT KIỆM: Mã Smart OTP chính là bước xác thực cuối cùng để kẻ gian chuyển toàn bộ 60 triệu trong tài khoản của bạn sang tài khoản khác! Tiền bị rút sạch ngay khi bạn bấm xác nhận!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_cod_click_help_link",
        "icon": "🔗",
        "title": "Bấm vào đường link \"Hỗ trợ hủy đơn hàng miễn phí\" do shipper gửi qua tin nhắn SMS",
        "desc": "Nhấn vào liên kết hỗ trợ từ tin nhắn người lạ.",
        "isFatal": true,
        "fatalReason": "CÀI MÃ ĐỘC VÀO MÁY: Đường link dẫn đến trang web độc hại tự động tải tệp APK chứa trojan gián điệp, âm thầm đọc trộm toàn bộ tin nhắn SMS trên điện thoại!",
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
        "title": "Giữ bình tĩnh, tuyệt đối KHÔNG chuyển tiền ngay vào tài khoản cá nhân của người gọi",
        "desc": "Kiểm soát cảm xúc, nhận diện kịch bản lừa đảo đánh vào tâm lý hoảng loạn của cha mẹ.",
        "successLog": "ĐÃ KIỂM SOÁT TÌNH HÌNH: Chị Hà giữ bình tĩnh, dừng ngón tay trước nút xác nhận chuyển tiền.",
        "threatMitigation": "Bảo vệ an toàn 50.000.000 VNĐ trong tài khoản."
      },
      {
        "id": "act_hospital_call_school",
        "icon": "📞",
        "title": "Giữ nguyên máy và dùng ngay một điện thoại khác gọi cho giáo viên chủ nhiệm hoặc ban giám hiệu",
        "desc": "Xác minh trực tiếp tình trạng của con tại lớp học.",
        "successLog": "XÁC MINH NHÀ TRƯỜNG: Cô giáo chủ nhiệm khẳng định con đang ngồi học thể dục hoàn toàn khỏe mạnh!",
        "threatMitigation": "Vạch trần 100% kịch bản lừa đảo bắt cóc online / cấp cứu giả."
      },
      {
        "id": "act_hospital_call_hotline",
        "icon": "🏥",
        "title": "Gọi đường dây nóng chính thức của bệnh viện để đối chiếu danh sách bệnh nhân cấp cứu",
        "desc": "Kiểm tra thông tin với tổng đài chính quy của cơ sở y tế.",
        "successLog": "BỆNH VIỆN XÁC NHẬN: Bệnh viện khẳng định không có bác sĩ nào gọi điện xin tiền qua tài khoản cá nhân.",
        "threatMitigation": "Quy trình cấp cứu bệnh viện luôn ưu tiên cứu người trước thủ tục viện phí."
      },
      {
        "id": "act_hospital_report_cyber",
        "icon": "🏛️",
        "title": "Báo ngay số điện thoại và số tài khoản của kẻ lừa đảo tới cơ quan công an",
        "desc": "Cung cấp đầu mối phục vụ truy vết đường dây lừa đảo gây bức xúc dư luận.",
        "successLog": "ĐÃ BÁO CÁO CƠ QUAN CHỨC NĂNG: Hồ sơ cuộc gọi lừa đảo được chuyển đến cơ quan điều tra.",
        "threatMitigation": "Chung tay ngăn chặn kẻ gian tiếp tục lừa đảo các phụ huynh khác."
      },
      {
        "id": "act_fatal_hospital_quick_transfer",
        "icon": "💸",
        "title": "Vì quá lo sợ tính mạng của con nên chuyển ngay 50 triệu vào tài khoản cá nhân của bác sĩ",
        "desc": "Vội vã chuyển tiền mà không xác minh lại với nhà trường.",
        "isFatal": true,
        "fatalReason": "SẬP BẪY TÂM LÝ: Kẻ gian lợi dụng triệt để tình mẫu tử để lừa đảo! Sau khi bạn chuyển 50 triệu, chúng sẽ tiếp tục gọi báo \"cần thêm 100 triệu mua máy thở\" cho đến khi bạn kiệt quệ tài chính!",
        "successLog": "",
        "threatMitigation": ""
      },
      {
        "id": "act_fatal_hospital_rush_alone",
        "icon": "🛵",
        "title": "Tự lái xe máy một mình chạy bạt mạng đến bệnh viện trong tình trạng mất kiểm soát",
        "desc": "Bỏ đi trong hoảng loạn mà không liên lạc với ai.",
        "isFatal": true,
        "fatalReason": "NGUY HIỂM TÍNH MẠNG: Lái xe trong trạng thái hoảng loạn cực độ rất dễ gây tai nạn giao thông nghiêm trọng cho chính bản thân, đồng thời bỏ lỡ thời điểm vàng xác minh thông tin với nhà trường!",
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
];;

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
