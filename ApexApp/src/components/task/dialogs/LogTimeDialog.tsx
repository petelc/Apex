/**
 * LogTimeDialog Component
 * Dialog for logging time to a task
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
  Stack,
  Alert,
  Chip
} from '@mui/material';
import { Schedule as ClockIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

interface LogTimeDialogProps {
  open: boolean;
  onClose: () => void;
  onLogTime: (hours: number) => Promise<void>;
  loading?: boolean;
  currentActualHours: number;
  estimatedHours?: number;
}

const LogTimeDialog: React.FC<LogTimeDialogProps> = ({
  open,
  onClose,
  onLogTime,
  loading = false,
  currentActualHours,
  estimatedHours
}) => {
  const [hours, setHours] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const newTotal = currentActualHours + (parseFloat(hours) || 0);
  const wouldBeOverBudget = estimatedHours && newTotal > estimatedHours;
  const remainingHours = estimatedHours ? Math.max(0, estimatedHours - newTotal) : null;

  const validate = (): boolean => {
    const hoursValue = parseFloat(hours);

    if (isNaN(hoursValue) || !hours.trim()) {
      setError('Please enter a valid number of hours');
      return false;
    }

    if (hoursValue <= 0) {
      setError('Hours must be greater than 0');
      return false;
    }

    if (hoursValue > 999) {
      setError('Hours must be less than 1000');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onLogTime(parseFloat(hours));
      setHours(''); // Reset on success
      setError(null);
    } catch (err) {
      // Error handled by parent
      console.error('Log time failed:', err);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setHours('');
      setError(null);
      onClose();
    }
  };

  const handleQuickSet = (value: number) => {
    setHours(value.toString());
    setError(null);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ClockIcon color="primary" />
          Log Time
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Current Stats */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Current Actual Hours:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {currentActualHours}h
              </Typography>
            </Box>
            {estimatedHours !== undefined && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Hours:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {estimatedHours}h
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Remaining:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    color={wouldBeOverBudget ? 'error.main' : 'text.primary'}
                  >
                    {remainingHours !== null ? `${remainingHours.toFixed(1)}h` : 'N/A'}
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        </Box>

        {/* Hours Input */}
        <TextField
          label="Hours to Log"
          type="number"
          value={hours}
          onChange={(e) => {
            setHours(e.target.value);
            if (error) setError(null);
          }}
          error={!!error}
          helperText={error}
          fullWidth
          required
          disabled={loading}
          autoFocus
          inputProps={{ 
            min: 0.1, 
            step: 0.5,
            max: 999
          }}
        />

        {/* Quick Set Buttons */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Quick set:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {[0.5, 1, 2, 4, 8].map((value) => (
              <Chip
                key={value}
                label={`${value}h`}
                onClick={() => handleQuickSet(value)}
                disabled={loading}
                size="small"
                clickable
              />
            ))}
          </Stack>
        </Box>

        {/* New Total Preview */}
        {hours && !error && (
          <Box sx={{ mt: 3, p: 2, bgcolor: wouldBeOverBudget ? 'error.lighter' : 'success.lighter', borderRadius: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TrendingUpIcon fontSize="small" color={wouldBeOverBudget ? 'error' : 'success'} />
              <Typography variant="body2" fontWeight={600}>
                New Total: {newTotal.toFixed(1)}h
              </Typography>
            </Stack>
            {wouldBeOverBudget && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                This will put the task over the estimated hours by {(newTotal - estimatedHours!).toFixed(1)}h
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading || !hours.trim()}
        >
          Log Time
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogTimeDialog;
