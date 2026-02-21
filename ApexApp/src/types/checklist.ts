/**
 * Task Checklist Types
 */

export interface ChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  order: number;
  completedByUserId?: string;
  completedDate?: string;
  createdDate: string;
}

export interface AddChecklistItemRequest {
  description: string;
  order: number;
}

export interface AddChecklistItemResponse {
  itemId: string;
}
