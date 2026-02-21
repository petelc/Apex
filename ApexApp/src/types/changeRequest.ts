/**
 * Change Request Types for APEX
 */

export type ChangeRequestStatus =
  | 'Draft'
  | 'UnderReview'
  | 'Approved'
  | 'Denied'
  | 'Scheduled'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'RolledBack'
  | 'Cancelled';

export type ChangeType = 'Standard' | 'Normal' | 'Emergency';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  changeType: ChangeType;
  priority: Priority;
  riskLevel: RiskLevel;
  status: ChangeRequestStatus;
  
  // Requirements
  impactAssessment: string;
  rollbackPlan: string;
  affectedSystems: string;
  
  // CAB Review
  requiresCABApproval: boolean;
  submittedDate?: string;
  approvedDate?: string;
  approvedByUserId?: string;
  approvalNotes?: string;
  deniedDate?: string;
  reviewedByUserId?: string;
  denialReason?: string;
  
  // Scheduling
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  changeWindow?: string;
  
  // Execution
  actualStartDate?: string;
  actualEndDate?: string;
  implementationNotes?: string;
  completedDate?: string;
  
  // Rollback
  rolledBackDate?: string;
  rollbackReason?: string;
  
  // Audit
  tenantId: string;
  createdByUserId: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface CreateChangeRequestDto {
  title: string;
  description: string;
  changeType: ChangeType;
  priority: Priority;
  riskLevel: RiskLevel;
  impactAssessment: string;
  rollbackPlan: string;
  affectedSystems: string;
}

export interface UpdateChangeRequestDto {
  title?: string;
  description?: string;
  changeType?: ChangeType;
  priority?: Priority;
  riskLevel?: RiskLevel;
  impactAssessment?: string;
  rollbackPlan?: string;
  affectedSystems?: string;
}

export interface ApproveChangeRequestDto {
  notes: string;
}

export interface DenyChangeRequestDto {
  reason: string;
}

export interface ScheduleChangeRequestDto {
  scheduledStartDate: string;
  scheduledEndDate: string;
  changeWindow: string;
}

export interface CompleteChangeRequestDto {
  notes: string;
}

export interface RollbackChangeRequestDto {
  reason: string;
}

// Analytics Types
export interface ChangeMetrics {
  totalChanges: number;
  completedChanges: number;
  failedChanges: number;
  rolledBackChanges: number;
  inProgressChanges: number;
  scheduledChanges: number;
  pendingApprovalChanges: number;
  
  successRate: number;
  rollbackRate: number;
  approvalRate: number;
  
  averageCompletionTimeHours: number;
  averageApprovalTimeHours: number;
  
  byType: {
    standard: number;
    normal: number;
    emergency: number;
  };
  
  byRisk: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface SuccessRateData {
  totalChanges: number;
  successfulChanges: number;
  failedChanges: number;
  rolledBackChanges: number;
  
  successPercentage: number;
  failurePercentage: number;
  rollbackPercentage: number;
  
  byType: {
    standard: TypeSuccessRate;
    normal: TypeSuccessRate;
    emergency: TypeSuccessRate;
  };
}

export interface TypeSuccessRate {
  total: number;
  successful: number;
  failed: number;
  successPercentage: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  monthName: string;
  totalChanges: number;
  completed: number;
  failed: number;
  rolledBack: number;
  successRate: number;
  averageCompletionTimeHours: number;
}

export interface TopAffectedSystem {
  systemName: string;
  changeCount: number;
  successfulChanges: number;
  failedChanges: number;
  successRate: number;
  lastChangeDate: string;
}

// Filter types for list page
export interface ChangeRequestFilters {
  status?: ChangeRequestStatus[];
  changeType?: ChangeType[];
  priority?: Priority[];
  riskLevel?: RiskLevel[];
  startDate?: string;
  endDate?: string;
  search?: string;
}
