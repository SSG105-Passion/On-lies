import { createSessionId } from './session';
import { beep, playEmergencyHeartbeat, playActionBeep, playTacticalSuccess } from './audio';
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
  attachment?: {
    type: 'doc' | 'image' | 'warning';
    badge: string;
    title: string;
    desc: string;
  };
}

interface Choice {
  text: string;
  tacticLabel: string;
  fear: number;
  trust: number;
  next: string;
}

interface Node {
  lines: ChatLine[];
  choices?: Choice[];
  ending?: 'win' | 'lose';
  lesson?: string;
  locationStatus?: string;
}

interface Scene {
  id?: number;
  title: string;
  relative: string;
  relationship: string;
  crisisContext: string;
  location: string;
  start: string;
  nodes: Record<string, Node>;
}

const SCENES: Scene[] = [
  {
    id: 1,
    title: 'Mẹ đang đứng ở quầy ngân hàng rút sổ tiết kiệm 300 triệu',
    relative: 'Mẹ',
    relationship: 'Mẹ ruột • 58 tuổi',
    crisisContext: 'Kẻ giả danh Viện kiểm sát gọi dọa bắt giam mẹ suốt 2 tiếng và ép mẹ đeo tai nghe ra ngân hàng rút toàn bộ sổ tiết kiệm 300 triệu chuyển "tài khoản tạm giữ". Mẹ đang lén nhắn tin cho bạn từ quầy!',
    location: 'Quầy giao dịch Ngân hàng (Đang cầm bút chuẩn bị ký giấy rút tiền)',
    start: 'start',
    nodes: {
      start: {
        locationStatus: 'Mẹ đang xếp hàng trước quầy rút tiền, tai vẫn đeo tai nghe bị đe dọa liên tục',
        lines: [
          {
            who: 'family',
            text: 'Con ơi, có cán bộ Viện Kiểm sát đang nghe máy mẹ suốt từ sáng. Họ bảo số CMND cũ của mẹ liên quan tài khoản ma túy 15 tỷ ở Đà Nẵng, bắt mẹ ra rút hết sổ tiết kiệm 300 triệu dưỡng già nộp vào tài khoản thanh tra. Họ dặn nếu nhân viên ngân hàng hỏi thì bảo rút cho con mua đất, cấm nói vụ án kẻo bị còng tay ngay tại quầy... Mẹ run bần bật, sắp đến số thứ tự rồi con ơi!'
          },
          {
            who: 'scammer',
            text: 'Bà Nguyễn Thị Lan, chú ý camera an ninh! Đến lượt vào quầy thì làm theo đúng kịch bản, tuyệt đối không tháo tai nghe!'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Trấn an & Kế hoãn binh tại chỗ',
            text: 'Mẹ hít thở sâu, con đang ở cạnh mẹ đây! Mẹ giả vờ ho nhiều hoặc cần đi vệ sinh gấp để nhường lượt cho người sau, lùi lại 5 phút ra ghế chờ nhé mẹ.',
            fear: -2,
            trust: -2,
            next: 'stall_bank'
          },
          {
            tacticLabel: 'Giao thức: Trực diện đối đầu & Chỉ trích',
            text: 'Mẹ bị ngốc à? Công an nào làm việc qua điện thoại! Mẹ cúp máy ngay đi, không con mặc kệ mẹ đấy!',
            fear: 3,
            trust: 2,
            next: 'lose_panic'
          },
          {
            tacticLabel: 'Giao thức: Thỏa hiệp chuyển thử một phần',
            text: 'Họ dọa ghê thế thì mẹ cứ rút chuyển trước 30 triệu cho yên chuyện kẻo bị bắt thật.',
            fear: 1,
            trust: 3,
            next: 'lose_transfer'
          }
        ]
      },
      stall_bank: {
        locationStatus: 'Mẹ đã lùi ra ghế chờ, kẻ gian liên tục quát tháo trong tai nghe',
        lines: [
          {
            who: 'family',
            text: 'Mẹ lùi ra ghế ngồi rồi... Nhưng trong tai nghe họ quát mẹ ghê quá, họ bảo xe cảnh sát đang đỗ ngoài cổng ngân hàng chờ còng tay mẹ rồi con ơi! Mẹ sợ lắm, hay mẹ cứ rút đại cho xong?'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Can thiệp Ngoại tuyến & Bảo vệ quầy',
            text: 'Mẹ giữ nguyên tai nghe đừng nói gì cả! Mẹ đứng dậy bước ngay tới bàn chú bảo vệ và cô giao dịch viên, đưa dòng tin nhắn này của con cho cô ấy đọc: "Tôi đang bị kẻ lạ dọa qua điện thoại ép rút tiền, xin giữ tôi lại!".',
            fear: -3,
            trust: -4,
            next: 'win'
          },
          {
            tacticLabel: 'Giao thức: Kiểm tra Thực địa & Vạch trần',
            text: 'Mẹ nhìn qua cửa kính xem có xe cảnh sát nào không? Không hề có chiếc nào! Viện kiểm sát chỉ gửi giấy mời qua bưu chính, không bao giờ giám sát qua tai nghe điện thoại đâu mẹ.',
            fear: -1,
            trust: -2,
            next: 'verify_paper'
          },
          {
            tacticLabel: 'Giao thức: Ép người thân tự đôi co',
            text: 'Mẹ hét vào tai nghe bảo con trai mẹ làm luật sư xem họ dám bắt mẹ không!',
            fear: 2,
            trust: 2,
            next: 'lose_panic'
          }
        ]
      },
      verify_paper: {
        locationStatus: 'Kẻ gian gửi Lệnh bắt giam qua Zalo để khủng bố tinh thần',
        lines: [
          {
            who: 'scammer',
            text: 'Văn bản Tống đạt: Quyết định Phê chuẩn Lệnh Bắt Tạm Giam số 812/VKSTC. Bị can: Nguyễn Thị Lan. Tội danh: Rửa tiền xuyên quốc gia.',
            attachment: {
              type: 'doc',
              badge: 'TÀI LIỆU NHẬN QUA ZALO',
              title: 'Lệnh Bắt Giữ & Phong Tỏa Tài Sản',
              desc: 'Con dấu đỏ Viện Kiểm sát Tối cao, tiêu đề đỏ chót ghi rõ họ tên và số CCCD của mẹ.'
            }
          },
          {
            who: 'family',
            text: 'Họ vừa gửi lệnh bắt có con dấu đỏ chót tên mẹ qua Zalo đây con ơi! Nhìn y như thật thế này sao giả được hả con?'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Bàn giao Giao dịch viên xử lý',
            text: 'Con dấu scan giả mạo 100%! Cơ quan pháp luật tuyệt đối không gửi lệnh bắt qua Zalo. Mẹ bước ngay tới quầy đưa máy cho cô giao dịch viên giúp con!',
            fear: -3,
            trust: -4,
            next: 'win'
          },
          {
            tacticLabel: 'Giao thức: Yêu cầu chuyển khoản tiền cọc',
            text: 'Nếu có con dấu thật thì mẹ cứ chuyển trước 50 triệu coi như tiền bảo lãnh tại ngoại.',
            fear: 2,
            trust: 3,
            next: 'lose_transfer'
          }
        ]
      },
      win: {
        locationStatus: 'Bảo vệ và giao dịch viên ngân hàng đã can thiệp, mẹ an toàn 100%',
        lines: [
          {
            who: 'family',
            text: 'Con ơi, cô giao dịch viên với chú bảo vệ đọc tin nhắn của con xong liền giữ mẹ lại phòng riêng, bảo mẹ cúp máy ngay! Cô ấy bảo tuần này có 3 bác lớn tuổi cũng bị bầy lừa đảo dọa y hệt như mẹ. Sổ tiết kiệm 300 triệu của mẹ vẫn nguyên vẹn, mẹ cảm ơn con nhiều lắm!'
          }
        ],
        ending: 'win',
        lesson: 'Kẻ giả danh công an/viện kiểm sát thường ép nạn nhân đeo tai nghe và dặn nói dối nhân viên ngân hàng để ngăn cản sự phát hiện. Hướng dẫn người thân ra hiệu cho giao dịch viên hoặc bảo vệ quầy là cách giải cứu hữu hiệu nhất.'
      },
      lose_panic: {
        locationStatus: 'Mẹ quá hoảng loạn, cúp máy với bạn và làm theo lệnh kẻ gian',
        lines: [
          {
            who: 'family',
            text: 'Con gắt gỏng với mẹ quá làm mẹ rối trí chẳng biết tin ai... Mẹ sợ bị còng tay trước mặt bao nhiêu người nên đã làm theo lời họ rút hết tiền chuyển đi rồi... Giờ họ khóa máy mẹ mới biết bị lừa, mất trắng 300 triệu rồi con ơi!'
          }
        ],
        ending: 'lose',
        lesson: 'Khi người thân đang bị thao túng tâm lý sợ hãi, việc chỉ trích gay gắt sẽ làm nạn nhân rối loạn và đẩy họ vào vòng xoáy nghe lời kẻ gian. Cần bình tĩnh trấn an và hướng dẫn hành động cụ thể tại chỗ.'
      },
      lose_transfer: {
        locationStatus: 'Mẹ đã chuyển tiền vào tài khoản rửa tiền của kẻ lừa đảo',
        lines: [
          {
            who: 'family',
            text: 'Mẹ vừa chuyển tiền xong thì đầu dây bên kia cười phá lên rồi chặn Zalo mẹ luôn... Mất hết tiền dưỡng già rồi con ơi, mẹ biết sống sao đây!'
          }
        ],
        ending: 'lose',
        lesson: 'Tuyệt đối không bao giờ có khái niệm "chuyển tạm tiền thanh tra" hay "tiền bảo lãnh vào tài khoản cá nhân". Một khi đã chuyển tiền thì gần như không thể thu hồi.'
      }
    }
  },
  {
    id: 2,
    title: 'Bố đang ở tiệm vàng & công ty tài chính định thế chấp sổ đỏ vay nóng',
    relative: 'Bố',
    relationship: 'Bố • 62 tuổi',
    crisisContext: 'Bố tham gia "Hội nhóm Đầu tư Vàng Quốc tế Dubai" được hứa hẹn lãi suất 30%/tháng. Bố giấu mẹ mang sổ đỏ căn nhà ra tiệm vàng kiêm tín dụng đen định thế chấp vay nóng 500 triệu để nộp vào sàn!',
    location: 'Tiệm vàng & Văn phòng Cho vay Tư nhân',
    start: 'start',
    nodes: {
      start: {
        locationStatus: 'Bố đang ngồi trong phòng tiếp khách tiệm vàng, tập hồ sơ thế chấp đã mở sẵn trên bàn',
        lines: [
          {
            who: 'family',
            text: 'Con à, bố đang ở chỗ người quen làm thủ tục vay vốn. Thầy trưởng nhóm đầu tư sàn vàng Dubai bảo hôm nay là hạn chót nâng cấp gói VIP lợi nhuận 30%/tháng. Bố thế chấp sổ đỏ vay 500 triệu nộp vào, tháng sau rút lãi mua cho con chiếc ô tô. Họ đang in hợp đồng, bố nhắn để con mừng!'
          },
          {
            who: 'scammer',
            text: 'Bác Ba cứ yên tâm ký hợp đồng vay thế chấp, chuyển tiền vào ví sàn trước 11h30 là tài khoản tự động nhảy lãi suất 30% ngay trong ngày!'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Trì hoãn Pháp lý & Chuyên gia đối soát',
            text: 'Bố ơi chuyện lớn thế này bố dừng bút lại 30 phút! Bố chụp hợp đồng thế chấp gửi con, con nhờ anh bạn thân làm phòng công chứng nhà nước kiểm tra điều khoản lãi suất giúp bố.',
            fear: -2,
            trust: -2,
            next: 'stall_legal'
          },
          {
            tacticLabel: 'Giao thức: Gọi mẹ làm ầm ĩ tại chỗ',
            text: 'Bố điên rồi à? Bố dám mang sổ đỏ nhà đi cắm! Con gọi ngay cho mẹ ra tiệm vàng lôi bố về!',
            fear: 3,
            trust: 2,
            next: 'lose_stubborn'
          },
          {
            tacticLabel: 'Giao thức: Động viên bố vay thêm',
            text: 'Nếu lãi 30%/tháng thật thì bố hỏi vay hẳn 1 tỷ cho bõ công!',
            fear: 1,
            trust: 4,
            next: 'lose_ruined'
          }
        ]
      },
      stall_legal: {
        locationStatus: 'Bố tạm hoãn ký, nhóm tư vấn tiệm vàng bắt đầu hối thúc giục giã',
        lines: [
          {
            who: 'family',
            text: 'Bố bảo họ chờ tí thì mấy cậu chuyên gia này khó chịu, bảo chậm 15 phút là sàn đóng cổng VIP mất cơ hội đổi đời. Bố thấy sốt ruột quá, hay cứ ký tạm?'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Kích hoạt Thử thách Rút thử Vốn',
            text: 'Bố ơi, quy tắc vàng đầu tư tài chính: Bố bảo họ cho bố rút thử 5 triệu tiền lãi từ tài khoản sàn hiện tại về thẻ ngân hàng trước mặt bố xem có về tài khoản không. Không rút được là lừa đảo 100%!',
            fear: -3,
            trust: -4,
            next: 'win'
          },
          {
            tacticLabel: 'Giao thức: Cung cấp Văn bản Cảnh báo Ngân hàng Nhà nước',
            text: 'Ngân hàng Nhà nước Việt Nam nghiêm cấm mọi sàn giao dịch vàng và ngoại hối forex tư nhân. Ai cam kết lãi 30%/tháng đều là mô hình Ponzi lừa đảo lấy tiền người sau trả người trước bố ơi.',
            fear: -2,
            trust: -2,
            next: 'show_proof'
          }
        ]
      },
      show_proof: {
        locationStatus: 'Kẻ gian bắt đầu đưa giấy tờ pháp lý giả mạo để phản bác',
        lines: [
          {
            who: 'scammer',
            text: 'Bác nhìn xem, đây là Giấy chứng nhận Đăng ký Doanh nghiệp Tài chính Đa quốc gia có con dấu chứng nhận của Ủy ban Tài chính Dubai!',
            attachment: {
              type: 'doc',
              badge: 'HỒ SƠ TÀI CHÍNH QUỐC TẾ',
              title: 'Chứng chỉ Quỹ Vàng Hoàng Gia',
              desc: 'Văn bản tiếng Anh in lem nhem, hoàn toàn không có giá trị pháp lý tại Việt Nam.'
            }
          },
          {
            who: 'family',
            text: 'Họ chìa giấy phép quốc tế có mộc vàng đây con, nhìn sang trọng lắm!'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Lệnh can thiệp chốt chặn gia đình',
            text: 'Bố cầm sổ đỏ bước ra khỏi tiệm vàng ngay lập tức! Con đang ở trước cổng với chú công an phường đây rồi, tuyệt đối không ký bất kỳ giấy tờ gì!',
            fear: -4,
            trust: -5,
            next: 'win'
          },
          {
            tacticLabel: 'Giao thức: Bỏ cuộc để bố tự quyết',
            text: 'Tùy bố, sau này mất nhà thì bố đừng trách con không cảnh báo!',
            fear: 2,
            trust: 3,
            next: 'lose_ruined'
          }
        ]
      },
      win: {
        locationStatus: 'Bố đã nhận ra bộ mặt sàn ảo, cất sổ đỏ ra về an toàn',
        lines: [
          {
            who: 'family',
            text: 'Con ơi, bố yêu cầu rút thử 5 triệu thì họ bắt bố phải nộp thêm 50 triệu tiền "phí bảo hiểm luồng tiền" mới cho rút! Đúng y như lời con nói, tiền vào thì dễ tiền ra thì không bao giờ có! Bố cầm sổ đỏ về nhà rồi, hú vía suýt nữa mất cả căn nhà gia đình!'
          }
        ],
        ending: 'win',
        lesson: 'Các sàn đầu tư vàng ảo, forex với cam kết lãi suất phi thực tế (20-30%/tháng) đều là bẫy lừa đảo Ponzi. Luôn thử tính năng rút tiền và kiểm tra giấy phép của Ngân hàng Nhà nước trước mọi giao dịch lớn.'
      },
      lose_stubborn: {
        locationStatus: 'Bố tự ái, khóa máy và ký hợp đồng thế chấp',
        lines: [
          {
            who: 'family',
            text: 'Bố tự ái vì con coi thường bố nên đã ký vay nộp hết tiền vào sàn rồi... Giờ trang web sàn biến mất, tiệm vàng cho người đến xiết nhà đòi 500 triệu cả gốc lẫn lãi... Bố ân hận quá con ơi!'
          }
        ],
        ending: 'lose',
        lesson: 'Với người lớn tuổi, lòng tự trọng rất cao. Tránh dùng từ ngữ xúc phạm hoặc dọa mách người khác, hãy dùng lý lẽ chuyên môn và tình cảm để giải thích.'
      },
      lose_ruined: {
        locationStatus: 'Căn nhà bị thế chấp, sàn vàng ảo sập hoàn toàn',
        lines: [
          {
            who: 'family',
            text: 'Sàn vàng sập rồi, nhóm Zalo bị xóa sạch, nợ nần chồng chất giờ bố mẹ biết dọn đi đâu đây con...'
          }
        ],
        ending: 'lose',
        lesson: 'Lòng tham trước các khoản lợi nhuận siêu thực tế luôn là mồi nhử chết người. Hãy luôn bảo vệ tài sản pháp lý gia đình trước mọi hình thức ủy thác tài chính không chính thống.'
      }
    }
  },
  {
    id: 3,
    title: 'Em gái sinh viên năm nhất bị "bắt cóc online" tại phòng khách sạn',
    relative: 'Em gái',
    relationship: 'Em gái út • 19 tuổi (Sinh viên năm nhất xa nhà)',
    crisisContext: 'Kẻ giả danh công an dọa em gái dính vào vụ án rửa tiền, ép em thuê phòng khách sạn tự nhốt mình, tắt toàn bộ liên lạc người thân và quay video giả bị bắt cóc để tống tiền gia đình 100 triệu!',
    location: 'Phòng khách sạn ngoại thành (Khóa trái cửa một mình)',
    start: 'start',
    nodes: {
      start: {
        locationStatus: 'Em gái đang ngồi khóc trong góc phòng khách sạn, kẻ gian giám sát qua cuộc gọi video kín',
        lines: [
          {
            who: 'family',
            text: 'Anh ơi... cứu em với! Có hai chú công an gọi bảo số tài khoản ngân hàng của em nhận tiền của trùm buôn người. Họ bắt em phải ra thuê phòng khách sạn một mình để "cách ly bảo vệ nhân chứng", cấm không được gọi cho bố mẹ. Họ bảo nếu em không nộp 100 triệu tiền bảo lãnh thì họ tống đạt lệnh truy nã toàn quốc... Em sợ lắm em đang trốn trong phòng khách sạn!'
          },
          {
            who: 'scammer',
            text: 'Sinh viên Trần Mai Anh! Bật camera trước quay toàn bộ căn phòng, đặt điện thoại lên bàn và không được tắt cuộc gọi video!'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Kích hoạt Mật mã An toàn Gia đình',
            text: 'Mai Anh nghe anh nói: Chú cún cưng hồi nhỏ nhà mình tên là gì? Em trả lời đúng anh mới tin đây là em gái anh. Bình tĩnh, anh đang ở ngay bên em đây!',
            fear: -3,
            trust: -3,
            next: 'safeword_pass'
          },
          {
            tacticLabel: 'Giao thức: Quát tháo hoảng loạn',
            text: 'Mày bị điên rồi à? Sao lại dại dột đi thuê khách sạn một mình như thế? Bố mẹ biết thì mày chết đòn!',
            fear: 3,
            trust: 2,
            next: 'lose_panic'
          },
          {
            tacticLabel: 'Giao thức: Bảo em cứ làm theo lời kẻ lạ',
            text: 'Em cứ chuyển hết tiền trong tài khoản cho họ đi rồi xin về nhà.',
            fear: 1,
            trust: 4,
            next: 'lose_kidnap'
          }
        ]
      },
      safeword_pass: {
        locationStatus: 'Em gái đã bình tĩnh lại, nhận ra có anh trai hỗ trợ',
        lines: [
          {
            who: 'family',
            text: 'Chú cún nhà mình tên là Bông Xù... Anh ơi, họ đang dọa là nếu em không tự trói tay và quay video van xin gửi cho họ thì công an sẽ đến bắn vỡ cửa phòng bắt em!'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Tác chiến Hiện trường Lễ tân Khách sạn',
            text: 'Nghe anh dặn từng bước: Em tắt ngay cuộc gọi video của chúng nó! Mở khóa cửa phòng bước thẳng xuống quầy lễ tân tầng 1, đưa điện thoại cho nhân viên khách sạn và nhờ họ gọi Công an phường sở tại đến bảo vệ em ngay!',
            fear: -4,
            trust: -4,
            next: 'win'
          },
          {
            tacticLabel: 'Giao thức: Bảo em tự quay video',
            text: 'Em cứ quay video giả vờ như lời họ xem họ đòi gì tiếp theo.',
            fear: 2,
            trust: 3,
            next: 'lose_kidnap'
          }
        ]
      },
      win: {
        locationStatus: 'Lễ tân và Công an phường đã tiếp cận phòng, em gái an toàn',
        lines: [
          {
            who: 'family',
            text: 'Anh ơi, em làm theo lời anh chạy xuống lễ tân! Các anh công an phường vừa đến khách sạn rồi, các anh ấy bảo đây là thủ đoạn "Bắt cóc ảo" (Virtual Kidnapping) chuyên nhắm vào sinh viên mới lên thành phố. Em an toàn rồi, cảm ơn anh trai của em nhiều lắm!'
          }
        ],
        ending: 'win',
        lesson: 'Chiêu thức "Bắt cóc online" thao túng nạn nhân tự cô lập trong khách sạn, sau đó dùng hình ảnh cắt ghép để tống tiền người nhà. Hãy luôn quy ước "Mật khẩu gia đình" và dặn con em chạy ngay ra nơi đông người (lễ tân, bảo vệ) để nhờ trợ giúp.'
      },
      lose_panic: {
        locationStatus: 'Em gái bị khủng hoảng tâm lý cực độ, cúp máy làm liều',
        lines: [
          {
            who: 'family',
            text: 'Em sợ anh và bố mẹ mắng nên em đã tự quay video khóc lóc gửi cho họ... Chúng nó lấy video đó gửi cho mẹ đòi 100 triệu tiền chuộc làm mẹ ngất xỉu phải đi cấp cứu rồi anh ơi!'
          }
        ],
        ending: 'lose',
        lesson: 'Khi nạn nhân là người trẻ bị đe dọa, sự chì chiết của gia đình sẽ đẩy họ vào bước đường cùng. Luôn mở rộng vòng tay bảo vệ và hướng dẫn thoát hiểm.'
      },
      lose_kidnap: {
        locationStatus: 'Gia đình bị tống tiền 100 triệu đồng trong hoảng loạn',
        lines: [
          {
            who: 'family',
            text: 'Bố mẹ tưởng em bị bắt cóc thật nên đã chuyển 100 triệu cho kẻ gian rồi... Em có lỗi với cả nhà quá!'
          }
        ],
        ending: 'lose',
        lesson: 'Kẻ lừa đảo dùng video tự quay của nạn nhân để dàn cảnh bắt cóc thật. Cần liên lạc trực tiếp hoặc định vị vị trí trước khi nghĩ đến việc chuyển tiền.'
      }
    }
  },
  {
    id: 4,
    title: 'Bà nội chuẩn bị mua gói "Thần dược trị bách bệnh" 60 triệu',
    relative: 'Bà nội',
    relationship: 'Bà nội • 76 tuổi',
    crisisContext: 'Nhóm "Thần y Viện Y học Cổ truyền giả mạo" mang máy đo điện tử giả đến nhà khám bệnh miễn phí, phán bà bị "ung thư tế bào gốc giai đoạn 3" và ép bà mua gói cao đan hoàn tán 60 triệu để chữa dứt điểm!',
    location: 'Phòng khách nhà riêng (Đang có 2 đối tượng mặc áo blouse ngồi thuyết phục)',
    start: 'start',
    nodes: {
      start: {
        locationStatus: 'Hai đối tượng tự xưng giáo sư y khoa đang cầm máy đo pin giả áp vào tay bà',
        lines: [
          {
            who: 'family',
            text: 'Cháu ơi, có hai bác sĩ của Viện Đông y Trung ương về tận nhà đo máy cho bà. Máy của họ kêu tít tít báo bà bị ung thư tế bào gốc sắp di căn rồi cháu ơi! Họ bảo may mà phát hiện sớm, có hộp cao sâm hoàng cung gia truyền 60 triệu uống 1 tháng là khỏi hẳn. Bà định lấy tiền mừng tuổi với dưỡng già đưa họ lấy thuốc ngay đây!'
          },
          {
            who: 'scammer',
            text: 'Cụ cứ tin tưởng y đức của chúng tôi, thuốc này là dược liệu quý hiếm của triều đình, chậm 1 tuần là khối u vỡ không cứu được đâu!'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Đòi Hóa đơn & Bác sĩ Trạm Y tế can thiệp',
            text: 'Bà ơi dừng tay lại! Bà đưa điện thoại cho vị "bác sĩ" đó nghe máy giúp cháu, để cháu hỏi mã chứng chỉ hành nghề và địa chỉ bệnh viện công tác của họ nhé bà.',
            fear: -2,
            trust: -2,
            next: 'confront_fake_doc'
          },
          {
            tacticLabel: 'Giao thức: Chửi bới đuổi người',
            text: 'Toàn bọn lừa đảo đấy bà đuổi cổ chúng nó ra khỏi nhà ngay đi!',
            fear: 2,
            trust: 2,
            next: 'lose_argue'
          },
          {
            tacticLabel: 'Giao thức: Đồng ý mua thuốc cho xong',
            text: 'Nếu bà thấy đau thì cứ mua thử 1 hộp 20 triệu uống xem sao.',
            fear: 1,
            trust: 3,
            next: 'lose_poison'
          }
        ]
      },
      confront_fake_doc: {
        locationStatus: 'Hai đối tượng ấp úng khi nghe bạn đòi kiểm tra chứng chỉ y khoa',
        lines: [
          {
            who: 'family',
            text: 'Bà đưa máy thì họ xua tay bảo không rảnh nói chuyện với trẻ con! Họ đang giục bà vào phòng trong lấy tiền mặt nhanh kẻo họ phải đi khám cho nhà khác...'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Báo Tổ trưởng & Trạm Y tế Phường sang can thiệp',
            text: 'Bà nói với họ: "Tiền cháu tôi giữ trong két sắt, 15 phút nữa nó về mở két đưa tiền". Đồng thời cháu gọi bác Tổ trưởng dân phố và chú công an phường ngay cạnh nhà mình bước sang kiểm tra giấy tờ của họ ngay bây giờ!',
            fear: -4,
            trust: -4,
            next: 'win'
          },
          {
            tacticLabel: 'Giao thức: Để bà tự thỏa thuận giá',
            text: 'Bà thử mặc cả xuống 10 triệu xem họ có bán không.',
            fear: 1,
            trust: 3,
            next: 'lose_poison'
          }
        ]
      },
      win: {
        locationStatus: 'Bác tổ trưởng và công an phường có mặt, nhóm lừa đảo bỏ chạy tháo thân',
        lines: [
          {
            who: 'family',
            text: 'Cháu ơi, bác Tổ trưởng với chú công an vừa sang đến cổng là hai người kia vơ vội túi đồ leo lên xe máy chạy mất dép! Chú công an bảo cái máy đo kia là đồ chơi điện tử mua trên mạng có mấy chục nghìn, còn hộp thuốc toàn bột đậu nành trộn phẩm màu. Bà cảm ơn cháu gái thông minh của bà đã giữ lại tiền dưỡng già!'
          }
        ],
        ending: 'win',
        lesson: 'Nhóm lừa đảo người cao tuổi thường dùng máy móc giả tạo và đe dọa bệnh nan y để bán thực phẩm chức năng giá cắt cổ. Tuyệt đối không mua thuốc từ người lạ đến tận nhà; mọi chẩn đoán bệnh đều phải đến cơ sở y tế chính quy.'
      },
      lose_argue: {
        locationStatus: 'Bà nội không tin lời bạn, giấu tiền mua thuốc',
        lines: [
          {
            who: 'family',
            text: 'Bà thấy cháu nói năng cộc lốc quá nên bà tự lấy tiền mua rồi... Uống vào bà bị ngộ độc tiêu chảy phải đi viện cấp cứu đây này cháu ơi!'
          }
        ],
        ending: 'lose',
        lesson: 'Người già rất dễ tổn thương trước nỗi sợ bệnh tật. Cần phối hợp với các lực lượng uy tín như y tế phường, tổ trưởng dân phố để thuyết phục hiệu quả.'
      },
      lose_poison: {
        locationStatus: 'Bà đã uống phải thuốc giả chứa hóa chất độc hại',
        lines: [
          {
            who: 'family',
            text: 'Bà uống xong thuốc đó thì men gan tăng vọt, bác sĩ bảo thuốc có chứa kim loại nặng và corticoid độc hại... Mất 60 triệu mà bệnh còn nặng thêm!'
          }
        ],
        ending: 'lose',
        lesson: 'Thuốc giả không rõ nguồn gốc vô cùng nguy hiểm cho tính mạng người già. Không bao giờ thỏa hiệp mua thử thuốc không có kiểm định của Bộ Y tế.'
      }
    }
  },
  {
    id: 5,
    title: 'Anh trai chuẩn bị chuyển cọc 120 triệu xuất khẩu lao động "chui"',
    relative: 'Anh trai',
    relationship: 'Anh trai • 27 tuổi',
    crisisContext: 'Anh trai đang ngồi tại quán cà phê gần sân bay với đường dây "cò mồi" hứa hẹn visa lao động VIP sang Hàn Quốc lương 80 triệu/tháng, không cần thi tiếng, bắt chuyển cọc 120 triệu tiền mặt để bay ngay tuần sau!',
    location: 'Quán cà phê gần Cảng hàng không (Đang chuẩn bị rút cọc chuyển khoản)',
    start: 'start',
    nodes: {
      start: {
        locationStatus: 'Anh trai đang ngồi cùng 2 người tự xưng là giám đốc phái cử lao động',
        lines: [
          {
            who: 'family',
            text: 'Em ơi, anh đang ngồi cà phê với hai anh bên Công ty Phái cử Quốc tế Sao Mai. Họ có suất ngoại giao đi làm nông nghiệp công nghệ cao bên Hàn Quốc lương 85 triệu/tháng, cam kết bao đỗ visa 100% không cần học tiếng. Họ bảo anh chuyển cọc 120 triệu tiền vé máy bay và hồ sơ ngay bây giờ để tuần sau xếp lịch bay luôn!'
          },
          {
            who: 'scammer',
            text: 'Em trai anh muốn đi thì ký hợp đồng cọc nhanh lên, bao nhiêu người đang xếp hàng xin suất này đấy!'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Tra cứu Mã số Doanh nghiệp Dolab Quốc gia',
            text: 'Anh dừng tay lại! Anh bảo họ cho xem Giấy phép Hoạt động Dịch vụ Đưa người lao động đi làm việc ở nước ngoài do Bộ LĐ-TB&XH (Dolab) cấp. Em lên cổng dolab.gov.vn tra cứu mã số trong 1 phút!',
            fear: -2,
            trust: -3,
            next: 'check_dolab'
          },
          {
            tacticLabel: 'Giao thức: Giễu cợt năng lực anh trai',
            text: 'Tiếng một chữ bẻ đôi không biết mà đòi lương 85 triệu? Anh mơ mộng hão huyền vừa thôi!',
            fear: 2,
            trust: 2,
            next: 'lose_stubborn'
          },
          {
            tacticLabel: 'Giao thức: Khuyên anh chuyển tiền cọc',
            text: 'Cơ hội tốt thế thì anh cọc trước 60 triệu xem sao.',
            fear: 1,
            trust: 3,
            next: 'lose_trafficking'
          }
        ]
      },
      check_dolab: {
        locationStatus: 'Công ty không có tên trên hệ thống cấp phép của Cục Quản lý Lao động Ngoài nước',
        lines: [
          {
            who: 'family',
            text: 'Em ơi, anh tra tên công ty họ trên trang dolab.gov.vn thì hoàn toàn không có giấy phép! Họ lại bảo đây là chương trình "đi theo diện visa du lịch thương mại rồi trốn ra ngoài làm việc", bên kia có người đón lo hết...'
          }
        ],
        choices: [
          {
            tacticLabel: 'Giao thức: Vạch trần Rủi ro Cư trú Bất hợp pháp & Buôn người',
            text: 'Đây là đường dây đưa người đi chui trái phép! Sang đó bị cảnh sát bắt trục xuất và phạt tù, hoặc bị bán vào các khu lao động cưỡng bức. Anh đứng dậy rời khỏi quán cà phê ngay lập tức!',
            fear: -4,
            trust: -4,
            next: 'win'
          },
          {
            tacticLabel: 'Giao thức: Để anh đánh cược số phận',
            text: 'Đi chui thì hên xui, anh tự chịu trách nhiệm nếu bị bắt nhé.',
            fear: 2,
            trust: 3,
            next: 'lose_trafficking'
          }
        ]
      },
      win: {
        locationStatus: 'Anh trai đã rời khỏi quán, thoát khỏi cạm bẫy xuất khẩu lao động chui',
        lines: [
          {
            who: 'family',
            text: 'Cảm ơn em đã cảnh tỉnh anh kịp thời! Anh vừa đọc tin thấy tháng trước có nhóm cũng đóng cọc cho công ty ma này rồi bị bỏ rơi ở sân bay mất trắng tiền. Anh sẽ đăng ký học tiếng đàng hoàng theo chương trình EPS chính phủ cho an toàn!'
          }
        ],
        ending: 'win',
        lesson: 'Mọi hoạt động xuất khẩu lao động hợp pháp đều phải thông qua các doanh nghiệp được Cục Quản lý Lao động Ngoài nước cấp phép. Tuyệt đối không tin các lời hứa "không cần tiếng, lương khủng, đi bằng visa du lịch".'
      },
      lose_stubborn: {
        locationStatus: 'Anh trai tự ái, chuyển tiền và sập bẫy cò mồi',
        lines: [
          {
            who: 'family',
            text: 'Anh tự ái nên đã nộp tiền cọc rồi... Đến sân bay họ cầm tiền trốn mất tăm, gọi điện thì thuê bao... Mất 120 triệu tiền vay mượn rồi em ơi!'
          }
        ],
        ending: 'lose',
        lesson: 'Tránh mỉa mai lòng tự trọng của người thân khi họ khao khát cơ hội đổi đời. Hãy dùng bằng chứng pháp lý và số liệu thực tế từ cổng thông tin chính phủ.'
      },
      lose_trafficking: {
        locationStatus: 'Anh trai bị đưa sang nước ngoài lao động cưỡng bức',
        lines: [
          {
            who: 'family',
            text: 'Họ lừa anh sang làm việc trong một casino lừa đảo ở biên giới, bị giam lỏng thu hộ chiếu... Giờ họ bắt gia đình chuộc 200 triệu mới cho về em ơi!'
          }
        ],
        ending: 'lose',
        lesson: 'Bẫy "việc nhẹ lương cao ở nước ngoài" là nguồn cung cho các đường dây buôn người và lao động cưỡng bức. Luôn tỉnh táo trước mọi lời mời xuất cảnh không chính thống.'
      }
    }
  }
];

