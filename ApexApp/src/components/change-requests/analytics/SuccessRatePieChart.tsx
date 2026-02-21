import { Typography, Box, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { SuccessRateData } from '@/types/changeRequest';

interface SuccessRatePieChartProps {
  data: SuccessRateData;
}

/**
 * Pie chart showing success/failure/rollback rates
 */
export const SuccessRatePieChart = ({ data }: SuccessRatePieChartProps) => {
  const theme = useTheme();

  const chartData = [
    {
      name: 'Successful',
      value: data.successfulChanges,
      percentage: data.successPercentage,
    },
    {
      name: 'Failed',
      value: data.failedChanges,
      percentage: data.failurePercentage,
    },
    {
      name: 'Rolled Back',
      value: data.rolledBackChanges,
      percentage: data.rollbackPercentage,
    },
  ];

  const COLORS = [
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {payload[0].value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {payload[0].payload.percentage.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Success Rate Analysis
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Distribution of change outcomes
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
        <Box textAlign="center">
          <Typography variant="h5" fontWeight={700} color="success.main">
            {data.successPercentage.toFixed(1)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Success Rate
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h5" fontWeight={700} color="error.main">
            {data.failurePercentage.toFixed(1)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Failure Rate
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h5" fontWeight={700} color="warning.main">
            {data.rollbackPercentage.toFixed(1)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Rollback Rate
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
