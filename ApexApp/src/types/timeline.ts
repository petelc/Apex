/**
 * Task Activity Timeline Types
 */

export interface TaskActivity {
  id: string;
  activityType: TaskActivityType;
  description: string;
  details?: string;
  userId: string;
  timestamp: string;
  
  // Enriched user info
  userName?: string;
  userEmail?: string;
}

export type TaskActivityType =
  | 'Created'
  | 'Updated'
  | 'Assigned'
  | 'Claimed'
  | 'Started'
  | 'Blocked'
  | 'Unblocked'
  | 'Completed'
  | 'Cancelled'
  | 'TimeLogged'
  | 'CommentAdded'
  | 'ChecklistItemAdded'
  | 'ChecklistItemCompleted'
  | 'NotesUpdated';

export const TaskActivityTypeLabels: Record<TaskActivityType, string> = {
  Created: 'Created',
  Updated: 'Updated',
  Assigned: 'Assigned',
  Claimed: 'Claimed',
  Started: 'Started',
  Blocked: 'Blocked',
  Unblocked: 'Unblocked',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  TimeLogged: 'Time Logged',
  CommentAdded: 'Comment Added',
  ChecklistItemAdded: 'Checklist Item Added',
  ChecklistItemCompleted: 'Checklist Item Completed',
  NotesUpdated: 'Notes Updated',
};

export const TaskActivityTypeIcons: Record<TaskActivityType, string> = {
  Created: 'add_circle',
  Updated: 'edit',
  Assigned: 'person_add',
  Claimed: 'person',
  Started: 'play_arrow',
  Blocked: 'block',
  Unblocked: 'check_circle',
  Completed: 'done',
  Cancelled: 'cancel',
  TimeLogged: 'schedule',
  CommentAdded: 'comment',
  ChecklistItemAdded: 'checklist',
  ChecklistItemCompleted: 'check_box',
  NotesUpdated: 'note',
};
