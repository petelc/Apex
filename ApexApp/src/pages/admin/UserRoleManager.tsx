import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { usersApi } from '@/api/users';

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
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
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
      const roles = await usersApi.admin.getAllRoles();
      
      // Handle both string[] and array of objects with 'name' property
      const roleNames = roles.map((role: any) => {
        if (typeof role === 'string') {
          return role;
        } else if (role && typeof role === 'object' && 'name' in role) {
          return role.name;
        } else {
          console.warn('Unexpected role format:', role);
          return String(role);
        }
      });
      
      setAvailableRoles(roleNames);
    } catch (err: any) {
      console.error('Error loading roles:', err);
      setError(err.response?.data?.error || 'Failed to load available roles');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (role: string, checked: boolean) => {
    try {
      setUpdatingRole(role);
      setError(null);

      if (checked) {
        // Assign role
        await usersApi.admin.assignRole(userId, role);
        const newRoles = [...selectedRoles, role];
        setSelectedRoles(newRoles);
        onRolesChanged(newRoles);
      } else {
        // Remove role
        await usersApi.admin.removeRole(userId, role);
        const newRoles = selectedRoles.filter((r) => r !== role);
        setSelectedRoles(newRoles);
        onRolesChanged(newRoles);
      }
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError(
        err.response?.data?.error || `Failed to ${checked ? 'assign' : 'remove'} role`,
      );
    } finally {
      setUpdatingRole(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && availableRoles.length === 0) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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

      {selectedRoles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Roles:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedRoles.map((role) => (
              <Chip key={role} label={role} color="primary" size="small" />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
