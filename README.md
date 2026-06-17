# Ứng dụng quản lý giặt là

Ứng dụng quản lý giặt là hỗ trợ khách hàng đặt lịch giặt, sấy, ủi đồ và hỗ trợ nhân viên quản lý đơn hàng, khách hàng, dịch vụ, khuyến mãi, tài chính, kho vật tư, máy móc và hỗ trợ khách hàng. Dự án được xây dựng theo mô hình full-stack với frontend Next.js và backend FastAPI kết nối PostgreSQL.

## Thành viên nhóm

| STT | Mã sinh viên | Thành viên | Chức vụ | Đóng góp |
| --- | --- | --- | --- | --- |
| 1 | 23010600 | Trịnh Như Nhất | Nhóm trưởng | 25% |
| 2 | 23010499 | Nguyễn Tuấn Huy | Thành viên | 25% |
| 3 | 23010625 | Trần Văn Nhật | Thành viên | 25% |
| 4 | 23017270 | Mầu Danh Chiến | Thành viên | 25% |

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| UI | shadcn/radix-ui, lucide-react, framer-motion, recharts |
| Backend | FastAPI, Uvicorn, Pydantic |
| Database | PostgreSQL, psycopg2 |
| Xác thực | JWT, bcrypt, python-jose |
| Lưu trữ ảnh | Cloudflare R2/S3 compatible storage |

## Chức năng chính

- Trang tổng quan: thống kê doanh thu, đơn hàng, đơn gần đây và tình hình vận hành.
- Xác thực người dùng: đăng ký, đăng nhập, refresh token, quên mật khẩu, cập nhật hồ sơ và ảnh đại diện.
- Quản lý khách hàng: thông tin liên hệ, điểm tích lũy, hạng thành viên, ghi chú đặc biệt.
- Quản lý đơn hàng: tạo đơn, cập nhật trạng thái, lịch sử trạng thái, hóa đơn.
- Quản lý đặt lịch: khách hàng gửi yêu cầu, nhân viên duyệt và chuyển thành đơn hàng.
- Quản lý dịch vụ và bảng giá: tạo, sửa, xóa dịch vụ giặt là.
- Quản lý khuyến mãi: mã ưu đãi, nhận ưu đãi, sử dụng ưu đãi.
- Quản lý tài chính: doanh thu, công nợ, chi phí, hoàn tiền.
- Quản lý kho và thiết bị: vật tư, máy giặt/sấy, lịch sử bảo trì.
- Hỗ trợ khách hàng: ticket, tin nhắn hỗ trợ và websocket chat.
- Báo cáo và thống kê: doanh thu, đơn hàng, tổng quan theo thời gian.

## Cấu trúc thư mục

```text
.
├── backend/
│   ├── app/
│   │   ├── api/              # Router FastAPI
│   │   ├── core/             # Bảo mật và xử lý lỗi
│   │   ├── database/         # Kết nối DB và các file SQL
│   │   ├── dependencies/     # Dependency injection
│   │   ├── repositories/     # Tầng truy vấn dữ liệu
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Xử lý nghiệp vụ
│   │   └── utils/            # Tiện ích phụ trợ
│   ├── requirements.txt
│   └── start.py
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # Component dùng chung
│   │   ├── context/          # Zustand stores
│   │   ├── constants/        # Dữ liệu hằng số
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # API client và helper
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Hàm tiện ích
│   ├── public/               # Ảnh và static assets
│   └── package.json
└── README.md
```

## Yêu cầu môi trường

- Node.js 20 trở lên
- npm
- Python 3.12 trở lên
- PostgreSQL 17 hoặc PostgreSQL tương thích

## Cấu hình biến môi trường

