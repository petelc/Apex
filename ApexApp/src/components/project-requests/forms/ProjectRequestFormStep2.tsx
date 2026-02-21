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
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import type { ProjectRequestFormData } from '@/schemas/projectRequestSchema';

interface ProjectRequestFormStep2Props {
  control: Control<ProjectRequestFormData>;
  errors: FieldErrors<ProjectRequestFormData>;
}

/**
 * Step 2: Impact & Risk Assessment
 */
export const ProjectRequestFormStep2 = ({
  control,
  errors,
}: ProjectRequestFormStep2Props) => {
  return (
    <Box>
      <Typography variant='h6' fontWeight={600} gutterBottom>
        Finance & Timeline Assessment
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Assess the financial impact and timeline of this change
      </Typography>

      <Stack spacing={3}>
        {/* Priority & Risk Level */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name='priority'
              control={control}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.priority}>
                  <InputLabel>Priority</InputLabel>
                  <Select {...field} label='Priority'>
                    <MenuItem value='Low'>Low</MenuItem>
                    <MenuItem value='Medium'>Medium</MenuItem>
                    <MenuItem value='High'>High</MenuItem>
                    <MenuItem value='Critical'>Critical</MenuItem>
                  </Select>
                  {errors.priority && (
                    <FormHelperText>{errors.priority.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name='estimatedBudget'
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <FormControl
                  fullWidth
                  required
                  error={!!errors.estimatedBudget}
                >
                  <InputLabel>Estimated Budget</InputLabel>
                  <OutlinedInput
                    {...field}
                    value={value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange(val === '' ? undefined : Number(val));
                    }}
                    id='estimated-budget'
                    type='number'
                    startAdornment={
                      <InputAdornment position='start'>$</InputAdornment>
                    }
                    label='Estimated Budget'
                  />
                  {errors.estimatedBudget && (
                    <FormHelperText>
                      {errors.estimatedBudget.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Proposed Start Date */}
            <Controller
              name='proposedStartDate'
              control={control}
              render={({ field: { value, ...field } }) => (
                <TextField
                  {...field}
                  value={value ?? ''}
                  label='Proposed Start Date'
                  type='date'
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  fullWidth
                  required
                  error={!!errors.proposedStartDate}
                  helperText={
                    errors.proposedStartDate?.message ||
                    'Select the proposed start date for this change'
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {/* Proposed End Date */}
            <Controller
              name='proposedEndDate'
              control={control}
              render={({ field: { value, ...field } }) => (
                <TextField
                  {...field}
                  value={value ?? ''}
                  label='Proposed End Date'
                  type='date'
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  fullWidth
                  required
                  error={!!errors.proposedEndDate}
                  helperText={
                    errors.proposedEndDate?.message ||
                    'Select the proposed end date for this change'
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {/*Due Date */}
            <Controller
              name='dueDate'
              control={control}
              render={({ field: { value, ...field } }) => (
                <TextField
                  {...field}
                  value={value ?? ''}
                  label='Due Date'
                  type='date'
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  fullWidth
                  required
                  error={!!errors.dueDate}
                  helperText={
                    errors.dueDate?.message ||
                    'Select the due date for this change'
                  }
                />
              )}
            />
          </Grid>
        </Grid>

        {/* Warning Alert */}
        <Alert severity='warning' icon={<Warning />}>
          <Typography variant='body2' fontWeight={600}>
            Important Reminders:
          </Typography>
          <Typography variant='body2' sx={{ mt: 1 }}>
            • <strong>Impact Assessment:</strong> Consider technical, business,
            and user impacts
          </Typography>
          <Typography variant='body2'>
            • <strong>Rollback Plan:</strong> Must be detailed and tested before
            execution
          </Typography>
          <Typography variant='body2'>
            • <strong>Risk Level:</strong> High/Critical risks require
            additional approvals
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
};
