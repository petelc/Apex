import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  Stack,
  Alert,
  LinearProgress,
  Chip,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Send,
  CheckCircle,
  Cancel,
  Schedule,
  PlayArrow,
  Done,
  Error as ErrorIcon,
  Undo,
  Delete,
} from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { DeploymentRequestStatusBadge } from '@/components/deployment-requests/DeploymentRequestStatusBadge';
import { deploymentRequestApi } from '@/api/deploymentRequests';
import { getErrorMessage } from '@/api/client';
import type { DeploymentRequest } from '@/types/deploymentRequest';
import { format } from 'date-fns';

type WorkflowDialogType =
  | 'approve'
  | 'reject'
  | 'schedule'
  | 'complete'
  | 'fail'
  | 'rollback'
  | null;

/**
 * Deployment Request Detail Page
 */
export default function DeploymentRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [deploymentRequest, setDeploymentRequest] = useState<DeploymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState<WorkflowDialogType>(null);
  const [dialogData, setDialogData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadDeploymentRequest();
    }

    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [id, location]);

  const loadDeploymentRequest = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await deploymentRequestApi.getById(id!);
      setDeploymentRequest(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (type: WorkflowDialogType) => {
    setDialogOpen(type);
    setDialogData({});
  };

  const handleDialogClose = () => {
    setDialogOpen(null);
    setDialogData({});
  };

  const runAction = async (fn: () => Promise<void>, successMsg: string) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');
      await fn();
      setSuccessMessage(successMsg);
      handleDialogClose();
      await loadDeploymentRequest();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = () =>
    runAction(() => deploymentRequestApi.submit(id!), 'Deployment request submitted for approval!');

  const handleApprove = () =>
    runAction(
      () => deploymentRequestApi.approve(id!, { notes: dialogData.notes }),
      'Deployment request approved!'
    );

  const handleReject = () =>
    runAction(
      () => deploymentRequestApi.reject(id!, { reason: dialogData.reason }),
      'Deployment request rejected.'
    );

  const handleSchedule = () =>
    runAction(
      () =>
        deploymentRequestApi.schedule(id!, {
          scheduledStartDate: new Date(dialogData.scheduledStartDate).toISOString(),
          scheduledEndDate: new Date(dialogData.scheduledEndDate).toISOString(),
          deploymentWindow: dialogData.deploymentWindow || undefined,
        }),
      'Deployment request scheduled!'
    );

  const handleStart = () =>
    runAction(() => deploymentRequestApi.start(id!), 'Deployment execution started!');

  const handleComplete = () =>
    runAction(
      () => deploymentRequestApi.complete(id!, { deploymentNotes: dialogData.deploymentNotes }),
      'Deployment completed successfully!'
    );

  const handleFail = () =>
    runAction(
      () => deploymentRequestApi.fail(id!, { reason: dialogData.reason }),
      'Deployment marked as failed.'
    );

  const handleRollback = () =>
    runAction(
      () => deploymentRequestApi.rollback(id!, { reason: dialogData.reason }),
      'Deployment rolled back.'
    );

  const handleCancel = () =>
    runAction(() => deploymentRequestApi.cancel(id!), 'Deployment request cancelled.');

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deployment request?')) return;
    try {
      await deploymentRequestApi.delete(id!);
      navigate('/deployment-requests', {
        state: { message: 'Deployment request deleted successfully!' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <>
        <title>Deployment Request - APEX</title>
        <AppLayout>
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        </AppLayout>
      </>
    );
  }

  if (!deploymentRequest) {
    return (
      <>
        <title>Deployment Request - APEX</title>
        <AppLayout>
          <Alert severity="error">Deployment request not found</Alert>
        </AppLayout>
      </>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {value || '—'}
      </Typography>
    </Box>
  );

  const environmentColorMap: Record<string, 'default' | 'primary' | 'warning' | 'error'> = {
    Development: 'default',
    Staging: 'primary',
    UAT: 'warning',
    Production: 'error',
  };

  const renderWorkflowActions = () => {
    const { status } = deploymentRequest;

    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {status === 'Draft' && (
          <>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleSubmit}
              disabled={actionLoading}
            >
              Submit for Approval
            </Button>
            <Button
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
              disabled={actionLoading}
            >
              Delete
            </Button>
          </>
        )}

        {status === 'PendingApproval' && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleDialogOpen('approve')}
              disabled={actionLoading}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleDialogOpen('reject')}
              disabled={actionLoading}
            >
              Reject
            </Button>
            <Button
              color="error"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={actionLoading}
            >
              Cancel
            </Button>
          </>
        )}

        {status === 'Approved' && (
          <>
            <Button
              variant="contained"
              startIcon={<Schedule />}
              onClick={() => handleDialogOpen('schedule')}
              disabled={actionLoading}
            >
              Schedule
            </Button>
            <Button
              color="error"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={actionLoading}
            >
              Cancel
            </Button>
          </>
        )}

        {status === 'Scheduled' && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrow />}
              onClick={handleStart}
              disabled={actionLoading}
            >
              Start Execution
            </Button>
            <Button
              color="error"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={actionLoading}
            >
              Cancel
            </Button>
          </>
        )}

        {status === 'InProgress' && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<Done />}
              onClick={() => handleDialogOpen('complete')}
              disabled={actionLoading}
            >
              Complete
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ErrorIcon />}
              onClick={() => handleDialogOpen('fail')}
              disabled={actionLoading}
            >
              Mark Failed
            </Button>
          </>
        )}

        {status === 'Failed' && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<Undo />}
            onClick={() => handleDialogOpen('rollback')}
            disabled={actionLoading}
          >
            Rollback
          </Button>
        )}
      </Box>
    );
  };

  const timelineEvents: { label: string; date?: string }[] = [
    { label: 'Created', date: deploymentRequest.createdDate },
    { label: 'Submitted', date: deploymentRequest.submittedDate },
    { label: 'Approved', date: deploymentRequest.approvedDate },
    { label: 'Rejected', date: deploymentRequest.rejectedDate },
    { label: 'Scheduled', date: deploymentRequest.scheduledDate },
    { label: 'Started', date: deploymentRequest.startedDate },
    { label: 'Deployed', date: deploymentRequest.deployedDate },
    { label: 'Failed', date: deploymentRequest.failedDate },
    { label: 'Rolled Back', date: deploymentRequest.rolledBackDate },
  ].filter((e) => !!e.date);

  return (
    <>
      <title>{deploymentRequest.title} - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/deployment-requests')}
              sx={{ mb: 2 }}
            >
              Back to Deployment Requests
            </Button>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {deploymentRequest.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <DeploymentRequestStatusBadge status={deploymentRequest.status} size="medium" />
                  <Chip
                    label={deploymentRequest.environment}
                    size="medium"
                    color={environmentColorMap[deploymentRequest.environment] ?? 'default'}
                    variant="outlined"
                  />
                  <Chip
                    label={deploymentRequest.priority}
                    size="medium"
                    variant="outlined"
                  />
                  <Chip
                    label={`${deploymentRequest.riskLevel} Risk`}
                    size="medium"
                    color={
                      deploymentRequest.riskLevel === 'Critical' || deploymentRequest.riskLevel === 'High'
                        ? 'error'
                        : deploymentRequest.riskLevel === 'Medium'
                        ? 'warning'
                        : 'default'
                    }
                  />
                  {deploymentRequest.isOverdue && (
                    <Chip label="Overdue" size="medium" color="error" />
                  )}
                </Stack>
              </Box>
            </Box>
          </Box>

          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Workflow Actions */}
          <Card
            sx={{
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.05
              )} 0%, transparent 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Actions
              </Typography>
              {renderWorkflowActions()}
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Main Details */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Deployment Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={3}>
                    <InfoRow label="Description" value={deploymentRequest.description} />
                    <InfoRow label="Affected Systems" value={deploymentRequest.affectedSystems} />
                    <InfoRow label="Rollback Plan" value={deploymentRequest.rollbackPlan} />
                    {deploymentRequest.deploymentWindow && (
                      <InfoRow
                        label="Deployment Window"
                        value={deploymentRequest.deploymentWindow}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Execution / Resolution Details */}
              {(deploymentRequest.deploymentNotes ||
                deploymentRequest.approvalNotes ||
                deploymentRequest.rejectionReason ||
                deploymentRequest.failureReason ||
                deploymentRequest.rollbackReason) && (
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Additional Notes
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Stack spacing={3}>
                      {deploymentRequest.approvalNotes && (
                        <InfoRow label="Approval Notes" value={deploymentRequest.approvalNotes} />
                      )}
                      {deploymentRequest.rejectionReason && (
                        <InfoRow
                          label="Rejection Reason"
                          value={deploymentRequest.rejectionReason}
                        />
                      )}
                      {deploymentRequest.deploymentNotes && (
                        <InfoRow
                          label="Deployment Notes"
                          value={deploymentRequest.deploymentNotes}
                        />
                      )}
                      {deploymentRequest.failureReason && (
                        <InfoRow label="Failure Reason" value={deploymentRequest.failureReason} />
                      )}
                      {deploymentRequest.rollbackReason && (
                        <InfoRow label="Rollback Reason" value={deploymentRequest.rollbackReason} />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Linked Resources */}
              {(deploymentRequest.projectId || deploymentRequest.changeRequestId) && (
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Linked Resources
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Stack spacing={2}>
                      {deploymentRequest.projectId && (
                        <InfoRow label="Project ID" value={deploymentRequest.projectId} />
                      )}
                      {deploymentRequest.changeRequestId && (
                        <InfoRow
                          label="Change Request ID"
                          value={deploymentRequest.changeRequestId}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, lg: 4 }}>
              {/* People */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    People
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={2}>
                    <InfoRow
                      label="Created By"
                      value={deploymentRequest.createdByUserName || deploymentRequest.createdByUserId}
                    />
                    {deploymentRequest.approvedByUserName && (
                      <InfoRow
                        label="Approved / Rejected By"
                        value={deploymentRequest.approvedByUserName}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Timeline
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={2}>
                    {timelineEvents.map((event) => (
                      <InfoRow
                        key={event.label}
                        label={event.label}
                        value={format(new Date(event.date!), 'MMM d, yyyy h:mm a')}
                      />
                    ))}

                    {/* Scheduled window */}
                    {deploymentRequest.scheduledStartDate && (
                      <InfoRow
                        label="Scheduled Start"
                        value={format(
                          new Date(deploymentRequest.scheduledStartDate),
                          'MMM d, yyyy h:mm a'
                        )}
                      />
                    )}
                    {deploymentRequest.scheduledEndDate && (
                      <InfoRow
                        label="Scheduled End"
                        value={format(
                          new Date(deploymentRequest.scheduledEndDate),
                          'MMM d, yyyy h:mm a'
                        )}
                      />
                    )}
                    {deploymentRequest.actualStartDate && (
                      <InfoRow
                        label="Actual Start"
                        value={format(
                          new Date(deploymentRequest.actualStartDate),
                          'MMM d, yyyy h:mm a'
                        )}
                      />
                    )}
                    {deploymentRequest.actualEndDate && (
                      <InfoRow
                        label="Actual End"
                        value={format(
                          new Date(deploymentRequest.actualEndDate),
                          'MMM d, yyyy h:mm a'
                        )}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </AppLayout>

      {/* Approve Dialog */}
      <Dialog open={dialogOpen === 'approve'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Deployment Request</DialogTitle>
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
            onClick={handleApprove}
            disabled={actionLoading}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={dialogOpen === 'reject'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Deployment Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection *"
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
            onClick={handleReject}
            disabled={!dialogData.reason || actionLoading}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={dialogOpen === 'schedule'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Deployment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Scheduled Start Date"
              type="datetime-local"
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
              value={dialogData.scheduledStartDate || ''}
              onChange={(e) =>
                setDialogData({ ...dialogData, scheduledStartDate: e.target.value })
              }
            />
            <TextField
              label="Scheduled End Date"
              type="datetime-local"
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
              value={dialogData.scheduledEndDate || ''}
              onChange={(e) => setDialogData({ ...dialogData, scheduledEndDate: e.target.value })}
            />
            <TextField
              label="Deployment Window"
              fullWidth
              placeholder="e.g. Saturdays 10pm-2am"
              value={dialogData.deploymentWindow || ''}
              onChange={(e) => setDialogData({ ...dialogData, deploymentWindow: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSchedule}
            disabled={
              !dialogData.scheduledStartDate || !dialogData.scheduledEndDate || actionLoading
            }
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={dialogOpen === 'complete'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Deployment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Deployment Notes"
            fullWidth
            multiline
            rows={3}
            value={dialogData.deploymentNotes || ''}
            onChange={(e) => setDialogData({ ...dialogData, deploymentNotes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleComplete}
            disabled={actionLoading}
          >
            Mark Deployed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fail Dialog */}
      <Dialog open={dialogOpen === 'fail'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Deployment as Failed</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Failure Reason"
            fullWidth
            multiline
            rows={3}
            value={dialogData.reason || ''}
            onChange={(e) => setDialogData({ ...dialogData, reason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleFail}
            disabled={actionLoading}
          >
            Mark Failed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rollback Dialog */}
      <Dialog open={dialogOpen === 'rollback'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Rollback Deployment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            This will roll back the deployment to its previous state.
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
            onClick={handleRollback}
            disabled={!dialogData.reason || actionLoading}
          >
            Rollback
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
