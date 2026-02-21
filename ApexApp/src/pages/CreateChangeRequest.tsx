import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  alpha,
  useTheme,
} from '@mui/material';
import { ArrowBack, Save, Send } from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChangeRequestFormStep1 } from '@/components/change-requests/forms/ChangeRequestFormStep1';
import { ChangeRequestFormStep2 } from '@/components/change-requests/forms/ChangeRequestFormStep2';
import { ChangeRequestFormStep3 } from '@/components/change-requests/forms/ChangeRequestFormStep3';
import { changeRequestApi } from '@/api/changeRequests';
import { getErrorMessage } from '@/api/client';
import {
  changeRequestSchema,
  defaultChangeRequestValues,
  type ChangeRequestFormData,
} from '@/schemas/changeRequestSchema';

const STEPS = ['Basic Information', 'Impact & Risk', 'Review & Submit'];

/**
 * Create Change Request - Multi-step Form
 */
export default function CreateChangeRequestPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch,
  } = useForm<ChangeRequestFormData>({
    resolver: zodResolver(changeRequestSchema),
    defaultValues: defaultChangeRequestValues,
    mode: 'onChange',
  });

  const formValues = watch();

  const handleNext = async () => {
    // Validate current step before proceeding
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getFieldsForStep = (step: number): (keyof ChangeRequestFormData)[] => {
    switch (step) {
      case 0:
        return ['title', 'description', 'changeType'];
      case 1:
        return ['priority', 'riskLevel', 'impactAssessment', 'rollbackPlan', 'affectedSystems'];
      case 2:
        return [];
      default:
        return [];
    }
  };

  const onSubmit = async (data: ChangeRequestFormData, shouldSubmit: boolean = false) => {
    try {
      setLoading(true);
      setError('');

      // Create the change request
      const response = await changeRequestApi.create(data);
      const changeRequestId = response.changeRequestId;

      // If shouldSubmit is true, also submit for review
      if (shouldSubmit) {
        await changeRequestApi.submit(changeRequestId);
      }

      // Navigate to the detail page
      navigate(`/change-requests/${changeRequestId}`, {
        state: {
          message: shouldSubmit
            ? 'Change request created and submitted for review!'
            : 'Change request created successfully!',
        },
      });
    } catch (err) {
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = handleSubmit((data) => onSubmit(data, false));
  const handleSubmitForReview = handleSubmit((data) => onSubmit(data, true));

  return (
    <>
      <title>Create Change Request - APEX</title>
      <AppLayout>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/change-requests')}
              sx={{ mb: 2 }}
            >
              Back to Change Requests
            </Button>

            <Typography variant="h4" fontWeight={700} gutterBottom>
              Create Change Request
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill out the form below to create a new change request
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

          {/* Stepper */}
          <Card
            sx={{
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.05
              )} 0%, transparent 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <CardContent>
              <Stepper activeStep={activeStep}>
                {STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Form Steps */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              {activeStep === 0 && (
                <ChangeRequestFormStep1 control={control} errors={errors} />
              )}

              {activeStep === 1 && (
                <ChangeRequestFormStep2 control={control} errors={errors} />
              )}

              {activeStep === 2 && (
                <ChangeRequestFormStep3 formValues={formValues} />
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              {activeStep > 0 && (
                <Button onClick={handleBack} disabled={loading}>
                  Back
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === STEPS.length - 1 ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={handleSaveDraft}
                    disabled={loading || !isValid}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleSubmitForReview}
                    disabled={loading || !isValid}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    Submit for Review
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </AppLayout>
    </>
  );
}
