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
  Folder,
  CheckCircle,
  Schedule,
  Warning,
  Refresh,
  Download,
} from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { projectApi, type ProjectMetrics } from '@/api/projects';
import { getErrorMessage } from '@/api/client';

export default function ProjectAnalyticsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await projectApi.getMetrics(start, end);
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
      ['Total Projects', metrics.totalProjects],
      ['Planning', metrics.planningProjects],
      ['Active', metrics.activeProjects],
      ['On Hold', metrics.onHoldProjects],
      ['Completed', metrics.completedProjects],
      ['Cancelled', metrics.cancelledProjects],
      ['Overdue', metrics.overdueProjects],
      ['Completion Rate (%)', metrics.completionRate],
      ['Active Rate (%)', metrics.activeRate],
      ['Cancellation Rate (%)', metrics.cancellationRate],
      ['On-Time Completion Rate (%)', metrics.onTimeCompletionRate],
      ['Avg Planned Duration (days)', metrics.averagePlannedDurationDays],
      ['Avg Actual Duration (days)', metrics.averageActualDurationDays],
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
    a.download = `project-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
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
      <title>Project Analytics - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/projects')} sx={{ mb: 2 }}>
              Back to Projects
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Project Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Performance metrics and trends across all projects
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
                      <Folder sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">Total Projects</Typography>
                      <Typography variant="h4" fontWeight={700}>{metrics.totalProjects}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metrics.overdueProjects} overdue
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
                        {metrics.completedProjects} completed
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
                        of completed projects
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card sx={kpiColor(theme.palette.warning.main)}>
                    <CardContent>
                      <Warning sx={{ fontSize: 36, color: 'warning.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">Overdue</Typography>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {metrics.overdueProjects}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        need attention
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                {/* Status Breakdown */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Status Breakdown
                      </Typography>
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        {[
                          { label: 'Planning', count: metrics.planningProjects, color: theme.palette.info.main },
                          { label: 'Active', count: metrics.activeProjects, color: theme.palette.success.main },
                          { label: 'On Hold', count: metrics.onHoldProjects, color: theme.palette.warning.main },
                          { label: 'Completed', count: metrics.completedProjects, color: theme.palette.primary.main },
                          { label: 'Cancelled', count: metrics.cancelledProjects, color: theme.palette.error.main },
                        ].map(({ label, count, color }) => (
                          <Box key={label}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{label}</Typography>
                              <Typography variant="body2" fontWeight={600}>{count}</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={metrics.totalProjects > 0 ? (count / metrics.totalProjects) * 100 : 0}
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

                {/* Duration + Priority */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={3} sx={{ height: '100%' }}>
                    {/* Duration metrics */}
                    <Card>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Duration Metrics
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">Avg Planned</Typography>
                            <Typography variant="h5" fontWeight={700}>
                              {metrics.averagePlannedDurationDays}d
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">Avg Actual</Typography>
                            <Typography
                              variant="h5" fontWeight={700}
                              color={metrics.averageActualDurationDays > metrics.averagePlannedDurationDays ? 'error.main' : 'success.main'}
                            >
                              {metrics.averageActualDurationDays}d
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Priority breakdown */}
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