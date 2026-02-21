/**
 * Task Utility Functions
 * Helper functions for task state, validation, and display
 */

import { Task, TaskStatus, TaskPriority } from '../types/task';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

// ============================================
// TASK STATE HELPERS
// ============================================

/**
 * Check if task can be edited
 */
export const isTaskEditable = (task: Task): boolean => {
  return task.status !== 'Completed' && task.status !== 'Cancelled';
};

/**
 * Check if task can be started
 */
export const canStartTask = (task: Task): boolean => {
  return task.status === 'NotStarted';
};

/**
 * Check if task can be completed
 */
export const canCompleteTask = (task: Task): boolean => {
  return task.status === 'InProgress';
};

/**
 * Check if task can be blocked
 */
export const canBlockTask = (task: Task): boolean => {
  return task.status === 'InProgress';
};

/**
 * Check if task can be unblocked
 */
export const canUnblockTask = (task: Task): boolean => {
  return task.status === 'Blocked';
};

/**
 * Check if time can be logged
 */
export const canLogTime = (task: Task): boolean => {
  return task.status === 'InProgress' || task.status === 'Blocked';
};

/**
 * Check if task is overdue
 */
export const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'Completed' || task.status === 'Cancelled') {
    return false;
  }
  return new Date(task.dueDate) < new Date();
};

/**
 * Check if task is due soon (within 3 days)
 */
export const isTaskDueSoon = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'Completed' || task.status === 'Cancelled') {
    return false;
  }
  const dueDate = new Date(task.dueDate);
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  return dueDate >= new Date() && dueDate <= threeDaysFromNow;
};

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format date for display
 */
export const formatTaskDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format date and time for display
 */
export const formatTaskDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatTaskRelativeTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

// ============================================
// PROGRESS CALCULATION
// ============================================

/**
 * Calculate task progress percentage (0-100)
 */
export const calculateTaskProgress = (task: Task): number => {
  if (task.status === 'Completed') return 100;
  if (task.status === 'Cancelled') return 0;
  if (task.status === 'NotStarted') return 0;
  
  // If we have estimated and actual hours, calculate based on time
  if (task.estimatedHours && task.actualHours) {
    const progress = (task.actualHours / task.estimatedHours) * 100;
    return Math.min(progress, 99); // Cap at 99% until completed
  }
  
  // Otherwise, use status-based progress
  if (task.status === 'InProgress') return 50;
  if (task.status === 'Blocked') return 50;
  
  return 0;
};

/**
 * Get remaining hours
 */
export const getRemainingHours = (task: Task): number | null => {
  if (!task.estimatedHours || !task.actualHours) return null;
  return Math.max(0, task.estimatedHours - task.actualHours);
};

/**
 * Check if task is over budget
 */
export const isTaskOverBudget = (task: Task): boolean => {
  if (!task.estimatedHours || !task.actualHours) return false;
  return task.actualHours > task.estimatedHours;
};

// ============================================
// USER DISPLAY HELPERS
// ============================================

/**
 * Get user display name (fallback to email if no name)
 */
export const getUserDisplayName = (fullName?: string, email?: string): string => {
  if (fullName && fullName.trim()) return fullName;
  if (email) return email.split('@')[0];
  return 'Unknown User';
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (fullName?: string, email?: string): string => {
  if (fullName && fullName.trim()) {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return fullName[0].toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return '?';
};

// ============================================
// VALIDATION
// ============================================

/**
 * Validate task title
 */
export const validateTaskTitle = (title: string): string | null => {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.length > 200) {
    return 'Title must be less than 200 characters';
  }
  return null;
};

/**
 * Validate task description
 */
export const validateTaskDescription = (description: string): string | null => {
  if (!description || description.trim().length === 0) {
    return 'Description is required';
  }
  if (description.length > 2000) {
    return 'Description must be less than 2000 characters';
  }
  return null;
};

/**
 * Validate estimated hours
 */
export const validateEstimatedHours = (hours?: number): string | null => {
  if (hours === undefined || hours === null) return null;
  if (hours < 0) {
    return 'Estimated hours cannot be negative';
  }
  if (hours > 10000) {
    return 'Estimated hours seems too high';
  }
  return null;
};

/**
 * Validate blocked reason
 */
export const validateBlockedReason = (reason: string): string | null => {
  if (!reason || reason.trim().length === 0) {
    return 'Please provide a reason for blocking';
  }
  if (reason.length > 500) {
    return 'Reason must be less than 500 characters';
  }
  return null;
};
