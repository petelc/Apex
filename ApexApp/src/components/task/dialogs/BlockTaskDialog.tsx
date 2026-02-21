/**
 * BlockTaskDialog Component
 * Dialog for blocking a task with a required reason
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
import { Block as BlockIcon } from '@mui/icons-material';
import { validateBlockedReason } from '../../../utils/taskUtils';

interface BlockTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onBlock: (blockedReason: string) => Promise<void>;
  loading?: boolean;
}

const BlockTaskDialog: React.FC<BlockTaskDialogProps> = ({
  open,
  onClose,
  onBlock,
  loading = false
}) => {
  const [blockedReason, setBlockedReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    const validationError = validateBlockedReason(blockedReason);
    setError(validationError);
    return !validationError;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onBlock(blockedReason.trim());
      setBlockedReason(''); // Reset on success
      setError(null);
    } catch (err) {
      // Error handled by parent
      console.error('Block failed:', err);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setBlockedReason('');
      setError(null);
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
          <BlockIcon color="error" />
          Block Task
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Blocking this task will prevent further progress until it's unblocked. Please provide a clear reason.
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Why is this task blocked? <strong>(Required)</strong>
        </Typography>

        <TextField
          label="Blocked Reason"
          value={blockedReason}
          onChange={(e) => {
            setBlockedReason(e.target.value);
            if (error) setError(null);
          }}
          error={!!error}
          helperText={error || `${blockedReason.length}/500 characters`}
          fullWidth
          required
          multiline
          rows={4}
          disabled={loading}
          placeholder="E.g., Waiting for API credentials, Blocked by another team, Missing requirements..."
          inputProps={{ maxLength: 500 }}
          autoFocus
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          color="error"
          disabled={loading || !blockedReason.trim()}
        >
          Block Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlockTaskDialog;
