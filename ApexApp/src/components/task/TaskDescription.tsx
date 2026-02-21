/**
 * TaskDescription Component
 * Displays task description with formatted text
 */

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';

interface TaskDescriptionProps {
  description: string;
}

const TaskDescription: React.FC<TaskDescriptionProps> = ({ description }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <DescriptionIcon color="action" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Description
          </Typography>
        </Box>

        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            lineHeight: 1.7,
            color: 'text.secondary'
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TaskDescription;
