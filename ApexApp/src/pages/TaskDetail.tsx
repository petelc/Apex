/**
 * TaskDetail Page
 * Complete task detail view with all components
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Grid,
  Stack,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  TaskHeader,
  TaskDescription,
  TaskMetadata,
  TaskTimeTracking,
  TaskActionButtons,
  TaskImplementationNotes,
  TaskResolutionNotes,
  TaskChecklist,
  TaskTimeline,
} from '../components/task';
import tasksApi from '../api/tasks';
import { Task } from '../types/task';
import { ChecklistItem } from '../types/checklist';
import { TaskActivity } from '../types/timeline';
import { isTaskEditable } from '../utils/taskUtils';

// Import dialogs (we'll create these next)
import EditTaskDialog from '../components/task/dialogs/EditTaskDialog';
import CompleteTaskDialog from '../components/task/dialogs/CompleteTaskDialog';
import BlockTaskDialog from '../components/task/dialogs/BlockTaskDialog';
import LogTimeDialog from '../components/task/dialogs/LogTimeDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { TaskAssignmentActions } from '@/components/task/TaskAssignmentActions';

const TaskDetail: React.FC = () => {
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();
  const navigate = useNavigate();

  // State
  const [task, setTask] = useState<Task | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [logTimeDialogOpen, setLogTimeDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    open: false,
    title: '',
    message: '',
    action: async () => {},
  });

  // Load task data
  const loadTask = async () => {
    if (!taskId) return;

    try {
      const taskData = await tasksApi.getTask(taskId);
      setTask(taskData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load task');
    }
  };

  // Load checklist
  const loadChecklist = async () => {
    if (!taskId) return;

    try {
      const items = await tasksApi.getTaskChecklist(taskId);
      setChecklistItems(items);
    } catch (err: any) {
      console.error('Failed to load checklist:', err);
    }
  };

  // Load timeline
  const loadTimeline = async () => {
    if (!taskId) return;

    try {
      const timeline = await tasksApi.getTaskTimeline(taskId);
      setActivities(timeline);
    } catch (err: any) {
      console.error('Failed to load timeline:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadTask(), loadChecklist(), loadTimeline()]);
      setLoading(false);
    };

    loadAll();
  }, [taskId]);

  const handleTaskUpdate = () => {
    loadTask(); // Simply reload the task to get updated assignment info
  };

  // Back button
  // const handleBack = () => {
  //   navigate(`/projects/${projectId}/tasks`);
  // };

  // Refresh all data
  const refreshAll = async () => {
    await Promise.all([loadTask(), loadChecklist(), loadTimeline()]);
  };

  // Action handlers
  const handleStart = async () => {
    if (!taskId) return;

    try {
      setActionLoading(true);
      await tasksApi.startTask(taskId);
      await refreshAll();
      setSuccessMessage('Task started successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to start task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (resolutionNotes?: string) => {
    if (!taskId) return;

    try {
      setActionLoading(true);
      await tasksApi.completeTask(taskId, { resolutionNotes });
      await refreshAll();
      setCompleteDialogOpen(false);
      setSuccessMessage('Task completed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to complete task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async (blockedReason: string) => {
    if (!taskId) return;

    try {
      setActionLoading(true);
      await tasksApi.blockTask(taskId, { blockedReason });
      await refreshAll();
      setBlockDialogOpen(false);
      setSuccessMessage('Task blocked successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to block task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!taskId) return;

    try {
      setActionLoading(true);
      await tasksApi.unblockTask(taskId);
      await refreshAll();
      setSuccessMessage('Task unblocked successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to unblock task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!taskId) return;

    try {
      setActionLoading(true);
      await tasksApi.cancelTask(taskId);
      await refreshAll();
      setConfirmDialog({ ...confirmDialog, open: false });
      setSuccessMessage('Task cancelled successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to cancel task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!taskId) return;

    try {
      setActionLoading(true);
      await tasksApi.claimTask(taskId);
      await refreshAll();
      setSuccessMessage('Task claimed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to claim task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogTime = async (hours: number) => {
    if (!taskId) return;

    try {
      setActionLoading(true);
      await tasksApi.logTime(taskId, { hours });
      await refreshAll();
      setLogTimeDialogOpen(false);
      setSuccessMessage(
        `Logged ${hours} hour${hours !== 1 ? 's' : ''} successfully`,
      );
    } catch (err: any) {
      setError(err.message || 'Failed to log time');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (updates: any) => {
    if (!taskId) return;

    try {
      setActionLoading(true);
      await tasksApi.updateTask(taskId, updates);
      await refreshAll();
      setEditDialogOpen(false);
      setSuccessMessage('Task updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setActionLoading(false);
    }
  };

  // Notes handlers
  const handleSaveImplementationNotes = async (notes: string) => {
    if (!taskId) return;
    await tasksApi.updateImplementationNotes(taskId, { notes });
    await loadTask();
    await loadTimeline();
  };

  const handleSaveResolutionNotes = async (notes: string) => {
    if (!taskId) return;
    await tasksApi.updateResolutionNotes(taskId, { notes });
    await loadTask();
    await loadTimeline();
  };

  // Checklist handlers
  const handleAddChecklistItem = async (description: string) => {
    if (!taskId) return;
    await tasksApi.addChecklistItem(taskId, {
      description,
      order: checklistItems.length,
    });
  };

  const handleToggleChecklistItem = async (itemId: string) => {
    if (!taskId) return;
    await tasksApi.toggleChecklistItem(taskId, itemId);
  };

  // Show confirm dialog
  const showConfirmDialog = (
    title: string,
    message: string,
    action: () => Promise<void>,
  ) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      action,
    });
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth='xl'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error && !task) {
    return (
      <Container maxWidth='xl'>
        <Box sx={{ py: 4 }}>
          <Alert severity='error'>{error}</Alert>
        </Box>
      </Container>
    );
  }

  // No task
  if (!task) {
    return (
      <Container maxWidth='xl'>
        <Box sx={{ py: 4 }}>
          <Alert severity='info'>Task not found</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth='xl'>
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <TaskHeader
          task={task}
          projectId={projectId || ''}
          onEdit={() => setEditDialogOpen(true)}
        />

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              {/* Description */}
              <TaskDescription description={task.description} />

              {/* Implementation Notes */}
              <TaskImplementationNotes
                task={task}
                onSave={handleSaveImplementationNotes}
              />

              {/* Resolution Notes */}
              <TaskResolutionNotes
                task={task}
                onSave={handleSaveResolutionNotes}
              />

              {/* Checklist */}
              <TaskChecklist
                taskId={task.id}
                items={checklistItems}
                onAddItem={handleAddChecklistItem}
                onToggleItem={handleToggleChecklistItem}
                onRefresh={loadChecklist}
                canEdit={isTaskEditable(task)}
              />

              {/* Timeline */}
              <TaskTimeline activities={activities} />
            </Stack>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              {/* Action Buttons */}
              <TaskActionButtons
                task={task}
                onStart={handleStart}
                onComplete={() => setCompleteDialogOpen(true)}
                onBlock={() => setBlockDialogOpen(true)}
                onUnblock={handleUnblock}
                onCancel={() =>
                  showConfirmDialog(
                    'Cancel Task',
                    'Are you sure you want to cancel this task? This action cannot be undone.',
                    handleCancel,
                  )
                }
                onClaim={handleClaim}
                loading={actionLoading}
              />
              <TaskAssignmentActions task={task} onUpdate={handleTaskUpdate} />

              {/* Metadata */}
              <TaskMetadata task={task} />

              {/* Time Tracking */}
              <TaskTimeTracking
                task={task}
                onLogTime={() => setLogTimeDialogOpen(true)}
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Dialogs */}
      {task && (
        <>
          <EditTaskDialog
            open={editDialogOpen}
            task={task}
            onClose={() => setEditDialogOpen(false)}
            onSave={handleEdit}
            loading={actionLoading}
          />

          <CompleteTaskDialog
            open={completeDialogOpen}
            onClose={() => setCompleteDialogOpen(false)}
            onComplete={handleComplete}
            loading={actionLoading}
          />

          <BlockTaskDialog
            open={blockDialogOpen}
            onClose={() => setBlockDialogOpen(false)}
            onBlock={handleBlock}
            loading={actionLoading}
          />

          <LogTimeDialog
            open={logTimeDialogOpen}
            onClose={() => setLogTimeDialogOpen(false)}
            onLogTime={handleLogTime}
            loading={actionLoading}
            currentActualHours={task.actualHours || 0}
            estimatedHours={task.estimatedHours}
          />

          <ConfirmDialog
            open={confirmDialog.open}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.action}
            onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
            loading={actionLoading}
          />
        </>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TaskDetail;
