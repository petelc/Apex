/**
 * TaskStatusBadge Component
 * Displays task status with appropriate color
 */

import React from 'react';
import { Chip } from '@mui/material';
import { TaskStatus, TaskStatusLabels, TaskStatusColors } from '../../types/task';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: 'small' | 'medium';
}

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, size = 'medium' }) => {
  const getColor = (status: TaskStatus) => {
    switch (status) {
      case 'NotStarted':
        return 'default';
      case 'InProgress':
        return 'warning';
      case 'Blocked':
        return 'error';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={TaskStatusLabels[status]}
      color={getColor(status)}
      size={size}
      sx={{
        fontWeight: 600,
        ...(status === 'Cancelled' && {
          opacity: 0.6,
        }),
      }}
    />
  );
};

export default TaskStatusBadge;
