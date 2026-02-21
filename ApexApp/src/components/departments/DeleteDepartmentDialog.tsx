import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Box,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { departmentApi, type Department } from '@/api/departments';

interface DeleteDepartmentDialogProps {
  open: boolean;
  department: Department;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteDepartmentDialog: React.FC<DeleteDepartmentDialogProps> = ({
  open,
  department,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await departmentApi.delete(department.id);
      onSuccess();
    } catch (err: any) {
      console.error('Error deleting department:', err);
      setError(err.response?.data?.message || 'Failed to delete department');
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Delete Department
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Alert severity="warning">
            <Typography variant="body2">
              Are you sure you want to delete the department <strong>{department.name}</strong>?
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. All users assigned to this department will have their
            department assignment removed.
          </Typography>

          {department.memberCount && department.memberCount > 0 && (
            <Alert severity="info">
              <Typography variant="body2">
                This department has <strong>{department.memberCount}</strong> member(s). They will
                be unassigned from this department.
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete Department'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
