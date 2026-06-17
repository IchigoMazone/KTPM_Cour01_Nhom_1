# Hệ thống quản lý giặt là

Ứng dụng quản lý giặt là gồm 2 phần:

- `frontend`: giao diện Next.js cho admin và khách hàng
- `backend`: API FastAPI xử lý xác thực, đơn hàng, khách hàng, hỗ trợ chat, kho, tài chính, khuyến mãi

Hệ thống hiện được triển khai theo mô hình:

- `Frontend`: Vercel
- `Backend`: Render
- `Storage`: Cloudflare R2
- `Database`: PostgreSQL trên Neon

## Kiến trúc triển khai

```text
Người dùng
   |
   v
Frontend (Next.js / Vercel)
   |
   v
Backend API (FastAPI / Render)
   |--------------------> Cloudflare R2 (avatar, ảnh chat, file đính kèm)
   |
   `--------------------> Neon PostgreSQL (dữ liệu nghiệp vụ)
```

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| UI | Radix UI, lucide-react, framer-motion, recharts |
| State | Zustand |
| Backend | FastAPI, Uvicorn, Pydantic |
| Database | PostgreSQL |
| Kết nối DB | psycopg2-binary |
| Auth | JWT, bcrypt, python-jose |
| Upload file | boto3 với Cloudflare R2 |
| Realtime | WebSocket |

## Chức năng chính

- Đăng ký, đăng nhập, làm mới token, cập nhật hồ sơ
- Quản lý khách hàng và điểm thành viên
- Quản lý dịch vụ giặt/sấy/ủi
- Tạo và xử lý đơn hàng
- Gửi yêu cầu đặt lịch từ phía khách hàng
- Quản lý mã giảm giá và lượt nhận ưu đãi
- Quản lý tài chính, vật tư, thiết bị, bảo trì
- Ticket hỗ trợ và chat giữa khách hàng với admin
- Dashboard thống kê cho admin và khu vực theo dõi cho user

## Cấu trúc thư mục

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── dependencies/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── requirements.txt
│   └── start.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Biến môi trường

### Backend: `backend/.env`

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>?sslmode=require&channel_binding=require

DB_HOST=<host>
DB_PORT=5432
DB_NAME=<database>
DB_USER=<user>
DB_PASSWORD=<password>
DB_SSLMODE=require
DB_CHANNEL_BINDING=require

SECRET_KEY=<access-token-secret>
REFRESH_TOKEN_SECRET=<refresh-token-secret>
RESET_TOKEN=<reset-token-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
RESET_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret-key>
R2_BUCKET_NAME=<bucket-name>
R2_PUBLIC_URL=<public-base-url>
```

### Frontend: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Với production:

- `NEXT_PUBLIC_API_URL` nên trỏ về domain Render của backend
- frontend hiện có fallback trong [frontend/src/lib/config.ts](/home/nhattrinh/Downloads/KTPM_Cour01_Nhom_1/frontend/src/lib/config.ts:1)

## Cài đặt database

File schema chuẩn hiện tại là:

- [backend/app/database/database.sql](/home/nhattrinh/Downloads/KTPM_Cour01_Nhom_1/backend/app/database/database.sql)

Đây là file schema sạch, dùng để import sang PostgreSQL mới. File này:

- có `CREATE TABLE`, `CONSTRAINT`, `INDEX`, `FOREIGN KEY`
- không giữ seed dữ liệu local
- phù hợp để copy/import sang database khác

Import bằng pgAdmin hoặc `psql`:

```bash
psql "<your_database_url>" -f backend/app/database/database.sql
```

Nếu cần import dữ liệu tài khoản mẫu riêng, xem thêm:

- [backend/app/database/accounts.sql](/home/nhattrinh/Downloads/KTPM_Cour01_Nhom_1/backend/app/database/accounts.sql)

## Chạy local

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python start.py
```

Backend mặc định:

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- OpenAPI: `http://localhost:8000/openapi.json`

