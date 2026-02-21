/**
 * TaskPriorityBadge Component
 * Displays task priority with appropriate color and icon
 */

import React from 'react';
import { Chip } from '@mui/material';
import { 
  Flag as LowIcon,
  FlagOutlined as MediumIcon,
  PriorityHigh as HighIcon,
  Warning as CriticalIcon 
} from '@mui/icons-material';
import { TaskPriority, TaskPriorityLabels } from '../../types/task';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ 
  priority, 
  size = 'medium',
  showIcon = true 
}) => {
  const getColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Low':
        return 'info';
      case 'Medium':
        return 'default';
      case 'High':
        return 'warning';
      case 'Critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getIcon = (priority: TaskPriority) => {
    const iconProps = { fontSize: size === 'small' ? 'small' : 'medium' } as const;
    switch (priority) {
      case 'Low':
        return <LowIcon {...iconProps} />;
      case 'Medium':
        return <MediumIcon {...iconProps} />;
      case 'High':
        return <HighIcon {...iconProps} />;
      case 'Critical':
        return <CriticalIcon {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <Chip
      label={TaskPriorityLabels[priority]}
      color={getColor(priority)}
      size={size}
      icon={showIcon ? getIcon(priority) : undefined}
      sx={{
        fontWeight: 600,
      }}
    />
  );
};

export default TaskPriorityBadge;
