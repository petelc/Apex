import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { departmentApi, type Department } from '@/api/departments';
import { CreateDepartmentDialog } from '@/components/departments/CreateDepartmentDialog';
import { EditDepartmentDialog } from '@/components/departments/EditDepartmentDialog';
import { DeleteDepartmentDialog } from '@/components/departments/DeleteDepartmentDialog';
import App from '@/App';
import { AppLayout } from '@/components/layout/AppLayout';

export const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  // Load departments
  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (err: any) {
      console.error('Error loading departments:', err);
      setError(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // Handlers
  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (department: Department) => {
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    loadDepartments();
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedDepartment(null);
    loadDepartments();
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedDepartment(null);
    loadDepartments();
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedDepartment(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppLayout>
      <Box>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant='h4' component='h1'>
            Departments
          </Typography>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            Create Department
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Departments Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align='center'>Status</TableCell>
                <TableCell align='center'>Members</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 4 }}>
                    <Typography variant='body2' color='text.secondary'>
                      No departments found. Create your first department to get
                      started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={department.id} hover>
                    <TableCell>
                      <Typography variant='body1' fontWeight={500}>
                        {department.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {department.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Chip
                        label={department.isActive ? 'Active' : 'Inactive'}
                        color={department.isActive ? 'success' : 'default'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell align='center'>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                        }}
                      >
                        <PeopleIcon fontSize='small' color='action' />
                        <Typography variant='body2'>
                          {department.memberCount || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {new Date(department.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <IconButton
                        size='small'
                        onClick={() => handleEditClick(department)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize='small' />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={() => handleDeleteClick(department)}
                        color='error'
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialogs */}
        <CreateDepartmentDialog
          open={createDialogOpen}
          onClose={handleDialogClose}
          onSuccess={handleCreateSuccess}
        />

        {selectedDepartment && (
          <>
            <EditDepartmentDialog
              open={editDialogOpen}
              department={selectedDepartment}
              onClose={handleDialogClose}
              onSuccess={handleEditSuccess}
            />

            <DeleteDepartmentDialog
              open={deleteDialogOpen}
              department={selectedDepartment}
              onClose={handleDialogClose}
              onSuccess={handleDeleteSuccess}
            />
          </>
        )}
      </Box>
    </AppLayout>
  );
};
