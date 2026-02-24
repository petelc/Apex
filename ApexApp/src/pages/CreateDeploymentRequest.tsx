import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  LinearProgress,
  Grid,
  TextField,
  MenuItem,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import { ArrowBack, Save, Send } from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { deploymentRequestApi } from '@/api/deploymentRequests';
import { projectApi } from '@/api/projects';
import { changeRequestApi } from '@/api/changeRequests';
import { getErrorMessage } from '@/api/client';
import type {
  CreateDeploymentRequestDto,
  DeploymentEnvironment,
  RequestPriority,
  RiskLevel,
} from '@/types/deploymentRequest';
import type { Project } from '@/types/project';
import type { ChangeRequest } from '@/types/changeRequest';

const ENVIRONMENTS: DeploymentEnvironment[] = ['Development', 'Staging', 'UAT', 'Production'];
const PRIORITIES: RequestPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

interface FormValues {
  title: string;
  description: string;
  environment: DeploymentEnvironment | '';
  priority: RequestPriority | '';
  riskLevel: RiskLevel | '';
  affectedSystems: string;
  rollbackPlan: string;
  deploymentWindow: string;
  projectId: string;
  changeRequestId: string;
  scheduledStartDate: string;
  scheduledEndDate: string;
}

const defaultValues: FormValues = {
  title: '',
  description: '',
  environment: '',
  priority: '',
  riskLevel: '',
  affectedSystems: '',
  rollbackPlan: '',
  deploymentWindow: '',
  projectId: '',
  changeRequestId: '',
  scheduledStartDate: '',
  scheduledEndDate: '',
};

/**
 * Create Deployment Request Page
 */
