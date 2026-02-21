import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ChangeRequestFormStep1 } from '@/components/change-requests/forms/ChangeRequestFormStep1';
import { ChangeRequestFormStep2 } from '@/components/change-requests/forms/ChangeRequestFormStep2';
import { changeRequestApi } from '@/api/changeRequests';
import { getErrorMessage } from '@/api/client';
import {
  changeRequestSchema,
  type ChangeRequestFormData,
} from '@/schemas/changeRequestSchema';

/**
 * Edit Change Request (Draft only)
 */
export default function EditChangeRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ChangeRequestFormData>({
    resolver: zodResolver(changeRequestSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (id) {
      loadChangeRequest();
    }
  }, [id]);

  const loadChangeRequest = async () => {
    try {
      setLoading(true);
      const data = await changeRequestApi.getById(id!);

      // Check if it's editable (must be Draft)
      if (data.status !== 'Draft') {
        setError('Only draft change requests can be edited');
        return;
      }

      // Populate form with existing data
      reset({
        title: data.title,
        description: data.description,
        changeType: data.changeType,
        priority: data.priority,
        riskLevel: data.riskLevel,
        impactAssessment: data.impactAssessment,
        rollbackPlan: data.rollbackPlan,
        affectedSystems: data.affectedSystems,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ChangeRequestFormData) => {
    try {
      setSaving(true);
      setError('');

      await changeRequestApi.update(id!, data);

      navigate(`/change-requests/${id}`, {
        state: {
          message: 'Change request updated successfully!',
        },
      });
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <title>Edit Change Request - APEX</title>
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
      <title>Edit Change Request - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/change-requests/${id}`)}
              sx={{ mb: 2 }}
            >
              Back to Change Request
            </Button>

            <Typography variant="h4" fontWeight={700} gutterBottom>
              Edit Change Request
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Make changes to your draft change request
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
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
                  <ChangeRequestFormStep1 control={control} errors={errors} />
                </CardContent>
              </Card>

              {/* Impact & Risk */}
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <ChangeRequestFormStep2 control={control} errors={errors} />
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
                  variant="outlined"
                  onClick={() => navigate(`/change-requests/${id}`)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
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
