import type { CaseFile } from './types';

export const SCHOOL_CALENDAR = [
  { day: 1, rule: null, title: 'Đăng ký môn Summer', date: '20/05/2026', detail: 'Mở đăng ký trên FAP từ ngày 20/05.' },
  { day: 2, rule: 9, title: 'Học phí học kỳ I', date: '16/09–30/09/2026', detail: 'Thông báo phát hành 15/09. Chỉ yêu cầu thanh toán trong đợt thu; thư nhắc lịch sớm được phép.' },
];
export const DIRECTORY = [
  'Phòng Đào tạo: daotao@fpt.edu.vn',
  'Phòng Tài chính: taichinh@fpt.edu.vn',
  'Học bổng: hocbong@fpt.edu.vn',
  'Cổng trường: fap.fpt.edu.vn',
  'Tuyển dụng: recruitment@fpt-software.com',
  'Shopee: shopee.vn',
];
export const LINK_DESTINATIONS: Record<string, string> = {
  'bit.ly/hocbong-fpt-xacnhan': 'https://hocbong-xacnhan.example/nhan-thuong',
  'tinyurl.com/ho-so-benh-an-be-bo': 'https://quyen-gop.example/ho-so',
  'www.safebank-portal.cc': 'https://www.safebank-portal.cc/',
};
export function caseLinks(file: CaseFile) {
  const text = file.allItems.map(item => item.text).join(' ');
  return Object.entries(LINK_DESTINATIONS).filter(([label]) => text.includes(label));
}
export function compareRule(file: CaseFile, index: number | null, rule: number | null): string {
  if (index === null || rule === null) return 'Chọn một chi tiết trên hồ sơ và một quy định trong sổ để đối chiếu.';
  const item = file.allItems[index];
  if (!item) return 'Chưa chọn dữ kiện.';
  if (item.clue?.rule === rule) return 'Có mâu thuẫn với quy định: ' + item.clue.why;
  if (index === 0 && rule === 1 && file.senderItem?.text.endsWith('@fpt.edu.vn')) return 'Khớp tên miền nhà trường. Kết quả này chỉ áp dụng cho người gửi; hãy kiểm tra nội dung yêu cầu.';
  return 'Chưa xác lập mâu thuẫn giữa hai mục này. Kết quả không xác nhận toàn bộ hồ sơ hợp lệ.';
}
