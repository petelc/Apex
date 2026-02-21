import { Typography, Box, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyTrend } from '@/types/changeRequest';

interface MonthlyTrendsChartProps {
  data: MonthlyTrend[];
}

/**
 * Line chart showing monthly trends over time
 */
export const MonthlyTrendsChart = ({ data }: MonthlyTrendsChartProps) => {
  const theme = useTheme();

  // Reverse to show oldest first (left to right)
  const chartData = [...data].reverse();

  const CustomTooltip = ({ active, payload, label }: any) => {
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
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {label}
          </Typography>
          {payload.map((item: any, index: number) => (
            <Typography key={index} variant="body2" sx={{ color: item.color }}>
              {item.name}: {item.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Monthly Trends
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Change volume and success rate over the last 12 months
      </Typography>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="monthName"
            stroke={theme.palette.text.secondary}
            style={{ fontSize: '0.875rem' }}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={{ fontSize: '0.875rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalChanges"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            name="Total Changes"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke={theme.palette.success.main}
            strokeWidth={2}
            name="Completed"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="failed"
            stroke={theme.palette.error.main}
            strokeWidth={2}
            name="Failed"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};
