# E-Commerce API & Shop Front-end

Hệ thống E-Commerce API kết hợp giao diện cửa hàng trực tuyến với đầy đủ tính năng quản lý sản phẩm, người dùng, đơn hàng và giỏ hàng.

## Tính năng

### Back-end API
- **Quản lý người dùng:** Đăng ký, đăng nhập, quản lý hồ sơ người dùng
- **Quản lý sản phẩm:** Thêm, sửa, xóa, tìm kiếm sản phẩm và danh mục
- **Quản lý đơn hàng:** Tạo đơn hàng, cập nhật trạng thái, xem lịch sử đơn hàng
- **Quản lý thuộc tính:** Thêm, sửa, xóa thuộc tính sản phẩm (màu sắc, kích thước, ...)
- **Quản lý nhà cung cấp:** Thêm, sửa, xóa nhà cung cấp sản phẩm
- **Hệ thống giảm giá:** Mã giảm giá, khuyến mãi theo sản phẩm/danh mục
- **Quản lý giỏ hàng:** Thêm, xóa sản phẩm trong giỏ hàng

### Front-end Shop
- **Giao diện người dùng đầy đủ chức năng:** Hiển thị sản phẩm, danh mục, giỏ hàng
- **Hệ thống đăng nhập/đăng ký:** Đăng nhập, đăng ký, quản lý tài khoản
- **Giỏ hàng & Thanh toán:** Quản lý giỏ hàng, quy trình thanh toán
- **Trang quản trị viên:** Quản lý sản phẩm, đơn hàng, người dùng

## Yêu cầu hệ thống

### Yêu cầu phần cứng
- **CPU:** 2 lõi trở lên
- **RAM:** 2GB trở lên
- **Dung lượng ổ đĩa:** 1GB trở lên cho mã nguồn và cơ sở dữ liệu

### Yêu cầu phần mềm
- **Node.js:** v14.0.0 trở lên
- **MongoDB:** v4.4 trở lên
- **npm hoặc yarn:** Công cụ quản lý gói
- **Trình duyệt Web hiện đại:** Chrome, Firefox, Safari, Edge

## Cài đặt

### 1. Cài đặt MongoDB

#### Windows
1. Tải MongoDB Community Server từ [trang chính thức](https://www.mongodb.com/try/download/community)
2. Cài đặt theo hướng dẫn
3. Đảm bảo dịch vụ MongoDB đang chạy

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu)
```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
```

