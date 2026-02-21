import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  CheckCircle,
  Pause,
  Cancel as CancelIcon,
  MoreVert,
  Assignment,
  Add,
  PersonAdd,
} from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AssignProjectManagerDialog } from '@/components/project/AssignProjectManagerDialog';
import { projectApi } from '@/api/projects';
import tasksApi from '@/api/tasks';
import { getErrorMessage } from '@/api/client';
import type { Project, Task } from '@/types/project';
import { format, differenceInDays } from 'date-fns';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Assign PM Dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Action Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (id) {
      loadProject();
      loadTasks();
    }
  }, [id]);

  const loadProject = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await projectApi.getById(id);
      setProject(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!id) return;

    try {
      const data = await tasksApi.getProjectTasks(id);
      console.log('Tasks API response:', data); // ← Add this to debug
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
  };

  const handleAssignSuccess = async () => {
    handleActionClose();
    await loadProject();
  };

  const handleStart = async () => {
    if (!project) return;

    try {
      setActionLoading(true);
      await projectApi.start(project.id);
      handleActionClose();
      await loadProject();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!project) return;

    try {
      setActionLoading(true);
      await projectApi.complete(project.id);
      handleActionClose();
      await loadProject();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleHold = async () => {
    if (!project) return;

    const reason = prompt('Enter reason for putting project on hold:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await projectApi.hold(project.id, reason);
      handleActionClose();
      await loadProject();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!project) return;

    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await projectApi.cancel(project.id, reason);
      handleActionClose();
      await loadProject();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const calculateProgress = () => {
    // ✅ Add safety check
    if (!tasks || !Array.isArray(tasks)) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    const percentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { completed: completedTasks, total: totalTasks, percentage };
  };

  const getDaysRemaining = () => {
    if (!project?.endDate) return null;
    return differenceInDays(new Date(project.endDate), new Date());
  };

  if (loading) {
    return (
      <AppLayout>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='60vh'
        >
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error && !project) {
    return (
      <AppLayout>
        <Alert severity='error'>{error}</Alert>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <Alert severity='error'>Project not found</Alert>
      </AppLayout>
    );
  }

  const progress = calculateProgress();
  const daysRemaining = getDaysRemaining();

  return (
    <>
      <title>{project.name} - Project - APEX</title>
      <AppLayout>
        {/* Header */}
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='flex-start'
          mb={3}
        >
          <Box flex={1}>
            <Box display='flex' alignItems='center' gap={2} mb={1}>
              <IconButton onClick={() => navigate('/projects')}>
                <ArrowBack />
              </IconButton>
              <Typography variant='h4' fontWeight={700}>
                {project.name}
              </Typography>
            </Box>
            <Box display='flex' alignItems='center' gap={1} ml={7}>
              <StatusBadge status={project.status} size='small' />
              <Chip
                label={project.priority}
                size='small'
                color={
                  project.priority === 'Urgent'
                    ? 'error'
                    : project.priority === 'High'
                      ? 'warning'
                      : 'default'
                }
              />
              {project.isOverdue && (
                <Chip label='Overdue' size='small' color='error' />
              )}
            </Box>
          </Box>

          <IconButton onClick={handleActionClick} disabled={actionLoading}>
            <MoreVert />
          </IconButton>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Progress Overview */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Progress
                </Typography>
                <Box display='flex' alignItems='baseline' gap={1}>
                  <Typography variant='h4' fontWeight={700}>
                    {progress.percentage}%
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    complete
                  </Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={progress.percentage}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Tasks
                </Typography>
                <Box display='flex' alignItems='baseline' gap={1}>
                  <Typography variant='h4' fontWeight={700}>
                    {progress.completed}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    / {progress.total}
                  </Typography>
                </Box>
                <Typography variant='caption' color='text.secondary'>
                  Completed
                </Typography>
              </Grid>

              {project.budget && (
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Budget
                  </Typography>
                  <Typography variant='h4' fontWeight={700}>
                    ${project.budget.toLocaleString()}
                  </Typography>
                </Grid>
              )}

              {daysRemaining !== null && (
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Time Remaining
                  </Typography>
                  <Typography
                    variant='h4'
                    fontWeight={700}
                    color={daysRemaining < 0 ? 'error' : 'inherit'}
                  >
                    {Math.abs(daysRemaining)} days
                  </Typography>
                  {daysRemaining < 0 && (
                    <Typography variant='caption' color='error'>
                      Overdue
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Description */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h6' fontWeight={600} gutterBottom>
                  Description
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  {project.description}
                </Typography>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardContent>
                <Box
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  mb={2}
                >
                  <Typography variant='h6' fontWeight={600}>
                    Tasks ({tasks.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={<Add />}
                    onClick={() => navigate(`/projects/${id}/tasks`)}
                  >
                    View All
                  </Button>
                </Box>

                {tasks.length === 0 ? (
                  <Box textAlign='center' py={4}>
                    <Assignment
                      sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
                    />
                    <Typography variant='body2' color='text.secondary'>
                      No tasks yet
                    </Typography>
                    <Button
                      size='small'
                      startIcon={<Add />}
                      onClick={() => navigate(`/projects/${id}/tasks`)}
                      sx={{ mt: 2 }}
                    >
                      Create Task
                    </Button>
                  </Box>
                ) : (
                  <List disablePadding>
                    {tasks.slice(0, 5).map((task, index) => (
                      <ListItem
                        key={task.id}
                        divider={index < Math.min(tasks.length, 5) - 1}
                        sx={{ px: 0 }}
                      >
                        <ListItemText
                          primary={
                            <Box display='flex' alignItems='center' gap={1}>
                              <Typography variant='body1'>
                                {task.title}
                              </Typography>
                              <StatusBadge status={task.status} size='small' />
                            </Box>
                          }
                          secondary={
                            task.assignedToUser
                              ? `Assigned to ${task.assignedToUser.fullName}`
                              : 'Unassigned'
                          }
                        />
                      </ListItem>
                    ))}
                    {tasks.length > 5 && (
                      <ListItem sx={{ px: 0, justifyContent: 'center' }}>
                        <Button
                          size='small'
                          onClick={() => navigate(`/projects/${id}/tasks`)}
                        >
                          View all {tasks.length} tasks
                        </Button>
                      </ListItem>
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Project Manager */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  mb={1}
                >
                  <Typography variant='subtitle2' color='text.secondary'>
                    Project Manager
                  </Typography>
                  <IconButton
                    size='small'
                    onClick={() => setAssignDialogOpen(true)}
                    title={project.projectManagerUser ? 'Reassign' : 'Assign'}
                  >
                    <PersonAdd fontSize='small' />
                  </IconButton>
                </Box>

                {project.projectManagerUser ? (
                  <Box display='flex' alignItems='center' gap={2}>
                    <Avatar sx={{ width: 48, height: 48 }}>
                      {project.projectManagerUser.fullName?.[0] || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant='body1' fontWeight={600}>
                        {project.projectManagerUser.fullName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {project.projectManagerUser.email}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box textAlign='center' py={2}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      gutterBottom
                    >
                      No project manager assigned
                    </Typography>
                    <Button
                      size='small'
                      variant='outlined'
                      startIcon={<PersonAdd />}
                      onClick={() => setAssignDialogOpen(true)}
                    >
                      Assign Manager
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Created By */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant='subtitle2'
                  color='text.secondary'
                  gutterBottom
                >
                  Created By
                </Typography>
                <Box display='flex' alignItems='center' gap={2}>
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {project.createdByUser?.fullName?.[0] || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant='body1' fontWeight={600}>
                      {project.createdByUser?.fullName || 'Unknown User'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {project.createdByUser?.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent>
                <Typography
                  variant='subtitle2'
                  color='text.secondary'
                  gutterBottom
                >
                  Timeline
                </Typography>
                <Box display='flex' flexDirection='column' gap={2}>
                  {project.startDate && (
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Start Date
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        {format(new Date(project.startDate), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  )}

                  {project.endDate && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          End Date
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {format(new Date(project.endDate), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {project.actualStartDate && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Actual Start
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {format(
                            new Date(project.actualStartDate),
                            'MMM d, yyyy',
                          )}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {project.actualEndDate && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Actual End
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {format(
                            new Date(project.actualEndDate),
                            'MMM d, yyyy',
                          )}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {project.durationDays && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Duration
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {project.durationDays} days
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Assign PM Dialog */}
        <AssignProjectManagerDialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          projectId={id!}
          currentManagerId={project.projectManagerUserId}
          onSuccess={handleAssignSuccess}
        />

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleActionClose}
        >
          <MenuItem
            onClick={() => {
              handleActionClose();
              setAssignDialogOpen(true);
            }}
          >
            <PersonAdd fontSize='small' sx={{ mr: 1 }} />
            {project.projectManagerUser ? 'Reassign' : 'Assign'} Project Manager
          </MenuItem>

          {project.status === 'Planning' && (
            <MenuItem onClick={handleStart}>
              <PlayArrow fontSize='small' sx={{ mr: 1 }} />
              Start Project
            </MenuItem>
          )}

          {project.status === 'Active' && [
            <MenuItem key='complete' onClick={handleComplete}>
              <CheckCircle fontSize='small' sx={{ mr: 1 }} />
              Complete
            </MenuItem>,
            <MenuItem key='hold' onClick={handleHold}>
              <Pause fontSize='small' sx={{ mr: 1 }} />
              Put on Hold
            </MenuItem>,
          ]}

          {!['Completed', 'Cancelled'].includes(project.status) && (
            <MenuItem onClick={handleCancel}>
              <CancelIcon fontSize='small' sx={{ mr: 1 }} />
              Cancel Project
            </MenuItem>
          )}
        </Menu>
      </AppLayout>
    </>
  );
}
