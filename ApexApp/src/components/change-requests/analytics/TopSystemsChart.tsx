import { Typography, Box, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { TopAffectedSystem } from '@/types/changeRequest';

interface TopSystemsChartProps {
  data: TopAffectedSystem[];
}

/**
 * Bar chart showing top affected systems
 */
export const TopSystemsChart = ({ data }: TopSystemsChartProps) => {
  const theme = useTheme();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
            {data.systemName}
          </Typography>
          <Typography variant="body2">
            Total Changes: {data.changeCount}
          </Typography>
          <Typography variant="body2" color="success.main">
            Successful: {data.successfulChanges}
          </Typography>
          <Typography variant="body2" color="error.main">
            Failed: {data.failedChanges}
          </Typography>
          <Typography variant="body2">
            Success Rate: {data.successRate.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Color bars based on change count
  const getBarColor = (count: number) => {
    const maxCount = Math.max(...data.map(d => d.changeCount));
    const intensity = count / maxCount;
    
    if (intensity > 0.7) return theme.palette.error.main;
    if (intensity > 0.4) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Top Affected Systems
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Systems with the most change requests
      </Typography>

      {data.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="systemName"
              stroke={theme.palette.text.secondary}
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              style={{ fontSize: '0.75rem' }}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              style={{ fontSize: '0.875rem' }}
              label={{ value: 'Number of Changes', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="changeCount"
              name="Total Changes"
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.changeCount)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};
