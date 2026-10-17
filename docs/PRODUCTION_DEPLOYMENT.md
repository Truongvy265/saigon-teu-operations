# Production deployment runbook

Kiến trúc mục tiêu:

- Cloudflare Pages phục vụ React/Vite (`dist`).
- Cloudflare Tunnel chuyển `https://api.example.com` tới `127.0.0.1:4000` trên Oracle VM; không mở port 4000 ra Internet.
- systemd chạy Node.js/Express và tự khởi động lại.
- Neon PostgreSQL dùng endpoint pooled khi chạy ứng dụng và endpoint direct khi migration/backup.
- Firebase Authentication cung cấp Google Login; backend xác minh ID token và ánh xạ email đã xác minh với `User.email` trong database.

Không lưu credential trong Git. Những giá trị `example.com`, UUID và URL trong tài liệu đều là placeholder.

## 1. Compatibility và sizing

Production chuẩn hóa trên Node.js 20 LTS, Ubuntu ARM64 và Prisma 6. Prisma hỗ trợ Linux ARM64/glibc; chạy `npm ci` và `npm run prisma:generate` ngay trên VM để tạo engine native đúng nền tảng. Không copy `node_modules` hoặc Prisma engine từ Windows/x64 lên VM.

```bash
node --version
npm --version
uname -m             # aarch64
openssl version      # OpenSSL 3 trên Ubuntu hiện đại
```

Với 10–30 người dùng và một API process, bắt đầu bằng `connection_limit=5&pool_timeout=10` trên URL pooled của Neon. Khi tăng số process/VM, tổng connection limit của tất cả instance phải nằm trong giới hạn Neon.

## 2. Firebase và cấp quyền người dùng

1. Tạo/chọn Firebase project, bật Authentication > Sign-in method > Google.
2. Thêm domain Cloudflare Pages và custom frontend domain vào Authorized domains.
3. Đặt cấu hình web Firebase vào biến môi trường Cloudflare Pages.
4. Tạo service account cho backend. Chép JSON trực tiếp vào `/etc/saigon-teu-operations/firebase-service-account.json`, owner `root:sgt-ops`, mode `0640`. Không đặt file này trong repository.
5. Tạo trước user trong bảng `User`, với email viết thường trùng email Google, `active=true`, và `companyRole=MANAGER` hoặc `MEMBER`.

Backend chỉ nhận `Authorization: Bearer <Firebase ID token>`, kiểm tra token bị thu hồi và yêu cầu email đã xác minh. `x-user-id` chỉ hoạt động khi `NODE_ENV` không phải production và `AUTH_MODE=development`. Ứng dụng từ chối khởi động nếu production cấu hình development auth.

Quyền được kiểm tra tại API: thao tác quản trị cần `MANAGER`; thành viên chỉ đọc Show mình tham gia và Task được phép, còn cập nhật Task dựa trên membership/assignment và các rule nghiệp vụ hiện có. UI không phải ranh giới bảo mật.

## 3. Neon

Tạo database/branch production trong Neon. Chuẩn bị hai URL:

- `DATABASE_URL`: hostname có `-pooler`, dành cho API runtime.
- `DIRECT_URL`: endpoint direct, dành cho Prisma migration và backup.

```env
DATABASE_URL=postgresql://USER:PASSWORD@POOLER_HOST/DB?sslmode=require&connection_limit=5&pool_timeout=10
DIRECT_URL=postgresql://USER:PASSWORD@DIRECT_HOST/DB?sslmode=require
```

Không chạy `prisma migrate dev`, `prisma db push`, `prisma migrate reset` hoặc seed trên production. Migration production duy nhất là `npm run prisma:deploy`.

## 4. Cloudflare Pages

Kết nối repository và cấu hình:

- Production branch: `main`
- Build command: `npm run build:frontend`
- Build output directory: `dist`
- Node version: `20`

