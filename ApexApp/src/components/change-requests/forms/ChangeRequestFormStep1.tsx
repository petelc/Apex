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
  Alert,
} from '@mui/material';
import { Info } from '@mui/icons-material';
import type { ChangeRequestFormData } from '@/schemas/changeRequestSchema';

interface ChangeRequestFormStep1Props {
  control: Control<ChangeRequestFormData>;
  errors: FieldErrors<ChangeRequestFormData>;
}

/**
 * Step 1: Basic Information
 */
export const ChangeRequestFormStep1 = ({
  control,
  errors,
}: ChangeRequestFormStep1Props) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Basic Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide the basic details of your change request
      </Typography>

      <Stack spacing={3}>
        {/* Title */}
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Change Title"
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
              placeholder="Provide a detailed description of the change..."
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

        {/* Change Type */}
        <Controller
          name="changeType"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth required error={!!errors.changeType}>
              <InputLabel>Change Type</InputLabel>
              <Select {...field} label="Change Type">
                <MenuItem value="Standard">
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Standard
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pre-approved, low-risk changes
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="Normal">
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Normal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Regular changes requiring CAB approval
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="Emergency">
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Emergency
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Urgent changes for critical issues
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
              {errors.changeType && (
                <FormHelperText>{errors.changeType.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {/* Info Alert */}
        <Alert severity="info" icon={<Info />}>
          <Typography variant="body2">
            <strong>Change Type Guide:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • <strong>Standard:</strong> Routine, pre-approved changes with minimal risk
          </Typography>
          <Typography variant="body2">
            • <strong>Normal:</strong> Regular changes that require CAB review and approval
          </Typography>
          <Typography variant="body2">
            • <strong>Emergency:</strong> Critical fixes needed immediately to restore service
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
};
