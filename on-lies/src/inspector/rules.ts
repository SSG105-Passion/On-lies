import type { Rule } from './types';

export const RULES: Rule[] = [
  { id: 9, day: 2, cat: 'urgent', text: 'Học phí học kỳ I: thông báo ngày 15/09/2026, thời gian thu 16/09–30/09/2026. Thư nhắc lịch được gửi sớm; yêu cầu thanh toán phải nằm trong đợt thu.' },
  {
    id: 1,
    day: 1,
    cat: 'sender',
    text: 'Email chính thức của trường dùng tên miền chuẩn (@fpt.edu.vn), không dùng đuôi lạ (.top, .site, .vip).'
  },
  {
    id: 2,
    day: 1,
    cat: 'ask',
    text: 'Học phí và các khoản thu đều qua cổng chính thức (FAP/Portal), KHÔNG chuyển vào số tài khoản cá nhân.'
  },
  {
    id: 3,
    day: 1,
    cat: 'bait',
    text: 'Yêu cầu chuyển tiền trước để được nhận việc là dấu hiệu cần dừng và kiểm chứng. Không chuyển cọc theo lời mời tuyển dụng chưa xác minh.'
  },
  {
    id: 4,
    day: 2,
    cat: 'ask',
    text: 'Tuyệt đối KHÔNG một tổ chức hay cá nhân chính đáng nào ĐÒI mật khẩu hoặc mã OTP của bạn.'
  },
  {
    id: 5,
    day: 2,
    cat: 'fake',
    text: 'Người quen nhắn vay tiền gấp: dừng chuyển tiền, liên hệ số đã biết và đối chiếu qua kênh độc lập; giọng nói quen chưa đủ xác minh.'
  },
  {
    id: 6,
    day: 1,
    cat: 'link',
    text: 'Link rút gọn (bit.ly, tinyurl) hoặc tên miền lạ: tự mở ứng dụng/trang chính thức, không bấm link.'
  },
  {
    id: 7,
    day: 3,
    cat: 'fake',
    text: 'Không chuyển tiền vào "tài khoản an toàn" theo cuộc gọi tự xưng công an hoặc tòa án. Dừng cuộc gọi và xác minh qua kênh độc lập.'
  },
  {
    id: 8,
    day: 3,
    cat: 'ask',
    text: 'Mua sắm trực tuyến: thanh toán theo quy trình có bảo vệ, KHÔNG giao dịch hay chuyển tiền riêng ngoài sàn.'
  }
];
