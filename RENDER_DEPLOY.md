# Hướng dẫn Triển khai On-Lies lên Render & Kết nối MongoDB Atlas

Dự án **On-Lies** đã được tích hợp sẵn Node.js/Express Server phục vụ API lưu điểm, Bảng xếp hạng và kết nối trực tiếp với cơ sở dữ liệu MongoDB bên ngoài (MongoDB Atlas Free M0).

---

## BƯỚC 1: Tạo Database MongoDB miễn phí trên MongoDB Atlas

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) và đăng ký/đăng nhập tài khoản miễn phí.
2. Tạo một Cluster miễn phí:
   - Chọn mục **Deploy a database** -> Chọn gói **M0 Free** (Shared, 512MB miễn phí vĩnh viễn).
   - Chọn nhà cung cấp (AWS hoặc Google Cloud) và khu vực gần nhất (ví dụ: `Singapore` hoặc `Tokyo`).
   - Bấm **Create**.
3. Thiết lập thông tin bảo mật kết nối:
   - **Database User**: Tạo `Username` và `Password` (lưu lại mật khẩu này).
   - **Network Access**: Vào tab **Network Access** -> Chọn **Add IP Address** -> Chọn **Allow Access from Anywhere** (`0.0.0.0/0`) để Render có thể kết nối.
4. Lấy chuỗi kết nối (Connection String):
   - Bấm nút **Connect** ở Database Deployment.
   - Chọn **Drivers** (Node.js).
   - Sao chép chuỗi kết nối URI có dạng:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Thay `<username>` và `<password>` bằng thông tin bạn vừa tạo.
   - Thêm tên database vào URI (ví dụ: `...mongodb.net/onlies_db?...`).

---

## BƯỚC 2: Triển khai ứng dụng lên Render (render.com)

1. Đẩy mã nguồn dự án lên GitHub:
   ```bash
   git add .
   git commit -m "feat: integrate inspector lore into mail game and setup MongoDB backend for Render"
   git push origin main
   ```

2. Đăng nhập vào [Render](https://render.com).
3. Tạo **Web Service** mới:
   - Chọn **New +** -> **Web Service**.
   - Kết nối với Repository GitHub của bạn.
4. Cấu hình thông số trên Render:
   - **Name**: `on-lies-cybersecurity` (hoặc tên tùy thích)
   - **Language**: `Node`
   - **Branch**: `main`
   - **Root Directory**: Để trống (hoặc điền `on-lies`)
   - **Build Command**:
     ```bash
     cd on-lies && npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     cd on-lies && node server/index.js
     ```
   *(Nếu bạn đặt Root Directory là `on-lies` thì Build Command chỉ cần `npm install && npm run build` và Start Command là `node server/index.js`)*.
   - **Instance Type**: Chọn **Free**.

5. Cấu hình biến môi trường (**Environment Variables**):
   - Thêm biến sau trong mục **Environment**:
     - `MONGODB_URI`: Điền chuỗi kết nối MongoDB Atlas ở Bước 1.
     - `DB_NAME`: `onlies_db`
     - `NODE_ENV`: `production`

6. Bấm **Create Web Service**.
   - Render sẽ tự động kéo code từ GitHub, cài đặt gói thư viện, chạy lệnh build Vite frontend và khởi chạy máy chủ Express kết nối tới MongoDB Atlas của bạn.
   - Sau 1 - 2 phút, Render sẽ cung cấp đường dẫn web công khai (ví dụ: `https://on-lies-cybersecurity.onrender.com`).

---

## Kiểm tra sau khi triển khai:

- **API Kiểm tra trạng thái**: Truy cập `https://<ten-app>.onrender.com/api/health`
  - Nếu trả về `{"status":"ok","database":"mongodb",...}` tức là web đã kết nối thành công tới MongoDB Atlas!
- **Dữ liệu được lưu**: Mọi kết quả chơi game, điểm thưởng XP, cấp bậc và hồ sơ tài khoản sẽ được đồng bộ và lưu trữ trực tiếp vào các collection `leaderboard`, `game_records` và `users` trên MongoDB.
