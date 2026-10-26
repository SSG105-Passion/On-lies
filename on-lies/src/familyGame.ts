import { createSessionId } from './session';
import { beep } from './audio';
import { renderFamilyIntro, renderFamilyScene, renderFamilySummary } from './familyView';

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

type Who = 'family' | 'scammer' | 'me';

interface ChatLine {
  who: Who;
  text: string;
}

interface Choice {
  text: string;
  fear: number;
  trust: number;
  next: string;
}

interface Node {
  lines: ChatLine[];
  choices?: Choice[];
  ending?: 'win' | 'lose';
  lesson?: string;
}

interface Scene {
  title: string;
  relative: string;
  intro: string;
  start: string;
  nodes: Record<string, Node>;
}

const SCENES: Scene[] = [
  {
    title: 'Bà bị gọi "công an điều tra"',
    relative: 'Bà ngoại',
    intro: 'Bà vừa nhận cuộc gọi từ số lạ tự xưng công an hình sự, nói bà dính vào vụ án rửa tiền và đang rất hoảng. Bạn đang nhắn tin với bà.',
    start: 'start',
    nodes: {
      start: {
        lines: [
          { who: 'family', text: 'Con ơi, vừa rồi có người gọi xưng công an, bảo bà liên quan đến vụ án rửa tiền 5 tỷ, phải chuyển 200 triệu vào "tài khoản an toàn" để họ thanh tra. Họ dặn không được cúp máy hay kể với ai... Bà run quá con ạ!' },
        ],
        choices: [
          { text: 'Bà ơi đó là lừa đảo 100%, bà cúp máy ngay đi!', fear: 1, trust: 1, next: 'push' },
          { text: 'Bà bình tĩnh nhé, con đang ở đây với bà. Bà kể con nghe họ vừa nói gì được không?', fear: -2, trust: 0, next: 'calm' },
          { text: 'Bà cứ làm theo họ cho xong chuyện kẻo bị bắt thật.', fear: -1, trust: 3, next: 'lose_transfer' },
        ],
      },
      push: {
        lines: [
          { who: 'family', text: 'Con biết gì mà nói! Họ đọc đúng họ tên bà, đúng số căn cước, nói năng có chức danh rõ ràng.' },
          { who: 'scammer', text: 'Bà còn 10 phút. Nếu không hợp tác sẽ có lệnh bắt khẩn cấp ngay tại nhà. Tuyệt đối không cúp máy!' },
        ],
        choices: [
          { text: 'Dạ con xin lỗi bà. Bà chưa cần quyết định gì vội, bà cho con xem họ gửi giấy tờ gì cho bà nhé.', fear: -1, trust: -1, next: 'calm' },
          { text: 'Con bảo bà cúp máy là cúp máy đi, bà cứ bướng!', fear: 2, trust: 2, next: 'lose_pressure' },
        ],
      },
      calm: {
        lines: [
          { who: 'family', text: 'Họ gửi qua Zalo cái lệnh bắt giam có hình con dấu đỏ chót, nhìn y như thật con ơi. Họ bảo nếu không chuyển tiền ngay thì chiều nay xe công an tới nhà.' },
        ],
        choices: [
          { text: 'Bà đặt máy xuống nhé. Công an không bao giờ làm việc hay đòi chuyển tiền qua điện thoại đâu. Mình cùng ra công an phường hỏi trực tiếp, con đi cùng bà.', fear: -2, trust: -3, next: 'win' },
          { text: 'Bà thử hỏi lại xem có đúng cơ quan công an quận mình không.', fear: 0, trust: 2, next: 'lose_pressure' },
          { text: 'Bà chuyển thử 5 triệu trước để xem họ phản hồi sao.', fear: 0, trust: 3, next: 'lose_transfer' },
        ],
      },
      win: {
        lines: [
          { who: 'family', text: 'Ừ, bà cúp máy rồi. Giờ bà qua phòng con, lát hai bà cháu mình cùng ra công an phường hỏi cho yên tâm nhé.' },
        ],
        ending: 'win',
        lesson: 'Cơ quan công an, viện kiểm sát KHÔNG BAO GIỜ làm việc qua điện thoại và KHÔNG BAO GIỜ yêu cầu chuyển tiền vào "tài khoản an toàn". Khi người thân hoảng loạn: hãy trấn an trước, hỏi rõ sự việc, rồi cùng họ đi xác minh trực tiếp.',
      },
      lose_transfer: {
        lines: [
          { who: 'family', text: 'Bà chuyển tiền rồi con ơi... Họ hứa 15 phút sẽ hoàn lại mà giờ chặn số bà rồi, mất sạch tiền dưỡng già của bà rồi...' },
        ],
        ending: 'lose',
        lesson: 'Tiền đã chuyển vào tài khoản kẻ lừa đảo sẽ bị tẩu tán ngay lập tức. Tuyệt đối không khuyên người thân "chuyển cho xong chuyện" hoặc chuyển thử "một ít cho an tâm".',
      },
      lose_pressure: {
        lines: [
          { who: 'family', text: 'Con cứ quát bà làm bà càng hoảng... Thôi bà nghe lời họ, họ bảo làm theo quy trình là an toàn nhất.' },
        ],
        ending: 'lose',
        lesson: 'Quát mắng hay chỉ trích người đang sợ hãi chỉ đẩy họ về phía kẻ lừa đảo. Nhờ chính kẻ gọi "tự chứng minh danh tính" cũng vô ích vì chúng luôn chuẩn bị sẵn giấy tờ giả.',
      },
    },
  },
  {
    title: 'Dì nhận tin "em họ tai nạn cấp cứu"',
    relative: 'Dì ruột',
    intro: 'Dì nhắn tin cho bạn với giọng hốt hoảng: có số lạ xưng là Nam (em họ bạn) bảo vừa bị tai nạn xe, đang cấp cứu cần tiền gấp.',
    start: 'start',
    nodes: {
      start: {
        lines: [
          { who: 'family', text: 'Cháu ơi, có số lạ nhắn xưng là thằng Nam con dì. Nó bảo bị tai nạn gãy chân, điện thoại cũ vỡ nát, mượn máy người ta nhắn nhờ dì chuyển gấp 15 triệu đóng viện phí mổ. Dì run rẩy quá!' },
        ],
        choices: [
          { text: 'Dì ơi người nhà thì chuyển gấp đi kẻo lỡ việc mổ xẻ của em!', fear: -1, trust: 3, next: 'lose_transfer' },
          { text: 'Dì khoan chuyển tiền nhé! Dì gọi số cũ của Nam, còn cháu gọi cho cô giáo và bạn cùng phòng Nam kiểm tra ngay.', fear: -1, trust: -2, next: 'call' },
          { text: 'Dì hỏi người đó vài câu về kỷ niệm gia đình xem có đúng là Nam không.', fear: 0, trust: 1, next: 'evade' },
        ],
      },
      evade: {
        lines: [
          { who: 'scammer', text: 'Đừng hỏi lòng vòng nữa dì ơi! Bác sĩ bảo không đóng tạm ứng là không mổ, con đau buốt sắp ngất rồi!' },
          { who: 'family', text: 'Nó trả lời cáu gắt và giục quá cháu ạ. Dì nghe sốt ruột không chịu nổi...' },
        ],
        choices: [
          { text: 'Né tránh và tạo áp lực gấp gáp chính là dấu hiệu lừa đảo. Dì dừng tay lại, để cháu gọi mẹ Nam và khoa cấp cứu.', fear: -1, trust: -2, next: 'call' },
          { text: 'Chắc em nó đau thật, thôi dì cứ chuyển trước 5 triệu đi.', fear: 0, trust: 3, next: 'lose_transfer' },
        ],
      },
      call: {
        lines: [
          { who: 'family', text: 'Dì gọi số cũ của Nam thì máy bận không ai nghe, dì sợ quá! Số lạ kia lại nhắn: "Mẹ ơi chuyển nhanh cứu con!"' },
        ],
        choices: [
          { text: 'Máy bận có thể do em đang trong giờ học. Cháu vừa gọi bạn cùng lớp, bạn xác nhận Nam đang ngồi trong giảng đường bình an. Dì đừng chuyển!', fear: -1, trust: -3, next: 'win' },
          { text: 'Dì bảo họ chụp ảnh bệnh viện gửi qua xem cho chắc.', fear: 0, trust: 2, next: 'lose_pressure' },
          { text: 'Dì chuyển khoản luôn cho kịp giờ cấp cứu.', fear: 0, trust: 3, next: 'lose_transfer' },
        ],
      },
      win: {
        lines: [
          { who: 'family', text: 'Trời ơi, Nam vừa gọi video về cho dì rồi, nó đang ở lớp! Tí nữa thì dì mất toi 15 triệu bạc, cảm ơn cháu nhiều lắm!' },
        ],
        ending: 'win',
        lesson: 'Chiêu lừa "người thân cấp cứu" đánh vào lòng thương và sự sợ hãi. Luôn dừng lại xác minh qua người thứ ba (bạn bè, trường học, bệnh viện) trước khi chuyển tiền cho số lạ.',
      },
      lose_transfer: {
        lines: [
          { who: 'family', text: 'Dì chuyển rồi cháu ơi... Giờ Nam đi học về bảo nãy giờ điện thoại nó hết pin chứ chẳng bị làm sao cả. Dì mất trắng 15 triệu rồi...' },
        ],
        ending: 'lose',
        lesson: 'Kẻ lừa đảo thường chọn lúc nạn nhân không liên lạc được với người thân (hết pin, giờ học, giờ bay) để tạo kịch bản cấp cứu.',
      },
      lose_pressure: {
        lines: [
          { who: 'family', text: 'Họ gửi qua bức ảnh phòng cấp cứu có người băng bó be bét máu, dì mềm lòng chuyển luôn rồi cháu ơi...' },
        ],
        ending: 'lose',
        lesson: 'Hình ảnh, bệnh án hay thậm chí giọng nói qua điện thoại đều có thể bị cắt ghép hoặc lấy từ Internet. Đừng tin vào bằng chứng do chính kẻ đòi tiền cung cấp.',
      },
    },
  },
  {
    title: 'Mẹ bị dụ làm "việc nhẹ lương cao"',
    relative: 'Mẹ',
    intro: 'Mẹ hào hứng khoe vừa tìm được công việc online kiếm vài trăm nghìn mỗi ngày tại nhà: làm nhiệm vụ tăng tương tác đơn hàng.',
    start: 'start',
    nodes: {
      start: {
        lines: [
          { who: 'family', text: 'Con ơi, mẹ vừa vào nhóm này hay lắm. Chỉ cần nạp tiền "chạy đơn hàng ảo" là nhận lại gốc cộng hoa hồng 20%. Hôm qua mẹ nạp 200k rút được 260k thật! Giờ họ bảo có đơn VIP 5 triệu được hoa hồng 2 triệu, mẹ tính nạp luôn.' },
        ],
        choices: [
          { text: 'Mẹ tham thế! Trên đời này làm gì có việc ngồi nhà bấm điện thoại mà kiếm tiền triệu!', fear: 1, trust: 2, next: 'push' },
          { text: 'Mẹ ơi khoan đã! 60k hôm qua là tiền mồi họ thả ra để mẹ tin đấy. Việc thật không bao giờ bắt người làm nạp tiền trước.', fear: -1, trust: -2, next: 'calm' },
          { text: 'Hoa hồng cao thế mẹ làm thử đi, có gì mẹ cho con ít tiền tiêu vặt.', fear: -1, trust: 3, next: 'lose_transfer' },
        ],
      },
      push: {
        lines: [
          { who: 'family', text: 'Mẹ kiếm tiền phụ gia đình chứ tham lam gì! Người ta có công ty đăng ký kinh doanh, có cả trăm người trong nhóm khoe rút được tiền kia kìa.' },
          { who: 'scammer', text: 'Chúc mừng chị là thành viên may mắn được chọn nhận đơn độc quyền. Cơ hội chỉ giữ trong 15 phút!' },
        ],
        choices: [
          { text: 'Mẹ ơi con xin lỗi vì nói hơi gắt. Nhưng các tài khoản khoe tiền trong nhóm toàn là "chim mồi" nick ảo thôi. Mẹ xem bài cảnh báo của đài truyền hình này.', fear: -1, trust: -2, next: 'calm' },
          { text: 'Mẹ không nghe con thì sau này mất tiền mẹ đừng có khóc với con nhé!', fear: 2, trust: 2, next: 'lose_pressure' },
        ],
      },
      calm: {
        lines: [
          { who: 'family', text: 'Họ bảo chỉ cần nạp 5 triệu, hoàn thành đơn là 10 phút sau rút cả gốc lẫn lãi 7 triệu về tài khoản ngân hàng ngay.' },
        ],
        choices: [
          { text: 'Kịch bản tiếp theo là họ sẽ báo mẹ "nhập sai cú pháp" hoặc "lỗi hệ thống" rồi bắt nạp thêm 20 triệu mới cho rút. Mẹ dừng ngay, chặn số và giữ lấy 60k tiền lãi hôm qua!', fear: -2, trust: -3, next: 'win' },
          { text: 'Mẹ thử xin họ rút bớt tiền hoa hồng trước rồi mới nạp.', fear: 0, trust: 2, next: 'lose_pressure' },
          { text: 'Mẹ nạp 5 triệu đi, xong rồi nhớ rút ngay nhé.', fear: 0, trust: 3, next: 'lose_transfer' },
        ],
      },
      win: {
        lines: [
          { who: 'family', text: 'Nghe con giải thích mẹ mới giật mình! Mẹ vừa out nhóm và chặn số rồi. Suýt nữa thì bay mất tháng lương hưu của mẹ.' },
        ],
        ending: 'win',
        lesson: 'Bẫy "nhiệm vụ đơn hàng online / việc nhẹ lương cao": ban đầu cho rút vài chục nghìn tiền mồi, sau đó đưa đơn hàng tiền triệu rồi khóa tiền với lý do "sai cú pháp". Hãy nhớ: Công việc chân chính không bao giờ yêu cầu nạp tiền trước.',
      },
      lose_transfer: {
        lines: [
          { who: 'family', text: 'Con ơi mẹ nạp 5 triệu rồi mà họ bảo mẹ nhập sai lệnh, bắt nạp thêm 20 triệu nữa mới mở khóa tài khoản... Giờ mẹ phải làm sao?' },
        ],
        ending: 'lose',
        lesson: 'Khi đã rơi vào bẫy, kẻ lừa đảo sẽ liên tục viện cớ (lỗi mạng, sai cú pháp, nâng cấp tài khoản) để ép nạn nhân nạp thêm tiền. Tuyệt đối không nạp thêm để "chuộc" tiền cũ.',
      },
      lose_pressure: {
        lines: [
          { who: 'family', text: 'Con nói khó nghe quá, mẹ tự làm chủ đồng tiền của mẹ! Mẹ vừa nạp xong rồi.' },
        ],
        ending: 'lose',
        lesson: 'Thái độ chỉ trích hay coi thường người lớn tuổi sẽ kích hoạt tâm lý tự ái, khiến họ càng cố chứng minh mình đúng bằng cách chuyển tiền.',
      },
    },
  },
  {
    title: 'Ông nhận SMS "quà tri ân bưu điện"',
    relative: 'Ông nội',
    intro: 'Ông nhận tin nhắn thông báo có bưu kiện tri ân quà tặng người cao tuổi trị giá 2 triệu, kèm link yêu cầu xác nhận.',
    start: 'start',
    nodes: {
      start: {
        lines: [
          { who: 'family', text: 'Cháu ơi, bưu điện gửi tin nhắn tặng ông gói quà tri ân 2 triệu. Họ bảo bấm vào đường link này xác nhận địa chỉ: bưu-dien-tri-an.cc. Ông bấm vào thì trang web bắt nhập số thẻ ngân hàng và mã OTP.' },
        ],
        choices: [
          { text: 'Ông ơi tuyệt đối không nhập mã OTP vào trang web đó! Bưu điện tặng quà không bao giờ đòi mã OTP ngân hàng.', fear: -1, trust: -2, next: 'calm' },
          { text: 'Ông già rồi còn ham quà trúng thưởng, bấm lung tung có ngày mất hết tiền!', fear: 1, trust: 1, next: 'push' },
          { text: 'Chắc là mã xác nhận nhận quà thôi, ông nhập vào đi cho họ gửi về.', fear: -1, trust: 3, next: 'lose_transfer' },
        ],
      },
      push: {
        lines: [
          { who: 'family', text: 'Ông có ham hố gì đâu, người ta ghi rõ tri ân người cao tuổi có công mà! Họ bảo chỉ giữ quà trong 30 phút thôi.' },
          { who: 'scammer', text: 'Quý khách vui lòng nhập mã OTP vừa gửi về SMS để hoàn tất thủ tục nhận quà miễn phí.' },
        ],
        choices: [
          { text: 'Cháu xin lỗi ông. Nhưng mã OTP là "chìa khóa két sắt" của tài khoản ngân hàng, ai có mã đó là rút được tiền của ông. Ông tắt trang web đó đi nhé.', fear: -2, trust: -2, next: 'calm' },
          { text: 'Ông mà nhập là con không chịu trách nhiệm đâu đấy!', fear: 2, trust: 2, next: 'lose_pressure' },
        ],
      },
      calm: {
        lines: [
          { who: 'family', text: 'Trang web có logo Bưu điện Việt Nam to tướng cháu ạ, giao diện nhìn đàng hoàng lắm. Sao họ lại lấy được tiền của ông được?' },
        ],
        choices: [
          { text: 'Giao diện và logo sao chép rất dễ. Ông nhìn tên miền kìa: đuôi .cc chứ không phải vnpost.vn chính thức. Chiều cháu chở ông ra bưu cục gần nhà kiểm tra nhé!', fear: -2, trust: -3, next: 'win' },
          { text: 'Hay ông gọi vào số hotline ghi ở dưới chân trang web đó hỏi xem.', fear: 0, trust: 2, next: 'lose_pressure' },
          { text: 'Ông nhập thử mã sai xem trang web có nhận không.', fear: 0, trust: 2, next: 'lose_pressure' },
        ],
      },
      win: {
        lines: [
          { who: 'family', text: 'May mà có cháu nhắc kịp! Ông vừa xóa trang web đó rồi. Đúng là thời nay lừa đảo tinh vi quá, cái gì cũng làm giả được.' },
        ],
        ending: 'win',
        lesson: 'Mã OTP là mật mã bảo vệ cuối cùng của tài khoản ngân hàng. Không một cơ quan, ngân hàng hay dịch vụ vận chuyển nào yêu cầu cung cấp mã OTP để nhận quà hay nhận bưu phẩm.',
      },
      lose_transfer: {
        lines: [
          { who: 'family', text: 'Cháu ơi, ông vừa nhập mã xong thì điện thoại báo tài khoản bị trừ mất 12 triệu rồi! Quà đâu không thấy mà tiền mất hết rồi...' },
        ],
        ending: 'lose',
        lesson: 'Nhập mã OTP vào trang web giả mạo đồng nghĩa với việc cho phép kẻ gian thực hiện giao dịch chuyển tiền ra khỏi tài khoản của bạn.',
      },
      lose_pressure: {
        lines: [
          { who: 'family', text: 'Họ dặn ông không làm nhanh là bị hủy quà, ông sốt ruột nhấn gửi mã luôn rồi cháu ơi...' },
        ],
        ending: 'lose',
        lesson: 'Tạo áp lực thời gian đếm ngược ("chỉ còn 15 phút", "sắp hết hạn") là chiêu bài kinh điển nhằm ngăn nạn nhân kịp suy nghĩ hoặc hỏi ý kiến người khác.',
      },
    },
  },
  {
    title: 'Cô quen "doanh nhân" rủ đầu tư tiền ảo',
    relative: 'Cô út',
    intro: 'Cô út quen một người bạn qua mạng được 2 tuần, xưng là chuyên gia tài chính và rủ cô góp vốn đầu tư sinh lời 10%/ngày.',
    start: 'start',
    nodes: {
      start: {
        lines: [
          { who: 'family', text: 'Cháu ơi, cô quen anh này trên mạng làm ăn phát đạt lắm. Anh ấy hướng dẫn cô đầu tư sàn giao dịch vàng quốc tế này, bảo cam kết lãi 10% mỗi ngày, không rủi ro. Cô tính rút 100 triệu sổ tiết kiệm nạp vào để kiếm tiền sửa nhà.' },
        ],
        choices: [
          { text: 'Cô bị lừa tình lừa tiền rồi! Người ta đẹp trai giàu có thì việc gì phải lên mạng rủ cô kiếm tiền!', fear: 1, trust: 2, next: 'push' },
          { text: 'Cô ơi dừng lại đã! Lãi suất 10%/ngày tương đương hơn 3000%/năm, ngay cả tỷ phú giỏi nhất thế giới cũng không làm được. Cô cho cháu xem trang web đó nhé.', fear: -1, trust: -2, next: 'calm' },
          { text: 'Nghe hấp dẫn đấy cô, cô nạp trước 50 triệu xem thế nào.', fear: -1, trust: 3, next: 'lose_transfer' },
        ],
      },
      push: {
        lines: [
          { who: 'family', text: 'Cháu cứ nói gở mồm! Người ta gọi video tâm sự với cô hàng ngày, quan tâm cô từng li từng tí. Anh ấy bảo chỉ muốn giúp cô có cuộc sống tốt hơn thôi.' },
          { who: 'scammer', text: 'Em yêu nạp sớm trong hôm nay để kịp vào lệnh phiên giao dịch buổi sáng nhé, cơ hội hiếm có đấy.' },
        ],
        choices: [
          { text: 'Cháu hiểu cô quý mến họ. Nhưng đây là thủ đoạn "nuôi heo để làm thịt" (Pig Butchering). Họ giả vờ yêu thương để tạo lòng tin rồi mới dụ nạp tiền. Cô chờ cháu 1 hôm, cháu nhờ bạn bên an ninh mạng kiểm tra sàn này.', fear: -2, trust: -3, next: 'win' },
          { text: 'Tùy cô, tiền của cô cô thích ném qua cửa sổ thì cứ nạp!', fear: 2, trust: 2, next: 'lose_pressure' },
        ],
      },
      calm: {
        lines: [
          { who: 'family', text: 'Họ gửi cho cô xem cả bảng sao kê tài khoản ngân hàng mấy chục tỷ, lại còn cho cô mật khẩu vào xem tài khoản đầu tư của họ đang có cả triệu đô...' },
        ],
        choices: [
          { text: 'Tất cả con số trên sàn giao dịch đó đều do kẻ lừa đảo tự gõ ra được trên máy tính của họ. Tiền cô nạp vào là chuyển thẳng vào ví cá nhân của họ chứ không có đầu tư gì đâu. Cô chặn người này ngay nhé!', fear: -2, trust: -3, next: 'win' },
          { text: 'Cô bảo anh ấy nạp tiền giùm cô trước đi, khi nào có lãi cô trả lại.', fear: 0, trust: 2, next: 'lose_pressure' },
          { text: 'Cô cứ nạp thử một ít đi, thấy nguy hiểm thì rút ngay.', fear: 0, trust: 3, next: 'lose_transfer' },
        ],
      },
      win: {
        lines: [
          { who: 'family', text: 'Cô vừa đưa ảnh anh ta cho công an khu vực xem, họ bảo đây là ảnh mạng bị kẻ lừa đảo đánh cắp để đi lừa hàng chục người rồi! Cô hú vía, tí nữa là mất trắng cả đời tích góp.' },
        ],
        ending: 'win',
        lesson: 'Chiêu lừa "bẫy tình - rủ đầu tư tài chính" (Pig Butchering): kẻ lừa đảo xây dựng mối quan hệ tình cảm thân thiết qua mạng trong nhiều tuần, sau đó mới rủ đầu tư vào sàn ảo do chúng tự tạo để chiếm đoạt tài sản.',
      },
      lose_transfer: {
        lines: [
          { who: 'family', text: 'Cháu ơi, cô nạp 100 triệu vào thì bảng điện tử hiện lãi thành 150 triệu. Nhưng khi cô bấm rút tiền thì hệ thống báo phải nộp thêm 30 triệu tiền thuế mới cho rút... Giờ người đó cũng biến mất rồi!' },
        ],
        ending: 'lose',
        lesson: 'Các con số sinh lời trên sàn ảo hoàn toàn là số giả do kẻ lừa đảo can thiệp. Nạn nhân không bao giờ rút được tiền ra, và nếu tiếp tục nộp "thuế/phí" thì chỉ mất thêm tiền.',
      },
      lose_pressure: {
        lines: [
          { who: 'family', text: 'Cháu làm cô cảm thấy bị xúc phạm. Cô tự tin vào mắt nhìn người của mình. Cô vừa chuyển tiền vào sàn rồi.' },
        ],
        ending: 'lose',
        lesson: 'Khi nạn nhân đang bị thao túng tâm lý tình cảm, việc chế giễu ngoại hình hay tuổi tác chỉ khiến họ có xu hướng bảo vệ kẻ lừa đảo để bảo vệ lòng tự trọng của chính mình.',
      },
    },
  },
];

