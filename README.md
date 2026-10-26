# On-lies

Trò chơi huấn luyện nhận diện lừa đảo với 4 chế độ: Thanh tra Hộp thư, Cuộc gọi khẩn, Lá chắn SMS và Cứu người thân.

## Chạy local

```powershell
cd on-lies
npm install
npm run dev
```

Mở địa chỉ Vite in trong terminal. Game có thể chơi và lưu tiến độ trên thiết bị mà không cần đăng nhập.

## Kiểm tra

Chạy trong thư mục `on-lies`:

```powershell
npm test
npm run build
```

Build bao gồm kiểm tra TypeScript. Các test dùng dữ liệu và bộ lưu điểm mô phỏng, không ghi lên Supabase thật.

## Kết nối Supabase

Sao chép `on-lies/.env.example` thành `on-lies/.env`, điền URL dự án và anon/publishable key của bạn, rồi khởi động lại Vite. Khi chưa cấu hình, đăng nhập/đăng ký trực tuyến sẽ thông báo chưa khả dụng; game vẫn chơi được trên máy.

Không đặt mật khẩu database hoặc service-role key vào biến `VITE_*`. Nếu mật khẩu thật từng nằm trong file mẫu đã chia sẻ, cần đổi/thu hồi trong tài khoản Supabase; sửa file không thu hồi giá trị cũ.

Bản hiện tại vẫn dùng các bảng/view Supabase đã có (`profiles`, `game_records`, `leaderboard_view`). Các sửa lỗi local không thay schema hoặc chính sách RLS trên cloud. Cơ chế chống nộp lặp hiện bảo vệ trong phiên ứng dụng; bảng xếp hạng cạnh tranh cần chấm điểm và chống trùng phía server trước khi phát hành. Không tự chạy SQL mẫu đè lên database đang dùng.

`RENDER_DEPLOY.md` còn mô tả kiến trúc MongoDB cũ. Server hiện phục vụ bản build tĩnh; `/api/health` xác nhận server đang chạy, không kiểm tra kết nối database.
