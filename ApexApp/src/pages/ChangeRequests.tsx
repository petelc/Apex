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
import { Add, Analytics } from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChangeRequestsTable } from '@/components/change-requests/ChangeRequestsTable';
import { ChangeRequestFilters } from '@/components/change-requests/ChangeRequestFilters';
import { changeRequestApi } from '@/api/changeRequests';
import { getErrorMessage } from '@/api/client';
import type { ChangeRequest, ChangeRequestFilters as Filters } from '@/types/changeRequest';

/**
 * Main Change Requests List Page
 */
export default function ChangeRequestsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    loadChangeRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [changeRequests, filters]);

  const loadChangeRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await changeRequestApi.getAll();
      setChangeRequests(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...changeRequests];

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((cr) => filters.status!.includes(cr.status));
    }

    // Type filter
    if (filters.changeType && filters.changeType.length > 0) {
      filtered = filtered.filter((cr) => filters.changeType!.includes(cr.changeType));
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((cr) => filters.priority!.includes(cr.priority));
    }

    // Risk filter
    if (filters.riskLevel && filters.riskLevel.length > 0) {
      filtered = filtered.filter((cr) => filters.riskLevel!.includes(cr.riskLevel));
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(
        (cr) => new Date(cr.createdDate) >= new Date(filters.startDate!)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (cr) => new Date(cr.createdDate) <= new Date(filters.endDate!)
      );
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (cr) =>
          cr.title.toLowerCase().includes(searchLower) ||
          cr.description.toLowerCase().includes(searchLower) ||
          cr.affectedSystems.toLowerCase().includes(searchLower)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this change request?')) {
      return;
    }

    try {
      await changeRequestApi.delete(id);
      await loadChangeRequests();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading && changeRequests.length === 0) {
    return (
      <>
        <title>Change Requests - APEX</title>
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
      <title>Change Requests - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Change Requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage and track all change requests across the organization
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Analytics />}
                  onClick={() => navigate('/change-analytics')}
                >
                  Analytics
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/change-requests/create')}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  Create Change Request
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
                <Stack direction="row" spacing={4} divider={<Box sx={{ width: 1, bgcolor: 'divider' }} />}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="primary">
                      {changeRequests.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Changes
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {changeRequests.filter((cr) => cr.status === 'InProgress').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Progress
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {changeRequests.filter((cr) => cr.status === 'Scheduled').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {changeRequests.filter((cr) => cr.status === 'Completed').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
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

          {/* Filters */}
          <Box sx={{ mb: 3 }}>
            <ChangeRequestFilters
              filters={filters}
              onChange={handleFilterChange}
              resultCount={filteredRequests.length}
            />
          </Box>

          {/* Table */}
          <Card>
            <ChangeRequestsTable
              changeRequests={filteredRequests}
              loading={loading}
              onRefresh={loadChangeRequests}
              onDelete={handleDelete}
            />
          </Card>

          {/* Empty State */}
          {!loading && changeRequests.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No change requests yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first change request to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/change-requests/create')}
              >
                Create Change Request
              </Button>
            </Box>
          )}

          {/* No Results State */}
          {!loading && changeRequests.length > 0 && filteredRequests.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No results found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your filters or search criteria
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setFilters({})}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Box>
      </AppLayout>
    </>
  );
}
