import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { userApi } from '@/api/users';

interface ManageRolesDialogProps {
  open: boolean;
  onClose: () => void;
}

const SYSTEM_ROLES = ['TenantAdmin', 'Manager', 'User', 'ReadOnly'];

export default function ManageRolesDialog({ open, onClose }: ManageRolesDialogProps) {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadRoles();
      setNewRoleName('');
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await userApi.admin.getAllRoles();
      setRoles(data);
    } catch {
      setError('Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const name = newRoleName.trim();
    if (!name) return;

    try {
      setCreating(true);
      setError(null);
      setSuccess(null);
      await userApi.admin.createRole(name);
      setRoles((prev) => [...prev, name].sort());
      setNewRoleName('');
      setSuccess(`Role "${name}" created successfully.`);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.errors?.join(', ') ||
          'Failed to create role.',
      );
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Manage Roles</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Create new role */}
        <Typography variant='subtitle2' color='text.secondary' gutterBottom>
          Create a new role
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <TextField
            fullWidth
            size='small'
            placeholder='e.g. Change Manager, CAB Member'
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={creating}
            InputProps={{
              endAdornment: creating ? (
                <InputAdornment position='end'>
                  <CircularProgress size={18} />
                </InputAdornment>
              ) : undefined,
            }}
          />
          <Button
            variant='contained'
            onClick={handleCreate}
            disabled={!newRoleName.trim() || creating}
            startIcon={<AddIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add Role
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Existing roles */}
        <Typography variant='subtitle2' color='text.secondary' gutterBottom>
          Existing roles
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List dense disablePadding>
            {roles.map((role) => {
              const isSystem = SYSTEM_ROLES.includes(role);
              return (
                <ListItem
                  key={role}
                  disableGutters
                  sx={{ py: 0.5 }}
                  secondaryAction={
                    isSystem ? (
                      <Chip label='System' size='small' variant='outlined' />
                    ) : null
                  }
                >
                  <ListItemText
                    primary={role}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              );
            })}
            {roles.length === 0 && (
              <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
                No roles found.
              </Typography>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