let sceneIdx = 0;
let nodeId = '';
let fear = 7;
let trust = 8;
let lives = 3;
let score = 0;
let sessionId = '';
let finished = false;
let log: ChatLine[] = [];
const history: { title: string; won: boolean; lesson: string }[] = [];

const content = () => document.getElementById('familyContent')!;
const stats = () => document.getElementById('familyStats')!;
const clamp = (n: number) => Math.max(0, Math.min(10, n));
export function openFamilyGame() {
  stats().classList.add('hidden');
  content().innerHTML = renderFamilyIntro(SCENES.length);
  content().scrollTop = 0;
}

function start() {
  sceneIdx = 0;
  lives = 3;
  score = 0;
  sessionId = createSessionId();
  finished = false;
  history.length = 0;
  startScene();
}

function startScene() {
  fear = 7;
  trust = 8;
  log = [];
  enterNode(SCENES[sceneIdx].start);
  content().scrollTop = 0;
  content().querySelector<HTMLElement>('.family-heading h1')?.focus({ preventScroll: true });
}

function enterNode(id: string) {
  const scene = SCENES[sceneIdx];
  const node = scene.nodes[id];
  nodeId = id;
  log.push(...node.lines);
  if (node.ending) {
    const won = node.ending === 'win';
    if (won) {
      score++;
      beep('C5', '8n');
    } else {
      lives--;
      beep('G2', '8n');
    }
    history.push({ title: scene.title, won, lesson: node.lesson ?? '' });
  }
  render();
}