Tạo file `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/postgres

DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSLMODE=prefer
DB_CHANNEL_BINDING=prefer

SECRET_KEY=change_me_access_token_secret
REFRESH_TOKEN_SECRET=change_me_refresh_token_secret
RESET_TOKEN=change_me_reset_token_secret

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

Tạo file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> Lưu ý: Không commit file `.env` chứa mật khẩu database, JWT secret hoặc khóa R2 lên Git.

## Cài đặt và chạy backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python start.py
```

Backend mặc định chạy tại:

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

Khi khởi động, backend sẽ tự động đọc các file SQL trong `backend/app/database` để tạo/cập nhật một số bảng nghiệp vụ như dịch vụ, đơn hàng, khuyến mãi, tài chính, hỗ trợ, memo, kho và máy móc.

Nếu cần import bảng tài khoản mẫu, có thể chạy:

```bash
psql "postgresql://postgres:your_password@localhost:5432/postgres" -f app/database/accounts.sql
```

Tài khoản mẫu trong `accounts.sql`:

| Username | Mật khẩu | Vai trò |
| --- | --- | --- |
| `admin_user1` | `Admin@123` | `admin` |

## Cài đặt và chạy frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend mặc định chạy tại `http://localhost:3000`.

Build production:

```bash
cd frontend
npm run build
npm run start
```

Kiểm tra lint:

```bash
cd frontend
npm run lint
```

## API chính

Backend gắn router với prefix `/api`.

### Auth

- `POST /api/auth/register`: đăng ký tài khoản
- `POST /api/auth/login`: đăng nhập
- `POST /api/auth/refresh`: làm mới access token
- `GET /api/auth/me`: lấy thông tin người dùng hiện tại
- `PUT /api/auth/me`: cập nhật hồ sơ
- `POST /api/auth/upload-avatar`: tải ảnh đại diện lên R2
- `POST /api/auth/forgot-password`: tạo yêu cầu quên mật khẩu
- `POST /api/auth/reset-password`: đặt lại mật khẩu

### Home

- `GET /api/home/dashboard/summary`: tổng hợp dashboard
- `GET /api/home/dashboard/revenue`: thống kê doanh thu
- `GET /api/home/dashboard/overview`: tổng quan vận hành
- `GET /api/home/customers`: danh sách khách hàng
- `GET /api/home/orders`: danh sách đơn hàng
- `GET /api/home/my-orders`: đơn hàng của người dùng hiện tại
- `GET /api/home/services`: danh sách dịch vụ
- `GET /api/home/promotions`: danh sách khuyến mãi
- `GET /api/home/booking-requests`: danh sách yêu cầu đặt lịch
- `GET /api/home/my-bookings`: lịch đặt của người dùng hiện tại
- `GET /api/home/finance-records`: danh sách bản ghi tài chính
- `GET /api/home/support-tickets/full`: ticket hỗ trợ kèm thông tin liên quan
- `WS /api/home/ws/support-chat`: websocket chat hỗ trợ

## Quy trình chạy local để demo

1. Tạo database PostgreSQL local.
2. Cấu hình `backend/.env`.
3. Chạy backend bằng `python start.py`.
4. Nếu database chưa có bảng `accounts`, import `backend/app/database/accounts.sql`.
5. Cấu hình `frontend/.env.local` trỏ đến `http://localhost:8000`.
6. Chạy frontend bằng `npm run dev`.
7. Truy cập `http://localhost:3000` và đăng nhập bằng tài khoản mẫu.

## Ghi chú phát triển

- Frontend dùng App Router của Next.js, các trang quản trị nằm trong `frontend/src/app/home`.
- Các trang người dùng nằm trong `frontend/src/app/user`.
- API base URL được cấu hình tại `frontend/src/lib/config.ts`.
- Kết nối database tập trung tại `backend/app/database/database.py`.
- CORS hiện đang cho phép tất cả origin để tiện phát triển local.
- File `backend/.env.example` có thể dùng làm mẫu cấu hình, nhưng nên cập nhật secret riêng khi chạy thật.

## Tác giả

Nhóm 1 - Học phần KTPM Cour01.
