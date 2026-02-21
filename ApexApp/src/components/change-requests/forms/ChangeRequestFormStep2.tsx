import { Controller, Control, FieldErrors } from 'react-hook-form';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Stack,
  Grid,
  Alert,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import type { ChangeRequestFormData } from '@/schemas/changeRequestSchema';

interface ChangeRequestFormStep2Props {
  control: Control<ChangeRequestFormData>;
  errors: FieldErrors<ChangeRequestFormData>;
}

/**
 * Step 2: Impact & Risk Assessment
 */
export const ChangeRequestFormStep2 = ({
  control,
  errors,
}: ChangeRequestFormStep2Props) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Impact & Risk Assessment
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Assess the impact and risk level of this change
      </Typography>

      <Stack spacing={3}>
        {/* Priority & Risk Level */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.priority}>
                  <InputLabel>Priority</InputLabel>
                  <Select {...field} label="Priority">
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                  {errors.priority && (
                    <FormHelperText>{errors.priority.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="riskLevel"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.riskLevel}>
                  <InputLabel>Risk Level</InputLabel>
                  <Select {...field} label="Risk Level">
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                  {errors.riskLevel && (
                    <FormHelperText>{errors.riskLevel.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
        </Grid>

        {/* Affected Systems */}
        <Controller
          name="affectedSystems"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Affected Systems"
              placeholder="e.g., Production Database, API Server, Frontend Application"
              fullWidth
              required
              error={!!errors.affectedSystems}
              helperText={
                errors.affectedSystems?.message ||
                'List all systems that will be affected by this change'
              }
              inputProps={{ maxLength: 500 }}
            />
          )}
        />

        {/* Impact Assessment */}
        <Controller
          name="impactAssessment"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Impact Assessment"
              placeholder="Describe the potential impact of this change on systems, users, and business operations..."
              fullWidth
              required
              multiline
              rows={5}
              error={!!errors.impactAssessment}
              helperText={
                errors.impactAssessment?.message ||
                `${field.value.length}/2000 characters`
              }
              inputProps={{ maxLength: 2000 }}
            />
          )}
        />

        {/* Rollback Plan */}
        <Controller
          name="rollbackPlan"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Rollback Plan"
              placeholder="Describe the step-by-step process to rollback this change if issues arise..."
              fullWidth
              required
              multiline
              rows={5}
              error={!!errors.rollbackPlan}
              helperText={
                errors.rollbackPlan?.message ||
                `${field.value.length}/2000 characters`
              }
              inputProps={{ maxLength: 2000 }}
            />
          )}
        />

        {/* Warning Alert */}
        <Alert severity="warning" icon={<Warning />}>
          <Typography variant="body2" fontWeight={600}>
            Important Reminders:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • <strong>Impact Assessment:</strong> Consider technical, business, and user impacts
          </Typography>
          <Typography variant="body2">
            • <strong>Rollback Plan:</strong> Must be detailed and tested before execution
          </Typography>
          <Typography variant="body2">
            • <strong>Risk Level:</strong> High/Critical risks require additional approvals
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
};
