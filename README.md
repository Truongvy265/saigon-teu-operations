# Saigon Tếu Operations

Ứng dụng nội bộ quản lý Show, nhân sự theo Show, Task, người đảm nhận và file bàn giao.

## Kiến trúc

- Frontend: React 19, Vite, TypeScript, Tailwind CSS.
- Backend: Node.js 20, Express, Prisma ORM.
- Database: PostgreSQL/Neon.
- Production: Cloudflare Pages + Oracle Cloud ARM64 VM + Cloudflare Tunnel.

Các module core (`User`, `Show`, `ShowMember`, `Task`, assignee, deliverable, dependency và activity) lưu trong PostgreSQL. Finance, advances, attendance và một phần analytics hiện vẫn là mock/localStorage.

## Phát triển local

Yêu cầu Node.js 20.19–22.x và PostgreSQL. Sao chép `.env.example` thành `.env`, điền database development, rồi chạy:

```powershell
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run prisma:migrate -- --name init
npm.cmd run prisma:seed
```

Hai terminal:

```powershell
npm.cmd run dev:api
npm.cmd run dev:web
```

Trên Windows PowerShell bị chặn `npm.ps1`, dùng `npm.cmd` như trên hoặc thay execution policy cho tài khoản của bạn. Không cần đổi policy toàn máy.

Development mặc định dùng user switcher và `x-user-id`. Production bắt buộc Firebase/Google Login và vô hiệu hóa hoàn toàn cơ chế này.

## Kiểm tra

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run prisma:validate
```

## Production

Xem [Production deployment runbook](docs/PRODUCTION_DEPLOYMENT.md) và các mẫu trong `deploy/`. Không commit `.env`, service-account JSON, database URL hoặc tunnel credential.

## Giới hạn đã biết

- Dependency mới chỉ hỗ trợ finish-to-start trực tiếp một cấp; chưa có critical path/recursive scheduling.
- Không tích hợp Google Drive/Canva/Figma API; deliverable chỉ lưu HTTPS URL.
- Finance, attendance và analytics chưa được migrate hoàn toàn sang PostgreSQL.
- Chưa có notification/email/full workflow template.
