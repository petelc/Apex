import { useState } from 'react';
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
  FormGroup,
  Checkbox,
  Divider,
} from '@mui/material';
import { usersApi } from '@/api/users';
import type { User } from '@/api/users';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: (user: User) => void;
  availableRoles: string[];
}

export default function CreateUserDialog({
  open,
  onClose,
  onUserCreated,
  availableRoles,
}: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    timeZone: 'America/New_York',
    password: '',
    confirmPassword: '',
    isActive: true,
    roles: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    if (!saving) {
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        timeZone: 'America/New_York',
        password: '',
        confirmPassword: '',
        isActive: true,
        roles: [],
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const handleRoleToggle = (role: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        roles: [...prev.roles, role],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        roles: prev.roles.filter((r) => r !== role),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await usersApi.admin.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        timeZone: formData.timeZone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        isActive: formData.isActive,
        roles: formData.roles.length > 0 ? formData.roles : undefined,
      });

      onUserCreated(response);
      setSuccess(true);

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(
        err.response?.data?.errors?.join(', ') || 'Failed to create user',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity='success' sx={{ mb: 2 }}>
              User created successfully!
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
                  helperText='This will be used as the username'
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
                      checked={formData.isActive}
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
              Password
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Password'
                  type='password'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={saving || success}
                  helperText='At least 8 characters'
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Confirm Password'
                  type='password'
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  disabled={saving || success}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant='h6' gutterBottom>
              Role Assignment
            </Typography>

            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Select the roles to assign to this user:
            </Typography>

            <FormGroup>
              {availableRoles.map((role) => (
                <FormControlLabel
                  key={role}
                  control={
                    <Checkbox
                      checked={formData.roles.includes(role)}
                      onChange={(e) => handleRoleToggle(role, e.target.checked)}
                      disabled={saving || success}
                    />
                  }
                  label={role}
                />
              ))}
            </FormGroup>
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
            {saving ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
