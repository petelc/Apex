import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';

export function NotificationDrawer() {
  const { notifications, drawerOpen, closeDrawer, markAllRead, unreadCount } = useNotifications();

  return (
    <Drawer
      anchor='right'
      open={drawerOpen}
      onClose={closeDrawer}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Typography variant='h6' fontWeight={600}>
          Notifications
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {unreadCount > 0 && (
            <Button size='small' onClick={markAllRead}>
              Mark all read
            </Button>
          )}
          <IconButton size='small' onClick={closeDrawer} aria-label='Close notifications'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>
      </Box>

      {/* Notification list */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              No notifications
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </List>
        )}
      </Box>

      <Divider />
      <Box sx={{ p: 1.5, textAlign: 'center', flexShrink: 0 }}>
        <Typography variant='caption' color='text.secondary'>
          Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Drawer>
  );
}
