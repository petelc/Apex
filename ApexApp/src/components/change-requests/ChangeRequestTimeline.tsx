import {
  Box,
  Typography,
  Paper,
  alpha,
  useTheme,
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
  Create,
  Send,
  CheckCircle,
  Cancel,
  Schedule,
  PlayArrow,
  Done,
  Error as ErrorIcon,
  Undo,
} from '@mui/icons-material';
import type { ChangeRequest } from '@/types/changeRequest';
import { format } from 'date-fns';

interface ChangeRequestTimelineProps {
  changeRequest: ChangeRequest;
}

interface TimelineEvent {
  date: Date;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'grey';
}

/**
 * Timeline showing change request history
 */
export const ChangeRequestTimeline = ({ changeRequest }: ChangeRequestTimelineProps) => {
  const theme = useTheme();

  // Helper function to get color value
  const getColorValue = (color: TimelineEvent['color']) => {
    if (color === 'grey') {
      return theme.palette.grey[500];
    }
    return theme.palette[color].main;
  };

  // Build timeline events from change request data
  const events: TimelineEvent[] = [];

  // Created
  events.push({
    date: new Date(changeRequest.createdDate),
    label: 'Created',
    description: 'Change request created as draft',
    icon: <Create fontSize="small" />,
    color: 'grey',
  });

  // Submitted
  if (changeRequest.submittedDate) {
    events.push({
      date: new Date(changeRequest.submittedDate),
      label: 'Submitted for Review',
      description: 'Sent to CAB for approval',
      icon: <Send fontSize="small" />,
      color: 'info',
    });
  }

  // Approved
  if (changeRequest.approvedDate) {
    events.push({
      date: new Date(changeRequest.approvedDate),
      label: 'Approved',
      description: changeRequest.approvalNotes
        ? `Approved with notes: ${changeRequest.approvalNotes}`
        : 'Change request approved by CAB',
      icon: <CheckCircle fontSize="small" />,
      color: 'success',
    });
  }

  // Denied
  if (changeRequest.deniedDate) {
    events.push({
      date: new Date(changeRequest.deniedDate),
      label: 'Denied',
      description: changeRequest.denialReason
        ? `Denied: ${changeRequest.denialReason}`
        : 'Change request denied',
      icon: <Cancel fontSize="small" />,
      color: 'error',
    });
  }

  // Scheduled
  if (changeRequest.scheduledStartDate) {
    events.push({
      date: new Date(changeRequest.createdDate), // Use creation as proxy since we don't have "scheduled on" date
      label: 'Scheduled',
      description: `Scheduled for ${format(
        new Date(changeRequest.scheduledStartDate),
        'MMM d, yyyy h:mm a'
      )}${changeRequest.changeWindow ? ` - ${changeRequest.changeWindow}` : ''}`,
      icon: <Schedule fontSize="small" />,
      color: 'primary',
    });
  }

  // Started
  if (changeRequest.actualStartDate) {
    events.push({
      date: new Date(changeRequest.actualStartDate),
      label: 'Execution Started',
      description: 'Change implementation began',
      icon: <PlayArrow fontSize="small" />,
      color: 'warning',
    });
  }

  // Completed
  if (changeRequest.completedDate) {
    events.push({
      date: new Date(changeRequest.completedDate),
      label: 'Completed',
      description: changeRequest.implementationNotes
        ? `Completed: ${changeRequest.implementationNotes}`
        : 'Change completed successfully',
      icon: <Done fontSize="small" />,
      color: 'success',
    });
  }

  // Failed
  if (changeRequest.status === 'Failed') {
    events.push({
      date: new Date(changeRequest.lastModifiedDate),
      label: 'Failed',
      description: 'Change implementation failed',
      icon: <ErrorIcon fontSize="small" />,
      color: 'error',
    });
  }

  // Rolled Back
  if (changeRequest.rolledBackDate) {
    events.push({
      date: new Date(changeRequest.rolledBackDate),
      label: 'Rolled Back',
      description: changeRequest.rollbackReason
        ? `Rolled back: ${changeRequest.rollbackReason}`
        : 'Change rolled back to previous state',
      icon: <Undo fontSize="small" />,
      color: 'warning',
    });
  }

  // Cancelled
  if (changeRequest.status === 'Cancelled') {
    events.push({
      date: new Date(changeRequest.lastModifiedDate),
      label: 'Cancelled',
      description: 'Change request cancelled',
      icon: <Cancel fontSize="small" />,
      color: 'grey',
    });
  }

  // Sort by date descending (most recent first)
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (events.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body2" color="text.secondary">
          No timeline events yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Timeline
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete history of this change request
      </Typography>

      <Timeline position="right">
        {events.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
              <Typography variant="caption" fontWeight={600}>
                {format(event.date, 'MMM d, yyyy')}
              </Typography>
              <Typography variant="caption" display="block">
                {format(event.date, 'h:mm a')}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot
                color={event.color === 'grey' ? undefined : event.color}
                sx={{
                  bgcolor: event.color === 'grey' ? theme.palette.grey[500] : undefined,
                  boxShadow: `0 0 0 4px ${alpha(getColorValue(event.color), 0.2)}`,
                }}
              >
                {event.icon}
              </TimelineDot>
              {index < events.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: alpha(getColorValue(event.color), 0.05),
                  border: `1px solid ${alpha(getColorValue(event.color), 0.2)}`,
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {event.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {event.description}
                </Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};
