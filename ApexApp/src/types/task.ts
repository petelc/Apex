/**
 * Task Management Types
 * Matches backend TaskDto with all enhancements
 */

export interface Task {
  // Identity
  id: string;
  projectId: string;

  // Core Information
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;

  // ✅ NEW: Notes
  implementationNotes?: string;
  resolutionNotes?: string;

  // Assignment
  assignedToDepartmentId?: string;
  assignedToDepartmentName?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;

  // Time Tracking
  estimatedHours?: number;
  actualHours?: number;

  // Dates
  dueDate?: string;
  createdDate: string;
  startedDate?: string;
  completedDate?: string;
  lastModifiedDate?: string;

  // Blocking
  blockedReason?: string;
  blockedDate?: string;

  // User Tracking
  createdByUserId: string;
  startedByUserId?: string; // ✅ NEW
  completedByUserId?: string; // ✅ NEW

  // User Objects (enriched from backend)
  createdByUser?: UserSummary;
  assignedToUser?: UserSummary;
  startedByUser?: UserSummary; // ✅ NEW
  completedByUser?: UserSummary; // ✅ NEW
}

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string;
}

// Task Status
export type TaskStatus =
  | 'NotStarted'
  | 'InProgress'
  | 'Blocked'
  | 'Completed'
  | 'Cancelled';

export const TaskStatusLabels: Record<TaskStatus, string> = {
  NotStarted: 'Not Started',
  InProgress: 'In Progress',
  Blocked: 'Blocked',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

export const TaskStatusColors: Record<TaskStatus, string> = {
  NotStarted: 'default',
  InProgress: 'warning',
  Blocked: 'error',
  Completed: 'success',
  Cancelled: 'default',
};

// Task Priority
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export const TaskPriorityLabels: Record<TaskPriority, string> = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical',
};

export const TaskPriorityColors: Record<TaskPriority, string> = {
  Low: 'info',
  Medium: 'default',
  High: 'warning',
  Critical: 'error',
};

// Request DTOs
export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedHours?: number;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedHours?: number;
  dueDate?: string;
}

export interface UpdateImplementationNotesRequest {
  notes?: string;
}

export interface UpdateResolutionNotesRequest {
  notes?: string;
}

export interface CompleteTaskRequest {
  resolutionNotes?: string;
}

export interface BlockTaskRequest {
  blockedReason: string;
}

export interface LogTimeRequest {
  hours: number;
}

export interface AssignToUserRequest {
  assignedToUserId: string;
}

export interface AssignToDepartmentRequest {
  departmentId: string;
}