```env
VITE_API_URL=https://api.example.com/api
VITE_AUTH_MODE=firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

Không đặt `DATABASE_URL`, service-account JSON hoặc secret backend trong Pages. File `public/_headers` được Vite đưa vào output để thêm security header cơ bản.

## 5. Oracle ARM64 VM và API

Tạo Ubuntu ARM64 VM, reserve public IP nếu cần cho SSH, cập nhật OS và cài Node.js 20 ARM64, `git`, `postgresql-client`, `ca-certificates`. Bảo đảm executable Node cố định ở `/usr/bin/node` (hoặc sửa `ExecStart` trong unit). Firewall chỉ cần SSH theo IP quản trị; API port 4000 không cần inbound rule.

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin sgt-ops
sudo install -d -o sgt-ops -g sgt-ops /opt/saigon-teu-operations/releases
sudo install -d -o root -g sgt-ops -m 0750 /etc/saigon-teu-operations
```

Tạo `/etc/saigon-teu-operations/api.env`, owner `root:sgt-ops`, mode `0640`:

```env
NODE_ENV=production
API_HOST=127.0.0.1
API_PORT=4000
LOG_LEVEL=info
AUTH_MODE=firebase
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/etc/saigon-teu-operations/firebase-service-account.json
CORS_ORIGINS=https://app.example.com
DATABASE_URL=...
DIRECT_URL=...
```

Mỗi release, checkout commit cụ thể vào release directory rồi chạy `npm ci`, `npm run prisma:generate`, `npm run build:api`. Không dùng `tsx watch`, Vite dev server hoặc `npm run dev:*` trong production.

Copy `deploy/systemd/sgt-operations-api.service` tới `/etc/systemd/system/`, sau đó:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now sgt-operations-api
sudo systemctl status sgt-operations-api
journalctl -u sgt-operations-api -f
```

API ghi log JSON vào stdout/stderr để journald thu thập. `/health/live` kiểm tra process; `/health/ready` kiểm tra cả kết nối database.

## 6. Cloudflare Tunnel

Trong Cloudflare Zero Trust, tạo named tunnel và DNS hostname `api.example.com`. Cài `cloudflared` từ package chính thức trên VM. Copy `deploy/cloudflared/config.yml.example` thành `/etc/cloudflared/config.yml`, thay UUID/hostname, đặt credential JSON ở `/etc/cloudflared/`, rồi:

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared
```

Tunnel origin là `http://127.0.0.1:4000`; HTTPS kết thúc ở Cloudflare. Sau khi DNS hoạt động, đặt chính xác frontend origin trong `CORS_ORIGINS`, restart API, rồi kiểm tra preflight và login.

## 7. Migration, backup và rollback

Trước release:

1. Tạo migration bằng `npm run prisma:migrate -- --name <name>` chỉ trên database development.
2. Review SQL đã commit. Với thay đổi phá vỡ tương thích, dùng expand/contract qua ít nhất hai release.
3. Chạy lint, test, build và `prisma validate` trong CI.
4. Chụp Neon branch/snapshot hoặc tạo logical backup trước migration.

Backup qua endpoint direct, không đưa password vào command history:

```bash
set -a; source /etc/saigon-teu-operations/api.env; set +a
umask 077
pg_dump --format=custom --no-owner --no-acl "$DIRECT_URL" --file "backup-$(date -u +%Y%m%dT%H%M%SZ).dump"
```

Release theo thứ tự: chuẩn bị build; backup; chạy `npm run prisma:deploy` đúng một lần; chuyển symlink `/opt/saigon-teu-operations/current`; restart service; kiểm tra health, đăng nhập, đọc Show và cập nhật một Task test.

Rollback ứng dụng bằng cách chuyển symlink về release trước rồi restart. Prisma không tự down-migrate: ưu tiên forward-fix tương thích. Nếu cần phục hồi dữ liệu, dừng ghi, tạo database/Neon branch mới và restore:

```bash
pg_restore --no-owner --no-acl --dbname "$RESTORE_DATABASE_URL" backup.dump
```

Xác minh database phục hồi trước khi đổi `DATABASE_URL`. Không chạy `--clean` vào production đang hoạt động.

## 8. Monitoring và vận hành

- Theo dõi status/latency, lỗi 5xx, `/health/ready`, systemd restart count, đĩa và Neon connection/compute usage.
- Cảnh báo nếu readiness lỗi liên tục; liveness chỉ dùng để phát hiện process.
- Rotate/revoke service-account key và database credential định kỳ.
- Review `npm audit`; không dùng `npm audit fix --force` trực tiếp trên production.
- Vá OS/Node/dependencies định kỳ và lập kế hoạch nâng Prisma trước khi nhánh v6 hết hỗ trợ.
