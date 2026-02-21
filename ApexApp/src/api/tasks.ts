/**
 * Task API Client - COMPLETE FIX
 * ✅ Fixed: assignTaskToUser sends correct property name
 * ✅ Fixed: getProjectTasks handles paginated response correctly
 */

import { apiClient } from './client';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateImplementationNotesRequest,
  UpdateResolutionNotesRequest,
  CompleteTaskRequest,
  BlockTaskRequest,
  LogTimeRequest,
  AssignToUserRequest,
  AssignToDepartmentRequest,
} from '../types/task';
import {
  ChecklistItem,
  AddChecklistItemRequest,
  AddChecklistItemResponse,
} from '../types/checklist';
import { TaskActivity } from '../types/timeline';

/**
 * Paginated response from backend
 */
interface ListTasksResponse {
  tasks: Task[]; // Try lowercase first
  Tasks?: Task[]; // Fallback to PascalCase
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Get all tasks for a project
 */
export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
  try {
    const response = await apiClient.get<ListTasksResponse>(
      `/projects/${projectId}/tasks`,
      {
        params: {
          pageNumber: 1,
          pageSize: 100,
        },
      },
    );

    // Handle both camelCase and PascalCase responses
    const data = response.data as any;
    return data.tasks || data.Tasks || [];
  } catch (error: any) {
    console.error('Error loading tasks:', error.response?.data);
    throw error;
  }
};

/**
 * Get a single task by ID
 */
export const getTask = async (taskId: string): Promise<Task> => {
  const response = await apiClient.get<Task>(`/tasks/${taskId}`);
  return response.data;
};

/**
 * Create a new task
 */
export const createTask = async (
  projectId: string,
  data: CreateTaskRequest,
): Promise<Task> => {
  const response = await apiClient.post<Task>(
    `/projects/${projectId}/tasks`,
    data,
  );
  return response.data;
};

/**
 * Update task details (title, description, priority, dates)
 */
export const updateTask = async (
  taskId: string,
  data: UpdateTaskRequest,
): Promise<void> => {
  await apiClient.put(`/tasks/${taskId}`, data);
};

/**
 * Update implementation notes
 */
export const updateImplementationNotes = async (
  taskId: string,
  data: UpdateImplementationNotesRequest,
): Promise<void> => {
  await apiClient.put(`/tasks/${taskId}/implementation-notes`, data);
};

/**
 * Update resolution notes
 */
export const updateResolutionNotes = async (
  taskId: string,
  data: UpdateResolutionNotesRequest,
): Promise<void> => {
  await apiClient.put(`/tasks/${taskId}/resolution-notes`, data);
};

/**
 * Start a task (NotStarted → InProgress)
 */
export const startTask = async (taskId: string): Promise<void> => {
  await apiClient.post(`/tasks/${taskId}/start`);
};

/**
 * Complete a task with optional resolution notes
 */
export const completeTask = async (
  taskId: string,
  data?: CompleteTaskRequest,
): Promise<void> => {
  await apiClient.post(`/tasks/${taskId}/complete`, data || {});
};

/**
 * Block a task with reason
 */
export const blockTask = async (
  taskId: string,
  data: BlockTaskRequest,
): Promise<void> => {
  await apiClient.post(`/tasks/${taskId}/block`, data);
};

/**
 * Unblock a task (Blocked → InProgress)
 */
export const unblockTask = async (taskId: string): Promise<void> => {
  await apiClient.post(`/tasks/${taskId}/unblock`);
};

/**
 * Cancel a task
 */
export const cancelTask = async (taskId: string): Promise<void> => {
  await apiClient.post(`/tasks/${taskId}/cancel`);
};

/**
 * Claim a task (assign to current user)
 */
export const claimTask = async (taskId: string): Promise<void> => {
  await apiClient.post(`/tasks/${taskId}/claim`);
};

/**
 * Assign task to a user
 * ✅ FIXED: Now sends "assignedToUserId" to match backend expectation
 */
export const assignTaskToUser = async (
  taskId: string,
  data: AssignToUserRequest,
): Promise<void> => {
  await apiClient.post(`/tasks/${taskId}/assign-to-user`, {
    assignedToUserId: data.assignedToUserId, // ✅ Backend expects "assignedToUserId"
  });
};

/**
 * Assign task to a department
 */
export const assignTaskToDepartment = async (
  taskId: string,
  data: AssignToDepartmentRequest,
): Promise<void> => {
  await apiClient.post(`/tasks/${taskId}/assign-to-department`, data);
};

/**
 * Log time to a task
 */
export const logTime = async (
  taskId: string,
  data: LogTimeRequest,
): Promise<void> => {
  await apiClient.post(`/tasks/${taskId}/log-time`, data);
};

// ============================================
// CHECKLIST ENDPOINTS
// ============================================

/**
 * Get task checklist items
 */
export const getTaskChecklist = async (
  taskId: string,
): Promise<ChecklistItem[]> => {
  const response = await apiClient.get<ChecklistItem[]>(
    `/tasks/${taskId}/checklist`,
  );
  return response.data;
};

/**
 * Add a checklist item
 */
export const addChecklistItem = async (
  taskId: string,
  data: AddChecklistItemRequest,
): Promise<AddChecklistItemResponse> => {
  const response = await apiClient.post<AddChecklistItemResponse>(
    `/tasks/${taskId}/checklist`,
    data,
  );
  return response.data;
};

/**
 * Toggle checklist item completion
 */
export const toggleChecklistItem = async (
  taskId: string,
  itemId: string,
): Promise<void> => {
  await apiClient.put(`/tasks/${taskId}/checklist/${itemId}/toggle`);
};

// ============================================
// TIMELINE ENDPOINTS
// ============================================

/**
 * Get task activity timeline
 */
export const getTaskTimeline = async (
  taskId: string,
): Promise<TaskActivity[]> => {
  const response = await apiClient.get<TaskActivity[]>(
    `/tasks/${taskId}/timeline`,
  );
  return response.data;
};

// ============================================
// EXPORT ALL
// ============================================

const tasksApi = {
  // Task CRUD
  getProjectTasks,
  getTask,
  createTask,
  updateTask,

  // Task Actions
  startTask,
  completeTask,
  blockTask,
  unblockTask,
  cancelTask,
  claimTask,
  assignTaskToUser,
  assignTaskToDepartment,
  logTime,

  // Notes
  updateImplementationNotes,
  updateResolutionNotes,

  // Checklist
  getTaskChecklist,
  addChecklistItem,
  toggleChecklistItem,

  // Timeline
  getTaskTimeline,
};

export default tasksApi;
