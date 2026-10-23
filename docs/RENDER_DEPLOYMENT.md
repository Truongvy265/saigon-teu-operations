# Deploy backend lên Render Web Service

Tài liệu này chỉ cấu hình backend. Frontend Cloudflare Pages, Neon và Firebase Authentication vẫn giữ nguyên.

## 1. Chuẩn bị Firebase credential

Tải service-account JSON từ Firebase Console về máy quản trị và không chép file vào repository. Chuyển toàn bộ nội dung file thành Base64 trên máy cục bộ:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("firebase-service-account.json"))
```

Lưu kết quả trực tiếp vào Render Secret Environment Variable `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`. Không dán giá trị vào source code, build command, log hoặc chat.

Backend ưu tiên biến Base64 này. Nếu không có, backend tiếp tục hỗ trợ file được chỉ bởi `GOOGLE_APPLICATION_CREDENTIALS` cho Oracle VM. Production sẽ từ chối khởi động nếu cả hai đều thiếu hoặc credential không đọc/giải mã được.

## 2. Tạo Render Web Service

Kết nối GitHub repository và cấu hình:

- Runtime: Node
- Branch: `main`
- Build command: `npm ci && npm run prisma:generate && npm run build:api`
- Start command: `npm run start:api`
- Health Check Path: `/health/ready`
- Auto Deploy: chỉ bật sau khi đã có quy trình migration an toàn

Các environment variable bắt buộc:

```env
NODE_ENV=production
API_HOST=0.0.0.0
API_PORT=10000
AUTH_MODE=firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=<Render secret>
CORS_ORIGINS=https://your-frontend.pages.dev
DATABASE_URL=<Neon pooled connection string>
DIRECT_URL=<Neon direct connection string>
LOG_LEVEL=info
```

Render cũng cung cấp `PORT`; backend hỗ trợ biến này làm fallback, nhưng cấu hình trên dùng `API_PORT=10000` theo yêu cầu rõ ràng. `CORS_ORIGINS` phải là origin chính xác, không có path và không dùng wildcard.

`DATABASE_URL` nên dùng Neon pooled endpoint với giới hạn nhỏ, ví dụ thêm `connection_limit=5&pool_timeout=10`. `DIRECT_URL` chỉ dùng cho Prisma migration.

## 3. Migration và phát hành

Không đưa `prisma migrate deploy` vào Start command vì mỗi lần Render restart không nên tự chạy migration. Trước khi deploy release có thay đổi schema:

1. Backup hoặc tạo Neon branch/snapshot.
2. Review SQL migration đã commit.
3. Chạy `npm run prisma:deploy` một lần từ môi trường quản trị an toàn hoặc Render one-off job/shell.
4. Deploy Web Service và kiểm tra `/health/live`, `/health/ready`.
5. Đăng nhập Google và kiểm tra một request đọc Show/Task.

Rollback application bằng commit/release trước trên Render. Với database, ưu tiên forward-fix; không chạy `prisma migrate reset` trên production.

## 4. Kiểm tra an toàn

- Không tạo Secret File từ repository; dùng Render Secret Environment Variable.
- Không bật `x-user-id`: production bắt buộc `AUTH_MODE=firebase`.
- Không log hoặc echo các biến Firebase/Neon trong build/start command.
- Nếu rotate service account, cập nhật Render secret rồi manual deploy/restart.
- Firebase service account, private key, `.env` thật và connection string đều phải nằm ngoài Git.
