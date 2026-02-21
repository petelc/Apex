import { Chip } from '@mui/material';
import type { ChangeRequestStatus } from '@/types/changeRequest';

interface ChangeRequestStatusBadgeProps {
  status: ChangeRequestStatus;
  size?: 'small' | 'medium';
}

/**
 * Status badge for Change Requests with appropriate colors
 */
export const ChangeRequestStatusBadge = ({ status, size = 'small' }: ChangeRequestStatusBadgeProps) => {
  const getStatusConfig = (status: ChangeRequestStatus) => {
    switch (status) {
      case 'Draft':
        return { label: 'Draft', color: 'default' as const };
      case 'UnderReview':
        return { label: 'Under Review', color: 'info' as const };
      case 'Approved':
        return { label: 'Approved', color: 'success' as const };
      case 'Denied':
        return { label: 'Denied', color: 'error' as const };
      case 'Scheduled':
        return { label: 'Scheduled', color: 'primary' as const };
      case 'InProgress':
        return { label: 'In Progress', color: 'warning' as const };
      case 'Completed':
        return { label: 'Completed', color: 'success' as const };
      case 'Failed':
        return { label: 'Failed', color: 'error' as const };
      case 'RolledBack':
        return { label: 'Rolled Back', color: 'warning' as const };
      case 'Cancelled':
        return { label: 'Cancelled', color: 'default' as const };
      default:
        return { label: status, color: 'default' as const };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
      }}
    />
  );
};
