import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  MoreVert,
  Send,
  CheckCircle,
  Cancel,
  Transform,
  Edit,
} from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { projectRequestApi } from '@/api/projectRequests';
import { getErrorMessage } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjectRequest } from '@/types/projectRequest';
import { format } from 'date-fns';

export default function ProjectRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const theme = useTheme();

  const [request, setRequest] = useState<ProjectRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Action Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (id) {
      loadRequest();
    }
  }, [id]);

  const loadRequest = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await projectRequestApi.getById(id);
      setRequest(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  console.log('Request:', request);

  const handleActionClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (!request) return;

    navigate(`/project-requests/${id}/edit`);
  };

  const handleSubmit = async () => {
    if (!request) return;

    try {
      setActionLoading(true);
      await projectRequestApi.submit(request.id);
      handleActionClose();
      await loadRequest();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!request) return;

    try {
      setActionLoading(true);
      await projectRequestApi.approve(
        request.id,
        'Approved for implementation',
      );
      handleActionClose();
      await loadRequest();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!request) return;

    const reason = prompt('Enter denial reason:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await projectRequestApi.deny(request.id, reason);
      handleActionClose();
      await loadRequest();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!request) return;

    try {
      setActionLoading(true);
      const result = await projectRequestApi.convertToProject(request.id);
      handleActionClose();
      navigate(`/projects/${result.projectId}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!request) return;

    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await projectRequestApi.cancel(request.id, reason);
      handleActionClose();
      await loadRequest();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='60vh'
        >
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error && !request) {
    return (
      <AppLayout>
        <Alert severity='error'>{error}</Alert>
      </AppLayout>
    );
  }

  if (!request) {
    return (
      <AppLayout>
        <Alert severity='error'>Project request not found</Alert>
      </AppLayout>
    );
  }

  return (
    <>
      <title>{request.title} - Project Request - APEX</title>
      <AppLayout>
        {/* Header */}
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='flex-start'
          mb={3}
        >
          <Box flex={1}>
            <Box display='flex' alignItems='center' gap={2} mb={1}>
              <IconButton onClick={() => navigate('/project-requests')}>
                <ArrowBack />
              </IconButton>
              <Typography variant='h4' fontWeight={700}>
                {request.title}
              </Typography>
            </Box>
            <Box display='flex' alignItems='center' gap={1} ml={7}>
              <StatusBadge status={request.status} size='small' />
              <Chip
                label={request.priority}
                size='small'
                color={
                  request.priority === 'Urgent'
                    ? 'error'
                    : request.priority === 'High'
                      ? 'warning'
                      : 'default'
                }
              />
            </Box>
          </Box>

          <IconButton onClick={handleActionClick} disabled={actionLoading}>
            <MoreVert />
          </IconButton>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Description */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h6' fontWeight={600} gutterBottom>
                  Description
                </Typography>
                <Typography variant='body1' color='text.secondary' paragraph>
                  {request.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant='h6' fontWeight={600} gutterBottom>
                  Business Justification
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  {request.businessJustification}
                </Typography>
              </CardContent>
            </Card>

            {/* Approval Notes */}
            {request.approvalNotes && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant='h6' fontWeight={600} gutterBottom>
                    Approval Notes
                  </Typography>
                  <Paper
                    variant='outlined'
                    sx={{ p: 2, bgcolor: 'success.50' }}
                  >
                    <Typography variant='body2'>
                      {request.approvalNotes}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            )}

            {/* Denial Reason */}
            {request.denialReason && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant='h6' fontWeight={600} gutterBottom>
                    Denial Reason
                  </Typography>
                  <Paper variant='outlined' sx={{ p: 2, bgcolor: 'error.50' }}>
                    <Typography variant='body2'>
                      {request.denialReason}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            )}

            {/* Cancellation Reason */}
            {request.cancellationReason && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant='h6' fontWeight={600} gutterBottom>
                    Cancellation Reason
                  </Typography>
                  <Paper
                    variant='outlined'
                    sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5) }}
                  >
                    <Typography variant='body2'>
                      {request.cancellationReason}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Requesting User */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant='subtitle2'
                  color='text.secondary'
                  gutterBottom
                >
                  Requested By
                </Typography>
                <Box display='flex' alignItems='center' gap={2}>
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {request.requestingUser?.fullName?.[0] || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant='body1' fontWeight={600}>
                      {request.requestingUser?.fullName || 'Unknown User'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {request.requestingUser?.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Approved By */}
            {request.approvedByUser && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Approved By
                  </Typography>
                  <Box display='flex' alignItems='center' gap={2}>
                    <Avatar sx={{ width: 48, height: 48 }}>
                      {request.approvedByUser?.fullName?.[0] || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant='body1' fontWeight={600}>
                        {request.approvedByUser?.fullName || 'Unknown User'}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {request.approvedByUser?.email}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <Card>
              <CardContent>
                <Typography
                  variant='subtitle2'
                  color='text.secondary'
                  gutterBottom
                >
                  Details
                </Typography>
                <Box display='flex' flexDirection='column' gap={2}>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Priority
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {request.priority}
                    </Typography>
                  </Box>

                  <Divider />
                  {/* Put Budget and timeline dates here */}
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Estimated Budget
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {request.estimatedBudget !== null
                        ? new Intl.NumberFormat(undefined, {
                            style: 'currency',
                            currency: 'USD',
                          }).format(request.estimatedBudget)
                        : 'N/A'}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Proposed Start Date
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {request.proposedStartDate
                        ? format(
                            new Date(request.proposedStartDate),
                            'MMM d, yyyy',
                          )
                        : 'N/A'}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Proposed End Date
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {request.proposedEndDate
                        ? format(
                            new Date(request.proposedEndDate),
                            'MMM d, yyyy',
                          )
                        : 'N/A'}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Due Date
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {request.dueDate
                        ? format(new Date(request.dueDate), 'MMM d, yyyy')
                        : 'N/A'}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Created
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      {format(
                        new Date(request.createdDate),
                        'MMM d, yyyy h:mm a',
                      )}
                    </Typography>
                  </Box>

                  {request.submittedDate && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Submitted
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {format(
                            new Date(request.submittedDate),
                            'MMM d, yyyy h:mm a',
                          )}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {request.approvedDate && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Approved
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {format(
                            new Date(request.approvedDate),
                            'MMM d, yyyy h:mm a',
                          )}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {request.lastModifiedDate && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Last Modified
                        </Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {format(
                            new Date(request.lastModifiedDate),
                            'MMM d, yyyy h:mm a',
                          )}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleActionClose}
        >
          {request.status === 'Draft' && [
            <MenuItem onClick={handleSubmit}>
              <Send fontSize='small' sx={{ mr: 1 }} />
              Submit for Approval
            </MenuItem>,
            <MenuItem onClick={handleEdit}>
              <Edit fontSize='small' sx={{ mr: 1 }} />
              Edit Request
            </MenuItem>,
          ]}
          {request.status === 'Pending' &&
            hasRole('TenantAdmin') && [
              <MenuItem key='approve' onClick={handleApprove}>
                <CheckCircle fontSize='small' sx={{ mr: 1 }} />
                Approve
              </MenuItem>,
              <MenuItem key='deny' onClick={handleDeny}>
                <Cancel fontSize='small' sx={{ mr: 1 }} />
                Deny
              </MenuItem>,
            ]}
          {request.status === 'Approved' && hasRole('TenantAdmin') && (
            <MenuItem onClick={handleConvert}>
              <Transform fontSize='small' sx={{ mr: 1 }} />
              Convert to Project
            </MenuItem>
          )}
          {!['Cancelled', 'Converted', 'Denied'].includes(request.status) && (
            <MenuItem onClick={handleCancel}>
              <Cancel fontSize='small' sx={{ mr: 1 }} />
              Cancel Request
            </MenuItem>
          )}
        </Menu>
      </AppLayout>
    </>
  );
}
//