export default function CreateDeploymentRequestPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormValues>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);

  useEffect(() => {
    Promise.all([projectApi.getAll(), changeRequestApi.getAll()]).then(
      ([projs, crs]) => {
        setProjects(projs.filter((p) => p.status !== 'Completed' && p.status !== 'Cancelled'));
        setChangeRequests(crs.filter((cr) => cr.status !== 'Completed' && cr.status !== 'Cancelled' && cr.status !== 'Denied' && cr.status !== 'RolledBack'));
      }
    );
  }, []);

  const handleChange = (field: keyof FormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    if (!form.environment) errors.environment = 'Environment is required';
    if (!form.priority) errors.priority = 'Priority is required';
    if (!form.riskLevel) errors.riskLevel = 'Risk level is required';
    if (!form.affectedSystems.trim()) errors.affectedSystems = 'Affected systems is required';
    if (!form.rollbackPlan.trim()) errors.rollbackPlan = 'Rollback plan is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildDto = (): CreateDeploymentRequestDto => {
    const dto: CreateDeploymentRequestDto = {
      title: form.title.trim(),
      description: form.description.trim(),
      environment: form.environment as DeploymentEnvironment,
      priority: form.priority as RequestPriority,
      riskLevel: form.riskLevel as RiskLevel,
      affectedSystems: form.affectedSystems.trim(),
      rollbackPlan: form.rollbackPlan.trim(),
    };

    if (form.deploymentWindow.trim()) dto.deploymentWindow = form.deploymentWindow.trim();
    if (form.projectId.trim()) dto.projectId = form.projectId.trim();
    if (form.changeRequestId.trim()) dto.changeRequestId = form.changeRequestId.trim();
    if (form.scheduledStartDate) dto.scheduledStartDate = new Date(form.scheduledStartDate).toISOString();
    if (form.scheduledEndDate) dto.scheduledEndDate = new Date(form.scheduledEndDate).toISOString();

    return dto;
  };

  const handleSaveDraft = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setError('');
      const response = await deploymentRequestApi.create(buildDto());
      navigate(`/deployment-requests/${response.deploymentRequestId}`, {
        state: { message: 'Deployment request created as draft!' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setError('');
      const response = await deploymentRequestApi.create(buildDto());
      await deploymentRequestApi.submit(response.deploymentRequestId);
      navigate(`/deployment-requests/${response.deploymentRequestId}`, {
        state: { message: 'Deployment request created and submitted for approval!' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <title>Create Deployment Request - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/deployment-requests')}
              sx={{ mb: 2 }}
            >
              Back to Deployment Requests
            </Button>

            <Typography variant="h4" fontWeight={700} gutterBottom>
              Create Deployment Request
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill out the form below to create a new deployment request
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress />
            </Box>
          )}

          {/* Form */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* Title */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Title"
                    fullWidth
                    required
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    error={!!fieldErrors.title}
                    helperText={fieldErrors.title}
                    disabled={loading}
                  />
                </Grid>

                {/* Description */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Description"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    error={!!fieldErrors.description}
                    helperText={fieldErrors.description}
                    disabled={loading}
                  />
                </Grid>

                {/* Environment */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Environment"
                    fullWidth
                    required
                    select
                    value={form.environment}
                    onChange={(e) => handleChange('environment', e.target.value)}
                    error={!!fieldErrors.environment}
                    helperText={fieldErrors.environment}
                    disabled={loading}
                  >
                    {ENVIRONMENTS.map((env) => (
                      <MenuItem key={env} value={env}>
                        {env}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Priority */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Priority"
                    fullWidth
                    required
                    select
                    value={form.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    error={!!fieldErrors.priority}
                    helperText={fieldErrors.priority}
                    disabled={loading}
                  >
                    {PRIORITIES.map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Risk Level */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Risk Level"
                    fullWidth
                    required
                    select
                    value={form.riskLevel}
                    onChange={(e) => handleChange('riskLevel', e.target.value)}
                    error={!!fieldErrors.riskLevel}
                    helperText={fieldErrors.riskLevel}
                    disabled={loading}
                  >
                    {RISK_LEVELS.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Affected Systems */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Affected Systems"
                    fullWidth
                    required
                    multiline
                    rows={2}
                    value={form.affectedSystems}
                    onChange={(e) => handleChange('affectedSystems', e.target.value)}
                    error={!!fieldErrors.affectedSystems}
                    helperText={fieldErrors.affectedSystems || 'Comma-separated list of systems'}
                    disabled={loading}
                  />
                </Grid>

                {/* Rollback Plan */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Rollback Plan"
                    fullWidth
                    required
                    multiline
                    rows={3}
                    value={form.rollbackPlan}
                    onChange={(e) => handleChange('rollbackPlan', e.target.value)}
                    error={!!fieldErrors.rollbackPlan}
                    helperText={fieldErrors.rollbackPlan}
                    disabled={loading}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 1 }}>
                Optional Details
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* Deployment Window */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Deployment Window"
                    fullWidth
                    placeholder="e.g. Saturdays 10pm-2am"
                    value={form.deploymentWindow}
                    onChange={(e) => handleChange('deploymentWindow', e.target.value)}
                    disabled={loading}
                  />
                </Grid>

                {/* Scheduled Start Date */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="Scheduled Start Date"
                    type="datetime-local"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={form.scheduledStartDate}
                    onChange={(e) => handleChange('scheduledStartDate', e.target.value)}
                    disabled={loading}
                  />
                </Grid>

                {/* Scheduled End Date */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="Scheduled End Date"
                    type="datetime-local"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={form.scheduledEndDate}
                    onChange={(e) => handleChange('scheduledEndDate', e.target.value)}
                    disabled={loading}
                  />
                </Grid>

                {/* Link to Project */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Link to Project"
                    fullWidth
                    select
                    value={form.projectId}
                    onChange={(e) => handleChange('projectId', e.target.value)}
                    disabled={loading}
                    helperText="Optional — link this deployment to an active project"
                  >
                    <MenuItem value="">None</MenuItem>
                    {projects.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name} ({p.status})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Link to Change Request */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Link to Change Request"
                    fullWidth
                    select
                    value={form.changeRequestId}
                    onChange={(e) => handleChange('changeRequestId', e.target.value)}
                    disabled={loading}
                    helperText="Optional — link this deployment to an open change request"
                  >
                    <MenuItem value="">None</MenuItem>
                    {changeRequests.map((cr) => (
                      <MenuItem key={cr.id} value={cr.id}>
                        {cr.title} ({cr.status})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Actions */}
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Save as Draft
            </Button>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleSubmitForApproval}
              disabled={loading}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              Submit for Approval
            </Button>
          </Box>
        </Box>
      </AppLayout>
    </>
  );
}
