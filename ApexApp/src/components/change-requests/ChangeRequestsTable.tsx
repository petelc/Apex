import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip, Chip } from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  Send,
  CheckCircle,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { ChangeRequestStatusBadge } from './ChangeRequestStatusBadge';
import { PriorityChip, RiskChip } from './PriorityChip';
import type { ChangeRequest } from '@/types/changeRequest';
import { format } from 'date-fns';

interface ChangeRequestsTableProps {
  changeRequests: ChangeRequest[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

/**
 * DataGrid table for Change Requests
 */
export const ChangeRequestsTable = ({
  changeRequests,
  loading,
  onRefresh,
  onDelete,
}: ChangeRequestsTableProps) => {
  const navigate = useNavigate();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
        renderCell: (params) => (
          <Tooltip title={params.value}>
            <span>{params.value.substring(0, 8)}...</span>
          </Tooltip>
        ),
      },
      {
        field: 'title',
        headerName: 'Title',
        flex: 1,
        minWidth: 250,
        renderCell: (params) => (
          <Box
            sx={{
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
              fontWeight: 600,
            }}
            onClick={() => navigate(`/change-requests/${params.row.id}`)}
          >
            {params.value}
          </Box>
        ),
      },
      {
        field: 'changeType',
        headerName: 'Type',
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={
              params.value === 'Emergency'
                ? 'error'
                : params.value === 'Normal'
                ? 'primary'
                : 'default'
            }
            variant="outlined"
          />
        ),
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 140,
        renderCell: (params) => <PriorityChip priority={params.value} />,
      },
      {
        field: 'riskLevel',
        headerName: 'Risk',
        width: 140,
        renderCell: (params) => <RiskChip risk={params.value} />,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => <ChangeRequestStatusBadge status={params.value} />,
      },
      {
        field: 'affectedSystems',
        headerName: 'Affected Systems',
        width: 200,
        renderCell: (params) => (
          <Tooltip title={params.value}>
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {params.value}
            </span>
          </Tooltip>
        ),
      },
      {
        field: 'createdDate',
        headerName: 'Created',
        width: 120,
        renderCell: (params) => format(new Date(params.value), 'MMM d, yyyy'),
      },
      {
        field: 'scheduledStartDate',
        headerName: 'Scheduled',
        width: 120,
        renderCell: (params) =>
          params.value ? format(new Date(params.value), 'MMM d, yyyy') : '—',
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 120,
        getActions: (params: GridRowParams<ChangeRequest>) => {
          const actions = [
            <GridActionsCellItem
              key="view"
              icon={
                <Tooltip title="View Details">
                  <Visibility />
                </Tooltip>
              }
              label="View"
              onClick={() => navigate(`/change-requests/${params.row.id}`)}
            />,
          ];

          // Add Edit for Draft status
          if (params.row.status === 'Draft') {
            actions.push(
              <GridActionsCellItem
                key="edit"
                icon={
                  <Tooltip title="Edit">
                    <Edit />
                  </Tooltip>
                }
                label="Edit"
                onClick={() => navigate(`/change-requests/${params.row.id}/edit`)}
              />
            );
          }

          // Add Delete for Draft status
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
        rows={changeRequests}
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
