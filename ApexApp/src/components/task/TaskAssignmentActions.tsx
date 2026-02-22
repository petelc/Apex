import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  PersonAdd as ClaimIcon,
} from '@mui/icons-material';
import type { Task } from '@/types/project';
import { AssignTaskToDepartmentDialog } from '@/components/task/AssignTaskToDepartmentDialog';
import { AssignTaskToUserDialog } from '@/components/task/AssignTaskToUserDialog';
import tasksApi from '@/api/tasks';

interface TaskAssignmentActionsProps {
  task: Task;
  onUpdate: () => void;
}

export const TaskAssignmentActions: React.FC<TaskAssignmentActionsProps> = ({
  task,
  onUpdate,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [assignDepartmentDialogOpen, setAssignDepartmentDialogOpen] =
    useState(false);
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAssignDepartment = () => {
    handleMenuClose();
    setAssignDepartmentDialogOpen(true);
  };

  const handleAssignUser = () => {
    handleMenuClose();
    setAssignUserDialogOpen(true);
  };

  const handleClaim = async () => {
    handleMenuClose();
    try {
      setClaiming(true);
      await tasksApi.claimTask(task.id);
      onUpdate();
    } catch (err) {
      console.error('Error claiming task:', err);
    } finally {
      setClaiming(false);
    }
  };

  const handleDialogSuccess = () => {
    setAssignDepartmentDialogOpen(false);
    setAssignUserDialogOpen(false);
    onUpdate();
  };

  const handleDialogClose = () => {
    setAssignDepartmentDialogOpen(false);
    setAssignUserDialogOpen(false);
  };

  // Show claim button if task is assigned to department but not to user
  const canClaim = task.assignedToDepartmentId && !task.assignedToUserId;

  return (
    <>
      <Box>
        <Button
          variant='outlined'
          startIcon={<AssignmentIcon />}
          onClick={handleMenuOpen}
          disabled={claiming}
        >
          {task.assignedToUserId
            ? `Assigned to ${task.assignedToUserName}`
            : task.assignedToDepartmentId
              ? `Department: ${task.assignedToDepartmentName}`
              : 'Assign Task'}
        </Button>

        <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
          <MenuItem onClick={handleAssignDepartment}>
            <ListItemIcon>
              <BusinessIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Assign to Department</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleAssignUser}>
            <ListItemIcon>
              <PersonIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Assign to User</ListItemText>
          </MenuItem>

          {canClaim && (
            <MenuItem onClick={handleClaim}>
              <ListItemIcon>
                <ClaimIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>Claim for Myself</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Box>

      {/* Assignment Dialogs */}
      <AssignTaskToDepartmentDialog
        open={assignDepartmentDialogOpen}
        task={task}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
      />

      <AssignTaskToUserDialog
        open={assignUserDialogOpen}
        task={task}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
};
