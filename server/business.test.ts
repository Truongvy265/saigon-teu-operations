import test from 'node:test';
import assert from 'node:assert/strict';
import { canUpdateTask, isOverdue, isUnassigned, isValidDeliverableUrl, showProgress } from './business';

test('show progress is derived from DONE tasks', () => assert.equal(showProgress([{status:'DONE'}, {status:'TODO'}, {status:'DONE'}]), 67));
test('show with no tasks is zero percent', () => assert.equal(showProgress([]), 0));
test('unassigned uses relation count', () => assert.equal(isUnassigned({status:'TODO', assignees:[]}), true));
test('DONE task is never overdue', () => assert.equal(isOverdue({status:'DONE', currentDeadline:'2020-01-01'}), false));
test('only https deliverables are accepted', () => assert.equal(isValidDeliverableUrl('https://drive.google.com/a'), true));
test('member can update only assigned task', () => assert.equal(canUpdateTask('MEMBER', 'u1', ['u1']), true));
