import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

export default function ChartSkeleton() {
  return (
    <Paper sx={{ p: 2, height: 280 }}>
      <Skeleton variant="text" width={120} height={24} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 200 }}>
        {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width="12%"
            height={`${h}%`}
            sx={{ minHeight: 24 }}
          />
        ))}
      </Box>
    </Paper>
  );
}
