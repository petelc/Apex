/**
 * TaskActionButtons Component
 * Action buttons for task state transitions
 */

import React from 'react';
import { Stack, Button, Card, CardContent } from '@mui/material';
import {
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Block as BlockIcon,
  Lock as UnblockIcon,
  Cancel as CancelIcon,
  PersonAdd as ClaimIcon,
} from '@mui/icons-material';
import { Task } from '../../types/task';
import { 
  canStartTask, 
  canCompleteTask, 
  canBlockTask,
  canUnblockTask 
} from '../../utils/taskUtils';

interface TaskActionButtonsProps {
  task: Task;
  onStart: () => void;
  onComplete: () => void;
  onBlock: () => void;
  onUnblock: () => void;
  onCancel: () => void;
  onClaim: () => void;
  loading?: boolean;
}

const TaskActionButtons: React.FC<TaskActionButtonsProps> = ({
  task,
  onStart,
  onComplete,
  onBlock,
  onUnblock,
  onCancel,
  onClaim,
  loading = false
}) => {
  const showStartButton = canStartTask(task);
  const showCompleteButton = canCompleteTask(task);
  const showBlockButton = canBlockTask(task);
  const showUnblockButton = canUnblockTask(task);
  const showClaimButton = !task.assignedToUserId && task.status === 'NotStarted';
  const showCancelButton = task.status !== 'Completed' && task.status !== 'Cancelled';

  // Don't render if no actions available
  const hasActions = showStartButton || showCompleteButton || showBlockButton || 
                     showUnblockButton || showClaimButton || showCancelButton;

  if (!hasActions) {
    return null;
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {showStartButton && (
            <Button
              variant="contained"
              startIcon={<StartIcon />}
              onClick={onStart}
              disabled={loading}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #0BB3D9 90%)',
                },
              }}
            >
              Start Task
            </Button>
          )}

          {showCompleteButton && (
            <Button
              variant="contained"
              startIcon={<CompleteIcon />}
              onClick={onComplete}
              disabled={loading}
              color="success"
              sx={{
                background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)',
                },
              }}
            >
              Complete Task
            </Button>
          )}

          {showUnblockButton && (
            <Button
              variant="contained"
              startIcon={<UnblockIcon />}
              onClick={onUnblock}
              disabled={loading}
              color="info"
            >
              Unblock Task
            </Button>
          )}

          {showBlockButton && (
            <Button
              variant="outlined"
              startIcon={<BlockIcon />}
              onClick={onBlock}
              disabled={loading}
              color="error"
            >
              Block Task
            </Button>
          )}

          {showClaimButton && (
            <Button
              variant="outlined"
              startIcon={<ClaimIcon />}
              onClick={onClaim}
              disabled={loading}
            >
              Claim Task
            </Button>
          )}

          {showCancelButton && (
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={loading}
              color="error"
            >
              Cancel Task
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TaskActionButtons;
