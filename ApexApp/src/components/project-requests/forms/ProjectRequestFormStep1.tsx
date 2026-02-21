import { Controller, Control, FieldErrors } from 'react-hook-form';
import {
  Box,
  TextField,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { Info } from '@mui/icons-material';
import type { ProjectRequestFormData } from '@/schemas/projectRequestSchema';


interface ProjectRequestFormStep1Props {
  control: Control<ProjectRequestFormData>;
  errors: FieldErrors<ProjectRequestFormData>;
}

/**
 * Step 1: Basic Information
 */
export const ProjectRequestFormStep1 = ({
  control,
  errors,
}: ProjectRequestFormStep1Props) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Basic Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide the basic details of your project request
      </Typography>

      <Stack spacing={3}>
        {/* Title */}
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Project Title"
              placeholder="e.g., Database Migration to PostgreSQL 15"
              fullWidth
              required
              error={!!errors.title}
              helperText={errors.title?.message}
              inputProps={{ maxLength: 200 }}
            />
          )}
        />

        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              placeholder="Provide a detailed description of the project..."
              fullWidth
              required
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description?.message || `${field.value.length}/2000 characters`}
              inputProps={{ maxLength: 2000 }}
            />
          )}
        />

        {/* Business Justification */}
        <Controller
          name="businessJustification"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Business Justification"
              placeholder="Provide a detailed business justification for the project..."
              fullWidth
              required
              multiline
              rows={4}
              error={!!errors.businessJustification}
              helperText={errors.businessJustification?.message || `${field.value.length}/2000 characters`}
              inputProps={{ maxLength: 2000 }}
            />
              
          )}
        />

        {/* Info Alert */}
        <Alert severity="info" icon={<Info />}>
          <Typography variant="body2">
            <strong>Project Request Guide:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • <strong>Description:</strong> Please provide a detailed overview of the project
          </Typography>
          <Typography variant="body2">
            • <strong>Business Justification:</strong> Please provide a detailed business justification for the project
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
};
