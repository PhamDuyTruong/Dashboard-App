import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import StatCardSkeleton from './StatCardSkeleton';
import ChartSkeleton from './ChartSkeleton';
import TableSkeleton from './TableSkeleton';

export default function DashboardPageSkeleton() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="text" width={180} height={40} />
        <Skeleton variant="rectangular" width={120} height={36} />
      </Box>
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCardSkeleton />
          </Grid>
        ))}
        <Grid item xs={12} md={6}>
          <ChartSkeleton />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartSkeleton />
        </Grid>
        <Grid item xs={12} md={8}>
          <TableSkeleton />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={200} />
        </Grid>
      </Grid>
    </Box>
  );
}
