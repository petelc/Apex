import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Notification } from '../../types/notification';

interface Props {
  notification: Notification;
}

export function NotificationItem({ notification }: Props) {
  const navigate = useNavigate();
  const { markRead } = useNotifications();

  const handleClick = async () => {
    if (!notification.isRead) {
      await markRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <ListItem
      onClick={handleClick}
      sx={{
        cursor: notification.actionUrl ? 'pointer' : 'default',
        borderLeft: notification.isRead ? 'none' : '3px solid',
        borderLeftColor: 'primary.main',
        pl: notification.isRead ? 2 : 1.625,
        '&:hover': notification.actionUrl ? { bgcolor: 'action.hover' } : {},
        alignItems: 'flex-start',
      }}
      divider
    >
      <ListItemText
        primary={
          <Typography
            variant='body2'
            fontWeight={notification.isRead ? 400 : 600}
          >
            {notification.title}
          </Typography>
        }
        secondary={
          <Box>
            <Typography variant='caption' color='text.secondary' display='block'>
              {notification.message}
            </Typography>
            <Typography variant='caption' color='text.disabled'>
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}
