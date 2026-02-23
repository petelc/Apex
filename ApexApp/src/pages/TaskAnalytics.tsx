import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  LinearProgress,
  Alert,
  Stack,
  TextField,
  Divider,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Assignment,
  CheckCircle,
  Block,
  Refresh,
  Download,
  Schedule,
} from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import tasksApi, { type TaskMetrics } from '@/api/tasks';
import { getErrorMessage } from '@/api/client';

export default function TaskAnalyticsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await tasksApi.getMetrics(start, end);
      setMetrics(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => loadMetrics(startDate || undefined, endDate || undefined);
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    loadMetrics();
  };

  const handleExportCsv = () => {
    if (!metrics) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Tasks', metrics.totalTasks],
      ['Not Started', metrics.notStartedTasks],
      ['In Progress', metrics.inProgressTasks],
      ['Blocked', metrics.blockedTasks],
      ['Completed', metrics.completedTasks],
      ['Cancelled', metrics.cancelledTasks],
      ['Overdue', metrics.overdueTasks],
      ['Completion Rate (%)', metrics.completionRate],
      ['Blocked Rate (%)', metrics.blockedRate],
      ['On-Time Completion Rate (%)', metrics.onTimeCompletionRate],
      ['Avg Estimated Hours', metrics.averageEstimatedHours],
      ['Avg Actual Hours', metrics.averageActualHours],
      ['Avg Hours Variance', metrics.averageHoursVariance],
      ['Assigned to User', metrics.assignedToUserTasks],
      ['Assigned to Department', metrics.assignedToDepartmentTasks],
      ['Unassigned', metrics.unassignedTasks],
      ['Priority: Low', metrics.byPriority.low],
      ['Priority: Medium', metrics.byPriority.medium],
      ['Priority: High', metrics.byPriority.high],
      ['Priority: Urgent', metrics.byPriority.urgent],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !metrics) {
    return (
      <AppLayout>
        <Box sx={{ width: '100%' }}><LinearProgress /></Box>
      </AppLayout>
    );
  }

  const kpiColor = (main: string) => ({
    background: `linear-gradient(135deg, ${alpha(main, 0.1)} 0%, transparent 100%)`,
    border: `1px solid ${alpha(main, 0.2)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 8px 24px ${alpha(main, 0.2)}`,
    },
  });

  return (
    <>
      <title>Task Analytics - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/tasks')} sx={{ mb: 2 }}>
              Back to Tasks
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Task Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion rates, time tracking, and assignment distribution
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleExportCsv}
                  disabled={!metrics}
                  size="small"
                >
                  Export CSV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => loadMetrics(startDate || undefined, endDate || undefined)}
                  disabled={loading}
                  size="small"
                >
                  Refresh
                </Button>
              </Stack>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Date Filters */}
          <Card sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Date Range Filter
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Start Date" type="date" size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  sx={{ width: 200 }}
                />
                <TextField
                  label="End Date" type="date" size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  sx={{ width: 200 }}
                />
                <Button variant="contained" onClick={handleApplyFilters} disabled={loading} size="small">
                  Apply
                </Button>
                {(startDate || endDate) && (
                  <Button variant="outlined" onClick={handleClearFilters} disabled={loading} size="small">
                    Clear
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>

          {metrics && (
            <>
              {/* KPI Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card sx={kpiColor(theme.palette.primary.main)}>
                    <CardContent>
                      <Assignment sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">Total Tasks</Typography>
                      <Typography variant="h4" fontWeight={700}>{metrics.totalTasks}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metrics.overdueTasks} overdue
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card sx={kpiColor(theme.palette.success.main)}>
                    <CardContent>
                      <CheckCircle sx={{ fontSize: 36, color: 'success.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {metrics.completionRate}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metrics.completedTasks} completed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card sx={kpiColor(theme.palette.info.main)}>
                    <CardContent>
                      <Schedule sx={{ fontSize: 36, color: 'info.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">On-Time Rate</Typography>
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {metrics.onTimeCompletionRate}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        of completed tasks
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card sx={kpiColor(theme.palette.error.main)}>
                    <CardContent>
                      <Block sx={{ fontSize: 36, color: 'error.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">Blocked Rate</Typography>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {metrics.blockedRate}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metrics.blockedTasks} currently blocked
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                {/* Status Breakdown */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Status Breakdown
                      </Typography>
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        {[
                          { label: 'Not Started', count: metrics.notStartedTasks, color: theme.palette.text.secondary },
                          { label: 'In Progress', count: metrics.inProgressTasks, color: theme.palette.info.main },
                          { label: 'Blocked', count: metrics.blockedTasks, color: theme.palette.error.main },
                          { label: 'Completed', count: metrics.completedTasks, color: theme.palette.success.main },
                          { label: 'Cancelled', count: metrics.cancelledTasks, color: theme.palette.warning.main },
                        ].map(({ label, count, color }) => (
                          <Box key={label}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{label}</Typography>
                              <Typography variant="body2" fontWeight={600}>{count}</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={metrics.totalTasks > 0 ? (count / metrics.totalTasks) * 100 : 0}
                              sx={{
                                height: 8, borderRadius: 4,
                                '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: color },
                              }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Time Tracking */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Time Tracking
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Avg Estimated Hours
                          </Typography>
                          <Typography variant="h5" fontWeight={700}>
                            {metrics.averageEstimatedHours}h
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Avg Actual Hours
                          </Typography>
                          <Typography variant="h5" fontWeight={700}>
                            {metrics.averageActualHours}h
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Avg Hours Variance
                          </Typography>
                          <Typography
                            variant="h5" fontWeight={700}
                            color={metrics.averageHoursVariance > 0 ? 'error.main' : 'success.main'}
                          >
                            {metrics.averageHoursVariance > 0 ? '+' : ''}{metrics.averageHoursVariance}h
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {metrics.averageHoursVariance > 0 ? 'over estimate on average' : 'under estimate on average'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Assignment + Priority */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={3} sx={{ height: '100%' }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Assignment Distribution
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={1}>
                          {[
                            { label: 'Assigned to User', count: metrics.assignedToUserTasks },
                            { label: 'Assigned to Department', count: metrics.assignedToDepartmentTasks },
                            { label: 'Unassigned', count: metrics.unassignedTasks },
                          ].map(({ label, count }) => (
                            <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">{label}</Typography>
                              <Typography variant="body2" fontWeight={600}>{count}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          By Priority
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {[
                            { label: 'Low', count: metrics.byPriority.low, color: 'default' as const },
                            { label: 'Medium', count: metrics.byPriority.medium, color: 'primary' as const },
                            { label: 'High', count: metrics.byPriority.high, color: 'warning' as const },
                            { label: 'Urgent', count: metrics.byPriority.urgent, color: 'error' as const },
                          ].map(({ label, count, color }) => (
                            <Chip
                              key={label}
                              label={`${label}: ${count}`}
                              color={color}
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </AppLayout>
    </>
  );
}