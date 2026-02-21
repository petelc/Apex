import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Grid,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
} from '@mui/material';
import { usersApi } from '@/api/users';
import type { User, UpdateUserRequest } from '@/api/users';
import UserRoleManager from './UserRoleManager';

interface UserEditDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onUserUpdated: (user: User) => void;
}

export default function UserEditDialog({
  open,
  user,
  onClose,
  onUserUpdated,
}: UserEditDialogProps) {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    timeZone: user.timeZone || 'America/New_York',
    isActive: user.isActive,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>(user.roles);

  // Reset form when user changes
  useEffect(() => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      timeZone: user.timeZone || 'America/New_York',
      isActive: user.isActive,
    });
    setUserRoles(user.roles);
    setError(null);
    setSuccess(false);
  }, [user]);

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const updatedUser = await usersApi.admin.updateUser(
        user.userId,
        formData,
      );

      // Update roles list with current roles
      updatedUser.roles = userRoles;

      onUserUpdated(updatedUser);
      setSuccess(true);

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(
        err.response?.data?.errors?.join(', ') || 'Failed to update user',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRolesChanged = (newRoles: string[]) => {
    setUserRoles(newRoles);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit User: {user.fullName}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity='success' sx={{ mb: 2 }}>
              User updated successfully!
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant='h6' gutterBottom>
              Personal Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='First Name'
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  disabled={saving || success}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Last Name'
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  disabled={saving || success}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='Email'
                  type='email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={saving || success}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Phone Number'
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  disabled={saving || success}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Time Zone'
                  value={formData.timeZone}
                  onChange={(e) =>
                    setFormData({ ...formData, timeZone: e.target.value })
                  }
                  select
                  SelectProps={{ native: true }}
                  disabled={saving || success}
                >
                  <option value='America/New_York'>Eastern Time (ET)</option>
                  <option value='America/Chicago'>Central Time (CT)</option>
                  <option value='America/Denver'>Mountain Time (MT)</option>
                  <option value='America/Los_Angeles'>Pacific Time (PT)</option>
                  <option value='America/Anchorage'>Alaska Time (AKT)</option>
                  <option value='Pacific/Honolulu'>Hawaii Time (HT)</option>
                  <option value='Europe/London'>London (GMT)</option>
                  <option value='Europe/Paris'>Paris (CET)</option>
                  <option value='Asia/Tokyo'>Tokyo (JST)</option>
                  <option value='Asia/Shanghai'>Shanghai (CST)</option>
                  <option value='Australia/Sydney'>Sydney (AEDT)</option>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive ?? true}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      disabled={saving || success}
                    />
                  }
                  label={formData.isActive ? 'Active' : 'Inactive'}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant='h6' gutterBottom>
              Role Assignment
            </Typography>

            <UserRoleManager
              userId={user.userId}
              currentRoles={userRoles}
              onRolesChanged={handleRolesChanged}
              disabled={saving || success}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={saving || success}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
