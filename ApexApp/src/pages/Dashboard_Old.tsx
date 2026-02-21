import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Assignment,
  FolderOpen,
  CheckCircle,
  Add,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp fontSize="small" color="success" />
              <Typography variant="caption" color="success.main" ml={0.5}>
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${color}15`,
            color: color,
            p: 2,
            borderRadius: 2,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myTasks: 0,
    activeProjects: 0,
    pendingRequests: 0,
    completedThisWeek: 0,
  });

  // TODO: Fetch real stats from API
  useEffect(() => {
    // Mock data for now
    setStats({
      myTasks: 8,
      activeProjects: 3,
      pendingRequests: 2,
      completedThisWeek: 5,
    });
  }, []);

  return (
    <>
      <title>Dashboard - APEX</title>
      <AppLayout>
      
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your projects today.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Tasks"
            value={stats.myTasks}
            icon={<CheckCircle sx={{ fontSize: 32 }} />}
            color="#4A90E2"
            trend="+12% from last week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={<FolderOpen sx={{ fontSize: 32 }} />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={<Assignment sx={{ fontSize: 32 }} />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed This Week"
            value={stats.completedThisWeek}
            icon={<CheckCircle sx={{ fontSize: 32 }} />}
            color="#2E5090"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                onClick={() => navigate('/project-requests')}
              >
                New Project Request
              </Button>
              <Button
                variant="outlined"
                startIcon={<CheckCircle />}
                fullWidth
                onClick={() => navigate('/tasks')}
              >
                View My Tasks
              </Button>
              <Button
                variant="outlined"
                startIcon={<FolderOpen />}
                fullWidth
                onClick={() => navigate('/projects')}
              >
                View Projects
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Security Audit Implementation"
                  secondary="Project approved - 2 hours ago"
                />
                <Chip label="Approved" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Code review security vulnerabilities"
                  secondary="Task started - 4 hours ago"
                />
                <Chip label="In Progress" color="primary" size="small" />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Database Migration Request"
                  secondary="Request submitted - Yesterday"
                />
                <Chip label="Pending" color="warning" size="small" />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="API Integration Task"
                  secondary="Task completed - 2 days ago"
                />
                <Chip label="Completed" color="default" size="small" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </AppLayout>
    </>
  );
}
