/**
 * CompleteTaskDialog Component
 * Dialog for completing a task with optional resolution notes
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { CheckCircle as CompleteIcon } from '@mui/icons-material';

interface CompleteTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (resolutionNotes?: string) => Promise<void>;
  loading?: boolean;
}

const CompleteTaskDialog: React.FC<CompleteTaskDialogProps> = ({
  open,
  onClose,
  onComplete,
  loading = false
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleSubmit = async () => {
    try {
      await onComplete(resolutionNotes.trim() || undefined);
      setResolutionNotes(''); // Reset on success
    } catch (err) {
      // Error handled by parent
      console.error('Complete failed:', err);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setResolutionNotes('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompleteIcon color="success" />
          Complete Task
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="success" sx={{ mb: 3 }}>
          You're about to mark this task as completed. This will record the completion time and user.
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Optionally add notes about how this task was resolved:
        </Typography>

        <TextField
          label="Resolution Notes (Optional)"
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          fullWidth
          multiline
          rows={6}
          disabled={loading}
          placeholder="Document how this task was resolved, what was implemented, testing notes, etc..."
          inputProps={{ maxLength: 5000 }}
          helperText={`${resolutionNotes.length}/5000 characters`}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          color="success"
          disabled={loading}
          sx={{
            background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)',
            },
          }}
        >
          Complete Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompleteTaskDialog;
