import {
  PrismaClient,
  ShowRole,
  TaskActivityType,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";
const prisma = new PrismaClient();
const people = [
  ["Khoi", "Khôi", "khoi@saigonteu.vn", "MANAGER"],
  ["phuc", "Phúc", "phuc@saigonteu.vn", "MEMBER"],
  ["yen-nhi", "Yến Nhi", "yennhi@saigonteu.vn", "MEMBER"],
  ["truong-vy", "Trường Vỹ", "vy@saigonteu.vn", "MEMBER"],
  ["kha-di", "Khả Di", "khadi@saigonteu.vn", "MEMBER"],
  ["na", "Na", "na@saigonteu.vn", "MEMBER"],
  ["nhung", "Nhung", "nhung@saigonteu.vn", "MEMBER"],
] as const;
async function main() {
  const users: Record<string, any> = {};
  for (const [id, name, email, companyRole] of people)
    users[id] = await prisma.user.upsert({
      where: { email },
      update: { name, companyRole },
      create: { id, name, email, companyRole },
    });
  const show = await prisma.show.upsert({
    where: { id: "teu-len-trinh-4" },
    update: {},
    create: {
      id: "teu-len-trinh-4",
      name: "Tếu Lên Trình #4",
      code: "TLT-04",
      showDate: new Date("2026-11-20T00:00:00.000Z"),
      startTime: "19:30",
      city: "TP. Hồ Chí Minh",
      venue: "Venue demo",
      scale: "VỪA",
      goal: "Doanh thu + Talent",
      status: "PREPARING",
      createdById: users.Khoi.id,
    },
  });
  const roles: [string, ShowRole][] = [
    ["Khoi", "PM"],
    ["phuc", "PA1"],
    ["yen-nhi", "PA2"],
    ["truong-vy", "SE"],
    ["kha-di", "SSE"],
  ];
  for (const [key, role] of roles)
    await prisma.showMember.upsert({
      where: { showId_userId: { showId: show.id, userId: users[key].id } },
      update: { role },
      create: { showId: show.id, userId: users[key].id, role },
    });
  await prisma.task.deleteMany({
    where: {
      OR: [
        { showId: show.id },
        {
          showId: null,
          title: {
            in: ["Báo cáo vận hành tháng 10", "Chuẩn bị họp kế hoạch tháng 11"],
          },
        },
      ],
    },
  });
  const statuses: TaskStatus[] = [
    "DONE",
    "DONE",
    "DONE",
    "IN_PROGRESS",
    "IN_PROGRESS",
    "IN_PROGRESS",
    "TODO",
    "TODO",
    "TODO",
    "STUCK",
  ];
  const titles = [
    "Chốt venue",
    "Duyệt kịch bản",
    "Banner online",
    "Kế hoạch check-in",
    "Lineup nghệ sĩ",
    "Kế hoạch social",
    "Giấy phép biểu diễn",
    "Logistics onsite",
    "Chăm sóc talent",
    "Đối soát vé",
  ];
  const tasks = [];
  for (let i = 0; i < 10; i++)
    tasks.push(
      await prisma.task.create({
        data: {
          showId: show.id,
          title: titles[i],
          description: `Công việc mẫu ${i + 1}`,
          category: i < 3 ? "PLANNING" : "EXECUTION",
          phase: i < 5 ? "PHASE 1" : "PHASE 2",
          department: "SHOW",
          startDate: new Date("2026-10-20T00:00:00.000Z"),
          plannedDeadline: new Date(
            `2026-11-${String(5 + i).padStart(2, "0")}T00:00:00.000Z`,
          ),
          currentDeadline: new Date(
            `2026-11-${String(5 + i).padStart(2, "0")}T00:00:00.000Z`,
          ),
          priority: i === 9 ? TaskPriority.URGENT : TaskPriority.NORMAL,
          status: statuses[i],
          progressPercent:
            statuses[i] === "DONE"
              ? 100
              : statuses[i] === "IN_PROGRESS"
                ? 40
                : 0,
          stuckReason: statuses[i] === "STUCK" ? "Chờ xác nhận đối tác" : null,
          completedAt: statuses[i] === "DONE" ? new Date() : null,
          createdById: users.Khoi.id,
        },
      }),
    );
  const assigned = [
    "truong-vy",
    "truong-vy",
    "phuc",
    "yen-nhi",
    "kha-di",
    "truong-vy",
  ];
  for (let i = 0; i < assigned.length; i++)
    await prisma.taskAssignee.create({
      data: { taskId: tasks[i].id, userId: users[assigned[i]].id },
    });
  const deliverables = await Promise.all(
    [
      {
        taskId: tasks[0].id,
        title: "Hợp đồng venue",
        url: "https://drive.google.com/example",
        submittedById: users["truong-vy"].id,
      },
      {
        taskId: tasks[2].id,
        title: "Source Canva",
        url: "https://canva.com/example",
        submittedById: users.phuc.id,
      },
    ].map((data) => prisma.taskDeliverable.create({ data })),
  );
  await prisma.taskDependency.createMany({
    data: [
      {
        predecessorTaskId: tasks[0].id,
        successorTaskId: tasks[3].id,
        lagDays: 2,
        autoAdjust: false,
      },
      {
        predecessorTaskId: tasks[1].id,
        successorTaskId: tasks[4].id,
        lagDays: 1,
        autoAdjust: false,
      },
    ],
  });
  const adHoc1 = await prisma.task.create({
    data: {
      showId: null,
      title: "Báo cáo vận hành tháng 10",
      description: "Tổng hợp báo cáo vận hành nội bộ",
      department: "OPERATION",
      plannedDeadline: new Date("2026-10-10T17:00:00+07:00"),
      currentDeadline: new Date("2026-10-12T17:00:00+07:00"),
      priority: "IMPORTANT",
      status: "IN_PROGRESS",
      progressPercent: 40,
      createdById: users.Khoi.id,
    },
  });
  await prisma.taskAssignee.create({
    data: { taskId: adHoc1.id, userId: users["truong-vy"].id },
  });
  await prisma.task.create({
    data: {
      showId: null,
      title: "Chuẩn bị họp kế hoạch tháng 11",
      department: "OPERATION",
      plannedDeadline: new Date("2026-11-01T17:00:00+07:00"),
      currentDeadline: new Date("2026-11-01T17:00:00+07:00"),
      priority: "NORMAL",
      status: "TODO",
      progressPercent: 0,
      createdById: users.Khoi.id,
    },
  });
  const activities: {
    taskId: string;
    actorId: string;
    type: TaskActivityType;
    metadata: any;
  }[] = [
    {
      taskId: tasks[2].id,
      actorId: users.Khoi.id,
      type: "TASK_CREATED",
      metadata: { scope: "SHOW" },
    },
    {
      taskId: tasks[2].id,
      actorId: users.Khoi.id,
      type: "TASK_ASSIGNED",
      metadata: { userId: users.phuc.id, userName: users.phuc.name },
    },
    {
      taskId: tasks[2].id,
      actorId: users.phuc.id,
      type: "STATUS_CHANGED",
      metadata: { from: "IN_PROGRESS", to: "DONE" },
    },
    {
      taskId: tasks[2].id,
      actorId: users.phuc.id,
      type: "DELIVERABLE_ADDED",
      metadata: {
        deliverableId: deliverables[1].id,
        title: deliverables[1].title,
        url: deliverables[1].url,
      },
    },
    {
      taskId: adHoc1.id,
      actorId: users.Khoi.id,
      type: "TASK_CREATED",
      metadata: { scope: "AD_HOC" },
    },
    {
      taskId: adHoc1.id,
      actorId: users.Khoi.id,
      type: "TASK_ASSIGNED",
      metadata: {
        userId: users["truong-vy"].id,
        userName: users["truong-vy"].name,
      },
    },
    {
      taskId: adHoc1.id,
      actorId: users.Khoi.id,
      type: "DEADLINE_CHANGED",
      metadata: {
        from: "2026-10-10T10:00:00.000Z",
        to: "2026-10-12T10:00:00.000Z",
        reason: "Cần thêm dữ liệu đối soát",
      },
    },
  ];
  await prisma.taskActivity.createMany({ data: activities });
}
main().finally(() => prisma.$disconnect());
