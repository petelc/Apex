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
  Tabs,
  Tab,
} from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChangeRequestStatusBadge } from '@/components/change-requests/ChangeRequestStatusBadge';
import { PriorityChip, RiskChip } from '@/components/change-requests/PriorityChip';
import { ChangeStatusStepper } from '@/components/change-requests/ChangeStatusStepper';
import { WorkflowActionButtons, type WorkflowAction } from '@/components/change-requests/WorkflowActionButtons';
import { ChangeRequestTimeline } from '@/components/change-requests/ChangeRequestTimeline';
import { changeRequestApi } from '@/api/changeRequests';
import { getErrorMessage } from '@/api/client';
import type { ChangeRequest } from '@/types/changeRequest';
import { format } from 'date-fns';

/**
 * Change Request Detail Page
 */
export default function ChangeRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [changeRequest, setChangeRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) {
      loadChangeRequest();
    }

    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [id, location]);

  const loadChangeRequest = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await changeRequestApi.getById(id!);
      setChangeRequest(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: WorkflowAction, data?: any) => {
    try {
      setError('');
      setSuccessMessage('');

      switch (action) {
        case 'submit':
          await changeRequestApi.submit(id!);
          setSuccessMessage('Change request submitted for review!');
          break;
        case 'approve':
          await changeRequestApi.approve(id!, data);
          setSuccessMessage('Change request approved!');
          break;
        case 'deny':
          await changeRequestApi.deny(id!, data);
          setSuccessMessage('Change request denied.');
          break;
        case 'schedule':
          await changeRequestApi.schedule(id!, data);
          console.log('Scheduled:', data);
          setSuccessMessage('Change request scheduled!');
          break;
        case 'start':
          await changeRequestApi.startExecution(id!);
          setSuccessMessage('Change execution started!');
          break;
        case 'complete':
          await changeRequestApi.complete(id!, data);
          setSuccessMessage('Change completed successfully!');
          break;
        case 'fail':
          await changeRequestApi.markFailed(id!);
          setSuccessMessage('Change marked as failed.');
          break;
        case 'rollback':
          await changeRequestApi.rollback(id!, data);
          setSuccessMessage('Change rolled back.');
          break;
        case 'cancel':
          await changeRequestApi.cancel(id!);
          setSuccessMessage('Change request cancelled.');
          break;
      }

      // Reload the change request
      await loadChangeRequest();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEdit = () => {
    navigate(`/change-requests/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this change request?')) {
      return;
    }

    try {
      await changeRequestApi.delete(id!);
      navigate('/change-requests', {
        state: { message: 'Change request deleted successfully!' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <>
        <title>Change Request - APEX</title>
        <AppLayout>
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        </AppLayout>
      </>
    );
  }

  if (!changeRequest) {
    return (
      <>
        <title>Change Request - APEX</title>
        <AppLayout>
          <Alert severity="error">Change request not found</Alert>
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

  return (
    <>
      <title>{changeRequest.title} - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/change-requests')}
              sx={{ mb: 2 }}
            >
              Back to Change Requests
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {changeRequest.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ChangeRequestStatusBadge status={changeRequest.status} size="medium" />
                  <PriorityChip priority={changeRequest.priority} size="medium" />
                  <RiskChip risk={changeRequest.riskLevel} size="medium" />
                  <Chip
                    label={changeRequest.changeType}
                    size="medium"
                    color={
                      changeRequest.changeType === 'Emergency'
                        ? 'error'
                        : changeRequest.changeType === 'Normal'
                        ? 'primary'
                        : 'default'
                    }
                    variant="outlined"
                  />
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

          {/* Status Stepper */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <ChangeStatusStepper status={changeRequest.status} />
            </CardContent>
          </Card>

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
              <WorkflowActionButtons
                changeRequest={changeRequest}
                onAction={handleAction}
                onEdit={changeRequest.status === 'Draft' ? handleEdit : undefined}
                onDelete={changeRequest.status === 'Draft' ? handleDelete : undefined}
              />
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Details" />
              <Tab label="Timeline" />
            </Tabs>
          </Card>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Stack spacing={3}>
                      <InfoRow label="Description" value={changeRequest.description} />
                      <InfoRow
                        label="Affected Systems"
                        value={changeRequest.affectedSystems}
                      />
                      <InfoRow
                        label="Impact Assessment"
                        value={changeRequest.impactAssessment}
                      />
                      <InfoRow
                        label="Rollback Plan"
                        value={changeRequest.rollbackPlan}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                {/* Execution Details */}
                {(changeRequest.implementationNotes ||
                  changeRequest.rollbackReason ||
                  changeRequest.denialReason) && (
                  <Card sx={{ mt: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Execution Details
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      <Stack spacing={3}>
                        {changeRequest.implementationNotes && (
                          <InfoRow
                            label="Implementation Notes"
                            value={changeRequest.implementationNotes}
                          />
                        )}
                        {changeRequest.denialReason && (
                          <InfoRow
                            label="Denial Reason"
                            value={changeRequest.denialReason}
                          />
                        )}
                        {changeRequest.rollbackReason && (
                          <InfoRow
                            label="Rollback Reason"
                            value={changeRequest.rollbackReason}
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Grid>

              {/* Sidebar - Dates & Metadata */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Dates & Timeline
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Stack spacing={2}>
                      <InfoRow
                        label="Created"
                        value={format(new Date(changeRequest.createdDate), 'MMM d, yyyy h:mm a')}
                      />
                      {changeRequest.submittedDate && (
                        <InfoRow
                          label="Submitted"
                          value={format(new Date(changeRequest.submittedDate), 'MMM d, yyyy h:mm a')}
                        />
                      )}
                      {changeRequest.approvedDate && (
                        <InfoRow
                          label="Approved"
                          value={format(new Date(changeRequest.approvedDate), 'MMM d, yyyy h:mm a')}
                        />
                      )}
                      {changeRequest.deniedDate && (
                        <InfoRow
                          label="Denied"
                          value={format(new Date(changeRequest.deniedDate), 'MMM d, yyyy h:mm a')}
                        />
                      )}
                      {changeRequest.scheduledStartDate && (
                        <InfoRow
                          label="Scheduled Start"
                          value={format(
                            new Date(changeRequest.scheduledStartDate),
                            'MMM d, yyyy h:mm a'
                          )}
                        />
                      )}
                      {changeRequest.scheduledEndDate && (
                        <InfoRow
                          label="Scheduled End"
                          value={format(
                            new Date(changeRequest.scheduledEndDate),
                            'MMM d, yyyy h:mm a'
                          )}
                        />
                      )}
                      {changeRequest.actualStartDate && (
                        <InfoRow
                          label="Actual Start"
                          value={format(
                            new Date(changeRequest.actualStartDate),
                            'MMM d, yyyy h:mm a'
                          )}
                        />
                      )}
                      {changeRequest.completedDate && (
                        <InfoRow
                          label="Completed"
                          value={format(
                            new Date(changeRequest.completedDate),
                            'MMM d, yyyy h:mm a'
                          )}
                        />
                      )}
                      {changeRequest.rolledBackDate && (
                        <InfoRow
                          label="Rolled Back"
                          value={format(
                            new Date(changeRequest.rolledBackDate),
                            'MMM d, yyyy h:mm a'
                          )}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                {changeRequest.changeWindow && (
                  <Card sx={{ mt: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Change Window
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2">{changeRequest.changeWindow}</Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          )}

          {/* Timeline Tab */}
          {activeTab === 1 && (
            <Card>
              <CardContent>
                <ChangeRequestTimeline changeRequest={changeRequest} />
              </CardContent>
            </Card>
          )}
        </Box>
      </AppLayout>
    </>
  );
}
