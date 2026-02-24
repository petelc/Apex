import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { DeploymentRequestsTable } from '@/components/deployment-requests/DeploymentRequestsTable';
import { deploymentRequestApi } from '@/api/deploymentRequests';
import { getErrorMessage } from '@/api/client';
import type { DeploymentRequestListItem } from '@/types/deploymentRequest';

/**
 * Main Deployment Requests List Page
 */
export default function DeploymentRequestsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [deploymentRequests, setDeploymentRequests] = useState<DeploymentRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDeploymentRequests();
  }, []);

  const loadDeploymentRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await deploymentRequestApi.getAll();
      setDeploymentRequests(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deployment request?')) {
      return;
    }

    try {
      await deploymentRequestApi.delete(id);
      await loadDeploymentRequests();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading && deploymentRequests.length === 0) {
    return (
      <>
        <title>Deployment Requests - APEX</title>
        <AppLayout>
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <title>Deployment Requests - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
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
                  Deployment Requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage and track all deployment requests across environments
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/deployment-requests/create')}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  New Deployment Request
                </Button>
              </Stack>
            </Box>

            {/* Stats Summary */}
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  spacing={4}
                  divider={<Box sx={{ width: 1, bgcolor: 'divider' }} />}
                >
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="primary">
                      {deploymentRequests.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {deploymentRequests.filter((dr) => dr.status === 'InProgress').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Progress
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {deploymentRequests.filter((dr) => dr.status === 'Scheduled').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {deploymentRequests.filter((dr) => dr.status === 'Deployed').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Deployed
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="error.main">
                      {deploymentRequests.filter((dr) => dr.isOverdue).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overdue
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Table */}
          <Card>
            <DeploymentRequestsTable
              deploymentRequests={deploymentRequests}
              loading={loading}
              onDelete={handleDelete}
            />
          </Card>

          {/* Empty State */}
          {!loading && deploymentRequests.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No deployment requests yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first deployment request to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/deployment-requests/create')}
              >
                New Deployment Request
              </Button>
            </Box>
          )}
        </Box>
      </AppLayout>
    </>
  );
}
