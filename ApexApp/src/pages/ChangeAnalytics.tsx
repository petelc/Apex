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
  alpha,
  useTheme,
  TextField,
} from '@mui/material';
import { ArrowBack, TrendingUp, CheckCircle, Schedule, Refresh } from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { SuccessRatePieChart } from '@/components/change-requests/analytics/SuccessRatePieChart';
import { MonthlyTrendsChart } from '@/components/change-requests/analytics/MonthlyTrendsChart';
import { TopSystemsChart } from '@/components/change-requests/analytics/TopSystemsChart';
import { changeRequestApi } from '@/api/changeRequests';
import { getErrorMessage } from '@/api/client';
import type { ChangeMetrics, SuccessRateData, MonthlyTrend, TopAffectedSystem } from '@/types/changeRequest';

/**
 * Change Management Analytics Dashboard
 */
export default function ChangeAnalyticsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [metrics, setMetrics] = useState<ChangeMetrics | null>(null);
  const [successRate, setSuccessRate] = useState<SuccessRateData | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [topSystems, setTopSystems] = useState<TopAffectedSystem[]>([]);
  
  // Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async (filterStartDate?: string, filterEndDate?: string) => {
    try {
      setLoading(true);
      setError('');

      // Load all analytics data in parallel
      const [metricsData, successData, trendsData, systemsData] = await Promise.all([
        changeRequestApi.getMetrics(filterStartDate, filterEndDate),
        changeRequestApi.getSuccessRate(filterStartDate, filterEndDate),
        changeRequestApi.getMonthlyTrends(12),
        changeRequestApi.getTopSystems(10, filterStartDate, filterEndDate),
      ]);

      setMetrics(metricsData);
      setSuccessRate(successData);
      setTrends(trendsData.months);
      setTopSystems(systemsData.systems);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadAnalytics(startDate || undefined, endDate || undefined);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    loadAnalytics();
  };

  if (loading && !metrics) {
    return (
      <>
        <title>Change Analytics - APEX</title>
        <AppLayout>
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <title>Change Analytics - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/change-requests')}
              sx={{ mb: 2 }}
            >
              Back to Change Requests
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Change Management Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Insights and trends for change requests
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => loadAnalytics(startDate || undefined, endDate || undefined)}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Date Range Filters */}
          <Card
            sx={{
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.05
              )} 0%, transparent 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Date Range Filter
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Start Date"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  sx={{ width: 200 }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  sx={{ width: 200 }}
                />
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  disabled={loading}
                  size="small"
                >
                  Apply
                </Button>
                {(startDate || endDate) && (
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    disabled={loading}
                    size="small"
                  >
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
                {/* Total Changes */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card
                    sx={{
                      height: '100%',
                      background: `linear-gradient(135deg, ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )} 0%, transparent 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                          mb: 2,
                        }}
                      >
                        <TrendingUp sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Changes
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {metrics.totalChanges}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Success Rate */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card
                    sx={{
                      height: '100%',
                      background: `linear-gradient(135deg, ${alpha(
                        theme.palette.success.main,
                        0.1
                      )} 0%, transparent 100%)`,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.2)}`,
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                          mb: 2,
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Success Rate
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {metrics.successRate.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Average Completion Time */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card
                    sx={{
                      height: '100%',
                      background: `linear-gradient(135deg, ${alpha(
                        theme.palette.info.main,
                        0.1
                      )} 0%, transparent 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.2)}`,
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`,
                          mb: 2,
                        }}
                      >
                        <Schedule sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Avg Completion Time
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {metrics.averageCompletionTimeHours.toFixed(1)}h
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* In Progress */}
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card
                    sx={{
                      height: '100%',
                      background: `linear-gradient(135deg, ${alpha(
                        theme.palette.warning.main,
                        0.1
                      )} 0%, transparent 100%)`,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.2)}`,
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
                          mb: 2,
                        }}
                      >
                        <TrendingUp sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        In Progress
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {metrics.inProgressChanges}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts Row 1 */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Success Rate Pie Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      {successRate && <SuccessRatePieChart data={successRate} />}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Type Distribution */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Changes by Type
                      </Typography>
                      <Box sx={{ mt: 3 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Standard</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {metrics.byType.standard}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(metrics.byType.standard / metrics.totalChanges) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  background: 'linear-gradient(90deg, #66BB6A 0%, #4CAF50 100%)',
                                },
                              }}
                            />
                          </Box>

                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Normal</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {metrics.byType.normal}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(metrics.byType.normal / metrics.totalChanges) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  background: 'linear-gradient(90deg, #4A90E2 0%, #2E5090 100%)',
                                },
                              }}
                            />
                          </Box>

                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Emergency</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {metrics.byType.emergency}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(metrics.byType.emergency / metrics.totalChanges) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  background: 'linear-gradient(90deg, #f44336 0%, #d32f2f 100%)',
                                },
                              }}
                            />
                          </Box>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts Row 2 */}
              <Grid container spacing={3}>
                {/* Monthly Trends */}
                <Grid size={{ xs: 12 }}>
                  <Card>
                    <CardContent>
                      <MonthlyTrendsChart data={trends} />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Top Systems */}
                <Grid size={{ xs: 12 }}>
                  <Card>
                    <CardContent>
                      <TopSystemsChart data={topSystems} />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </AppLayout>
    </>
  );
}
