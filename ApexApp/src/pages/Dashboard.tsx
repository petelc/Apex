// src/pages/Dashboard.tsx

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Refresh,
  ChangeCircle,
  Folder,
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  TrendingUp,
  PendingActions,
} from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { dashboardApi } from '@/api/dashboard';
import { getErrorMessage } from '@/api/client';
import type { DashboardStats } from '@/types/dashboard';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadStats();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </AppLayout>
    );
  }

  if (!stats) return null;

  // Prepare recent activity data
  const recentChanges = stats.recentActivity.recentChanges.map((change) => ({
    id: change.id,
    title: change.title,
    status: change.status,
    date: change.createdDate,
    type: 'change' as const,
  }));

  const recentProjects = stats.recentActivity.recentProjects.map((project) => ({
    id: project.id,
    title: project.name,
    status: project.status,
    date: project.createdDate,
    type: 'project' as const,
  }));

  const recentTasks = stats.recentActivity.recentTasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    date: task.dueDate || new Date().toISOString(),
    type: 'task' as const,
  }));

  return (
    <AppLayout>
      <title>Dashboard - APEX</title>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of your work management system
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} disabled={refreshing}>
          <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </IconButton>
      </Box>

      {/* Change Management Stats */}
      <Box mb={4}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Change Management
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="Total Changes"
              value={stats.changeManagement.totalChanges}
              icon={<ChangeCircle />}
              color="primary"
              subtitle={`${stats.changeManagement.scheduledToday} scheduled today`}
            />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="Pending Approval"
              value={stats.changeManagement.pendingApproval}
              icon={<PendingActions />}
              color="warning"
              subtitle={`${stats.changeManagement.draftChanges} drafts`}
            />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="In Progress"
              value={stats.changeManagement.inProgress}
              icon={<Schedule />}
              color="info"
              subtitle={`${stats.changeManagement.approved} approved`}
            />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="Success Rate"
              value={`${stats.changeManagement.successRate}%`}
              icon={<TrendingUp />}
              color="success"
              progress={stats.changeManagement.successRate}
              subtitle={`${stats.changeManagement.completed} completed, ${stats.changeManagement.failed} failed`}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Project Management Stats */}
      <Box mb={4}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Project Management
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="Total Projects"
              value={stats.projectManagement.totalProjects}
              icon={<Folder />}
              color="primary"
              subtitle={`${stats.projectManagement.pendingRequests} pending requests`}
            />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="Active Projects"
              value={stats.projectManagement.activeProjects}
              icon={<Schedule />}
              color="info"
              subtitle={`${stats.projectManagement.onHoldProjects} on hold`}
            />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="Overdue Projects"
              value={stats.projectManagement.overdueProjects}
              icon={<Warning />}
              color="error"
              subtitle="Need attention"
            />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="Completion Rate"
              value={`${stats.projectManagement.completionRate}%`}
              icon={<CheckCircle />}
              color="success"
              progress={stats.projectManagement.completionRate}
              subtitle={`${stats.projectManagement.completedProjects} completed`}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Task Management Stats */}
      <Box mb={4}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Task Management
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="My Tasks"
              value={stats.taskManagement.myTasks}
              icon={<Assignment />}
              color="primary"
              subtitle={`${stats.taskManagement.dueToday} due today`}
            />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="Open Tasks"
              value={stats.taskManagement.openTasks}
              icon={<PendingActions />}
              color="warning"
              subtitle={`${stats.taskManagement.totalTasks} total`}
            />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="Overdue Tasks"
              value={stats.taskManagement.overdueTasks}
              icon={<Warning />}
              color="error"
              subtitle="Need attention"
            />
          </Grid>
          <Grid size={{xs:12, sm:6, md:3}} >
            <StatCard
              title="Completion Rate"
              value={`${stats.taskManagement.completionRate}%`}
              icon={<CheckCircle />}
              color="success"
              progress={stats.taskManagement.completionRate}
              subtitle={`${stats.taskManagement.completedTasks} completed`}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Box mb={4}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recent Activity
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{xs:12, md:4}}>
            <RecentActivityList
              title="Recent Changes"
              items={recentChanges}
              emptyMessage="No recent changes"
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <RecentActivityList
              title="Recent Projects"
              items={recentProjects}
              emptyMessage="No recent projects"
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <RecentActivityList
              title="Recent Tasks"
              items={recentTasks}
              emptyMessage="No recent tasks"
            />
          </Grid>
        </Grid>
      </Box>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </AppLayout>
  );
}
