/**
 * TaskMetadata Component
 * Displays task dates, creator, and assignment information
 */

import React from 'react';
import { Card, CardContent, Grid, Typography, Stack, Box, Chip } from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as ClockIcon,
  Person as PersonIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Task } from '../../types/task';
import { 
  formatTaskDate, 
  formatTaskRelativeTime,
  isTaskOverdue,
  isTaskDueSoon 
} from '../../utils/taskUtils';
import UserAvatar from './UserAvatar';

interface TaskMetadataProps {
  task: Task;
}

const TaskMetadata: React.FC<TaskMetadataProps> = ({ task }) => {
  const renderDateField = (
    label: string, 
    date: string | undefined, 
    icon: React.ReactNode,
    warning?: boolean
  ) => {
    if (!date) return null;

    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ color: warning ? 'error.main' : 'text.secondary', display: 'flex' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {label}
          </Typography>
          <Typography 
            variant="body2" 
            fontWeight={500}
            color={warning ? 'error.main' : 'text.primary'}
          >
            {formatTaskDate(date)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTaskRelativeTime(date)}
          </Typography>
        </Box>
      </Stack>
    );
  };

  const renderUserField = (
    label: string,
    fullName?: string,
    email?: string,
    profileImageUrl?: string,
    icon?: React.ReactNode
  ) => {
    if (!fullName && !email) return null;

    return (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <UserAvatar 
          fullName={fullName}
          email={email}
          profileImageUrl={profileImageUrl}
          size="medium"
        />
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {label}
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {fullName || email}
          </Typography>
          {email && fullName && (
            <Typography variant="caption" color="text.secondary">
              {email}
            </Typography>
          )}
        </Box>
      </Stack>
    );
  };

  const overdue = isTaskOverdue(task);
  const dueSoon = isTaskDueSoon(task);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Details
        </Typography>

        <Grid container spacing={3}>
          {/* Dates Section */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2.5}>
              {renderDateField(
                'Created',
                task.createdDate,
                <CalendarIcon fontSize="small" />
              )}

              {renderDateField(
                'Due Date',
                task.dueDate,
                overdue ? <WarningIcon fontSize="small" /> : <ClockIcon fontSize="small" />,
                overdue
              )}

              {dueSoon && !overdue && task.dueDate && (
                <Chip 
                  label="Due Soon" 
                  size="small" 
                  color="warning" 
                  icon={<WarningIcon />}
                  sx={{ width: 'fit-content' }}
                />
              )}

              {task.startedDate && renderDateField(
                'Started',
                task.startedDate,
                <StartIcon fontSize="small" />
              )}

              {task.completedDate && renderDateField(
                'Completed',
                task.completedDate,
                <CompleteIcon fontSize="small" />
              )}

              {task.blockedDate && renderDateField(
                'Blocked',
                task.blockedDate,
                <BlockIcon fontSize="small" />,
                true
              )}
            </Stack>
          </Grid>

          {/* People Section */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2.5}>
              {renderUserField(
                'Created By',
                task.createdByUser?.fullName,
                task.createdByUser?.email,
                task.createdByUser?.profileImageUrl
              )}

              {task.assignedToUser && renderUserField(
                'Assigned To',
                task.assignedToUser.fullName,
                task.assignedToUser.email,
                task.assignedToUser.profileImageUrl
              )}

              {task.startedByUser && renderUserField(
                'Started By',
                task.startedByUser.fullName,
                task.startedByUser.email,
                task.startedByUser.profileImageUrl
              )}

              {task.completedByUser && renderUserField(
                'Completed By',
                task.completedByUser.fullName,
                task.completedByUser.email,
                task.completedByUser.profileImageUrl
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Blocked Reason */}
        {task.blockedReason && (
          <Box 
            sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: 'error.light', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'error.main'
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <BlockIcon color="error" fontSize="small" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" color="error.dark" fontWeight={600}>
                  Blocked Reason
                </Typography>
                <Typography variant="body2" color="error.dark" sx={{ mt: 0.5 }}>
                  {task.blockedReason}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskMetadata;
