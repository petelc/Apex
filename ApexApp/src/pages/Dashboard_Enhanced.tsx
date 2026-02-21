import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  Avatar,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assignment,
  FolderOpen,
  CheckCircle,
  Schedule,
  MoreVert,
  ArrowForward,
} from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down';
}

const StatCard = ({ title, value, change, icon, color, trend = 'up' }: StatCardProps) => {
  const theme = useTheme();
  const isPositive = trend === 'up';

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color as keyof typeof theme.palette].main, 0.1)} 0%, transparent 100%)`,
        border: `1px solid ${alpha(theme.palette[color as keyof typeof theme.palette].main, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(theme.palette[color as keyof typeof theme.palette].main, 0.2)}`,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.palette[color as keyof typeof theme.palette].main} 0%, ${theme.palette[color as keyof typeof theme.palette].dark} 100%)`,
              boxShadow: `0 4px 12px ${alpha(theme.palette[color as keyof typeof theme.palette].main, 0.3)}`,
            }}
          >
            {icon}
          </Box>
          <IconButton size="small">
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isPositive ? (
            <TrendingUp fontSize="small" color="success" />
          ) : (
            <TrendingDown fontSize="small" color="error" />
          )}
          <Typography
            variant="body2"
            color={isPositive ? 'success.main' : 'error.main'}
            fontWeight={600}
          >
            {change > 0 ? '+' : ''}{change}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            vs last month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

interface RecentActivityItem {
  id: string;
  title: string;
  type: 'request' | 'project' | 'task';
  status: string;
  time: string;
  assignee?: string;
}

const ActivityCard = ({ activity }: { activity: RecentActivityItem }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'request':
        return <Assignment fontSize="small" />;
      case 'project':
        return <FolderOpen fontSize="small" />;
      case 'task':
        return <CheckCircle fontSize="small" />;
    }
  };

  const getColor = () => {
    switch (activity.type) {
      case 'request':
        return 'primary';
      case 'project':
        return 'secondary';
      case 'task':
        return 'success';
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Avatar
          sx={{
            bgcolor: `${getColor()}.main`,
            width: 40,
            height: 40,
          }}
        >
          {getIcon()}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {activity.title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={activity.status}
              size="small"
              color={getColor() as any}
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
            <Typography variant="caption" color="text.secondary">
              {activity.time}
            </Typography>
          </Stack>
        </Box>

        <ArrowForward fontSize="small" sx={{ color: 'text.secondary', opacity: 0.5 }} />
      </Box>
    </Box>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real API calls
  const stats = [
    {
      title: 'Total Requests',
      value: 24,
      change: 12,
      icon: <Assignment sx={{ fontSize: 28, color: 'white' }} />,
      color: 'primary',
      trend: 'up' as const,
    },
    {
      title: 'Active Projects',
      value: 8,
      change: 8,
      icon: <FolderOpen sx={{ fontSize: 28, color: 'white' }} />,
      color: 'secondary',
      trend: 'up' as const,
    },
    {
      title: 'Completed Tasks',
      value: 156,
      change: 23,
      icon: <CheckCircle sx={{ fontSize: 28, color: 'white' }} />,
      color: 'success',
      trend: 'up' as const,
    },
    {
      title: 'Pending Items',
      value: 12,
      change: -5,
      icon: <Schedule sx={{ fontSize: 28, color: 'white' }} />,
      color: 'warning',
      trend: 'down' as const,
    },
  ];

  const recentActivity: RecentActivityItem[] = [
    {
      id: '1',
      title: 'New website redesign request submitted',
      type: 'request',
      status: 'Pending',
      time: '2 hours ago',
    },
    {
      id: '2',
      title: 'Mobile app development started',
      type: 'project',
      status: 'In Progress',
      time: '5 hours ago',
    },
    {
      id: '3',
      title: 'Database migration completed',
      type: 'task',
      status: 'Completed',
      time: '1 day ago',
    },
    {
      id: '4',
      title: 'Marketing campaign request approved',
      type: 'request',
      status: 'Approved',
      time: '2 days ago',
    },
    {
      id: '5',
      title: 'API integration task assigned',
      type: 'task',
      status: 'In Progress',
      time: '3 days ago',
    },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <>
        <title>Dashboard - APEX</title>
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
      <title>Dashboard - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back! Here's what's happening with your projects.
            </Typography>
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>

          {/* Content Grid */}
          <Grid container spacing={3}>
            {/* Recent Activity */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Recent Activity
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ cursor: 'pointer', fontWeight: 500 }}
                    >
                      View all
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    {recentActivity.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Quick Actions
                  </Typography>

                  <Stack spacing={2} sx={{ mt: 3 }}>
                    <Box
                      onClick={() => navigate('/project-requests')}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 100%)`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Assignment />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            New Request
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Submit a project request
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box
                      onClick={() => navigate('/projects')}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 100%)`,
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          borderColor: theme.palette.secondary.main,
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <FolderOpen />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            View Projects
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            See all active projects
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Progress Card */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    This Month
                  </Typography>

                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Tasks Completed</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          75%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={75}
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

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Projects On Track</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          88%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={88}
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
                        <Typography variant="body2">Team Utilization</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          92%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={92}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: 'linear-gradient(90deg, #7C4DFF 0%, #5E35B1 100%)',
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </AppLayout>
    </>
  );
}
