import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { usersApi } from '@/api/users';
import type { User } from '@/api/users';
import UserListTable from '@/components/admin/UserListTable';
import UserEditDialog from '@/components/admin/UserEditDialog';
import CreateUserDialog from '@/components/admin/CreateUserDialog';
import { AssignUserToDepartmentDialog } from '@/components/user/AssignUserToDepartmentDialog';
import { AppLayout } from '@/components/layout/AppLayout';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDepartmentDialogOpen, setAssignDepartmentDialogOpen] =
    useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.fullName?.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.departmentName?.toLowerCase().includes(term) ||
            user.roles?.some((role) => role.toLowerCase().includes(term)),
        ),
      );
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await usersApi.getAll();
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const roles = await usersApi.admin.getAllRoles();
      setAvailableRoles(roles);
    } catch (err: any) {
      console.error('Error loading roles:', err);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleUserUpdated = (updatedUser: User) => {
    // Update user in the list
    setUsers((prev) =>
      prev.map((u) => (u.userId === updatedUser.userId ? updatedUser : u)),
    );
    setEditDialogOpen(false);
  };

  const handleUserCreated = (newUser: User) => {
    // Add new user to the list
    setUsers((prev) => [newUser, ...prev]);
    setCreateDialogOpen(false);
  };

  const handleAssignDepartment = (user: User) => {
    setSelectedUser(user);
    setAssignDepartmentDialogOpen(true);
  };

  const handleAssignDepartmentSuccess = () => {
    setAssignDepartmentDialogOpen(false);
    setSelectedUser(null);
    loadUsers();
  };

  const handleAssignDepartmentClose = () => {
    setAssignDepartmentDialogOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant='h4'>User Management</Typography>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create User
          </Button>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder='Search by name, email, department, or role...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <UserListTable
              users={filteredUsers}
              onEditUser={handleEditUser}
              onAssignDepartment={handleAssignDepartment}
            />
          </CardContent>
        </Card>

        {selectedUser && (
          <UserEditDialog
            open={editDialogOpen}
            user={selectedUser}
            onClose={() => setEditDialogOpen(false)}
            onUserUpdated={handleUserUpdated}
          />
        )}

        <CreateUserDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onUserCreated={handleUserCreated}
          availableRoles={availableRoles}
        />

        {selectedUser && (
          <AssignUserToDepartmentDialog
            open={assignDepartmentDialogOpen}
            user={selectedUser}
            onClose={handleAssignDepartmentClose}
            onSuccess={handleAssignDepartmentSuccess}
          />
        )}
      </Box>
    </AppLayout>
  );
}
