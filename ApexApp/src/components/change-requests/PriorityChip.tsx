import { Chip } from '@mui/material';
import { PriorityHigh, KeyboardArrowUp, KeyboardArrowDown, Remove } from '@mui/icons-material';
import type { Priority, RiskLevel } from '@/types/changeRequest';

interface PriorityChipProps {
  priority: Priority;
  size?: 'small' | 'medium';
}

/**
 * Priority chip with icon and color
 */
export const PriorityChip = ({ priority, size = 'small' }: PriorityChipProps) => {
  const getConfig = (priority: Priority) => {
    switch (priority) {
      case 'Critical':
        return {
          label: 'Critical',
          color: 'error' as const,
          icon: <PriorityHigh fontSize="small" />,
        };
      case 'High':
        return {
          label: 'High',
          color: 'warning' as const,
          icon: <KeyboardArrowUp fontSize="small" />,
        };
      case 'Medium':
        return {
          label: 'Medium',
          color: 'info' as const,
          icon: <Remove fontSize="small" />,
        };
      case 'Low':
        return {
          label: 'Low',
          color: 'success' as const,
          icon: <KeyboardArrowDown fontSize="small" />,
        };
    }
  };

  const config = getConfig(priority);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      variant="outlined"
      sx={{
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
      }}
    />
  );
};

interface RiskChipProps {
  risk: RiskLevel;
  size?: 'small' | 'medium';
}

/**
 * Risk level chip with appropriate styling
 */
export const RiskChip = ({ risk, size = 'small' }: RiskChipProps) => {
  const getConfig = (risk: RiskLevel) => {
    switch (risk) {
      case 'Critical':
        return { label: 'Critical Risk', color: 'error' as const };
      case 'High':
        return { label: 'High Risk', color: 'error' as const };
      case 'Medium':
        return { label: 'Medium Risk', color: 'warning' as const };
      case 'Low':
        return { label: 'Low Risk', color: 'success' as const };
    }
  };

  const config = getConfig(risk);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="filled"
      sx={{
        fontWeight: risk === 'Critical' || risk === 'High' ? 700 : 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
      }}
    />
  );
};