let sceneIdx = 0;
let score = 0;
let lives = 3;
let finished = false;
let currentNodeId = 'start';
let fear = 5;
let trust = 5;
let log: ChatLine[] = [];
let history: { title: string; won: boolean; lesson: string }[] = [];
let sessionId = '';

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
  sceneIdx = 0;
  score = 0;
  lives = 3;
  finished = false;
  history = [];
  stats()?.classList.remove('hidden');
  content().innerHTML = renderFamilyIntro();
}

function start(): void {
  sceneIdx = 0;
  score = 0;
  lives = 3;
  finished = false;
  history = [];
  loadScene(0);
}

function loadScene(index: number): void {
  sceneIdx = index;
  const s = SCENES[index];
  currentNodeId = s.start;
  fear = 5;
  trust = 5;
  const node = s.nodes[currentNodeId];
  log = [...node.lines];
  playEmergencyHeartbeat();
  render();
}

function choose(choiceIdx: number): void {
  const s = SCENES[sceneIdx];
  const node = s.nodes[currentNodeId];
  if (!node.choices || !node.choices[choiceIdx]) return;

  const choice = node.choices[choiceIdx];
  playActionBeep();

  log.push({ who: 'me', text: choice.text });
  fear = Math.max(0, Math.min(10, fear + choice.fear));
  trust = Math.max(0, Math.min(10, trust + choice.trust));

  currentNodeId = choice.next;
  const nextNode = s.nodes[currentNodeId];
  if (nextNode) {
    log.push(...nextNode.lines);
    if (nextNode.ending === 'win') {
      score++;
      playTacticalSuccess();
      history.push({ title: s.title, won: true, lesson: nextNode.lesson || '' });
    } else if (nextNode.ending === 'lose') {
      lives--;
      beep('G2', '8n');
      history.push({ title: s.title, won: false, lesson: nextNode.lesson || '' });
    } else if (fear >= 7 || trust >= 7) {
      playEmergencyHeartbeat();
    }
  }

  render();
}

