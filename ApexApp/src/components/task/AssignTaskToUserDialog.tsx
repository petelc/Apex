import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import tasksApi from '@/api/tasks';
import { userApi, type User } from '@/api/users';
import type { Task } from '@/types/project';

interface AssignTaskToUserDialogProps {
  open: boolean;
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignTaskToUserDialog: React.FC<AssignTaskToUserDialogProps> = ({
  open,
  task,
  onClose,
  onSuccess,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await userApi.getAll();
        // Only show active users
        setUsers(data.filter((u) => u.isActive));
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };

    if (open) {
      loadUsers();
      setSelectedUserId('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await tasksApi.assignTaskToUser(task.id, { userId: selectedUserId });

      onSuccess();
    } catch (err: any) {
      console.error('Error assigning task to user:', err);
      setError(err.response?.data?.message || 'Failed to assign task to user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedUserId('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Assign Task to User</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Typography variant='body2' color='text.secondary'>
            Assign task{' '}
            <strong>
              #{task.taskNumber}: {task.title}
            </strong>{' '}
            to a specific user.
          </Typography>

          {loadingUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FormControl fullWidth required>
              <InputLabel>User</InputLabel>
              <Select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setError(null);
                }}
                label='User'
                disabled={loading}
              >
                <MenuItem value=''>
                  <em>Select a user</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.userId} value={user.userId}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                      }}
                    >
                      <Typography>
                        {user.firstName} {user.lastName}
                      </Typography>
                      {user.departmentName && (
                        <Chip
                          label={user.departmentName}
                          size='small'
                          variant='outlined'
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {task.assignedToUserName && (
            <Alert severity='info'>
              Current assignment: <strong>{task.assignedToUserName}</strong>
            </Alert>
          )}

          <Alert severity='info'>
            <Typography variant='body2'>
              The task will be directly assigned to this user and removed from
              any department assignments.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading || !selectedUserId || loadingUsers}
        >
          {loading ? 'Assigning...' : 'Assign to User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
