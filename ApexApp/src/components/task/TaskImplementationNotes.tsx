/**
 * TaskImplementationNotes Component
 * Displays and edits implementation notes
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
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CancelIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { Task } from '../../types/task';
import { isTaskEditable } from '../../utils/taskUtils';

interface TaskImplementationNotesProps {
  task: Task;
  onSave: (notes: string) => Promise<void>;
}

const TaskImplementationNotes: React.FC<TaskImplementationNotesProps> = ({ task, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(task.implementationNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = isTaskEditable(task);
  const hasNotes = task.implementationNotes && task.implementationNotes.trim().length > 0;

  const handleEdit = () => {
    setNotes(task.implementationNotes || '');
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setNotes(task.implementationNotes || '');
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
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon color="action" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Implementation Notes
            </Typography>
          </Box>

          {canEdit && !isEditing && (
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
              placeholder="Document how you're implementing this task, technical decisions, code snippets, etc..."
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
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              bgcolor: 'action.hover',
              p: 2,
              borderRadius: 1
            }}
          >
            {task.implementationNotes}
          </Typography>
        ) : (
          <Box 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 1,
              border: '2px dashed',
              borderColor: 'divider'
            }}
          >
            <CodeIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No implementation notes yet
            </Typography>
            {canEdit && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Click the edit button to add notes about your implementation approach
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskImplementationNotes;
