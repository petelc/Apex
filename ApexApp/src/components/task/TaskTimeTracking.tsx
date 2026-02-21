/**
 * TaskTimeTracking Component
 * Displays estimated vs actual hours with progress bar
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress,
  Stack,
  Chip,
  Button
} from '@mui/material';
import {
  Schedule as ClockIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Task } from '../../types/task';
import { 
  getRemainingHours, 
  isTaskOverBudget,
  canLogTime 
} from '../../utils/taskUtils';

interface TaskTimeTrackingProps {
  task: Task;
  onLogTime: () => void;
}

const TaskTimeTracking: React.FC<TaskTimeTrackingProps> = ({ task, onLogTime }) => {
  const estimatedHours = task.estimatedHours || 0;
  const actualHours = task.actualHours || 0;
  const remainingHours = getRemainingHours(task);
  const overBudget = isTaskOverBudget(task);
  
  const progressPercentage = estimatedHours > 0 
    ? Math.min((actualHours / estimatedHours) * 100, 100)
    : 0;

  const getProgressColor = () => {
    if (overBudget) return 'error';
    if (progressPercentage > 80) return 'warning';
    return 'primary';
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Time Tracking
          </Typography>
          {canLogTime(task) && (
            <Button
              startIcon={<AddIcon />}
              onClick={onLogTime}
              size="small"
              variant="outlined"
            >
              Log Time
            </Button>
          )}
        </Stack>

        {/* Hours Summary */}
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <ClockIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Estimated
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={600}>
              {estimatedHours > 0 ? `${estimatedHours}h` : 'Not set'}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <TrendingUpIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Actual
              </Typography>
            </Stack>
            <Typography 
              variant="h5" 
              fontWeight={600}
              color={overBudget ? 'error.main' : 'text.primary'}
            >
              {actualHours > 0 ? `${actualHours}h` : '0h'}
            </Typography>
          </Box>

          {remainingHours !== null && (
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <ClockIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Remaining
                </Typography>
              </Stack>
              <Typography 
                variant="h5" 
                fontWeight={600}
                color={overBudget ? 'error.main' : 'text.primary'}
              >
                {overBudget ? '0h' : `${remainingHours.toFixed(1)}h`}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Progress Bar */}
        {estimatedHours > 0 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight={600}
                color={overBudget ? 'error.main' : 'text.primary'}
              >
                {progressPercentage.toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(progressPercentage, 100)}
              color={getProgressColor()}
              sx={{ 
                height: 8, 
                borderRadius: 1,
                bgcolor: 'action.hover'
              }}
            />
          </Box>
        )}

        {/* Over Budget Warning */}
        {overBudget && (
          <Chip
            icon={<WarningIcon />}
            label={`Over budget by ${(actualHours - estimatedHours).toFixed(1)} hours`}
            color="error"
            size="small"
            sx={{ mt: 2 }}
          />
        )}

        {/* No Estimate Info */}
        {estimatedHours === 0 && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 1,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No time estimate has been set for this task
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskTimeTracking;
