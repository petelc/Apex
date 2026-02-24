import { Chip } from '@mui/material';
import type { DeploymentRequestStatus } from '@/types/deploymentRequest';

interface DeploymentRequestStatusBadgeProps {
  status: DeploymentRequestStatus;
  size?: 'small' | 'medium';
}

/**
 * Status badge for Deployment Requests with appropriate colors
 */
export const DeploymentRequestStatusBadge = ({
  status,
  size = 'small',
}: DeploymentRequestStatusBadgeProps) => {
  const getStatusConfig = (status: DeploymentRequestStatus) => {
    switch (status) {
      case 'Draft':
        return { label: 'Draft', color: 'default' as const };
      case 'PendingApproval':
        return { label: 'Pending Approval', color: 'info' as const };
      case 'Approved':
        return { label: 'Approved', color: 'success' as const };
      case 'Rejected':
        return { label: 'Rejected', color: 'error' as const };
      case 'Scheduled':
        return { label: 'Scheduled', color: 'primary' as const };
      case 'InProgress':
        return { label: 'In Progress', color: 'warning' as const };
      case 'Deployed':
        return { label: 'Deployed', color: 'success' as const };
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
