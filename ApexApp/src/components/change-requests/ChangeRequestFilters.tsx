import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Stack,
  Collapse,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  SelectChangeEvent,
  alpha,
  useTheme,
} from '@mui/material';
import { Search, FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
import type {
  ChangeRequestFilters as Filters,
  ChangeRequestStatus,
  ChangeType,
  Priority,
  RiskLevel,
} from '@/types/changeRequest';

interface ChangeRequestFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
}

const STATUS_OPTIONS: ChangeRequestStatus[] = [
  'Draft',
  'UnderReview',
  'Approved',
  'Denied',
  'Scheduled',
  'InProgress',
  'Completed',
  'Failed',
  'RolledBack',
  'Cancelled',
];

const TYPE_OPTIONS: ChangeType[] = ['Standard', 'Normal', 'Emergency'];

const PRIORITY_OPTIONS: Priority[] = ['Low', 'Medium', 'High', 'Critical'];

const RISK_OPTIONS: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

/**
 * Filter component for Change Requests list
 */
export const ChangeRequestFilters = ({
  filters,
  onChange,
  resultCount,
}: ChangeRequestFiltersProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSearchSubmit = () => {
    onChange({ ...filters, search: searchValue });
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      status: typeof value === 'string' ? value.split(',') as ChangeRequestStatus[] : value as ChangeRequestStatus[],
    });
  };

  const handleTypeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      changeType: typeof value === 'string' ? value.split(',') as ChangeType[] : value as ChangeType[],
    });
  };

  const handlePriorityChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      priority: typeof value === 'string' ? value.split(',') as Priority[] : value as Priority[],
    });
  };

  const handleRiskChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      riskLevel: typeof value === 'string' ? value.split(',') as RiskLevel[] : value as RiskLevel[],
    });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    onChange({});
  };

  const hasActiveFilters =
    filters.status?.length ||
    filters.changeType?.length ||
    filters.priority?.length ||
    filters.riskLevel?.length ||
    filters.search ||
    filters.startDate ||
    filters.endDate;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.5),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      {/* Search Bar */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: expanded ? 2 : 0 }}>
        <TextField
          fullWidth
          placeholder="Search by title, description, or affected systems..."
          value={searchValue}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<Search />}
          onClick={handleSearchSubmit}
          sx={{ minWidth: 120 }}
        >
          Search
        </Button>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          {expanded ? <ExpandLess /> : <FilterList />}
        </IconButton>
      </Stack>

      {/* Advanced Filters */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Stack spacing={2}>
            {/* Row 1: Status & Type */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.status || []}
                  onChange={handleStatusChange}
                  input={<OutlinedInput label="Status" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  multiple
                  value={filters.changeType || []}
                  onChange={handleTypeChange}
                  input={<OutlinedInput label="Type" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {TYPE_OPTIONS.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Row 2: Priority & Risk */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  multiple
                  value={filters.priority || []}
                  onChange={handlePriorityChange}
                  input={<OutlinedInput label="Priority" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  multiple
                  value={filters.riskLevel || []}
                  onChange={handleRiskChange}
                  input={<OutlinedInput label="Risk Level" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {RISK_OPTIONS.map((risk) => (
                    <MenuItem key={risk} value={risk}>
                      {risk}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Row 3: Date Range */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.startDate || ''}
                onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.endDate || ''}
                onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
              />
            </Stack>

            {/* Actions */}
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <Box>
                <Chip
                  label={`${resultCount} result${resultCount !== 1 ? 's' : ''}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              {hasActiveFilters && (
                <Button
                  startIcon={<Clear />}
                  onClick={handleClearFilters}
                  size="small"
                >
                  Clear All Filters
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Collapse>

      {/* Active Filters Display (when collapsed) */}
      {!expanded && hasActiveFilters && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            Active filters:
          </Box>
          {filters.status?.map((s) => (
            <Chip
              key={s}
              label={`Status: ${s}`}
              size="small"
              onDelete={() =>
                onChange({
                  ...filters,
                  status: filters.status?.filter((x) => x !== s),
                })
              }
            />
          ))}
          {filters.changeType?.map((t) => (
            <Chip
              key={t}
              label={`Type: ${t}`}
              size="small"
              onDelete={() =>
                onChange({
                  ...filters,
                  changeType: filters.changeType?.filter((x) => x !== t),
                })
              }
            />
          ))}
          {filters.priority?.map((p) => (
            <Chip
              key={p}
              label={`Priority: ${p}`}
              size="small"
              onDelete={() =>
                onChange({
                  ...filters,
                  priority: filters.priority?.filter((x) => x !== p),
                })
              }
            />
          ))}
          {filters.riskLevel?.map((r) => (
            <Chip
              key={r}
              label={`Risk: ${r}`}
              size="small"
              onDelete={() =>
                onChange({
                  ...filters,
                  riskLevel: filters.riskLevel?.filter((x) => x !== r),
                })
              }
            />
          ))}
          {filters.search && (
            <Chip
              label={`Search: "${filters.search}"`}
              size="small"
              onDelete={() => {
                setSearchValue('');
                onChange({ ...filters, search: undefined });
              }}
            />
          )}
          <Button
            size="small"
            startIcon={<Clear />}
            onClick={handleClearFilters}
          >
            Clear All
          </Button>
        </Box>
      )}
    </Box>
  );
};
