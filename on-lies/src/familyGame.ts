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
