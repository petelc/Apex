import { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import {
  Send,
  CheckCircle,
  Cancel,
  Schedule,
  PlayArrow,
  Done,
  Error,
  Undo,
  MoreVert,
  Edit,
  Delete,
} from '@mui/icons-material';
import type { ChangeRequest } from '@/types/changeRequest';

interface WorkflowActionButtonsProps {
  changeRequest: ChangeRequest;
  onAction: (action: WorkflowAction, data?: any) => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => void;
}

export type WorkflowAction =
  | 'submit'
  | 'approve'
  | 'deny'
  | 'schedule'
  | 'start'
  | 'complete'
  | 'fail'
  | 'rollback'
  | 'cancel';

/**
 * Dynamic action buttons based on change request status
 */
export const WorkflowActionButtons = ({
  changeRequest,
  onAction,
  onEdit,
  onDelete,
}: WorkflowActionButtonsProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState<WorkflowAction | null>(null);
  const [dialogData, setDialogData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = (action: WorkflowAction) => {
    setDialogOpen(action);
    setDialogData({});
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(null);
    setDialogData({});
  };

  const handleAction = async (action: WorkflowAction, data?: any) => {
    try {
      setLoading(true);
      await onAction(action, data);
      handleDialogClose();
    } finally {
      setLoading(false);
    }
  };

  // Determine available actions based on status
  const getAvailableActions = () => {
    const { status } = changeRequest;

    switch (status) {
      case 'Draft':
        return (
          <>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={() => handleAction('submit')}
              disabled={loading}
            >
              Submit for Review
            </Button>
            {onEdit && (
              <Button startIcon={<Edit />} onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                startIcon={<Delete />}
                color="error"
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
          </>
        );

      case 'UnderReview':
        return (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleDialogOpen('approve')}
              disabled={loading}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleDialogOpen('deny')}
              disabled={loading}
            >
              Deny
            </Button>
          </>
        );

      case 'Approved':
        return (
          <>
            <Button
              variant="contained"
              startIcon={<Schedule />}
              onClick={() => handleDialogOpen('schedule')}
              disabled={loading}
            >
              Schedule
            </Button>
            <Button
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleAction('cancel')}
              disabled={loading}
            >
              Cancel
            </Button>
          </>
        );

      case 'Scheduled':
        return (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrow />}
              onClick={() => handleAction('start')}
              disabled={loading}
            >
              Start Execution
            </Button>
            <Button
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleAction('cancel')}
              disabled={loading}
            >
              Cancel
            </Button>
          </>
        );

      case 'InProgress':
        return (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<Done />}
              onClick={() => handleDialogOpen('complete')}
              disabled={loading}
            >
              Complete
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Error />}
              onClick={() => handleAction('fail')}
              disabled={loading}
            >
              Mark Failed
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Undo />}
              onClick={() => handleDialogOpen('rollback')}
              disabled={loading}
            >
              Rollback
            </Button>
          </>
        );

      case 'Failed':
        return (
          <Button
            variant="contained"
            color="warning"
            startIcon={<Undo />}
            onClick={() => handleDialogOpen('rollback')}
            disabled={loading}
          >
            Rollback
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {getAvailableActions()}
      </Box>

      {/* Approve Dialog */}
      <Dialog open={dialogOpen === 'approve'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Change Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Approval Notes"
            fullWidth
            multiline
            rows={3}
            value={dialogData.notes || ''}
            onChange={(e) => setDialogData({ ...dialogData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleAction('approve', { notes: dialogData.notes || '' })}
            disabled={loading}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deny Dialog */}
      <Dialog open={dialogOpen === 'deny'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Deny Change Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Denial *"
            fullWidth
            multiline
            rows={3}
            required
            value={dialogData.reason || ''}
            onChange={(e) => setDialogData({ ...dialogData, reason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAction('deny', { reason: dialogData.reason })}
            disabled={!dialogData.reason || loading}
          >
            Deny
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={dialogOpen === 'schedule'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Change</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Scheduled Start Date"
              type="datetime-local"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={dialogData.scheduledStartDate || ''}
              onChange={(e) => setDialogData({ ...dialogData, scheduledStartDate: e.target.value })}
            />
            <TextField
              label="Scheduled End Date"
              type="datetime-local"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={dialogData.scheduledEndDate || ''}
              onChange={(e) => setDialogData({ ...dialogData, scheduledEndDate: e.target.value })}
            />
            <TextField
              label="Change Window"
              fullWidth
              placeholder="e.g., Maintenance Window - Weekend"
              value={dialogData.changeWindow || ''}
              onChange={(e) => setDialogData({ ...dialogData, changeWindow: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              handleAction('schedule', {
                scheduledStartDate: new Date(dialogData.scheduledStartDate).toISOString(),
                scheduledEndDate: new Date(dialogData.scheduledEndDate).toISOString(),
                changeWindow: dialogData.changeWindow || '',
              })
            }
            disabled={!dialogData.scheduledStartDate || !dialogData.scheduledEndDate || loading}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={dialogOpen === 'complete'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Change</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Implementation Notes"
            fullWidth
            multiline
            rows={3}
            value={dialogData.notes || ''}
            onChange={(e) => setDialogData({ ...dialogData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleAction('complete', { notes: dialogData.notes || '' })}
            disabled={loading}
          >
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rollback Dialog */}
      <Dialog open={dialogOpen === 'rollback'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Rollback Change</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            This will roll back the change to its previous state.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rollback Reason *"
            fullWidth
            multiline
            rows={3}
            required
            value={dialogData.reason || ''}
            onChange={(e) => setDialogData({ ...dialogData, reason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => handleAction('rollback', { reason: dialogData.reason })}
            disabled={!dialogData.reason || loading}
          >
            Rollback
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
