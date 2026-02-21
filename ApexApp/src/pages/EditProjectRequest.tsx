import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  LinearProgress,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';

import { getErrorMessage } from '@/api/client';

import { projectRequestApi } from '@/api/projectRequests';
import {
  defaultProjectRequestValues,
  ProjectRequestFormData,
  projectRequestSchema,
} from '@/schemas/projectRequestSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ProjectRequestFormStep1 } from '@/components/project-requests/forms/ProjectRequestFormStep1';
import { ProjectRequestFormStep2 } from '@/components/project-requests/forms/ProjectRequestFormStep2';

/**
 * Edit Project Request (Draft only)
 */
export default function EditProjectRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // console.log('Editing Project Request ID:', id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProjectRequestFormData>({
    resolver: zodResolver(projectRequestSchema),
    defaultValues: defaultProjectRequestValues,
    mode: 'onBlur',
  });

  // Debug form state
  // console.log('Form isDirty:', isDirty);
  // console.log('Form errors:', errors);

  useEffect(() => {
    if (id) {
      loadProjectRequest();
    }
  }, [id]);

  const loadProjectRequest = async () => {
    try {
      setLoading(true);
      const data = await projectRequestApi.getById(id!);

      // Check if it's editable (must be Draft)
      if (data.status !== 'Draft') {
        setError('Only draft project requests can be edited');
        return;
      }

      // Populate form with existing data
      reset({
        title: data.title,
        description: data.description,
        businessJustification: data.businessJustification,
        priority: data.priority,
        dueDate: data.dueDate,
        estimatedBudget: data.estimatedBudget,
        proposedStartDate: data.proposedStartDate,
        proposedEndDate: data.proposedEndDate,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProjectRequestFormData) => {
    try {
      setSaving(true);
      setError('');

      // console.log('Submitting update with data:', data);
      // console.log('Project Request ID:', id);

      await projectRequestApi.update(id!, data);

      // console.log('Update successful, navigating...');

      navigate(`/project-requests/${id}`, {
        state: {
          message: 'Project request updated successfully!',
        },
      });
    } catch (err) {
      console.error('Update failed:', err);
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <title>Edit Project Request - APEX</title>
        <AppLayout>
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <title>Edit Project Request - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/project-requests/${id}`)}
              sx={{ mb: 2 }}
            >
              Back to Project Request
            </Button>
            <Typography variant='h4' fontWeight={700} gutterBottom>
              Edit Project Request
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Make changes to your draft project request
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Saving */}
          {saving && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress />
            </Box>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Basic Information */}
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <ProjectRequestFormStep1 control={control} errors={errors} />
                </CardContent>
              </Card>

              {/* Impact & Risk */}
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <ProjectRequestFormStep2 control={control} errors={errors} />
                </CardContent>
              </Card>

              {/* Actions */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                }}
              >
                <Button
                  variant='outlined'
                  onClick={() => navigate(`/project-requests/${id}`)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  startIcon={<Save />}
                  disabled={saving || !isDirty}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </Stack>
          </form>
        </Box>
      </AppLayout>
    </>
  );
}
