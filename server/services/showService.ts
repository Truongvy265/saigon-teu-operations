import { ShowRole, ShowStatus } from "@prisma/client";
import { prisma } from "../db";
import { canAccessShow, showProgress } from "../business";
import { notFound, badRequest, forbidden } from "../utils/errors";
import {
  enumValue,
  optionalText,
  requiredText,
  validDate,
} from "../utils/validation";
import type { AuthUser } from "../types";
export const showInclude = {
  members: { include: { user: true } },
  tasks: {
    include: { assignees: { include: { user: true } }, deliverables: true },
  },
} as const;
export async function listShows(user: AuthUser) {
  const where =
    user.companyRole === "MANAGER"
      ? {}
      : { members: { some: { userId: user.id } } };
  const shows = await prisma.show.findMany({
    where,
    include: showInclude,
    orderBy: { showDate: "asc" },
  });
  return shows.map((s) => ({ ...s, progressPercent: showProgress(s.tasks) }));
}
export async function assertShowAccess(showId: string, user: AuthUser) {
  if (user.companyRole === "MANAGER") return;
  const membership = await prisma.showMember.findUnique({
    where: { showId_userId: { showId, userId: user.id } },
    select: { userId: true },
  });
  if (
    !canAccessShow(
      user.companyRole,
      user.id,
      membership ? [membership.userId] : [],
    )
  )
    throw forbidden("Not a show member");
}
export async function createShow(body: any, user: AuthUser) {
  return prisma.show.create({
    data: {
      name: requiredText(body.name, "Show name"),
      code: optionalText(body.code),
      description: optionalText(body.description),
      showDate: validDate(body.showDate, "show date"),
      startTime: optionalText(body.startTime),
      endTime: optionalText(body.endTime),
      city: requiredText(body.city, "City"),
      venue: requiredText(body.venue, "Venue"),
      scale: optionalText(body.scale),
      goal: optionalText(body.goal),
      status: enumValue(ShowStatus, body.status || "PLANNING", "show status"),
      createdById: user.id,
    },
    include: showInclude,
  });
}
export async function deleteSummary(id: string) {
  const show = await prisma.show.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      _count: { select: { tasks: true, members: true } },
      tasks: { select: { _count: { select: { deliverables: true } } } },
    },
  });
  if (!show) throw notFound("Show not found");
  return {
    id: show.id,
    name: show.name,
    tasks: show._count.tasks,
    members: show._count.members,
    deliverables: show.tasks.reduce((n, t) => n + t._count.deliverables, 0),
  };
}
export async function addMember(showId: string, body: any) {
  const [show, user] = await Promise.all([
    prisma.show.findUnique({ where: { id: showId } }),
    prisma.user.findUnique({ where: { id: body.userId } }),
  ]);
  if (!show || !user) throw notFound("Show or user not found");
  if (!user.active) throw badRequest("User is inactive");
  return prisma.showMember.create({
    data: {
      showId,
      userId: user.id,
      role: enumValue(ShowRole, body.role, "show role"),
      note: optionalText(body.note),
    },
    include: { user: true },
  });
}
