// src/types/dashboard.ts

export interface DashboardStats {
  changeManagement: ChangeManagementStats;
  projectManagement: ProjectManagementStats;
  taskManagement: TaskManagementStats;
  recentActivity: RecentActivity;
}

export interface ChangeManagementStats {
  totalChanges: number;
  draftChanges: number;
  pendingApproval: number;
  approved: number;
  inProgress: number;
  completed: number;
  failed: number;
  successRate: number;
  scheduledToday: number;
}

export interface ProjectManagementStats {
  totalProjects: number;
  pendingRequests: number;
  activeProjects: number;
  onHoldProjects: number;
  completedProjects: number;
  overdueProjects: number;
  completionRate: number;
}

export interface TaskManagementStats {
  totalTasks: number;
  openTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  myTasks: number;
  dueToday: number;
  completionRate: number;
}

export interface RecentActivity {
  recentChanges: RecentChange[];
  recentProjects: RecentProject[];
  recentTasks: RecentTask[];
}

export interface RecentChange {
  id: string;
  title: string;
  status: string;
  createdDate: string;
}

export interface RecentProject {
  id: string;
  name: string;
  status: string;
  createdDate: string;
}

export interface RecentTask {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
}
