import test from "node:test";
import assert from "node:assert/strict";
import {
  assignmentAllowed,
  canAccessShow,
  canUpdateTask,
  deadlineChangeRequiresReason,
  deadlineVarianceDays,
  isOverdue,
  isUnassigned,
  isValidDeliverableUrl,
  progressForStatus,
  showProgress,
} from "./business";

test("show progress is derived from DONE tasks", () =>
  assert.equal(
    showProgress([{ status: "DONE" }, { status: "TODO" }, { status: "DONE" }]),
    67,
  ));
test("show with no tasks is zero percent", () =>
  assert.equal(showProgress([]), 0));
test("unassigned uses relation count", () =>
  assert.equal(isUnassigned({ status: "TODO", assignees: [] }), true));
test("DONE task is never overdue", () =>
  assert.equal(
    isOverdue({ status: "DONE", currentDeadline: "2020-01-01" }),
    false,
  ));
test("only https deliverables are accepted", () =>
  assert.equal(isValidDeliverableUrl("https://drive.google.com/a"), true));
test("member can update only assigned task", () =>
  assert.equal(canUpdateTask("MEMBER", "u1", ["u1"]), true));
test("show progress ignores AD-HOC tasks", () =>
  assert.equal(
    showProgress([
      { status: "DONE", showId: "s1" },
      { status: "TODO", showId: "s1" },
      { status: "DONE", showId: null },
    ]),
    50,
  ));
test("show task assignment requires show membership", () =>
  assert.equal(assignmentAllowed("s1", true, false), false));
test("AD-HOC assignment only requires an active user", () =>
  assert.equal(assignmentAllowed(null, true, false), true));
test("member cannot update another member task", () =>
  assert.equal(canUpdateTask("MEMBER", "u1", ["u2"]), false));
test("member can only access a show they belong to", () => {
  assert.equal(canAccessShow("MEMBER", "u1", ["u1", "u2"]), true);
  assert.equal(canAccessShow("MEMBER", "u3", ["u1", "u2"]), false);
  assert.equal(canAccessShow("MANAGER", "manager", []), true);
});
test("deadline change requires a non-empty reason", () =>
  assert.equal(
    deadlineChangeRequiresReason("2026-11-10", "2026-11-12", "  "),
    false,
  ));
test("unchanged deadline does not require a reason", () =>
  assert.equal(
    deadlineChangeRequiresReason("2026-11-10", "2026-11-10", ""),
    true,
  ));
test("deadline variance is derived, not stored", () =>
  assert.equal(
    deadlineVarianceDays({
      status: "TODO",
      plannedDeadline: "2026-11-10",
      currentDeadline: "2026-11-13",
    }),
    3,
  ));
test("status owns task progress", () => {
  assert.equal(progressForStatus("TODO", 80), 0);
  assert.equal(progressForStatus("IN_PROGRESS", 90), 40);
  assert.equal(progressForStatus("STUCK", 40), 40);
  assert.equal(progressForStatus("DONE", 40), 100);
});
test("non-HTTPS deliverables are rejected", () =>
  assert.equal(isValidDeliverableUrl("http://drive.google.com/a"), false));
