import {
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  Alert,
  Paper,
} from '@mui/material';
import { CheckCircle, Info } from '@mui/icons-material';
import type { ChangeRequestFormData } from '@/schemas/changeRequestSchema';

interface ChangeRequestFormStep3Props {
  formValues: ChangeRequestFormData;
}

/**
 * Step 3: Review & Submit
 */
export const ChangeRequestFormStep3 = ({
  formValues,
}: ChangeRequestFormStep3Props) => {
  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Review & Submit
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your change request details before submitting
      </Typography>

      <Stack spacing={3}>
        {/* Basic Information */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Basic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            <InfoRow label="Title" value={formValues.title} />
            <InfoRow label="Description" value={formValues.description} />
            <InfoRow
              label="Change Type"
              value={
                <Chip
                  label={formValues.changeType}
                  size="small"
                  color={
                    formValues.changeType === 'Emergency'
                      ? 'error'
                      : formValues.changeType === 'Normal'
                      ? 'primary'
                      : 'default'
                  }
                />
              }
            />
          </Stack>
        </Paper>

        {/* Impact & Risk */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Impact & Risk Assessment
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <InfoRow
                label="Priority"
                value={
                  <Chip
                    label={formValues.priority}
                    size="small"
                    color={
                      formValues.priority === 'Critical'
                        ? 'error'
                        : formValues.priority === 'High'
                        ? 'warning'
                        : formValues.priority === 'Medium'
                        ? 'info'
                        : 'success'
                    }
                  />
                }
              />
              <InfoRow
                label="Risk Level"
                value={
                  <Chip
                    label={formValues.riskLevel}
                    size="small"
                    color={
                      formValues.riskLevel === 'Critical' || formValues.riskLevel === 'High'
                        ? 'error'
                        : formValues.riskLevel === 'Medium'
                        ? 'warning'
                        : 'success'
                    }
                  />
                }
              />
            </Box>
            <InfoRow label="Affected Systems" value={formValues.affectedSystems} />
            <InfoRow label="Impact Assessment" value={formValues.impactAssessment} />
            <InfoRow label="Rollback Plan" value={formValues.rollbackPlan} />
          </Stack>
        </Paper>

        {/* Next Steps Alert */}
        <Alert severity="success" icon={<CheckCircle />}>
          <Typography variant="body2" fontWeight={600}>
            You're ready to submit!
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Choose one of the following actions:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • <strong>Save as Draft:</strong> Save your progress and continue editing later
          </Typography>
          <Typography variant="body2">
            • <strong>Submit for Review:</strong> Send to CAB for approval
          </Typography>
        </Alert>

        {/* CAB Review Info */}
        {formValues.changeType === 'Normal' && (
          <Alert severity="info" icon={<Info />}>
            <Typography variant="body2">
              <strong>CAB Review Required:</strong> This change will be submitted to the Change
              Advisory Board for review and approval.
            </Typography>
          </Alert>
        )}

        {formValues.changeType === 'Emergency' && (
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Emergency Change:</strong> This will be flagged as an emergency change
              requiring expedited review.
            </Typography>
          </Alert>
        )}
      </Stack>
    </Box>
  );
};
