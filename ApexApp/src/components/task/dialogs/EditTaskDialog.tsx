/**
 * EditTaskDialog Component
 * Dialog for editing task details
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Box,
  Typography
} from '@mui/material';
import { Task, TaskPriority, UpdateTaskRequest } from '../../../types/task';
import { 
  validateTaskTitle, 
  validateTaskDescription,
  validateEstimatedHours 
} from '../../../utils/taskUtils';

interface EditTaskDialogProps {
  open: boolean;
  task: Task;
  onClose: () => void;
  onSave: (updates: UpdateTaskRequest) => Promise<void>;
  loading?: boolean;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  open,
  task,
  onClose,
  onSave,
  loading = false
}) => {
  const [formData, setFormData] = useState<UpdateTaskRequest>({
    title: task.title,
    description: task.description,
    priority: task.priority,
    estimatedHours: task.estimatedHours,
    dueDate: task.dueDate
  });

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    estimatedHours?: string;
  }>({});

  // Reset form when task changes
  useEffect(() => {
    if (open) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        estimatedHours: task.estimatedHours,
        dueDate: task.dueDate
      });
      setErrors({});
    }
  }, [open, task]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    const titleError = validateTaskTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    const descError = validateTaskDescription(formData.description);
    if (descError) newErrors.description = descError;

    if (formData.estimatedHours !== undefined) {
      const hoursError = validateEstimatedHours(formData.estimatedHours);
      if (hoursError) newErrors.estimatedHours = hoursError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSave(formData);
    } catch (err) {
      // Error handled by parent
      console.error('Edit failed:', err);
    }
  };

  const handleChange = (field: keyof UpdateTaskRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Edit Task</DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Title */}
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title || `${formData.title.length}/200 characters`}
            fullWidth
            required
            disabled={loading}
            inputProps={{ maxLength: 200 }}
          />

          {/* Description */}
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description || `${formData.description.length}/2000 characters`}
            fullWidth
            required
            multiline
            rows={6}
            disabled={loading}
            inputProps={{ maxLength: 2000 }}
          />

          {/* Priority */}
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
              label="Priority"
              disabled={loading}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>

          {/* Estimated Hours */}
          <TextField
            label="Estimated Hours"
            type="number"
            value={formData.estimatedHours || ''}
            onChange={(e) => handleChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
            error={!!errors.estimatedHours}
            helperText={errors.estimatedHours}
            fullWidth
            disabled={loading}
            inputProps={{ min: 0, step: 0.5 }}
          />

          {/* Due Date */}
          <TextField
            label="Due Date"
            type="date"
            value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
            onChange={(e) => handleChange('dueDate', e.target.value || undefined)}
            fullWidth
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskDialog;
