import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  Menu,
  MenuItem as MenuItemComponent,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Send,
  CheckCircle,
  Transform,
} from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { projectRequestApi } from '@/api/projectRequests';
import { getErrorMessage } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjectRequest, RequestPriority } from '@/types/projectRequest';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function ProjectRequestsPage() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    businessJustification: '',
    priority: 'Medium' as RequestPriority,
  });

  // Action Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await projectRequestApi.getAll();
      setRequests(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      setCreateError('');
      await projectRequestApi.create(formData);
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        businessJustification: '',
        priority: 'Medium',
      });
      await loadRequests();
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleActionClick = (
    event: React.MouseEvent<HTMLElement>,
    request: ProjectRequest
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleSubmit = async () => {
    if (!selectedRequest) return;
    try {
      await projectRequestApi.submit(selectedRequest.id);
      handleActionClose();
      await loadRequests();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await projectRequestApi.approve(selectedRequest.id, 'Approved for implementation');
      handleActionClose();
      await loadRequests();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleConvert = async () => {
    if (!selectedRequest) return;
    try {
      await projectRequestApi.convertToProject(selectedRequest.id);
      handleActionClose();
      await loadRequests();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  return (
    <>
      <title>Project Requests - APEX</title>
      <AppLayout>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Project Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage project requests and approvals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={(e) => {
            e.stopPropagation();
            setCreateDialogOpen(true);
          }}
        >
          New Request
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Requests Grid */}
      <Grid container spacing={3}>
        {requests.map((request) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={request.id}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => navigate(`/project-requests/${request.id}`)}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {request.title}
                    </Typography>
                    <StatusBadge status={request.status} size='small' />
                    <Chip
                      label={request.priority}
                      size="small"
                      color={
                        request.priority === 'Urgent'
                          ? 'error'
                          : request.priority === 'High'
                          ? 'warning'
                          : 'default'
                      }
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(e, request)
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {request.description}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {request.requestingUser?.fullName?.[0] || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {request.requestingUser?.fullName || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.requestingUser?.email}
                      </Typography>
                      </Box>
                    </Box>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(request.createdDate), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {requests.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No project requests yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first project request to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
              onClick={(e) => {
                e.stopPropagation();
                setCreateDialogOpen(true)
              }}
          >
            Create Request
          </Button>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
      >
        {selectedRequest?.status === 'Draft' && (
          <MenuItemComponent onClick={handleSubmit}>
            <Send fontSize="small" sx={{ mr: 1 }} />
            Submit for Approval
          </MenuItemComponent>
        )}
        {selectedRequest?.status === 'Pending' && hasRole('TenantAdmin') && (
          <MenuItemComponent onClick={handleApprove}>
            <CheckCircle fontSize="small" sx={{ mr: 1 }} />
            Approve
          </MenuItemComponent>
        )}
        {selectedRequest?.status === 'Approved' && hasRole('TenantAdmin') && (
          <MenuItemComponent onClick={handleConvert}>
            <Transform fontSize="small" sx={{ mr: 1 }} />
            Convert to Project
          </MenuItemComponent>
        )}
      </Menu>

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !createLoading && setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Project Request</DialogTitle>
        <DialogContent>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}

          <TextField
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />

          <TextField
            label="Description"
            fullWidth
            required
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Business Justification"
            fullWidth
            required
            multiline
            rows={3}
            value={formData.businessJustification}
            onChange={(e) =>
              setFormData({ ...formData, businessJustification: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            label="Priority"
            select
            fullWidth
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as RequestPriority })
            }
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Urgent">Urgent</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={createLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={createLoading || !formData.title || !formData.description}
          >
            {createLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
    </>
  );
}
