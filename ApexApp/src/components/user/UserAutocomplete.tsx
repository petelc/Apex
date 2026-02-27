import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import type { UserSummary } from '@/api/users'; // ✅ Import from API file

interface UserAutocompleteProps {
  users: UserSummary[];
  selectedUserId: string | null;
  onSelect: (userId: string | null) => void;
  label?: string;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Autocomplete component for selecting users
 * Provides search functionality with user display
 */
export function UserAutocomplete({
  users,
  selectedUserId,
  onSelect,
  label = 'Select User',
  loading = false,
  error,
  disabled = false,
  required = false,
}: UserAutocompleteProps) {
  const selectedUser = users.find((u) => u.id === selectedUserId) || null;

  return (
    <Autocomplete
      value={selectedUser}
      onChange={(_, newValue) => {
        onSelect(newValue?.id || null);
      }}
      options={users}
      getOptionLabel={(option) => option.fullName}
      loading={loading}
      disabled={disabled}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props as any;
        return (
          <li key={option.id} {...otherProps}>
            <div>
              <div style={{ fontWeight: 600 }}>{option.fullName}</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {option.email}
              </div>
            </div>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={!!error}
          helperText={error}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color='inherit' size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
