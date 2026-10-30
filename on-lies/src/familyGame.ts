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
    title: 'Mẹ đang đứng ở quầy ngân hàng rút sổ tiết kiệm 300 triệu',
    relative: 'Mẹ',
    relationship: 'Mẹ ruột • 58 tuổi',
    crisisContext: 'Kẻ giả danh Viện kiểm sát gọi dọa bắt giam mẹ suốt 2 tiếng và ép mẹ đeo tai nghe ra ngân hàng rút toàn bộ sổ tiết kiệm 300 triệu chuyển "tài khoản tạm giữ". Mẹ đang lén nhắn tin cho bạn từ quầy!',
    location: 'Quầy giao dịch Ngân hàng (Đang xếp hàng đến lượt)',
    start: 'start',
    nodes: {
      start: {
        locationStatus: 'Mẹ đang xếp hàng trước quầy rút tiền, tai vẫn đeo tai nghe bị đe dọa',
        lines: [
          {
            who: 'family',
            text: 'Con ơi, có cán bộ Viện Kiểm sát đang nghe máy mẹ. Họ bảo mẹ dính vào đường dây buôn ma túy 15 tỷ, bắt mẹ ra rút hết sổ tiết kiệm 300 triệu chuyển vào tài khoản thanh tra. Họ dặn nếu nhân viên ngân hàng hỏi thì bảo rút cho con mua đất, cấm nói vụ án kẻo bị bắt giam ngay tại quầy... Mẹ run bần bật, đến số thứ tự của mẹ rồi con ơi!'
          },
          {
            who: 'scammer',
            text: 'Bà Nguyễn Thị Lan, chú ý camera an ninh! Đến lượt vào quầy thì làm theo đúng kịch bản, tuyệt đối không tháo tai nghe!'
          }
        ],
        choices: [
          {
            tacticLabel: '💚 Trấn an & Câu giờ',
            text: 'Mẹ ơi hít một hơi thật sâu, con đang ở cạnh mẹ đây! Mẹ giả vờ ho hoặc cần đi vệ sinh gấp để lùi lại 5 phút, khoan vào quầy nhé mẹ.',
            fear: -2,
            trust: -2,
            next: 'stall_bank'
          },
          {
            tacticLabel: '⚠️ Chỉ trích gay gắt',
            text: 'Mẹ bị ngốc à? Công an nào làm việc qua điện thoại! Mẹ cúp máy đi, không con mặc kệ mẹ đấy!',
            fear: 2,
            trust: 2,
            next: 'lose_panic'
          },
          {
            tacticLabel: '❌ Xuôi theo kẻ gian',
            text: 'Họ dọa ghê thế thì mẹ cứ rút chuyển trước 50 triệu cho yên chuyện kẻo bị bắt thật.',
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
            tacticLabel: '📞 Can thiệp tại chỗ',
            text: 'Mẹ đừng nói gì trên tai nghe cả! Mẹ đứng dậy bước ngay tới bàn chú bảo vệ và cô giao dịch viên, đưa dòng tin nhắn này của con cho cô ấy đọc: "Tôi đang bị kẻ lạ dọa qua điện thoại ép rút tiền, xin giữ tôi lại!".',
            fear: -3,
            trust: -4,
            next: 'win'
          },
          {
            tacticLabel: '🔍 Bóc mẽ bằng chứng',
            text: 'Mẹ nhìn ra cửa xem có xe cảnh sát nào không? Không hề có! Viện kiểm sát không bao giờ làm việc qua tai nghe điện thoại như vậy đâu mẹ.',
            fear: -1,
            trust: -2,
            next: 'verify_paper'
          },
          {
            tacticLabel: '⚠️ Bắt mẹ tự đôi co',
            text: 'Mẹ hét vào tai nghe bảo là con trai mẹ làm luật sư xem họ dám bắt mẹ không!',
            fear: 1,
            trust: 2,
            next: 'lose_panic'
          }
        ]
      },
      verify_paper: {
        locationStatus: 'Kẻ gian gửi Lệnh bắt giam giả mạo qua Zalo',
        lines: [
          {
            who: 'scammer',
            text: 'Hồ sơ Tống đạt Lệnh Bắt Tạm Giam số 812/VKSTC. Bị can: Nguyễn Thị Lan. Tội danh: Rửa tiền xuyên quốc gia.',
            attachment: {
              type: 'doc',
              badge: 'VĂN BẢN GIẢ MẠO',
              title: 'Lệnh Bắt Giữ & Phong Tỏa Tài Sản',
              desc: 'Con dấu đỏ scan lem nhem, sai thẩm quyền (Viện kiểm sát không phát hành "lệnh bắt qua Zalo").'
            }
          },
          {
            who: 'family',
            text: 'Họ gửi lệnh bắt có con dấu đỏ chót tên mẹ qua Zalo đây con ơi! Nhìn y như thật thế này sao giả được?'
          }
        ],
        choices: [
          {
            tacticLabel: '🛑 Lệnh chốt chặn can thiệp',
            text: 'Con dấu scan giả mạo 100%! Viện kiểm sát chỉ gửi giấy mời qua bưu điện hoặc công an khu vực. Mẹ bước ngay tới quầy đưa máy cho giao dịch viên giúp con!',
            fear: -3,
            trust: -4,
            next: 'win'
          },
          {
            tacticLabel: '❌ Mềm lòng chuyển tiền',
            text: 'Có lệnh bắt thật rồi... thôi mẹ rút chuyển đi rồi mình tính sau.',
            fear: 2,
            trust: 3,
            next: 'lose_transfer'
          }
        ]
      },
      win: {
        locationStatus: 'Ngân hàng và Công an phường đã can thiệp thành công',
        lines: [
          {
            who: 'family',
            text: 'Con ơi! Cô giao dịch viên đọc tin nhắn của con là lập tức bấm còi báo động nội bộ và giật ngay tai nghe cúp máy luôn. Chú bảo vệ giữ mẹ ngồi trong phòng kín, công an phường vừa tới xác nhận 100% đây là nhóm tội phạm giả danh! Suýt chút nữa là mẹ mất trắng 300 triệu tiền dưỡng già của cả đời... Đội ơn con!'
          }
        ],
        ending: 'win',
        lesson: 'Khi người thân bị thao túng qua tai nghe tại ngân hàng: hãy trấn an, câu giờ và hướng dẫn họ đưa tín hiệu trực tiếp cho giao dịch viên ngân hàng hoặc bảo vệ. Nhân viên ngân hàng đã được tập huấn nghiệp vụ ngăn chặn các vụ rút tiền bất thường!'
      },
      lose_panic: {
        locationStatus: 'Người thân hoảng loạn tột độ và làm theo kẻ lừa đảo',
        lines: [
          {
            who: 'family',
            text: 'Con mắng mẹ làm mẹ càng hoảng loạn, không biết bấu víu vào đâu... Mẹ sợ bị đi tù nên mẹ đã làm theo họ rút hết tiền chuyển đi rồi con ơi... Họ hứa 15 phút sau hoàn lại mà giờ chặn số mẹ rồi!'
          }
        ],
        ending: 'lose',
        lesson: 'Quát mắng người thân đang trong cơn hoảng loạn chỉ khiến họ cô lập và đẩy họ về phía kẻ lừa đảo. Hãy dùng sự bình tĩnh và đồng cảm để làm điểm tựa cho họ.'
      },
      lose_transfer: {
        locationStatus: 'Giao dịch hoàn tất — Tiền đã bị tẩu tán qua tài khoản ảo',
        lines: [
          {
            who: 'family',
            text: 'Mẹ vừa ký giấy nộp 300 triệu vào tài khoản thanh tra của họ xong... Giờ mẹ gọi lại thì số điện thoại kia khóa máy rồi con ơi. Mẹ chết mất thôi!'
          }
        ],
        ending: 'lose',
        lesson: 'Tiền đã chuyển vào tài khoản kẻ gian sẽ lập tức bị chia nhỏ và tẩu tán qua hàng chục tài khoản ảo trong 60 giây. Không bao giờ thỏa hiệp chuyển tiền cho số lạ.'
      }
    }
  },
  {
    id: 2,
    title: 'Bố nhận video Deepfake con trai cấp cứu ở Nhật',
    relative: 'Bố',
    relationship: 'Bố • 62 tuổi',
    crisisContext: 'Kẻ gian hack nick Facebook của con trai đang du học Nhật, gọi video 5 giây chiếu mặt khóc lóc cầu cứu xin 50 triệu nộp tiền mổ ruột thừa khẩn cấp.',
    location: 'Tại nhà (Bố đang mở app ngân hàng)',
    start: 'start',
    nodes: {
      start: {
        locationStatus: 'Bố vừa cúp cuộc gọi video Messenger chập chờn và đang mở app ngân hàng',
        lines: [
          {
            who: 'family',
            text: 'Con ơi, thằng Nam bên Nhật vừa gọi video Messenger cho bố! Mặt nó mếu máo trên giường bệnh, nó bảo bị đau ruột thừa sắp vỡ, bệnh viện bên đó đòi cọc 50 triệu mới chịu mổ! Nó gửi số tài khoản này bảo chuyển gấp. Bố đang run tay mở app ngân hàng chuyển đây!'
          },
          {
            who: 'scammer',
            text: 'Bố ơi chuyển gấp vào STK Vietcombank của bạn con: 1029384xxx (Trần Văn Đạt) để bạn nộp viện phí ngay, con đau sắp ngất rồi!'
          }
        ],
        choices: [
          {
            tacticLabel: '🔍 Kiểm tra Video & Câu giờ',
            text: 'Bố dừng tay lại 1 phút! Cuộc gọi video đó chỉ kéo dài 5-7 giây và mặt Nam bị nhòe giật đúng không bố? Kẻ gian đang dùng Deepfake video cắt ghép từ clip cũ của Nam đấy!',
            fear: -1,
            trust: -2,
            next: 'check_deepfake'
          },
          {
            tacticLabel: '📞 Gọi kênh độc lập ngay',
            text: 'Bố khoan bấm chuyển tiền! Để con gọi ngay vào số di động Nhật của Nam hoặc nhắn tin cho bạn cùng phòng của Nam xác minh trong 2 phút!',
            fear: -2,
            trust: -3,
            next: 'verify_third_party'
          },
          {
            tacticLabel: '❌ Chuyển tiền ngay',
            text: 'Thấy mặt em nó khóc thì chắc thật rồi, bố chuyển gấp đi kẻo nguy hiểm tính mạng!',
            fear: 2,
            trust: 3,
            next: 'lose_transfer'
          }
        ]
      },
      check_deepfake: {
        locationStatus: 'Bố nhớ lại chi tiết cuộc gọi video bất thường',
        lines: [
          {
            who: 'family',
            text: 'Đúng rồi con! Cuộc gọi đúng 5 giây, tiếng giật cục kêu "bố cứu con" rồi tắt ngúm, nhắn lại bảo mạng bệnh viện yếu. Nhưng số tài khoản lại là tên một người lạ ở Việt Nam chứ không phải tài khoản Nhật?'
          }
        ],
        choices: [
          {
            tacticLabel: '🔑 Câu hỏi bảo mật gia đình',
            text: 'Đúng dấu hiệu lừa đảo rồi bố! Bố nhắn lại hỏi: "Con cún Miu ở nhà mấy tuổi rồi?". Nếu nó là Nam thật nó sẽ trả lời được ngay. Kẻ hack nick sẽ lúng túng hoặc giục chuyển tiền!',
            fear: -2,
            trust: -3,
            next: 'ask_family_secret'
          },
          {
            tacticLabel: '📞 Kích hoạt kênh liên lạc bạn bè',
            text: 'Bố không cần đôi co với nick đó nữa. Con vừa gọi điện cho Huy bạn cùng phòng của Nam rồi, bố đợi con 30 giây!',
            fear: -2,
            trust: -4,
            next: 'verify_third_party'
          }
        ]
      },
      ask_family_secret: {
        locationStatus: 'Kẻ gian né tránh câu hỏi bí mật gia đình',
        lines: [
          {
            who: 'scammer',
            text: 'Bố hỏi vớ vẩn gì thế! Con đang đau quằn quại sắp chết rồi mà bố còn hỏi con cún nào! Chuyển tiền ngay không con chết cho bố xem!'
          },
          {
            who: 'family',
            text: 'Trời ơi, nhà mình nuôi mèo chứ có nuôi chó bao giờ đâu! Đúng là kẻ lừa đảo mạo danh con trai bố rồi!'
          }
        ],
        choices: [
          {
            tacticLabel: '🛑 Chốt chặn an toàn',
            text: 'Chuẩn luôn bố! Con vừa gọi được cho Nam qua số sim Nhật, Nam đang ngồi ăn cơm ở ký túc xá bình an vô sự. Nick Facebook của Nam vừa bị hack chiều nay. Bố tắt app ngân hàng ngay nhé!',
            fear: -4,
            trust: -5,
            next: 'win'
          }
        ]
      },
      verify_third_party: {
        locationStatus: 'Kết nối thành công với người thật qua kênh độc lập',
        lines: [
          {
            who: 'family',
            text: 'Con liên hệ được với ai bên Nhật chưa? Bố sốt ruột ngồi không yên...'
          }
        ],
        choices: [
          {
            tacticLabel: '🟢 Kết nối video người thật',
            text: 'Con đang gọi video Zalo trực tiếp với Nam đây bố ơi! Nam khỏe mạnh bình thường, đang ngồi học bài. Bố nhìn màn hình nói chuyện với em này!',
            fear: -5,
            trust: -5,
            next: 'win'
          }
        ]
      },
      win: {
        locationStatus: 'Vụ lừa đảo Deepfake đã bị chặn đứng',
        lines: [
          {
            who: 'family',
            text: 'Nhìn thấy thằng Nam cười toe toét trên màn hình bố mới hoàn hồn! Tí nữa thì mất oan 50 triệu tiền tiết kiệm. Chiêu video Deepfake này tinh vi quá, nếu không có con bình tĩnh xác minh thì bố sập bẫy chắc rồi!'
          }
        ],
        ending: 'win',
        lesson: 'Video call ngắn 5-10 giây, hình ảnh mờ giật, tiếng nói rè hoặc chỉ có cử động môi là đặc trưng của Deepfake AI. Khi người thân ở xa gặp nạn, LUÔN gọi kiểm tra qua người thứ ba (bạn bè, trường học, số sim riêng) hoặc đặt câu hỏi bảo mật chỉ gia đình biết.'
      },
      lose_transfer: {
        locationStatus: 'Bố đã chuyển 50 triệu cho kẻ mạo danh',
        lines: [
          {
            who: 'family',
            text: 'Bố chuyển 50 triệu rồi con ơi... Vừa chuyển xong thì Nam gọi về bằng số sim bảo nãy giờ đang học ở thư viện chứ có bệnh viện nào đâu. Bị lừa mất sạch tiền rồi con ơi...'
          }
        ],
        ending: 'lose',
        lesson: 'Lòng thương con bị kẻ gian khai thác triệt để. Tuyệt đối không chuyển tiền vào tài khoản người lạ khi chưa xác minh trực tiếp với người thân.'
      }
    }
  },
  {
    id: 3,
    title: 'Em gái sinh viên tính vay App đen nạp cọc thực tập sinh',
    relative: 'Em gái',
    relationship: 'Em gái • Sinh viên năm nhất',
    crisisContext: 'Em gái vừa "trúng tuyển" làm Thực tập sinh truyền thông lương 25 triệu/tháng, bị bắt cọc 12 triệu giữ chỗ thiết bị. Em giấu gia đình tính chụp CCCD vay app tín dụng đen.',
    location: 'Ký túc xá (Đang chuẩn bị gửi ảnh CCCD vay tiền)',
    start: 'start',
    nodes: {
      start: {
        locationStatus: 'Em gái đang mở app vay tiền online trên điện thoại',
        lines: [
          {
            who: 'family',
            text: 'Anh ơi, em vừa trúng tuyển vị trí Thực tập sinh sáng tạo nội dung của tập đoàn lớn lương 25 triệu/tháng! Nhưng họ yêu cầu chiều nay phải nộp 12 triệu "phí bảo lãnh máy ảnh và máy tính xách tay". Em không có tiền nên tính chụp CCCD vay tạm qua app "Vay Nhanh 24h", mai nhận trợ cấp em trả... Anh thấy được không?'
          },
          {
            who: 'scammer',
            text: 'Chúc mừng ứng viên. Hạn chót hoàn tất phí bảo lãnh máy móc là 16h00. Quá hạn vị trí sẽ chuyển cho ứng viên dự bị.'
          }
        ],
        choices: [
          {
            tacticLabel: '💚 Đồng cảm & Phân tích nhẹ nhàng',
            text: 'Anh mừng vì em chủ động tìm việc tự lập! Nhưng em dừng tay lại 10 phút nhé. Anh xem bản hợp đồng và địa chỉ công ty cùng em trước khi em gửi bất kỳ giấy tờ gì.',
            fear: -2,
            trust: -2,
            next: 'check_law'
          },
          {
            tacticLabel: '⚠️ Quát mắng coi thường',
            text: 'Mày bị ảo tưởng à? Sinh viên năm nhất chưa có kinh nghiệm lấy đâu ra lương 25 triệu! Toàn lừa đảo mà cũng tin!',
            fear: 2,
            trust: 2,
            next: 'lose_ego'
          },
          {
            tacticLabel: '❌ Đồng ý cho vay',
            text: 'Lương cao thế thì vay tạm đi, đi làm 1 tháng là trả hết nợ ấy mà.',
            fear: 0,
            trust: 3,
            next: 'lose_loan'
          }
        ]
      },
      check_law: {
        locationStatus: 'Em gái gửi thông tin công ty và hợp đồng',
        lines: [
          {
            who: 'family',
            text: 'Họ gửi cho em bản hợp đồng có dấu mộc công ty này anh. Nhưng sao họ lại bắt gửi cả ảnh 2 mặt CCCD kèm video quay cận mặt em nữa ạ?'
          }
        ],
        choices: [
          {
            tacticLabel: '🔍 Dẫn chứng Luật Lao Động',
            text: 'Theo Điều 20 Bộ luật Lao động: Doanh nghiệp NGHIÊM CẤM thu tiền của người tìm việc dưới bất kỳ hình thức nào. Công ty chân chính cấp thiết bị làm việc chứ không bao giờ bắt sinh viên đặt cọc tiền!',
            fear: -2,
            trust: -3,
            next: 'verify_company'
          },
          {
            tacticLabel: '⚠️ Cảnh báo bẫy App đen',
            text: 'App "Vay Nhanh" đó là tín dụng đen lãi suất cắt cổ 300%/năm! Em gửi ảnh CCCD là chúng dùng để bôi nhọ tống tiền em và danh bạ cả nhà mình đấy!',
            fear: -1,
            trust: -3,
            next: 'verify_company'
          }
        ]
      },
      verify_company: {
        locationStatus: 'Tra cứu mã số thuế và địa chỉ trụ sở',
        lines: [
          {
            who: 'family',
            text: 'Anh nói em mới để ý... Địa chỉ công ty ghi ở tầng 15 tòa nhà Keangnam, nhưng em tìm trên Google Maps thì tầng đó là công ty khác. Giờ em phải làm sao anh?'
          }
        ],
        choices: [
          {
            tacticLabel: '🛑 Lệnh chốt chặn an toàn',
            text: 'Chặn số kẻ tuyển dụng ngay lập tức và xóa app vay kia đi em. Cuối tuần anh dẫn em đi tham gia ngày hội việc làm chính thức của trường đại học cho an toàn nhé!',
            fear: -4,
            trust: -5,
            next: 'win'
          }
        ]
      },
      win: {
        locationStatus: 'Bảo vệ thành công em gái khỏi bẫy nợ tín dụng đen',
        lines: [
          {
            who: 'family',
            text: 'May mà có anh giải thích rõ ràng không thì em vừa mất 12 triệu tiền cọc, vừa dính vào nợ nần app đen rồi! Em vừa chặn số và xóa tài khoản vay rồi. Cảm ơn anh hai nhiều lắm!'
          }
        ],
        ending: 'win',
        lesson: 'Công việc chân chính không bao giờ yêu cầu ứng viên nộp tiền cọc thiết bị hay đóng phí đào tạo. Khi người trẻ bị dụ dỗ, thái độ chỉ trích chỉ khiến họ giấu diếm; hãy giải thích bằng quy định pháp luật và kiến thức thực tế.'
      },
      lose_ego: {
        locationStatus: 'Em gái tự ái và tự ý vay tiền lén lút',
        lines: [
          {
            who: 'family',
            text: 'Anh lúc nào cũng coi thường em! Em tự làm chủ cuộc đời em! Em vừa nộp hồ sơ vay xong rồi.'
          }
        ],
        ending: 'lose',
        lesson: 'Thái độ trịch thượng và chế giễu khiến người trẻ bị tổn thương lòng tự trọng, dẫn đến hành động bốc đồng để chứng minh bản thân.'
      },
      lose_loan: {
        locationStatus: 'Em gái rơi vào vòng xoáy nợ nần tín dụng đen',
        lines: [
          {
            who: 'family',
            text: 'Anh ơi, em nộp 12 triệu cọc xong thì họ chặn nick em! Còn bên app vay tiền thì liên tục nhắn tin khủng bố dọa ghép ảnh bôi nhọ em lên mạng... Em sợ quá!'
          }
        ],
        ending: 'lose',
        lesson: 'Vay tiền app đen để nộp cọc việc làm là kịch bản "bẫy lừa kép" cực kỳ nguy hiểm, đẩy nạn nhân vào vòng xoáy nợ nần không lối thoát.'
      }
    }
  },
  {
    id: 4,
    title: 'Ông ngoại 80 tuổi bị ép nhận bưu phẩm thuốc 18 triệu',
    relative: 'Ông ngoại',
    relationship: 'Ông ngoại • 82 tuổi',
    crisisContext: 'Nhóm mạo danh "Hội đồng Y khoa Trung ương" gọi điện dọa ông nếu không nhận hộp "Cao hồng sâm hoàng gia" 18 triệu thì sẽ bị kiện ra tòa vì tội hủy hoại danh dự hội đồng. Shipper đang bấm chuông trước cổng!',
    location: 'Tại nhà một mình (Shipper đang đứng ngoài cổng)',
    start: 'start',
    nodes: {
      start: {
        locationStatus: 'Shipper đang bấm chuông cổng liên hồi, ông đang run rẩy ở phòng khách',
        lines: [
          {
            who: 'family',
            text: 'Cháu ơi, có người xưng Giáo sư bên Hội đồng Y học gọi điện bảo ông được tặng hộp thuốc sâm bồi bổ tuổi già. Nhưng họ bảo ông phải thanh toán "phí bảo tồn dược liệu" 18 triệu cho shipper. Họ dọa nếu ông không nhận thì vi phạm hợp đồng y tế và công an sẽ đến lập biên bản tịch thu nhà! Shipper đang bấm chuông ngoài cổng ầm ĩ rồi cháu ơi!'
          },
          {
            who: 'scammer',
            text: 'Người giao hàng đang đứng trước cổng nhà ông. Yêu cầu mở cửa thanh toán 18.000.000đ tiền mặt ngay lập tức, không được từ chối!'
          }
        ],
        choices: [
          {
            tacticLabel: '💚 Khóa chốt cửa & Giữ an toàn',
            text: 'Ông ơi ông bình tĩnh ngồi yên trong phòng, khóa chốt cửa chính lại và TUYỆT ĐỐI KHÔNG mở cửa cho ai vào nhà! Không có ai dám kiện hay tịch thu nhà của ông đâu ạ.',
            fear: -2,
            trust: -2,
            next: 'call_neighborhood'
          },
          {
            tacticLabel: '⚠️ Bảo ông ra cãi nhau',
            text: 'Ông mở cửa ra mắng vào mặt thằng shipper đuổi nó đi!',
            fear: 1,
            trust: 1,
            next: 'lose_danger'
          },
          {
            tacticLabel: '❌ Khuyên ông trả tiền',
            text: 'Họ dọa tịch thu nhà thế thì ông trả tiền lấy gói thuốc cho yên thân ông ạ.',
            fear: 2,
            trust: 3,
            next: 'lose_transfer'
          }
        ]
      },
      call_neighborhood: {
        locationStatus: 'Ông đã chốt cửa, shipper vẫn đập cổng giục',
        lines: [
          {
            who: 'family',
            text: 'Ông khóa chặt cửa sắt rồi cháu. Nhưng ngoài cổng nó cứ đập cửa gọi "Ông Lan ơi ra nhận hàng trả tiền gấp!". Ông ở nhà một mình lo quá cháu ơi!'
          }
        ],
        choices: [
          {
            tacticLabel: '📞 Can thiệp lực lượng địa phương',
            text: 'Cháu vừa gọi điện cho bác Hùng tổ trưởng dân phố và công an khu vực cách nhà mình 100m rồi! Bác Hùng đang đi bộ sang cổng nhà ông ngay bây giờ đây ạ.',
            fear: -4,
            trust: -4,
            next: 'police_arrived'
          },
          {
            tacticLabel: '🔍 Kiểm tra xuất xứ bưu phẩm',
            text: 'Ông bảo shipper đọc rõ tên công ty gửi và số hóa đơn xem có đúng không.',
            fear: 0,
            trust: 1,
            next: 'lose_danger'
          }
        ]
      },
      police_arrived: {
        locationStatus: 'Tổ trưởng dân phố và Công an khu vực có mặt tại cổng',
        lines: [
          {
            who: 'family',
            text: 'Bác Hùng tổ trưởng với chú công an khu vực sang rồi cháu ơi! Chú công an đang kiểm tra giấy tờ của người giao hàng ngoài cổng!'
          }
        ],
        choices: [
          {
            tacticLabel: '🛑 Lệnh chốt chặn an toàn',
            text: 'Quá tốt rồi ông! Chú công an sẽ xử lý bóc mẽ kiện hàng rác này. Ông cứ ngồi uống nước ấm, lát nữa mẹ đi làm về sẽ qua với ông ngay!',
            fear: -5,
            trust: -5,
            next: 'win'
          }
        ]
      },
      win: {
        locationStatus: 'Chiêu trò ép mua thuốc dỏm bị lật tẩy tại hiện trường',
        lines: [
          {
            who: 'family',
            text: 'Chú công an kiểm tra thì ra gói hàng là hộp trà thảo mộc trôi nổi trị giá chưa tới 50 nghìn mà chúng dám kê lên 18 triệu để ép người già mua! Chú công an đã lập biên bản tạm giữ shipper để điều tra đường dây lừa đảo. Cảm ơn cháu ngoan đã nhanh trí báo công an!'
          }
        ],
        ending: 'win',
        lesson: 'Chiêu lừa "ép nhận bưu phẩm quà tặng kèm đe dọa pháp lý" chuyên nhắm vào người già ở nhà một mình. Nguyên tắc vàng: Tuyệt đối không mở cửa cho người lạ, không giao tiền mặt và lập tức báo tổ dân phố / công an khu vực hỗ trợ.'
      },
      lose_danger: {
        locationStatus: 'Tình huống nguy hiểm khi đối đầu trực tiếp',
        lines: [
          {
            who: 'family',
            text: 'Ông mở cửa ra thì người giao hàng xông vào nhà lớn tiếng ép ông ký nhận, dọa gọi thêm người đến quậy... Ông hoảng quá phải móc hết tiền lương hưu đưa cho họ rồi cháu ơi!'
          }
        ],
        ending: 'lose',
        lesson: 'Không để người lớn tuổi mở cửa đối đầu trực tiếp với kẻ lạ khi ở nhà một mình. An toàn thể chất luôn là ưu tiên số một.'
      },
      lose_transfer: {
        locationStatus: 'Mất trắng tiền dưỡng già cho bọc thuốc vô giá trị',
        lines: [
          {
            who: 'family',
            text: 'Ông đưa 18 triệu tiền mặt cho họ rồi... Mở hộp thuốc ra thì toàn rễ cây ẩm mốc không có nhãn mác gì cả cháu ơi. Ông mất sạch tiền thuốc thang tháng này rồi...'
          }
        ],
        ending: 'lose',
        lesson: 'Kẻ lừa đảo thường tạo ra những lời đe dọa vô lý ("tịch thu nhà vì hủy đơn") để dọa người già thiếu hiểu biết pháp luật.'
      }
    }
  },
  {
    id: 5,
    title: 'Chị dâu bị hack Facebook mượn tiền cả họ tộc',
    relative: 'Chị dâu',
    relationship: 'Chị dâu • 32 tuổi',
    crisisContext: 'Kẻ gian hack nick Facebook của chị dâu, gửi tin nhắn mượn tiền hàng loạt cô chú, bác họ trong gia đình. Bác trưởng họ đang chuẩn bị ra cây ATM chuyển 20 triệu!',
    location: 'Nhóm gia đình (Nhiều người thân đang chuẩn bị chuyển khoản)',
    start: 'start',
    nodes: {
      start: {
        locationStatus: 'Hacker đang dùng nick chị dâu nhắn tin mượn tiền trong nhóm họ hàng',
        lines: [
          {
            who: 'family',
            text: 'Em ơi nguy cấp quá! Facebook của chị vừa bị kẻ gian đổi mật khẩu chiếm quyền lúc nãy. Giờ nó đang nhắn tin mượn tiền khắp mọi người trong họ. Bác Bảy với chú Năm vừa gọi điện bảo đang mở app ngân hàng chuyển 20 triệu cho chị mượn tiền hàng... Chị hoảng quá, làm sao bây giờ em?'
          },
          {
            who: 'scammer',
            text: 'Nhắn cho Bác Bảy: "Bác chuyển tạm vào số tài khoản đối tác này giúp cháu nhé: Techcombank 1903829xxx (Trần Thị Mai) - chiều cháu về trả bác ngay."'
          }
        ],
        choices: [
          {
            tacticLabel: '📢 Phát chuông báo động gia tộc',
            text: 'Chị gọi điện thoại thẳng vào số di động của Bác Bảy và Chú Năm ngay lập tức: "DỪNG LẠI, KHÔNG CHUYỂN TIỀN!". Đồng thời em sẽ đăng cảnh báo lên nhóm Zalo đại gia đình!',
            fear: -2,
            trust: -3,
            next: 'alert_family'
          },
          {
            tacticLabel: '⚠️ Loay hoay tìm cách lấy lại nick',
            text: 'Chị cứ ngồi bấm lấy lại mật khẩu Facebook đi đã, việc mượn tiền tính sau.',
            fear: 1,
            trust: 2,
            next: 'lose_slow'
          },
          {
            tacticLabel: '❌ Chấp nhận đền tiền',
            text: 'Thôi ai lỡ chuyển rồi thì sau này chị đi làm kiếm tiền trả nợ cho các bác.',
            fear: 2,
            trust: 3,
            next: 'lose_debt'
          }
        ]
      },
      alert_family: {
        locationStatus: 'Đã chặn kịp cuộc gọi của Bác Bảy trước cây ATM',
        lines: [
          {
            who: 'family',
            text: 'May quá em ơi! Chị vừa gọi cho Bác Bảy kịp lúc bác ấy vừa bấm số tài khoản ở cây ATM, bác ấy hủy giao dịch kịp rồi! Nhưng còn tài khoản Facebook của chị thì làm sao lấy lại được?'
          }
        ],
        choices: [
          {
            tacticLabel: '🔐 Khôi phục & Kích hoạt 2FA',
            text: 'Chị vào email gốc bấm "Đây không phải tôi", đổi mật khẩu mới và kích hoạt ngay tính năng Xác thực 2 yếu tố (2FA qua Google Authenticator), rồi bấm Đăng xuất khỏi mọi thiết bị!',
            fear: -4,
            trust: -4,
            next: 'win'
          },
          {
            tacticLabel: '⚠️ Nhờ dịch vụ mạng',
            text: 'Chị lên mạng tìm mấy bên nhận "kéo nick Facebook về giá 2 triệu" đi.',
            fear: 0,
            trust: 2,
            next: 'lose_service'
          }
        ]
      },
      win: {
        locationStatus: 'Tài khoản được bảo vệ, cả gia đình an toàn 0 đồng thiệt hại',
        lines: [
          {
            who: 'family',
            text: 'Chị đã lấy lại được quyền kiểm soát Facebook và bật bảo mật 2 lớp rồi! Cả dòng họ đều đã đọc được cảnh báo trên Zalo nên không một ai bị mất tiền cả. Cảm ơn em nhiều, đúng là người am hiểu công nghệ cứu nguy cả nhà!'
          }
        ],
        ending: 'win',
        lesson: 'Khi tài khoản mạng xã hội bị hack: HÀNH ĐỘNG ĐẦU TIÊN là gọi điện thoại trực tiếp cảnh báo người thân chặn dòng tiền, sau đó mới khôi phục tài khoản chính thống qua email và bật xác thực 2 lớp (2FA).'
      },
      lose_slow: {
        locationStatus: 'Hành động chậm trễ khiến người thân lớn tuổi sập bẫy',
        lines: [
          {
            who: 'family',
            text: 'Trong lúc chị loay hoay bấm quên mật khẩu thì Bác Bảy với Chú Năm đã chuyển tổng cộng 40 triệu vào tài khoản kẻ gian rồi... Giờ chị phải gánh món nợ này rồi em ơi!'
          }
        ],
        ending: 'lose',
        lesson: 'Kẻ gian thường tranh thủ 15-30 phút đầu tiên sau khi hack nick để mượn tiền tốc hành. Phải ưu tiên chặn đứng việc chuyển tiền trước khi lo lấy lại tài khoản.'
      },
      lose_debt: {
        locationStatus: 'Gánh chịu thiệt hại không đáng có',
        lines: [
          {
            who: 'family',
            text: 'Các bác chuyển tiền mất hết rồi... Cả họ trách móc chị không biết giữ tài khoản, chị đau lòng quá!'
          }
        ],
        ending: 'lose',
        lesson: 'Thiếu hành động ngăn chặn khẩn cấp sẽ để lại thiệt hại kinh tế và rạn nứt tình cảm gia đình.'
      },
      lose_service: {
        locationStatus: 'Bị lừa thêm lần 2 bởi "dịch vụ lấy lại nick"',
        lines: [
          {
            who: 'family',
            text: 'Chị chuyển 2 triệu cho bên nhận lấy lại nick thì họ chặn luôn nick chị... Giờ vừa mất Facebook vừa mất thêm 2 triệu nữa em ơi!'
          }
        ],
        ending: 'lose',
        lesson: 'Các dịch vụ "lấy lại nick Facebook" trên mạng đa phần là bẫy lừa đảo tiếp theo (bẫy lừa kép) nhằm vét thêm tiền của nạn nhân.'
      }
    }
  }
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
    title: scene.title,
    relative: scene.relative,
    relationship: scene.relationship,
    intro: scene.crisisContext,
    location: scene.location,
    locationStatus: node.locationStatus || scene.location,
    sceneIdx,
    total: SCENES.length,
    score,
    lives,
    fear,
    trust,
    log,
    choices: node.choices ?? [],
    ending: node.ending,
    lesson: node.lesson,
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

  const forceLose = trust >= 10 && !scene.nodes[choice.next].ending;
  enterNode(forceLose ? 'lose_transfer' : choice.next);

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
