import { Chip } from '@mui/material';

type Status = string;

interface StatusBadgeProps {
  status: Status;
  size: 'small' | 'medium';
}

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
  // ProjectRequest
  Draft: 'default',
  Pending: 'warning',
  InReview: 'info',
  Approved: 'success',
  Denied: 'error',
  Cancelled: 'default',
  Converted: 'primary',
  
  // Project
  Planning: 'info',
  Active: 'success',
  OnHold: 'warning',
  Completed: 'primary',
  
  // Task
  NotStarted: 'default',
  InProgress: 'primary',
  Blocked: 'error',
};

export const StatusBadge = ({ status, size }: StatusBadgeProps) => {
  // Convert camelCase to spaces
  const displayText = status.replace(/([A-Z])/g, ' $1').trim();
  
  return (
    <Chip
      label={displayText}
      color={statusColors[status] || 'default'}
      size={size}
    />
  );
};
