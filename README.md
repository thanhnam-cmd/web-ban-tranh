# Mộc Họa – Website bán tranh nghệ thuật

Website bán tranh hiện đại, hiệu ứng cuộn kiểu điện ảnh (GSAP + ScrollTrigger + Lenis), đặt hàng nhanh, kèm **trang quản trị** để thay banner, sửa nội dung và quản lý sản phẩm, đơn hàng.

## Tính năng

**Trang khách hàng**
- Hero nhiều slide (Ken Burns), cuộn xuống thì ảnh co lại thành “màn chiếu”
- Dải chữ chạy phản ứng theo tốc độ cuộn, câu giới thiệu sáng dần theo từng chữ
- Bộ sưu tập nổi bật **cuộn ngang khi ghim màn hình**, lưới tất cả tác phẩm có lọc danh mục
- Thẻ “Gợi ý không gian” xếp chồng, quy trình với ảnh lộ dần, nền đổi sáng/tối theo phân cảnh
- Xem chi tiết sản phẩm, phóng to ảnh, chọn kích thước, giỏ tranh
- Form đặt hàng 1 bước, đồng hồ đếm ngược ưu đãi, nút Gọi / Zalo nổi, thanh đặt hàng trên mobile

**Trang quản trị** – `/admin`
- Đơn hàng: lọc theo trạng thái, tìm kiếm, đổi trạng thái, ghi chú, xuất CSV (mở bằng Excel), thông báo đơn mới
- Sản phẩm: thêm / sửa / xoá / nhân bản, nhiều ảnh (tự nén), nhiều kích thước & giá khuyến mãi, ẩn/hiện, nổi bật, sắp xếp
- Banner & thông báo, ưu đãi đếm ngược
- Toàn bộ nội dung từng khu vực trên trang
- Cài đặt thương hiệu, liên hệ, màu chủ đạo, SEO, sao lưu / khôi phục

## Chạy trên máy

```bash
npm install
npm start
```

Mở http://localhost:3000, trang quản trị ở http://localhost:3000/admin. Khi chưa đặt `ADMIN_PASSWORD`, mật khẩu mặc định là `admin123` (chỉ dùng trên máy).

## Biến môi trường

| Biến | Ý nghĩa |
|---|---|
| `ADMIN_PASSWORD` | Mật khẩu vào trang quản trị (**bắt buộc khi deploy**) |
| `MONGODB_URI` | Chuỗi kết nối MongoDB. Có biến này thì dữ liệu và ảnh lưu vào MongoDB, không bị mất |
| `SESSION_SECRET` | Chuỗi bí mật ký phiên đăng nhập (Render tự tạo) |
| `DATA_DIR` | Thư mục lưu file khi không dùng MongoDB (mặc định `./data`) |

> ⚠️ Gói Free của Render **không có ổ đĩa bền vững**: nếu không cấu hình `MONGODB_URI`, mọi sửa đổi, đơn hàng và ảnh tải lên sẽ mất khi Render khởi động lại hoặc deploy lại. Hãy dùng MongoDB Atlas (miễn phí).

## Deploy

### 1. Đưa code lên GitHub
Tạo repository trống trên https://github.com/new (không tích README), rồi chạy:

```bash
git remote add origin https://github.com/<tai-khoan>/<ten-repo>.git
git push -u origin main
```

### 2. Tạo MongoDB miễn phí (khuyên dùng)
1. Đăng ký https://www.mongodb.com/cloud/atlas → tạo cluster **M0 Free**.
2. *Database Access*: tạo user + mật khẩu.
3. *Network Access*: thêm `0.0.0.0/0` (cho phép Render kết nối).
4. *Connect → Drivers*: sao chép chuỗi `mongodb+srv://...`.

### 3. Deploy lên Render
1. Vào https://dashboard.render.com → **New → Blueprint** → chọn repo GitHub vừa tạo (Render đọc file `render.yaml`).
2. Nhập `ADMIN_PASSWORD` và `MONGODB_URI` khi được hỏi → **Apply**.
3. Vài phút sau website chạy ở `https://<ten-dich-vu>.onrender.com`, quản trị ở `/admin`.

Mỗi lần `git push` lên nhánh `main`, Render tự deploy lại.

## Cấu trúc

```
server.js            Máy chủ Express + API
lib/store.js         Lưu trữ (MongoDB hoặc file JSON)
lib/defaults.js      Nội dung & sản phẩm mặc định
views/index.html     Khung trang chủ
public/js/app.js     Giao diện + hiệu ứng
public/css/style.css Giao diện
public/admin/        Trang quản trị
public/samples/      Tranh mẫu (SVG) – thay bằng ảnh thật trong quản trị
scripts/gen-samples.js  Tạo lại tranh mẫu: npm run samples
```
