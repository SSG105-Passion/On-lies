import type { CaseFile, RawCase, RawPart, ParsedItem } from './types';

function parsePart(part: RawPart): ParsedItem {
  if (typeof part === 'string') {
    return { text: part };
  }
  return {
    text: part[0],
    clue: {
      text: part[0],
      cat: part[1],
      why: part[2],
      rule: part[3]
    }
  };
}

function createCase(raw: RawCase): CaseFile {
  const senderItem = raw.a ? parsePart(raw.a) : undefined;
  const bodyItems = raw.p.map(parsePart);
  const allItems: ParsedItem[] = senderItem ? [senderItem, ...bodyItems] : bodyItems;

  const clueIndices: number[] = [];
  allItems.forEach((item, index) => {
    if (item.clue) {
      clueIndices.push(index);
    }
  });

  return {
    id: raw.id,
    day: raw.d,
    channel: raw.channel,
    channelLabel: raw.k,
    who: raw.who,
    note: raw.note,
    senderItem,
    bodyItems,
    allItems,
    isScam: clueIndices.length > 0,
    clueIndices,
    okWhy: raw.ok
  };
}

const RAW_CASES: RawCase[] = [
  // ==================== NGÀY 1 ====================
  {
    id: 101,
    d: 1,
    k: 'Email',
    channel: 'mail',
    who: 'Hồ sơ #101',
    note: 'Em nhận được mail báo trúng học bổng khuyến học nhưng phải đóng phí. Em hơi lo nhưng sợ mất suất.',
    a: ['hocbong@fpt-edu-hotro.top', 'sender', 'Tên miền đuôi lạ (.top), không phải @fpt.edu.vn của trường.', 1],
    p: [
      'Chúc mừng bạn nhận học bổng khuyến khích 5.000.000đ từ quỹ tài năng. Để giữ suất nhận thưởng, bạn cần chuyển ',
      ['lệ phí xét duyệt 500.000đ vào số tài khoản cá nhân của cán bộ phụ trách', 'ask', 'Không có khoản lệ phí nào để nhận học bổng, và trường không thu qua STK cá nhân.', 2],
      ' rồi xác nhận hồ sơ tại ',
      ['bit.ly/hocbong-fpt-xacnhan', 'link', 'Đường link rút gọn che giấu địa chỉ website thật.', 6],
      '. ',
      ['Hạn chót đóng phí là 23h59 hôm nay, quá hạn suất sẽ chuyển cho người khác', 'urgent', 'Tạo tâm lý khẩn cấp nhằm ép bạn hành động vội vàng trước khi kịp kiểm chứng.', 2],
      '.'
    ]
  },
  {
    id: 102,
    d: 1,
    k: 'Email',
    channel: 'mail',
    who: 'Hồ sơ #102',
    note: 'Em nhận được email từ phòng đào tạo trường, không biết thật hay giả, sợ bị virus hay lừa đảo.',
    a: 'daotao@fpt.edu.vn',
    ok: 'Đuôi email chính thức @fpt.edu.vn, không yêu cầu đóng tiền hay gửi OTP, chỉ hướng dẫn sinh viên tự đăng nhập hệ thống cổng FAP chính thống.',
    p: [
      'Chào bạn, Phòng Đào tạo thông báo lịch đăng ký môn học kỳ Summer bắt đầu từ ngày 20. Bạn vui lòng tự đăng nhập hệ thống FAP của trường để kiểm tra thời khóa biểu và tiến hành chọn môn. Mọi thắc mắc vui lòng liên hệ trực tiếp tại sảnh bàn tiếp đón sinh viên.'
    ]
  },
  {
    id: 103,
    d: 1,
    k: 'Bài đăng',
    channel: 'social',
    who: 'Hồ sơ #103',
    note: 'Em đang cần tìm việc làm thêm, thấy bài tuyển dụng này hấp dẫn quá nhưng chưa dám nộp.',
    a: 'Tuyển CTV Sinh viên Bán thời gian – Hà Nội',
    p: [
      'TUYỂN GẤP CTV XỬ LÝ ĐƠN HÀNG: ',
      ['làm 2 tiếng mỗi ngày tại nhà, thu nhập 400k–600k/ngày', 'bait', 'Việc quá nhẹ mà thù lao cao bất thường là bẫy lừa đảo nhiệm vụ phổ biến.', 3],
      '! Chỉ cần điện thoại. Ứng viên mới vui lòng ',
      ['đóng cọc 300.000đ tiền tài liệu hướng dẫn và đồng phục', 'ask', 'Yêu cầu chuyển cọc trước để nhận việc từ nguồn chưa xác minh là dấu hiệu rủi ro cần dừng và kiểm chứng.', 3],
      ' để giữ chỉ tiêu. ',
      ['Chỉ còn đúng 3 suất cho ai nhắn tin Zalo trong hôm nay', 'urgent', 'Tạo cảm giác khan hiếm giả tạo để nạn nhân chuyển tiền gấp.', 3],
      '.'
    ]
  },
  {
    id: 104,
    d: 1,
    k: 'Email',
    channel: 'mail',
    who: 'Hồ sơ #104',
    note: 'Thư mời phỏng vấn thực tập gửi đến hộp thư sinh viên của em.',
    a: 'recruitment@fpt-software.com',
    ok: 'Email gửi từ tên miền doanh nghiệp chính thống, có địa chỉ văn phòng rõ ràng và không yêu cầu nộp bất kỳ khoản phí nào.',
    p: [
      'Chào bạn, Phòng Nhân sự FPT Software đã nhận được CV ứng tuyển vị trí Fresher Developer của bạn. Chúng tôi trân trọng mời bạn tham gia buổi phỏng vấn trực tiếp tại Tòa nhà F-Town vào 9h00 sáng thứ Năm tới. Bạn không cần chuẩn bị khoản phí nào khi tham gia.'
    ]
  },

  // ==================== NGÀY 2 ====================
  {
    id: 201,
    d: 2,
    k: 'Tin nhắn',
    channel: 'sms',
    who: 'Hồ sơ #201',
    note: 'Bạn cùng lớp nhắn tin vay tiền gấp, em rất thương bạn nhưng thấy cách nói chuyện hơi lạ.',
    a: 'Hùng K18 (Tài khoản phụ vừa nhắn)',
    p: [
      'Ê mày ơi, ',
      ['Facebook tao bị khóa đột xuất nên phải lập tạm acc này', 'fake', 'Chiêu trò giả mạo người quen mất tài khoản để mượn tiền.', 5],
      '. Mày chuyển khoản giúp tao gấp 2 triệu vào ',
      ['STK ngân hàng của một người tên Nguyễn Văn Lạ', 'sender', 'Số tài khoản nhận tiền không trùng tên người bạn quen là dấu hiệu mượn danh lừa đảo.', 5],
      ' nhé. Giờ ',
      ['tao đang bận việc gia đình gấp, đừng gọi điện thoại cho tao', 'urgent', 'Ngăn bạn liên hệ số đã biết khiến việc đối chiếu qua kênh độc lập khó hơn. Giọng nói quen cũng chưa đủ chứng minh danh tính.', 5],
      '!'
    ]
  },
  {
    id: 202,
    d: 2,
    k: 'Tin nhắn',
    channel: 'sms',
    who: 'Hồ sơ #202',
    note: 'Lớp trưởng nhắn trong nhóm lớp nhưng em sợ là tài khoản bị hack.',
    a: 'Lớp trưởng Mai Trang',
    ok: 'Nội dung nhắc nhở bài tập thông thường: không yêu cầu chuyển tiền, không đòi thông tin nhạy cảm và hướng dẫn nộp qua hệ thống trường.',
    p: [
      'Mọi người chú ý: Hạn chót nộp bài Assignment 2 trên hệ thống LMS là trước 23h59 tối mai. Ai gặp lỗi kỹ thuật thì chụp ảnh gửi lại nhóm lớp trước 20h để mình tổng hợp báo giảng viên.'
    ]
  },
  {
    id: 203,
    d: 2,
    k: 'Tin nhắn',
    channel: 'sms',
    who: 'Hồ sơ #203',
    note: 'Em nhận được tin nhắn SMS báo tài khoản ngân hàng bị khóa, em đang rất hoảng loạn.',
    a: 'SafeBank-CSKH (Số chưa lưu · +84 987 234 112)',
    p: [
      'SafeBank: Tài khoản của quý khách bị tạm khóa do phát hiện đăng nhập lạ. Vui lòng ',
      ['nhập mã OTP vừa nhận vào trang www.safebank-portal.cc', 'ask', 'Tuyệt đối không một ngân hàng nào yêu cầu bạn nhập OTP vào đường link lạ.', 4],
      ' ',
      ['trong vòng 10 phút để tránh bị phong tỏa vĩnh viễn', 'urgent', 'Đe dọa khóa tài khoản nhằm gây tâm lý sợ hãi, thúc ép nạn nhân làm theo.', 4],
      '.'
    ]
  },
  {
    id: 204,
    d: 2,
    k: 'Tin nhắn',
    channel: 'sms',
    who: 'Hồ sơ #204',
    note: 'Em đang tự chuyển khoản 45.000đ tiền ăn trong ứng dụng ngân hàng, chưa xác nhận thì nhận mã này.',
    a: 'V-Bank Brandname',
    ok: 'Đây là mã OTP gửi đến đúng khi người dùng chủ động thao tác giao dịch, có cảnh báo rõ ràng không được chia sẻ cho bất kỳ ai.',
    p: [
      'V-Bank: Ma OTP cua ban la 592814 cho giao dich chuyen khoan 45.000 VND. Ma nay co hieu luc trong 3 phut. TUYET DOI KHONG CUNG CAP MA OTP NAY CHO BAT KY AI.'
    ]
  },

  // ==================== NGÀY 3 ====================
  {
    id: 301,
    d: 3,
    k: 'Biên bản gọi',
    channel: 'phone',
    who: 'Hồ sơ #301',
    note: 'Em vừa nghe cuộc gọi từ người tự xưng là cán bộ công an điều tra, dọa em dính vào đường dây rửa tiền.',
    a: 'Số điện thoại chưa xác minh: +84 24 999 113',
    p: [
      'Biên bản ghi âm: "Tôi là trung úy Lê Văn Nam, Cục Cảnh sát Điều tra. Số CCCD của em đang đứng tên tài khoản rửa tiền 5 tỷ. ',
      ['Vụ án này thuộc danh mục tuyệt mật, em không được nói cho bố mẹ hay bất kỳ ai', 'urgent', 'Ép giữ bí mật và không hỏi người tin cậy là dấu hiệu cô lập nạn nhân cần cảnh giác.', 7],
      '. Hiện tại để chứng minh trong sạch, em phải ',
      ['rút toàn bộ tiền chuyển vào tài khoản an toàn của cơ quan điều tra: STK 992817263', 'ask', 'Cơ quan thực thi pháp luật không có "tài khoản an toàn" và không bao giờ yêu cầu chuyển tiền qua điện thoại.', 7],
      '."'
    ]
  },
  {
    id: 302,
    d: 3,
    k: 'Email',
    channel: 'mail',
    who: 'Hồ sơ #302',
    note: 'Em có đặt hàng trên Shopee tuần trước, hôm nay nhận email này làm em phân vân.',
    a: 'no-reply@shopee.vn',
    ok: 'Email gửi từ tên miền chính thức của Shopee, thông báo giao hàng thành công, không đòi tiền hay OTP và hướng người dùng vào ứng dụng.',
    p: [
      'Shopee: Đơn hàng #SP882914 của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm trên Shopee. Bạn có thể kiểm tra chi tiết đơn hàng hoặc yêu cầu đổi trả trong mục "Đơn mua" của ứng dụng Shopee.'
    ]
  },
  {
    id: 303,
    d: 3,
    k: 'Bài đăng',
    channel: 'social',
    who: 'Hồ sơ #303',
    note: 'Em thấy bài kêu gọi từ thiện này. Em đã tự liên hệ bệnh viện qua số chính thức; họ xác nhận không có hồ sơ và chương trình quyên góp như bài viết mô tả.',
    a: 'Chị Lan – Quỹ Trái Tim Bồ Đề',
    p: [
      'KHẨN CẤP: Bé Bo 3 tuổi vừa phát hiện bệnh tim bẩm sinh, bố mẹ nghèo không có tiền mổ. Mong các mạnh thường quân ',
      ['chuyển tiền gấp vào số tài khoản cá nhân: 092817382 - NGUYEN THI LAN', 'ask', 'Kêu gọi từ thiện vào tài khoản cá nhân không được kiểm chứng, không có bảo chứng của bệnh viện hay hội đồng.', 6],
      '. ',
      ['Cháu chỉ còn cơ hội phẫu thuật duy nhất trong ngày hôm nay', 'urgent', 'Lợi dụng lòng thương cảm và ép thời gian khẩn cấp để giục chuyển tiền.', 6],
      '. Xem chi tiết hồ sơ bệnh án tại: ',
      ['tinyurl.com/ho-so-benh-an-be-bo', 'link', 'Link rút gọn che giấu tên miền độc hại hoặc trang mạo danh.', 6],
      '.'
    ]
  },
  {
    id: 304,
    d: 3,
    k: 'Phiếu đơn hàng',
    channel: 'market',
    who: 'Hồ sơ #304',
    note: 'Em đặt mua tai nghe trên sàn, người bán nhắn tin riêng bảo em chuyển cọc để được giảm giá sốc.',
    a: 'Shop Phụ Kiện Giá Rẻ (Chat người bán)',
    p: [
      'Tin nhắn người bán: "Chào bạn, mẫu tai nghe này bên mình đang có voucher nội bộ giảm 50% chỉ còn 150k. Bạn ',
      ['hủy đơn trên sàn và chuyển khoản trực tiếp qua số Momo này cho shop', 'ask', 'Giao dịch chuyển khoản riêng ngoài sàn làm mất hoàn toàn chính sách bảo vệ người mua của nền tảng.', 8],
      ' nhé. Bạn ',
      ['cần chuyển cọc 100% ngay trong 15 phút để mình giữ giá', 'urgent', 'Thúc ép đặt cọc gấp vào tài khoản riêng.', 8],
      '."'
    ]
  },
  {
    id: 305,
    d: 3,
    k: 'Tin nhắn',
    channel: 'sms',
    who: 'Hồ sơ #305',
    note: 'Tin nhắn nhắc lịch hẹn khám sức khỏe định kỳ của phòng khám trường.',
    a: 'Clinic-FPT (Brandname)',
    ok: 'Tin nhắn gửi từ brandname phòng khám trường, nội dung cung cấp thông tin lịch hẹn rõ ràng, không kèm link lạ hay yêu cầu chuyển phí.',
    p: [
      'Phong kham FPT thong bao: Ban co lich kham suc khoe dinh ky vao 08:30 sang mai tai Phong Y te Co so 1. Vui long mang theo the sinh vien khi den. Hotline: 024.7300.xxxx.'
    ]
  }
];

export const CASES: CaseFile[] = RAW_CASES.map(createCase);
