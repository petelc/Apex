/**
 * TaskTimeline Component
 * Displays activity log timeline with user information
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  History as HistoryIcon,
  Circle as DotIcon,
  AddCircle as CreatedIcon,
  Edit as UpdatedIcon,
  PersonAdd as AssignedIcon,
  Person as ClaimedIcon,
  PlayArrow as StartedIcon,
  Block as BlockedIcon,
  CheckCircle as UnblockedIcon,
  Done as CompletedIcon,
  Cancel as CancelledIcon,
  Schedule as TimeLoggedIcon,
  Comment as CommentIcon,
  CheckBox as ChecklistIcon,
  Note as NotesIcon,
} from '@mui/icons-material';
import { TaskActivity, TaskActivityType } from '../../types/timeline';
import {
  formatTaskDateTime,
  formatTaskRelativeTime,
  getUserInitials,
} from '../../utils/taskUtils';

interface TaskTimelineProps {
  activities: TaskActivity[];
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({ activities }) => {
  const getActivityIcon = (type: TaskActivityType) => {
    const iconProps = { fontSize: 'small' as const };

    switch (type) {
      case 'Created':
        return <CreatedIcon {...iconProps} />;
      case 'Updated':
        return <UpdatedIcon {...iconProps} />;
      case 'Assigned':
        return <AssignedIcon {...iconProps} />;
      case 'Claimed':
        return <ClaimedIcon {...iconProps} />;
      case 'Started':
        return <StartedIcon {...iconProps} />;
      case 'Blocked':
        return <BlockedIcon {...iconProps} />;
      case 'Unblocked':
        return <UnblockedIcon {...iconProps} />;
      case 'Completed':
        return <CompletedIcon {...iconProps} />;
      case 'Cancelled':
        return <CancelledIcon {...iconProps} />;
      case 'TimeLogged':
        return <TimeLoggedIcon {...iconProps} />;
      case 'CommentAdded':
        return <CommentIcon {...iconProps} />;
      case 'ChecklistItemAdded':
        return <ChecklistIcon {...iconProps} />;
      case 'ChecklistItemCompleted':
        return <ChecklistIcon {...iconProps} />;
      case 'NotesUpdated':
        return <NotesIcon {...iconProps} />;
      default:
        return <DotIcon {...iconProps} />;
    }
  };

  const getActivityColor = (
    type: TaskActivityType,
  ): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'grey' => {
    switch (type) {
      case 'Created':
        return 'primary';
      case 'Started':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Blocked':
        return 'error';
      case 'Unblocked':
        return 'success';
      case 'Cancelled':
        return 'grey';
      case 'Assigned':
        return 'primary';
      case 'TimeLogged':
        return 'info';
      default:
        return 'grey';
    }
  };

  if (activities.length === 0) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <HistoryIcon color='action' />
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Activity Timeline
            </Typography>
          </Box>

          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 1,
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <HistoryIcon
              sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }}
            />
            <Typography variant='body2' color='text.secondary'>
              No activity yet
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant='outlined'>
      <CardContent>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          sx={{ mb: 3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color='action' />
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Activity Timeline
            </Typography>
          </Box>
          <Chip label={`${activities.length} activities`} size='small' />
        </Stack>

        <Timeline sx={{ p: 0, m: 0 }}>
          {activities.map((activity, index) => (
            <TimelineItem key={activity.id}>
              <TimelineOppositeContent
                sx={{
                  flex: 0.3,
                  py: 2,
                  px: 1,
                }}
              >
                <Typography
                  variant='caption'
                  color='text.secondary'
                  display='block'
                >
                  {formatTaskRelativeTime(activity.timestamp)}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  display='block'
                >
                  {formatTaskDateTime(activity.timestamp)}
                </Typography>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={getActivityColor(activity.activityType)}>
                  {getActivityIcon(activity.activityType)}
                </TimelineDot>
                {index < activities.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 2, px: 2 }}>
                <Box>
                  <Typography variant='subtitle2' fontWeight={600}>
                    {activity.description}
                  </Typography>

                  {/* User Info */}
                  <Stack
                    direction='row'
                    spacing={1}
                    alignItems='center'
                    sx={{ mt: 0.5 }}
                  >
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: '0.75rem',
                        bgcolor: 'primary.main',
                      }}
                    >
                      {getUserInitials(activity.userName, activity.userEmail)}
                    </Avatar>
                    <Typography variant='caption' color='text.secondary'>
                      {activity.userName ||
                        activity.userEmail ||
                        'Unknown User'}
                    </Typography>
                  </Stack>

                  {/* Details */}
                  {activity.details && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        borderLeft: '3px solid',
                        borderLeftColor: `${getActivityColor(activity.activityType)}.main`,
                      }}
                    >
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          whiteSpace: 'pre-wrap',
                          fontFamily:
                            activity.activityType === 'NotesUpdated'
                              ? 'monospace'
                              : 'inherit',
                          fontSize:
                            activity.activityType === 'NotesUpdated'
                              ? '0.85rem'
                              : 'inherit',
                        }}
                      >
                        {activity.details}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
};

export default TaskTimeline;
