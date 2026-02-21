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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
} from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { projectApi } from '@/api/projects';
import tasksApi from '@/api/tasks';
import { getErrorMessage } from '@/api/client';
import type { Project, Task } from '@/types/project';
import { format, differenceInDays } from 'date-fns';
import { UserLookup } from '@/components/user/user-lookup';
import { userApi } from '@/api/users';
import { UserInfo } from '@/types/auth';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [projectManagers, setProjectManagers] = useState<UserInfo[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Action Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (id) {
      loadProject();
      loadTasks();
      loadProjectManagers();
    }
  }, [id]);

  const loadProject = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await projectApi.getById(id);
      console.log('Loaded Project Data:', data);
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
      const data = await taskApi.getByProject(id);
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  const loadProjectManagers = async () => {
    try {
      // Fetch project managers from API
      const users = await userApi.getProjectManagers();
      setProjectManagers(users);
    } catch (err) {
      console.error('Error loading project managers:', err);
    }
  };

  // const handleAssignUser = async () => {
  //   if (!project) return;

  //   try {
  //     setActionLoading(true);
  //     // Logic to assign user goes here
  //     // await projectApi.assignUser(project.id, userId);
  //     handleClose();
  //     handleActionClose();
  //     await loadProject();
  //   } catch (err) {
  //     setError(getErrorMessage(err));
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
  };

  const handleAssignProjectManager = async (managerId: string) => {
    if (!project) return;

    try {
      setActionLoading(true);
      await projectApi.assignProjectManager(project.id, managerId);
      handleClose();
      handleActionClose();
      await loadProject();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
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
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    return Math.round((completed / tasks.length) * 100);
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
                    {progress}%
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    complete
                  </Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={progress}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Tasks
                </Typography>
                <Box display='flex' alignItems='baseline' gap={1}>
                  <Typography variant='h4' fontWeight={700}>
                    {tasks.filter((t) => t.status === 'Completed').length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    / {tasks.length}
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
            {/* Assign User Dialog */}
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Assign Project Manager</DialogTitle>
              <DialogContent>
                {/* User assignment form goes here */}
                <UserLookup
                  Label='Project Manager'
                  items={projectManagers}
                  onSelect={(id) => setSelectedManagerId(id)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAssignProjectManager(selectedManagerId)}
                  disabled={actionLoading || !selectedManagerId}
                  variant='contained'
                >
                  {actionLoading ? <CircularProgress size={24} /> : 'Assign'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Project Manager */}
            {project.projectManager && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Project Manager
                  </Typography>
                  <Box display='flex' alignItems='center' gap={2}>
                    <Avatar sx={{ width: 48, height: 48 }}>
                      {project.projectManager?.fullName?.[0] || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant='body1' fontWeight={600}>
                        {project.projectManager?.fullName || 'Unknown User'}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {project.projectManager?.email}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

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

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleActionClose}
        >
          {project.status === 'Planning' && (
            <MenuItem onClick={handleOpen}>
              <Assignment sx={{ mr: 1 }} />
              Assign Project Manager
            </MenuItem>
          )}
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
