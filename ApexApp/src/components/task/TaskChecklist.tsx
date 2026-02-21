/**
 * TaskChecklist Component
 * Interactive checklist with add/toggle functionality
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  TextField,
  Button,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  CheckBoxOutlineBlank as UncheckedIcon,
  CheckBox as CheckedIcon,
  PlaylistAddCheck as ChecklistIcon,
  Close as CancelIcon
} from '@mui/icons-material';
import { ChecklistItem } from '../../types/checklist';
import { formatTaskRelativeTime } from '../../utils/taskUtils';

interface TaskChecklistProps {
  taskId: string;
  items: ChecklistItem[];
  onAddItem: (description: string) => Promise<void>;
  onToggleItem: (itemId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  canEdit: boolean;
}

const TaskChecklist: React.FC<TaskChecklistProps> = ({ 
  taskId,
  items, 
  onAddItem, 
  onToggleItem,
  onRefresh,
  canEdit 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItemDescription, setNewItemDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  const completedCount = items.filter(item => item.isCompleted).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddClick = () => {
    setIsAdding(true);
    setError(null);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewItemDescription('');
    setError(null);
  };

  const handleSubmitAdd = async () => {
    const description = newItemDescription.trim();
    
    if (!description) {
      setError('Description is required');
      return;
    }

    if (description.length > 500) {
      setError('Description must be less than 500 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAddItem(description);
      setNewItemDescription('');
      setIsAdding(false);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (itemId: string) => {
    try {
      setTogglingId(itemId);
      setError(null);
      await onToggleItem(itemId);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle item');
    } finally {
      setTogglingId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAdd();
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChecklistIcon color="action" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Checklist
            </Typography>
            {totalCount > 0 && (
              <Chip 
                label={`${completedCount}/${totalCount}`} 
                size="small"
                color={completedCount === totalCount ? 'success' : 'default'}
              />
            )}
          </Box>

          {canEdit && !isAdding && (
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              size="small"
              variant="outlined"
            >
              Add Item
            </Button>
          )}
        </Stack>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {progressPercentage.toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage}
              color={completedCount === totalCount ? 'success' : 'primary'}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Add New Item Form */}
        {isAdding && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter checklist item description..."
              disabled={isSubmitting}
              autoFocus
              inputProps={{ maxLength: 500 }}
              helperText={`${newItemDescription.length}/500 characters`}
              sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSubmitAdd}
                disabled={isSubmitting || !newItemDescription.trim()}
              >
                Add Item
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancelAdd}
                disabled={isSubmitting}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        )}

        {/* Checklist Items */}
        {sortedItems.length > 0 ? (
          <List sx={{ py: 0 }}>
            {sortedItems.map((item) => (
              <ListItem
                key={item.id}
                disablePadding
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <ListItemButton
                  onClick={() => canEdit && handleToggle(item.id)}
                  disabled={!canEdit || togglingId === item.id}
                  sx={{
                    py: 1.5,
                    ...(item.isCompleted && {
                      bgcolor: 'action.hover'
                    })
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {togglingId === item.id ? (
                      <CircularProgress size={24} />
                    ) : item.isCompleted ? (
                      <CheckedIcon color="success" />
                    ) : (
                      <UncheckedIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.description}
                    secondary={
                      item.isCompleted && item.completedDate
                        ? `Completed ${formatTaskRelativeTime(item.completedDate)}`
                        : null
                    }
                    primaryTypographyProps={{
                      sx: {
                        ...(item.isCompleted && {
                          textDecoration: 'line-through',
                          color: 'text.secondary'
                        })
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : !isAdding ? (
          <Box 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 1,
              border: '2px dashed',
              borderColor: 'divider'
            }}
          >
            <ChecklistIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No checklist items yet
            </Typography>
            {canEdit && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Click "Add Item" to create a to-do list for this task
              </Typography>
            )}
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TaskChecklist;
