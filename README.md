# Saigon Tếu Operations

MVP nội bộ quản lý Show, nhân sự theo Show, Task, người đảm nhận và file bàn giao. Giao diện React hiện hữu được giữ lại; dữ liệu core được lưu trong PostgreSQL thay vì localStorage.

## Architecture

- Frontend: React 19, Vite, TypeScript, Tailwind CSS, Context và API service.
- Backend: Node.js, Express, Prisma ORM.
- Database: PostgreSQL (khuyến nghị Neon).
- Core persistence: `User`, `Show`, `ShowMember`, `Task`, `TaskAssignee`, `TaskDeliverable`, `TaskDependency`.
- Analytics, finance, advances và attendance vẫn dùng mock/localStorage trong phase này.

## Requirements

- Node.js 20+
- PostgreSQL 15+ hoặc Neon PostgreSQL
- npm

## Environment variables

Sao chép `.env.example` thành `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
API_PORT="4000"
VITE_API_URL="http://localhost:4000/api"
```

Không commit `.env` hoặc credential thật.

## Database setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Seed tạo 7 user, Show “Tếu Lên Trình #4”, staffing, 10 Task (3 Done, 3 In Progress, 3 Todo, 1 Stuck), 4 unassigned, 2 deliverable và 2 dependency.

## Run

Terminal 1:

```bash
npm run dev:api
```

Terminal 2:

```bash
npm run dev
```

Frontend chạy tại `http://localhost:3000`, API mặc định tại `http://localhost:4000/api`.

## Validation

```bash
npm run lint
npm run build
npm test
npm run prisma:validate
```

## Development authentication

Navbar có development user switcher. Frontend gửi `x-user-id`; backend vẫn kiểm tra quyền Manager/Member và membership/assignment. Đây **không phải production authentication**. TODO phase sau: thay bằng Firebase Authentication hoặc Google Login và tắt hoàn toàn dev header trong production.

## Production notes

- Dùng HTTPS và secret manager cho `DATABASE_URL`.
- Chạy Prisma migration trong deployment pipeline.
- Chỉ expose API sau reverse proxy, cấu hình CORS theo origin cụ thể.
- Thay development identity bridge trước khi đưa ra production.

## Known limitations

- Dependency mới hỗ trợ mô hình finish-to-start trực tiếp một cấp; chưa có critical path/recursive scheduling.
- Không tích hợp Google Drive/Canva/Figma API; deliverable chỉ lưu URL HTTPS.
- Các module finance, attendance và analytics chưa migrate sang PostgreSQL.
- Chưa có notification/email/full workflow template.
