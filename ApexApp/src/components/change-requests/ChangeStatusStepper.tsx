import { Box, Stepper, Step, StepLabel, alpha, useTheme } from '@mui/material';
import {
  Edit,
  RateReview,
  CheckCircle,
  Schedule,
  PlayArrow,
  Done,
} from '@mui/icons-material';
import type { ChangeRequestStatus } from '@/types/changeRequest';

interface ChangeStatusStepperProps {
  status: ChangeRequestStatus;
}

/**
 * Visual stepper showing change request progress
 */
export const ChangeStatusStepper = ({ status }: ChangeStatusStepperProps) => {
  const theme = useTheme();

  // Define the happy path steps
  const steps = [
    { label: 'Draft', icon: Edit, statuses: ['Draft'] },
    { label: 'Review', icon: RateReview, statuses: ['UnderReview'] },
    { label: 'Approved', icon: CheckCircle, statuses: ['Approved'] },
    { label: 'Scheduled', icon: Schedule, statuses: ['Scheduled'] },
    { label: 'In Progress', icon: PlayArrow, statuses: ['InProgress'] },
    { label: 'Completed', icon: Done, statuses: ['Completed'] },
  ];

  // Determine active step
  const getActiveStep = () => {
    const index = steps.findIndex(step => step.statuses.includes(status));
    return index !== -1 ? index : -1;
  };

  const activeStep = getActiveStep();

  // Handle special cases
  const isErrorState = status === 'Failed' || status === 'RolledBack' || status === 'Denied';
  const isCancelled = status === 'Cancelled';

  if (isErrorState || isCancelled) {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {status === 'Denied' && (
            <>
              <CheckCircle sx={{ color: 'error.main' }} />
              <Box>
                <strong>Change Denied</strong> - Review CAB feedback
              </Box>
            </>
          )}
          {status === 'Failed' && (
            <>
              <Done sx={{ color: 'error.main' }} />
              <Box>
                <strong>Change Failed</strong> - Consider rollback
              </Box>
            </>
          )}
          {status === 'RolledBack' && (
            <>
              <PlayArrow sx={{ color: 'warning.main' }} />
              <Box>
                <strong>Change Rolled Back</strong> - Review incident
              </Box>
            </>
          )}
          {status === 'Cancelled' && (
            <>
              <Edit sx={{ color: 'text.secondary' }} />
              <Box>
                <strong>Change Cancelled</strong>
              </Box>
            </>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;

          return (
            <Step key={step.label} completed={isCompleted}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isActive
                        ? theme.palette.primary.main
                        : isCompleted
                        ? theme.palette.success.main
                        : alpha(theme.palette.text.primary, 0.1),
                      color: isActive || isCompleted ? 'white' : 'text.secondary',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <StepIcon fontSize="small" />
                  </Box>
                )}
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};
