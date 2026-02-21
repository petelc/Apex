/**
 * Project Types
 */

export type ProjectStatus =
  | 'Planning'
  | 'Active'
  | 'OnHold'
  | 'Completed'
  | 'Cancelled';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: string;
  budget?: number;
  projectManagerUserId?: string;
  projectManagerUser?: {
    id: string;
    fullName: string;
    email: string;
  };
  // projectManagerName?: string;
  startDate?: string;
  endDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  createdByUserId: string;
  createdByUser?: {
    id: string;
    fullName: string;
    email: string;
  };
  //createdByName?: string;
  createdDate: string;
  lastModifiedDate?: string;
  isOverdue?: boolean;
  durationDays?: number;
  daysRemaining?: number;
  totalTasks?: number;
  completedTasks?: number;
  convertedFromRequestId?: string;
}

/**
 * Task Types - Re-exported from task.ts
 */
export type {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskRequest,
  UpdateTaskRequest,
} from './task';

/**
 * Department Types
 */

export interface Department {
  id: string;
  name: string;
  description: string;
  departmentManagerUserId?: string;
  departmentManagerName?: string;
  isActive: boolean;
  memberCount?: number;
  createdDate: string;
}
