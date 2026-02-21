/**
 * ConfirmDialog Component
 * Reusable confirmation dialog
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  DialogContentText
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  loading?: boolean;
  confirmText?: string;
  confirmColor?: 'primary' | 'error' | 'warning' | 'success' | 'info';
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onClose,
  loading = false,
  confirmText = 'Confirm',
  confirmColor = 'primary',
  cancelText = 'Cancel'
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (err) {
      console.error('Confirm action failed:', err);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          color={confirmColor}
          disabled={loading}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