function nextScene(): void {
  if (lives === 0 || sceneIdx === SCENES.length - 1) {
    finish();
  } else {
    loadScene(sceneIdx + 1);
  }
}

function finish(): void {
  if (finished) return;
  finished = true;

  if (lives > 0 && history.length === SCENES.length) {
    document.dispatchEvent(new CustomEvent<FamilyGameResult>('family-completed', {
      detail: { score, maxScore: SCENES.length, livesLeft: lives, sessionId },
    }));
  }

  stats()?.classList.add('hidden');
  content().innerHTML = renderFamilySummary(history, score, lives, SCENES.length);
}

function render(): void {
  const s = SCENES[sceneIdx];
  const node = s.nodes[currentNodeId];

  content().innerHTML = renderFamilyScene({
    title: s.title,
    relative: s.relative,
    relationship: s.relationship,
    intro: s.crisisContext,
    location: s.location,
    locationStatus: node.locationStatus || s.location,
    sceneIdx,
    total: SCENES.length,
    score,
    lives,
    fear,
    trust,
    log,
    choices: node.choices ? node.choices.map(c => ({ text: c.text, tacticLabel: c.tacticLabel })) : [],
    ending: node.ending,
    lesson: node.lesson,
  });

  const chat = content().querySelector('.family-chat');
  if (chat) chat.scrollTop = chat.scrollHeight;
}

document.addEventListener('click', event => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>('[data-family]');
  if (!button || button.disabled) return;

  const action = button.dataset.family;
  switch (action) {
    case 'start':
      start();
      break;
    case 'choose': {
      const idx = Number(button.dataset.choice);
      if (!isNaN(idx)) choose(idx);
      break;
    }
    case 'next':
      nextScene();
      break;
    case 'finish':
      finish();
      break;
  }
});
