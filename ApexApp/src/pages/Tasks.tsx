import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
} from '@mui/material';
import { Add, PlayArrow, CheckCircle, Visibility } from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { getErrorMessage } from '@/api/client';
import type { Task, CreateTaskRequest, TaskPriority } from '@/types/project';

import { format } from 'date-fns';
import tasksApi from '@/api/tasks';

export default function TasksPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    priority: 'Medium',
  });

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  const loadTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await tasksApi.getProjectTasks(projectId);
      setTasks(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  console.log('TasksPage render, tasks loaded:', tasks);

  const handleCreate = async () => {
    if (!projectId) return;
    try {
      setCreateLoading(true);
      await tasksApi.createTask(projectId, formData);
      setCreateDialogOpen(false);
      setFormData({ title: '', description: '', priority: 'Medium' });
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStart = async (taskId: string) => {
    try {
      await tasksApi.startTask(taskId);
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await tasksApi.completeTask(taskId);
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // ✅ Navigate to task detail
  const handleViewTask = (taskId: string) => {
    navigate(`/projects/${projectId}/tasks/${taskId}`);
  };

  const groupedTasks = {
    notStarted: tasks.filter((t) => t.status === 'NotStarted'),
    inProgress: tasks.filter((t) => t.status === 'InProgress'),
    blocked: tasks.filter((t) => t.status === 'Blocked'),
    completed: tasks.filter((t) => t.status === 'Completed'),
  };

  if (loading || createLoading) {
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

  return (
    <>
      <title>Tasks - APEX</title>
      <AppLayout>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={3}
        >
          <Box>
            <Typography variant='h4' fontWeight={700} gutterBottom>
              Project Tasks
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {tasks.length} tasks total
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Task
          </Button>
        </Box>

        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Kanban Board */}
        <Grid container spacing={2}>
          {/* Not Started */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant='subtitle2' fontWeight={600} mb={2}>
                Not Started ({groupedTasks.notStarted.length})
              </Typography>
              {groupedTasks.notStarted.map((task) => (
                <Card
                  key={task.id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 },
                  }}
                  onClick={() => handleViewTask(task.id)}
                >
                  <CardContent>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='start'
                    >
                      <Typography
                        variant='subtitle2'
                        fontWeight={600}
                        gutterBottom
                        sx={{ flex: 1 }}
                      >
                        {task.title}
                      </Typography>
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTask(task.id);
                        }}
                      >
                        <Visibility fontSize='small' />
                      </IconButton>
                    </Box>
                    <Typography variant='caption' color='text.secondary'>
                      {task.description}
                    </Typography>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='center'
                      sx={{ mt: 1, mb: 1 }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {task.createdByUser?.fullName?.[0] || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant='body2' fontWeight={600}>
                            {task.createdByUser?.fullName || 'Unknown User'}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {task.createdByUser?.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant='caption' color='text.secondary'>
                        {format(new Date(task.createdDate), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                    <Box mt={1}>
                      <Chip label={task.priority} size='small' />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: '10px',
                      }}
                    >
                      <Button
                        size='small'
                        startIcon={<PlayArrow />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStart(task.id);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Start
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* In Progress */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant='subtitle2' fontWeight={600} mb={2}>
                In Progress ({groupedTasks.inProgress.length})
              </Typography>
              {groupedTasks.inProgress.map((task) => (
                <Card
                  key={task.id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 },
                  }}
                  onClick={() => handleViewTask(task.id)}
                >
                  <CardContent>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='start'
                    >
                      <Typography
                        variant='subtitle2'
                        fontWeight={600}
                        gutterBottom
                        sx={{ flex: 1 }}
                      >
                        {task.title}
                      </Typography>
                      <IconButton size='small'>
                        <Visibility fontSize='small' />
                      </IconButton>
                    </Box>
                    <Typography variant='caption' color='text.secondary'>
                      {task.assignedToUser?.fullName || 'Unassigned'}
                    </Typography>
                    <Box mt={1}>
                      <Typography variant='caption'>
                        {task.actualHours}h logged
                      </Typography>
                    </Box>
                    <Button
                      size='small'
                      startIcon={<CheckCircle />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(task.id);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Complete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Blocked */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant='subtitle2' fontWeight={600} mb={2}>
                Blocked ({groupedTasks.blocked.length})
              </Typography>
              {groupedTasks.blocked.map((task) => (
                <Card
                  key={task.id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 },
                  }}
                  onClick={() => handleViewTask(task.id)}
                >
                  <CardContent>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='start'
                    >
                      <Typography
                        variant='subtitle2'
                        fontWeight={600}
                        gutterBottom
                        sx={{ flex: 1 }}
                      >
                        {task.title}
                      </Typography>
                      <IconButton size='small'>
                        <Visibility fontSize='small' />
                      </IconButton>
                    </Box>
                    <Alert severity='error' sx={{ mt: 1 }}>
                      <Typography variant='caption'>
                        {task.blockedReason}
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Completed */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant='subtitle2' fontWeight={600} mb={2}>
                Completed ({groupedTasks.completed.length})
              </Typography>
              {groupedTasks.completed.map((task) => (
                <Card
                  key={task.id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 },
                  }}
                  onClick={() => handleViewTask(task.id)}
                >
                  <CardContent>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='start'
                    >
                      <Typography
                        variant='subtitle2'
                        fontWeight={600}
                        gutterBottom
                        sx={{ flex: 1 }}
                      >
                        {task.title}
                      </Typography>
                      <IconButton size='small'>
                        <Visibility fontSize='small' />
                      </IconButton>
                    </Box>
                    <Typography variant='caption' color='text.secondary'>
                      {task.actualHours}h total
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Create Task Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Create Task</DialogTitle>
          <DialogContent>
            <TextField
              label='Title'
              fullWidth
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              label='Description'
              fullWidth
              required
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              label='Priority'
              select
              fullWidth
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as TaskPriority,
                })
              }
            >
              <MenuItem value='Low'>Low</MenuItem>
              <MenuItem value='Medium'>Medium</MenuItem>
              <MenuItem value='High'>High</MenuItem>
              <MenuItem value='Critical'>Critical</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              variant='contained'
              onClick={handleCreate}
              disabled={!formData.title}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </AppLayout>
    </>
  );
}
