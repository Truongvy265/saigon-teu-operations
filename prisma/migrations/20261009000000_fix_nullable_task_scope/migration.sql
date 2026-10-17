-- Correct Phase 1.5 task scope nullability. Show membership always belongs to a Show;
-- company ad-hoc tasks may omit showId.
ALTER TABLE "ShowMember" ALTER COLUMN "showId" SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "showId" DROP NOT NULL;
