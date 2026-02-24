import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { Box, Tooltip, Chip } from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { DeploymentRequestStatusBadge } from './DeploymentRequestStatusBadge';
import type { DeploymentRequestListItem } from '@/types/deploymentRequest';
import { format } from 'date-fns';

interface DeploymentRequestsTableProps {
  deploymentRequests: DeploymentRequestListItem[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const priorityColorMap: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  Low: 'default',
  Medium: 'info',
  High: 'warning',
  Urgent: 'error',
};

const riskColorMap: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  Low: 'default',
  Medium: 'info',
  High: 'warning',
  Critical: 'error',
};

const environmentColorMap: Record<string, 'default' | 'primary' | 'warning' | 'error'> = {
  Development: 'default',
  Staging: 'primary',
  UAT: 'warning',
  Production: 'error',
};

/**
 * DataGrid table for Deployment Requests
 */
export const DeploymentRequestsTable = ({
  deploymentRequests,
  loading,
  onDelete,
}: DeploymentRequestsTableProps) => {
  const navigate = useNavigate();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'title',
        headerName: 'Title',
        flex: 1,
        minWidth: 220,
        renderCell: (params) => (
          <Box
            sx={{
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
              fontWeight: 600,
            }}
            onClick={() => navigate(`/deployment-requests/${params.row.id}`)}
          >
            {params.value}
          </Box>
        ),
      },
      {
        field: 'environment',
        headerName: 'Environment',
        width: 130,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={environmentColorMap[params.value] ?? 'default'}
            variant="outlined"
          />
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 160,
        renderCell: (params) => <DeploymentRequestStatusBadge status={params.value} />,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 110,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={priorityColorMap[params.value] ?? 'default'}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        field: 'riskLevel',
        headerName: 'Risk Level',
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={riskColorMap[params.value] ?? 'default'}
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        field: 'scheduledStartDate',
        headerName: 'Scheduled Start',
        width: 140,
        renderCell: (params) =>
          params.value ? format(new Date(params.value), 'MMM d, yyyy') : '—',
      },
      {
        field: 'createdByUserName',
        headerName: 'Created By',
        width: 150,
        renderCell: (params) => params.value || '—',
      },
      {
        field: 'createdDate',
        headerName: 'Created',
        width: 120,
        renderCell: (params) => format(new Date(params.value), 'MMM d, yyyy'),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 100,
        getActions: (params: GridRowParams<DeploymentRequestListItem>) => {
          const actions = [
            <GridActionsCellItem
              key="view"
              icon={
                <Tooltip title="View Details">
                  <Visibility />
                </Tooltip>
              }
              label="View"
              onClick={() => navigate(`/deployment-requests/${params.row.id}`)}
            />,
          ];

          if (params.row.status === 'Draft') {
            actions.push(
              <GridActionsCellItem
                key="delete"
                icon={
                  <Tooltip title="Delete">
                    <Delete />
                  </Tooltip>
                }
                label="Delete"
                onClick={() => onDelete(params.row.id)}
                showInMenu
              />
            );
          }

          return actions;
        },
      },
    ],
    [navigate, onDelete]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={deploymentRequests}
        columns={columns}
        loading={loading}
        autoHeight
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
          sorting: {
            sortModel: [{ field: 'createdDate', sort: 'desc' }],
          },
        }}
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            cursor: 'pointer',
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px 8px 0 0',
          },
        }}
      />
    </Box>
  );
};