Nếu cổng `8000` đã bị chiếm, đổi sang cổng khác khi chạy `uvicorn` hoặc tắt process cũ trước.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend local:

- `http://localhost:3000`

Build production:

```bash
cd frontend
npm run build
npm run start
```

## Deploy

### Frontend trên Vercel

1. Import thư mục `frontend` vào Vercel
2. Framework preset: `Next.js`
3. Khai báo biến môi trường:
   - `NEXT_PUBLIC_API_URL=https://<your-render-backend>`
4. Deploy

### Backend trên Render

1. Tạo Web Service từ thư mục `backend`
2. Runtime: `Python`
3. Build command:

```bash
pip install -r requirements.txt
```

4. Start command:

```bash
python start.py
```

Hoặc:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

5. Khai báo đầy đủ biến môi trường database, JWT và R2

### Storage trên Cloudflare R2

R2 đang dùng cho:

- avatar người dùng
- ảnh tin nhắn chat
- file đính kèm hỗ trợ

Backend upload thông qua helper trong:

- [backend/app/utils/r2.py](/home/nhattrinh/Downloads/KTPM_Cour01_Nhom_1/backend/app/utils/r2.py:1)

### Database trên Neon

Database production hiện dùng PostgreSQL hosted trên Neon.

Lưu ý:

- Neon free plan có thể sleep khi không có truy cập trong một khoảng thời gian
- khi sleep, request đầu tiên sau một thời gian nghỉ có thể chậm hơn bình thường
- nếu cần luôn sẵn sàng, nên dùng gói không scale-to-zero hoặc bổ sung health check/ping định kỳ từ bên ngoài

## API chính

Backend mount router với prefix `/api`.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `POST /api/auth/upload-avatar`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Home

- `GET /api/home/dashboard/summary`
- `GET /api/home/dashboard/overview`
- `GET /api/home/dashboard/revenue`
- `GET /api/home/customers`
- `GET /api/home/orders`
- `GET /api/home/my-orders`
- `GET /api/home/services`
- `GET /api/home/promotions`
- `GET /api/home/my-promotion-claims`
- `GET /api/home/booking-requests`
- `GET /api/home/my-bookings`
- `GET /api/home/finance-records`
- `GET /api/home/support-tickets/full`
- `WS /api/home/ws/support-chat`

## Nghiệp vụ quan trọng đang áp dụng

- Admin tạo đơn hàng phải chọn khách hàng
- User tạo booking/đơn từ tài khoản của mình sẽ tự suy ra `customer_id` và `customer_code`
- Ảnh chat, avatar và ảnh đính kèm được lưu trên R2
- Schema chuẩn để dựng database mới nằm ở `backend/app/database/database.sql`

## Ghi chú phát triển

- Frontend admin nằm chủ yếu trong `frontend/src/app/home`
- Frontend user nằm chủ yếu trong `frontend/src/app/user`
- API base URL nằm ở [frontend/src/lib/config.ts](/home/nhattrinh/Downloads/KTPM_Cour01_Nhom_1/frontend/src/lib/config.ts:1)
- Kết nối database nằm ở [backend/app/database/database.py](/home/nhattrinh/Downloads/KTPM_Cour01_Nhom_1/backend/app/database/database.py:1)
- Upload file R2 nằm ở [backend/app/utils/r2.py](/home/nhattrinh/Downloads/KTPM_Cour01_Nhom_1/backend/app/utils/r2.py:1)

## Bảo mật

- Không commit `.env` thật lên Git
- Không đưa trực tiếp secret JWT, DB password, R2 key vào README
- Nếu lộ key, nên rotate ngay trên Neon / Cloudflare / Render

## Thành viên nhóm

| STT | Mã sinh viên | Thành viên | Vai trò |
| --- | --- | --- | --- |
| 1 | 23010600 | Trịnh Như Nhất | Nhóm trưởng |
| 2 | 23010499 | Nguyễn Tuấn Huy | Thành viên |
| 3 | 23010625 | Trần Văn Nhật | Thành viên |
| 4 | 23017270 | Mầu Danh Chiến | Thành viên |
