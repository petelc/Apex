/**
 * TaskResolutionNotes Component
 * Displays and edits resolution notes (how task was completed)
 */

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  TextField,
  Button,
  Stack,
  IconButton,
  Alert,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CancelIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { Task } from '../../types/task';

interface TaskResolutionNotesProps {
  task: Task;
  onSave: (notes: string) => Promise<void>;
}

const TaskResolutionNotes: React.FC<TaskResolutionNotesProps> = ({ task, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(task.resolutionNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasNotes = task.resolutionNotes && task.resolutionNotes.trim().length > 0;
  const isCompleted = task.status === 'Completed';

  const handleEdit = () => {
    setNotes(task.resolutionNotes || '');
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setNotes(task.resolutionNotes || '');
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onSave(notes.trim());
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card 
      variant="outlined"
      sx={{
        ...(isCompleted && {
          borderColor: 'success.main',
          bgcolor: 'success.lighter'
        })
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon color={isCompleted ? 'success' : 'action'} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Resolution Notes
            </Typography>
            {isCompleted && (
              <Chip label="Completed" color="success" size="small" />
            )}
          </Box>

          {!isEditing && (
            <IconButton onClick={handleEdit} size="small" color="primary">
              <EditIcon />
            </IconButton>
          )}
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document how this task was resolved, what was implemented, testing notes, etc..."
              disabled={isSaving}
              inputProps={{ maxLength: 5000 }}
              helperText={`${notes.length}/5000 characters`}
              sx={{ mb: 2 }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isSaving}
              >
                Save Notes
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        ) : hasNotes ? (
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              color: 'text.secondary',
              bgcolor: isCompleted ? 'background.paper' : 'action.hover',
              p: 2,
              borderRadius: 1
            }}
          >
            {task.resolutionNotes}
          </Typography>
        ) : (
          <Box 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              bgcolor: isCompleted ? 'background.paper' : 'action.hover',
              borderRadius: 1,
              border: '2px dashed',
              borderColor: 'divider'
            }}
          >
            <CheckIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No resolution notes yet
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {isCompleted 
                ? 'Add notes about how this task was resolved'
                : 'Resolution notes can be added when completing the task'
              }
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskResolutionNotes;
