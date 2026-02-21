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
} from '@mui/material';
import tasksApi from '@/api/tasks';
import { departmentApi, type Department } from '@/api/departments';
import type { Task } from '@/types/project';

interface AssignTaskToDepartmentDialogProps {
  open: boolean;
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignTaskToDepartmentDialog: React.FC<
  AssignTaskToDepartmentDialogProps
> = ({ open, task, onClose, onSuccess }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const data = await departmentApi.getAll();
        // Only show active departments
        setDepartments(data.filter((d) => d.isActive));
      } catch (err) {
        console.error('Error loading departments:', err);
        setError('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };

    if (open) {
      loadDepartments();
      setSelectedDepartmentId('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedDepartmentId) {
      setError('Please select a department');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await tasksApi.assignTaskToDepartment(task.id, {
        departmentId: selectedDepartmentId,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Error assigning task to department:', err);
      setError(
        err.response?.data?.message || 'Failed to assign task to department',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedDepartmentId('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Assign Task to Department</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Typography variant='body2' color='text.secondary'>
            Assign task <strong>{task.title}</strong> to a department. Any
            member of the department can claim this task.
          </Typography>

          {loadingDepartments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FormControl fullWidth required>
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartmentId}
                onChange={(e) => {
                  setSelectedDepartmentId(e.target.value);
                  setError(null);
                }}
                label='Department'
                disabled={loading}
              >
                <MenuItem value=''>
                  <em>Select a department</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                    {dept.memberCount !== undefined && (
                      <Typography
                        component='span'
                        variant='caption'
                        color='text.secondary'
                        sx={{ ml: 1 }}
                      >
                        ({dept.memberCount} members)
                      </Typography>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {task.assignedToDepartmentName && (
            <Alert severity='info'>
              Current assignment:{' '}
              <strong>{task.assignedToDepartmentName}</strong>
            </Alert>
          )}

          <Alert severity='info'>
            <Typography variant='body2'>
              Once assigned to a department, any member can claim this task.
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
          disabled={loading || !selectedDepartmentId || loadingDepartments}
        >
          {loading ? 'Assigning...' : 'Assign to Department'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