function render() {
  const scene = SCENES[sceneIdx];
  const node = scene.nodes[nodeId];
  content().innerHTML = renderFamilyScene({
    ...scene, sceneIdx, total: SCENES.length, score, lives, fear, trust, log,
    choices: (node.choices ?? []).map(choice => choice.text), ending: node.ending, lesson: node.lesson,
  });

  const chatEl = document.getElementById('familyChat');
  if (chatEl) {
    chatEl.scrollTop = chatEl.scrollHeight;
  }
}

function choose(index: number) {
  const scene = SCENES[sceneIdx];
  const choice = scene.nodes[nodeId].choices?.[index];
  if (!choice) return;

  fear = clamp(fear + choice.fear);
  trust = clamp(trust + choice.trust);
  log.push({ who: 'me', text: choice.text });

  // Tin kẻ gọi chạm trần (>= 10): người thân hoàn toàn nghe theo kẻ lừa đảo
  const forceLose = trust >= 10 && !scene.nodes[choice.next].ending;
  enterNode(forceLose ? 'lose_pressure' : choice.next);
  const target = content().querySelector<HTMLElement>('[data-family-feedback], [data-family="choose"]');
  target?.focus({ preventScroll: true });
  target?.scrollIntoView({ block: 'nearest' });
}

function next() {
  if (lives === 0 || sceneIdx === SCENES.length - 1) {
    finish();
    return;
  }
  sceneIdx++;
  startScene();
}

function finish() {
  if (finished) return;
  finished = true;

  if (lives > 0 && history.length === SCENES.length) {
    document.dispatchEvent(new CustomEvent<FamilyGameResult>('family-completed', {
      detail: { score, maxScore: SCENES.length, livesLeft: lives, sessionId },
    }));
  }

  stats().classList.add('hidden');
  content().innerHTML = renderFamilySummary(history, score, lives, SCENES.length);
  content().scrollTop = 0;
}

document.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-family]');
  if (!button || button.disabled) return;
  switch (button.dataset.family) {
    case 'start':
      start();
      break;
    case 'choose':
      choose(Number(button.dataset.choice));
      break;
    case 'next':
      next();
      break;
  }
});
