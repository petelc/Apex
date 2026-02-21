import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { UserAutocomplete } from '@/components/user/UserAutocomplete';
import { userApi, type UserSummary } from '@/api/users';
import { projectApi } from '@/api/projects';
import { getErrorMessage } from '@/api/client';

interface AssignProjectManagerDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  currentManagerId?: string | null;
  onSuccess?: () => void;
}

/**
 * Dialog for assigning a project manager to a project
 * - Loads project managers from API
 * - Provides autocomplete search
 * - Handles assignment API call
 */
export function AssignProjectManagerDialog({
  open,
  onClose,
  projectId,
  currentManagerId,
  onSuccess,
}: AssignProjectManagerDialogProps) {
  const [projectManagers, setProjectManagers] = useState<UserSummary[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(
    currentManagerId || null,
  );
  const [loading, setLoading] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [error, setError] = useState('');

  // Load project managers when dialog opens
  useEffect(() => {
    if (open) {
      loadProjectManagers();
      setSelectedManagerId(currentManagerId || null);
      setError('');
    }
  }, [open, currentManagerId]);

  const loadProjectManagers = async () => {
    try {
      setLoadingManagers(true);
      setError('');

      console.log('🔍 Loading project managers...');
      const managers = await userApi.getProjectManagers();

      console.log('✅ Loaded project managers:', managers);
      console.log('📊 Count:', managers.length);

      setProjectManagers(managers);

      if (managers.length === 0) {
        setError(
          'No users with "Project Manager" role found. Please assign the role to users first.',
        );
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      console.error('❌ Error loading project managers:', errorMsg, err);
      setError(errorMsg);
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedManagerId) return;

    try {
      setLoading(true);
      setError('');

      console.log('🚀 Assigning project manager:', {
        projectId,
        managerId: selectedManagerId,
      });

      await projectApi.assignProjectManager(projectId, selectedManagerId);

      console.log('✅ Project manager assigned successfully');

      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      console.error('❌ Error assigning project manager:', errorMsg, err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Assign Project Manager</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loadingManagers ? (
          <Box display='flex' justifyContent='center' py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            {projectManagers.length > 0 ? (
              <UserAutocomplete
                users={projectManagers}
                selectedUserId={selectedManagerId}
                onSelect={setSelectedManagerId}
                label='Project Manager'
                required
                disabled={loading}
              />
            ) : (
              !error && (
                <Alert severity='info'>
                  No users with "Project Manager" role found.
                  <br />
                  Please assign the role to users first.
                </Alert>
              )
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant='contained'
          disabled={
            loading ||
            !selectedManagerId ||
            loadingManagers ||
            projectManagers.length === 0
          }
        >
          {loading ? <CircularProgress size={24} /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
