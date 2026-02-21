/**
 * TaskHeader Component
 * Displays task title, status, priority, and action buttons
 */

import React from 'react';
import { Box, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types/task';
import { isTaskEditable } from '../../utils/taskUtils';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';

interface TaskHeaderProps {
  task: Task;
  projectId: string; // Add this
  onEdit: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ task, projectId, onEdit }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/tasks`);
    } else {
      navigate('/projects');
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction='row' alignItems='center' spacing={2} sx={{ mb: 2 }}>
        <Tooltip title='Back to Project' arrow>
          <IconButton onClick={handleBack} size='small'>
            <BackIcon />
          </IconButton>
        </Tooltip>

        <Typography
          variant='h4'
          component='h1'
          sx={{ flex: 1, fontWeight: 600 }}
        >
          {task.title}
        </Typography>

        {isTaskEditable(task) && (
          <Tooltip title='Edit Task' arrow>
            <IconButton onClick={onEdit} color='primary'>
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Stack direction='row' spacing={1.5} alignItems='center'>
        <TaskStatusBadge status={task.status} />
        <TaskPriorityBadge priority={task.priority} />
      </Stack>
    </Box>
  );
};

export default TaskHeader;