### 2. Cài đặt Node.js và npm
Tải và cài đặt Node.js từ [trang chính thức](https://nodejs.org/) (Bao gồm npm)

### 3. Cài đặt ứng dụng
```bash
# Clone repository
git clone <repository_url> ecommerce-api
cd ecommerce-api

# Cài đặt dependencies
npm install

# Tạo file .env (từ mẫu .env.example)
cp .env.example .env
# Sau đó cấu hình biến môi trường trong file .env
```

### 4. Cấu hình file .env
Điền thông tin vào file .env với các giá trị sau:
```
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE=mongodb://localhost:27017/ecommerce
DATABASE_PASSWORD=

# JWT
JWT_SECRET=your-super-secure-secret-key-for-jwt
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email (tùy chọn, nếu sử dụng tính năng gửi email)
EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_FROM=
```

## Chạy ứng dụng

### Chạy ở chế độ phát triển
```bash
npm run dev
```

### Chạy ở chế độ sản xuất
```bash
npm run start
```

Ứng dụng sẽ chạy ở địa chỉ `http://localhost:5000` (mặc định)

## Cấu trúc dự án
```
ecommerce-api/
├── src/                   # Mã nguồn chính
│   ├── config/            # Cấu hình ứng dụng
│   ├── controllers/       # Xử lý logic nghiệp vụ
│   ├── middleware/        # Middleware
│   ├── models/            # Các model MongoDB
│   ├── public/            # Tệp tin tĩnh, giao diện shop
│   │   ├── css/           # CSS files
│   │   ├── js/            # JavaScript files
│   │   ├── shop/          # Giao diện cửa hàng
│   │   └── postman/       # Bộ sưu tập Postman API
│   ├── routes/            # Định nghĩa route
│   └── utils/             # Tiện ích
├── .env                   # Biến môi trường
└── server.js              # Điểm khởi đầu ứng dụng
```

## API Endpoints

### Xác thực
- `POST /api/users/signup` - Đăng ký
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/logout` - Đăng xuất
- `POST /api/users/forgotPassword` - Quên mật khẩu

### Người dùng
- `GET /api/users/` - Lấy danh sách người dùng (Admin)
- `GET /api/users/me` - Lấy thông tin người dùng hiện tại
- `PATCH /api/users/updateMe` - Cập nhật thông tin người dùng
- `DELETE /api/users/deleteMe` - Vô hiệu hóa tài khoản

### Sản phẩm
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy thông tin chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (Admin)
- `PATCH /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Danh mục
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/:id` - Lấy thông tin chi tiết danh mục
- `POST /api/categories` - Tạo danh mục mới (Admin)
- `PATCH /api/categories/:id` - Cập nhật danh mục (Admin)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin)

### Đơn hàng
- `GET /api/orders` - Lấy danh sách đơn hàng (Admin)
- `GET /api/orders/my` - Lấy đơn hàng của người dùng hiện tại
- `GET /api/orders/:id` - Lấy thông tin chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái đơn hàng (Admin)
- `POST /api/orders/:id/notes` - Thêm ghi chú đơn hàng
- `GET /api/orders/:id/invoice` - Tạo hóa đơn
- `POST /api/orders/:id/refund` - Hoàn tiền đơn hàng (Admin)

### Thuộc tính
- `GET /api/attributes` - Lấy danh sách thuộc tính
- `GET /api/attributes/:id` - Lấy thông tin chi tiết thuộc tính
- `GET /api/attributes/:id/values` - Lấy giá trị của thuộc tính
- `POST /api/attributes` - Tạo thuộc tính mới (Admin)
- `PUT /api/attributes/:id` - Cập nhật thuộc tính (Admin)
- `DELETE /api/attributes/:id` - Xóa thuộc tính (Admin)
- `POST /api/attributes/:id/values` - Thêm giá trị cho thuộc tính (Admin)
- `DELETE /api/attributes/:id/values/:valueId` - Xóa giá trị thuộc tính (Admin)

### Nhà cung cấp
- `GET /api/suppliers` - Lấy danh sách nhà cung cấp
- `GET /api/suppliers/active` - Lấy danh sách nhà cung cấp đang hoạt động
- `GET /api/suppliers/:id` - Lấy thông tin chi tiết nhà cung cấp
- `GET /api/suppliers/:id/products` - Lấy sản phẩm từ nhà cung cấp
- `POST /api/suppliers` - Tạo nhà cung cấp mới (Admin)
- `PUT /api/suppliers/:id` - Cập nhật nhà cung cấp (Admin)
- `DELETE /api/suppliers/:id` - Xóa nhà cung cấp (Admin)

## Sử dụng giao diện Shop

### Truy cập trang chủ
Mở trình duyệt và truy cập địa chỉ `http://localhost:5000`

### Đăng ký và đăng nhập
1. Nhấp vào nút "Đăng ký" để tạo tài khoản mới
2. Điền đầy đủ thông tin yêu cầu và gửi form
3. Sau khi đăng ký thành công, bạn có thể đăng nhập bằng email và mật khẩu

### Mua sắm
1. Duyệt qua các danh mục và sản phẩm
2. Nhấp vào sản phẩm để xem chi tiết
3. Thêm sản phẩm vào giỏ hàng
4. Nhấp vào biểu tượng giỏ hàng để tiến hành thanh toán

### Quản lý tài khoản
1. Đăng nhập vào tài khoản
2. Nhấp vào tên người dùng ở góc trên bên phải
3. Chọn "Hồ sơ" để quản lý thông tin cá nhân
4. Chọn "Đơn hàng" để xem lịch sử đơn hàng

## Sử dụng bộ sưu tập Postman

1. Tải và cài đặt [Postman](https://www.postman.com/downloads/)
2. Import các bộ sưu tập từ thư mục `src/public/postman`
3. Tạo môi trường mới với biến `base_url` = `http://localhost:5000`
4. Sử dụng các API endpoint trong bộ sưu tập

## Xử lý lỗi thường gặp

### Không kết nối được với MongoDB
- Kiểm tra dịch vụ MongoDB đã chạy chưa
- Kiểm tra URL kết nối trong file .env
- Đảm bảo cổng MongoDB (27017) không bị chặn bởi tường lửa

### API trả về lỗi 401 Unauthorized
- Đảm bảo bạn đã đăng nhập và có token hợp lệ
- Token hết hạn, hãy đăng nhập lại
- Bạn không có quyền truy cập tài nguyên này

### Không cập nhật được giao diện sau khi đăng nhập
- Kiểm tra console để xem lỗi JavaScript
- Đảm bảo token và thông tin người dùng được lưu đúng trong localStorage
- Kiểm tra response từ API đăng nhập có đúng định dạng không

## Hỗ trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub hoặc liên hệ với chúng tôi qua email support@example.com

## Giấy phép

[MIT License](LICENSE)
