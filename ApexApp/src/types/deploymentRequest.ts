export type DeploymentRequestStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'Approved'
  | 'Rejected'
  | 'Scheduled'
  | 'InProgress'
  | 'Deployed'
  | 'Failed'
  | 'RolledBack'
  | 'Cancelled';

export type DeploymentEnvironment = 'Development' | 'Staging' | 'UAT' | 'Production';

export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface DeploymentRequest {
  id: string;
  title: string;
  description: string;
  status: DeploymentRequestStatus;
  priority: RequestPriority;
  riskLevel: RiskLevel;
  environment: DeploymentEnvironment;
  affectedSystems: string;
  rollbackPlan: string;
  deploymentNotes?: string;
  deploymentWindow?: string;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  createdByUserId: string;
  createdByUserName?: string;
  approvedByUserId?: string;
  approvedByUserName?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  failureReason?: string;
  rollbackReason?: string;
  projectId?: string;
  changeRequestId?: string;
  createdDate: string;
  submittedDate?: string;
  approvedDate?: string;
  rejectedDate?: string;
  scheduledDate?: string;
  startedDate?: string;
  deployedDate?: string;
  failedDate?: string;
  rolledBackDate?: string;
  isOverdue: boolean;
}

export interface DeploymentRequestListItem {
  id: string;
  title: string;
  status: DeploymentRequestStatus;
  priority: RequestPriority;
  riskLevel: RiskLevel;
  environment: DeploymentEnvironment;
  scheduledStartDate?: string;
  deployedDate?: string;
  createdByUserId: string;
  createdByUserName?: string;
  createdDate: string;
  isOverdue: boolean;
}

export interface CreateDeploymentRequestDto {
  title: string;
  description: string;
  priority: RequestPriority;
  riskLevel: RiskLevel;
  environment: DeploymentEnvironment;
  affectedSystems: string;
  rollbackPlan: string;
  projectId?: string;
  changeRequestId?: string;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  deploymentWindow?: string;
}
