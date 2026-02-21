import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { departmentApi, type Department, type UpdateDepartmentRequest } from '@/api/departments';

interface EditDepartmentDialogProps {
  open: boolean;
  department: Department;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditDepartmentDialog: React.FC<EditDepartmentDialogProps> = ({
  open,
  department,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<UpdateDepartmentRequest>({
    name: department.name,
    description: department.description || '',
    isActive: department.isActive,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when department changes
  useEffect(() => {
    setFormData({
      name: department.name,
      description: department.description || '',
      isActive: department.isActive,
    });
  }, [department]);

  const handleChange = (field: keyof UpdateDepartmentRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'isActive' ? event.target.checked : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await departmentApi.update(department.id, formData);
      onSuccess();
    } catch (err: any) {
      console.error('Error updating department:', err);
      setError(err.response?.data?.message || 'Failed to update department');
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
      <DialogTitle>Edit Department</DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            label="Department Name"
            value={formData.name}
            onChange={handleChange('name')}
            required
            fullWidth
            autoFocus
            disabled={loading}
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            multiline
            rows={3}
            fullWidth
            disabled={loading}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleChange('isActive')}
                disabled={loading}
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name.trim()}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
