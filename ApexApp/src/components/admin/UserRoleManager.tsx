import { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { userApi } from '@/api/users';

interface UserRoleManagerProps {
  userId: string;
  currentRoles: string[];
  onRolesChanged: (newRoles: string[]) => void;
  disabled?: boolean;
}

export default function UserRoleManager({
  userId,
  currentRoles,
  onRolesChanged,
  disabled = false,
}: UserRoleManagerProps) {
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableRoles();
  }, []);

  useEffect(() => {
    setSelectedRoles(currentRoles);
  }, [currentRoles]);

  const loadAvailableRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const roles = await userApi.admin.getAllRoles();
      setAvailableRoles(roles);
    } catch (err: any) {
      console.error('Error loading roles:', err);
      setError('Failed to load available roles');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (role: string, checked: boolean) => {
    if (disabled) return;

    try {
      setUpdatingRole(role);
      setError(null);

      if (checked) {
        // Assign role
        await userApi.admin.assignRole(userId, role);
        const newRoles = [...selectedRoles, role];
        setSelectedRoles(newRoles);
        onRolesChanged(newRoles);
      } else {
        // Remove role
        await userApi.admin.removeRole(userId, role);
        const newRoles = selectedRoles.filter((r) => r !== role);
        setSelectedRoles(newRoles);
        onRolesChanged(newRoles);
      }
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError(
        err.response?.data?.errors?.join(', ') ||
          `Failed to ${checked ? 'assign' : 'remove'} role`,
      );
    } finally {
      setUpdatingRole(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error && availableRoles.length === 0) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        Select the roles to assign to this user:
      </Typography>

      <FormGroup>
        {availableRoles.map((role) => {
          const isChecked = selectedRoles.includes(role);
          const isUpdating = updatingRole === role;

          return (
            <FormControlLabel
              key={role}
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => handleRoleToggle(role, e.target.checked)}
                  disabled={disabled || isUpdating}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {role}
                  {isUpdating && <CircularProgress size={16} />}
                </Box>
              }
            />
          );
        })}
      </FormGroup>

      <Box sx={{ mt: 2 }}>
        <Typography variant='subtitle2' gutterBottom>
          Currently Assigned Roles:
        </Typography>
        <Stack direction='row' spacing={1} flexWrap='wrap'>
          {selectedRoles.map((role) => (
            <Chip key={role} label={role} color='primary' size='small' />
          ))}
          {selectedRoles.length === 0 && (
            <Typography variant='body2' color='text.secondary'>
              No roles assigned
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
