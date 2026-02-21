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
import { userApi, type User } from '@/api/users';
import { departmentApi, type Department } from '@/api/departments';

interface AssignUserToDepartmentDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignUserToDepartmentDialog: React.FC<
  AssignUserToDepartmentDialogProps
> = ({ open, user, onClose, onSuccess }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(
    user.departmentId || '',
  );
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
      setSelectedDepartmentId(user.departmentId || '');
    }
  }, [open, user.departmentId]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pass null if no department selected to remove assignment
      const departmentId = selectedDepartmentId || null;
      await userApi.assignDepartment(user.userId, departmentId);

      onSuccess();
    } catch (err: any) {
      console.error('Error assigning user to department:', err);
      setError(
        err.response?.data?.message || 'Failed to assign user to department',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  const hasChanges = selectedDepartmentId !== (user.departmentId || '');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Assign Department</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Typography variant='body2' color='text.secondary'>
            Assign{' '}
            <strong>
              {user.firstName} {user.lastName}
            </strong>{' '}
            to a department
          </Typography>

          {loadingDepartments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FormControl fullWidth>
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
                  <em>No Department (Unassign)</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {user.departmentName && (
            <Alert severity='info'>
              Current department: <strong>{user.departmentName}</strong>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading || !hasChanges || loadingDepartments}
        >
          {loading ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
