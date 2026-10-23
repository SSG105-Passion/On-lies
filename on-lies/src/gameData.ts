import type { GameMode, ScenarioItem } from './types';
import { EXTRA_GAMES } from './extraGames';

export const GAME_DATA: Record<GameMode, ScenarioItem[]> = {
  mail: [
    // Round 1
    {
      id: 101,
      sender: "Đại học XYZ",
      address: "thongbao@daihocxyz-edu.com",
      subject: "THÔNG BÁO THU HỌC PHÍ HỌC KỲ KẾ TẾP",
      spf: "PASS (daihocxyz-edu.com)",
      body: "Sinh viên chú ý: Hạn nộp học phí được gia hạn đến 24h hôm nay. Sinh viên chuyển khoản gấp qua cổng thanh toán mới để nhận chiết khấu 10%:\nhttp://pay-daihocxyz.com/payment",
      attachment: "huong_dan_chuyen_tien.pdf.exe",
      isScam: true,
      round: 1,
      explanation: "Tên miền 'daihocxyz-edu.com' và 'pay-daihocxyz.com' không phải tên miền chính thức của trường. File đính kèm có đuôi kéo kép '.pdf.exe' chứa mã độc executable."
    },
    {
      id: 102,
      sender: "Nguyễn Duy Nhật Anh",
      address: "nhatanh@company.com",
      subject: "Project Proposal & Design Specs V2",
      spf: "PASS (company.com)",
      body: "Chào team, mình vừa cập nhật lại bản thiết kế UI cho dự án On-lies. Mọi người xem file đính kèm nhé.",
      attachment: "UI_Design_v2.pdf",
      isScam: false,
      round: 1,
      explanation: "Địa chỉ email chính xác từ nội bộ công ty (company.com), SPF xác minh chuẩn và file đính kèm định dạng PDF an toàn."
    },
    {
      id: 103,
      sender: "Tuyển dụng FastTech",
      address: "hr-fasttech@gmail.com",
      subject: "Thu Mời Phỏng Vấn Vị Trí Dev - Lương $3000",
      spf: "PASS (gmail.com)",
      body: "Chúc mừng bạn! Hồ sơ của bạn đã trúng tuyển. Hãy tải file mã bài test bên dưới về máy tính và chạy file để làm bài thử.",
      attachment: "CodingTest_Setup.zip",
      isScam: true,
      round: 1,
      explanation: "Tuyển dụng doanh nghiệp lớn sử dụng Email Gmail công cộng (hr-fasttech@gmail.com) và yêu cầu tải/chạy file `.zip` không rõ nguồn gốc."
    },
    // Round 2
    {
      id: 104,
      sender: "Ngân Hàng V-Bank",
      address: "security-alert@v-bank.com.vn",
      subject: "Cảnh báo bảo mật: Tài khoản bị truy cập lạ",
      spf: "PASS (v-bank.com.vn)",
      body: "Chúng tôi phát hiện đăng nhập từ thiết bị lạ vào 03:12 AM. Nếu không phải bạn, vui lòng đăng nhập ngay để khóa tài khoản.",
      attachment: "none",
      isScam: false,
      round: 2,
      explanation: "Domain chính thức (.com.vn), xác minh SPF hợp lệ và đây là cảnh báo tự động không chứa link lạ hay file đính kèm."
    },
    {
      id: 105,
      sender: "Dịch Vụ Lưu Trữ Cloud",
      address: "no-reply@cloud-storage-billing.net",
      subject: "Hóa đơn gia hạn tự động $299.99 thành công",
      spf: "NEUTRAL",
      body: "Tài khoản của bạn vừa bị trừ $299.99 cho gói Cloud VIP. Nếu muốn hủy đơn hàng và hoàn tiền, gọi ngay hot line: 1900-xxxx-fake.",
      attachment: "Invoice_982.pdf",
      isScam: true,
      round: 2,
      explanation: "Hình thức Refund Scam (lừa đảo hoàn tiền). Dùng domain lạ và hối thúc nạn nhân gọi vào số điện thoại giả mạo để lấy thông tin thẻ."
    },
    {
      id: 106,
      sender: "Phòng CNTT Công ty",
      address: "it-support@company.com",
      subject: "Cập nhật chứng chỉ VPN hệ thống",
      spf: "PASS (company.com)",
      body: "Nhắc nhở toàn bộ nhân viên cập nhật VPN định kỳ theo chính sách an toàn thông tin quý 3.",
      attachment: "vpn_config.ovpn",
      isScam: false,
      round: 2,
      explanation: "Gửi từ phòng IT nội bộ, sử dụng đuôi cấu hình OpenVPN tiêu chuẩn (.ovpn)."
    },
    // Round 3
    {
      id: 107,
      sender: "Steam Community Support",
      address: "help@steampowered-security.org",
      subject: "Tài khoản của bạn sắp bị Banned vĩnh viễn",
      spf: "FAIL (steampowered-security.org)",
      body: "Bạn bị tố cáo gian lận mua bán vật phẩm. Vui lòng nhấn vào link bên dưới để xác minh thông tin tài khoản trong vòng 2 giờ.",
      attachment: "none",
      isScam: true,
      round: 3,
      explanation: "Xác thực SPF thất bại (FAIL), tên miền nhái (.org thay vì steampowered.com) và đe dọa khóa tài khoản khẩn cấp."
    },
    {
      id: 108,
      sender: "Ban Quản Lý Chung Cư",
      address: "bql-building@gmail.com",
      subject: "Thông báo lịch bảo trì thang máy tuần này",
      spf: "PASS (gmail.com)",
      body: "Xin gửi cư dân lịch bảo trì định kỳ thang máy Block A vào sáng thứ 7 tuần này.",
      attachment: "lich_bao_tri.png",
      isScam: false,
      round: 3,
      explanation: "Thông báo sinh hoạt thường nhật, đính kèm ảnh PNG thông tin rõ ràng."
    },
    {
      id: 109,
      sender: "Sàn TMĐT Online",
      address: "promotions@flash-sale-shop.site",
      subject: "Chúc mừng! Bạn trúng giải iPhone 17 Pro Max",
      spf: "PASS (flash-sale-shop.site)",
      body: "Bạn là người may mắn trúng thưởng quay số! Nhấp vào đường dẫn nhập thông tin thẻ tín dụng để thanh toán 30k phí vận chuyển.",
      attachment: "none",
      isScam: true,
      round: 3,
      explanation: "Lừa đảo trúng thưởng điển hình. Yêu cầu nhập thông tin thẻ ngân hàng để lấy phí vận chuyển."
    }
  ],
  messages: [
    { id: 201, sender: 'V-Bank', address: 'SMS BRANDNAME', subject: 'Cảnh báo đăng nhập lạ', spf: 'BRANDNAME VERIFIED', body: 'V-Bank: Phát hiện đăng nhập trên thiết bị mới. Nếu là bạn, không cần làm gì. Nếu không phải bạn, hãy gọi số hotline in trên mặt sau thẻ.', attachment: 'none', isScam: false, round: 1, explanation: 'Tin nhắn không chứa liên kết, không yêu cầu OTP và hướng người dùng kiểm tra hotline chính thức trên thẻ.' },
    { id: 202, sender: 'Giao hàng nhanh', address: 'Số chưa lưu · 09xx 224 xxx', subject: 'Đơn hàng chưa giao được', spf: 'UNKNOWN SENDER', body: 'Đơn hàng của bạn đang bị giữ. Thanh toán 18.000đ phí giao lại trong 30 phút tại https://giao-lai.example/phi. Quá thời hạn, đơn sẽ được chuyển hoàn.', attachment: 'none', isScam: true, round: 1, explanation: 'SMS yêu cầu phí nhưng đơn trong ứng dụng không có khoản thu mới. Tự liên hệ bên vận chuyển từ thông tin trong đơn để xác minh, không thanh toán theo liên kết SMS. Số lạ hoặc lời thúc giục riêng lẻ chưa đủ để kết luận.' },
    { id: 203, sender: 'QUA TANG 24H', address: 'SMS +84 783 551 209', subject: 'Bạn đã trúng iPhone!', spf: 'UNKNOWN SENDER', body: 'Chúc mừng bạn nhận iPhone 17. Xác nhận ngay tại http://nhanqua-vip.cc và nhập CCCD để nhận quà.', attachment: 'none', isScam: true, round: 1, explanation: 'Tin trúng thưởng bất ngờ yêu cầu CCCD và truy cập tên miền lạ là dấu hiệu lừa đảo điển hình.' },
    { id: 204, sender: 'Nhà mạng', address: 'SMS BRANDNAME', subject: 'Bảo trì hệ thống đêm nay', spf: 'BRANDNAME VERIFIED', body: 'Nhà mạng sẽ bảo trì hệ thống từ 00:00–02:00. Một số dịch vụ có thể gián đoạn. Tổng đài hỗ trợ vẫn hoạt động bình thường.', attachment: 'none', isScam: false, round: 2, explanation: 'Thông báo chỉ cung cấp thông tin, không kèm link, không đòi tiền hay dữ liệu cá nhân.' },
    { id: 205, sender: 'Tài khoản định danh', address: '+84 336 818 020', subject: 'Tài khoản sẽ bị khóa', spf: 'UNKNOWN SENDER', body: 'Tài khoản định danh của bạn chưa cập nhật. Gửi mã OTP về số này để được mở khóa ngay: 482911.', attachment: 'none', isScam: true, round: 2, explanation: 'Không bao giờ gửi OTP cho người khác. Tin nhắn dùng đe dọa khóa tài khoản để đánh cắp mã xác thực.' },
    { id: 206, sender: 'Lịch hẹn khám', address: 'SMS BRANDNAME', subject: 'Nhắc lịch khám ngày mai', spf: 'BRANDNAME VERIFIED', body: 'Phòng khám An Tâm nhắc bạn có lịch lúc 09:00 ngày mai. Vui lòng mang theo giấy tờ tùy thân khi đến.', attachment: 'none', isScam: false, round: 2, explanation: 'Tin nhắn nhắc lịch không yêu cầu chuyển tiền, bấm link hay cung cấp mã bảo mật.' },
    { id: 207, sender: 'Hỗ trợ ví điện tử', address: '+84 977 310 442', subject: 'Hoàn tiền giao dịch lỗi', spf: 'UNKNOWN SENDER', body: 'Bạn được hoàn 2.450.000đ. Đọc số thẻ, ngày hết hạn và mã CVV để xác nhận nhận tiền.', attachment: 'none', isScam: true, round: 3, explanation: 'Đơn vị thật không cần CVV để hoàn tiền. Đây là chiêu lấy thông tin thẻ qua cuộc trò chuyện.' },
    { id: 208, sender: 'Gia đình', address: '+84 912 345 678', subject: 'Mẹ đã về đến nhà', spf: 'CONTACT SAVED', body: 'Mẹ về đến nhà rồi nhé. Tối nay con có ăn cơm ở nhà không?', attachment: 'none', isScam: false, round: 3, explanation: 'Tin nhắn hội thoại thông thường, không có yêu cầu bất thường hoặc dấu hiệu thúc giục.' },
    { id: 209, sender: 'TUYEN DUNG ONLINE', address: '+84 866 401 553', subject: 'Việc nhẹ lương cao', spf: 'UNKNOWN SENDER', body: 'Làm nhiệm vụ đánh giá sản phẩm, thu nhập 500k/ngày. Nạp trước 100k để kích hoạt tài khoản: https://job-fast-vn.com.', attachment: 'none', isScam: true, round: 3, explanation: 'Mô hình việc nhẹ lương cao yêu cầu nạp tiền trước là lừa đảo nhiệm vụ phổ biến.' }
  ],
  posts: EXTRA_GAMES.posts,
  browser: EXTRA_GAMES.browser,
  market: EXTRA_GAMES.market
};
