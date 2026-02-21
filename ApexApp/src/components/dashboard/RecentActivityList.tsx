// src/components/dashboard/RecentActivityList.tsx

import {
  Card,
  CardContent,
  Typography,
  List,
  ListItemText,
  Box,
  Divider,
  ListItemButton,
} from '@mui/material';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/common/StatusBadge';

interface ActivityItem {
  id: string;
  title: string;
  status: string;
  date: string;
  type: 'change' | 'project' | 'task';
}

interface RecentActivityListProps {
  title: string;
  items: ActivityItem[];
  emptyMessage?: string;
}

export function RecentActivityList({
  title,
  items,
  emptyMessage = 'No recent activity',
}: RecentActivityListProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {title}
        </Typography>

        {items.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {items.map((item, index) => (
              <Box key={item.id} >
                {index > 0 && <Divider sx={{ my: 1 }} />}
                <Box display="flex" justifyContent="space-around" alignItems="center" mb={1}>
                <StatusBadge status={item.status} size="small" />
                <ListItemButton key={item.id}
                        sx={{ py: 0, minHeight: 32, color: 'rgba(255,255,255,.8)' }} >
                    
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <>
                          {format(new Date(item.date), 'PPP')}
                        </>
                      }
                    />
                </ListItemButton>
                </Box>
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}