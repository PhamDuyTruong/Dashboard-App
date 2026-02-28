import BarChartByStatus from './BarChartByStatus';
import LineChartRegistrations from './LineChartRegistrations';
import Grid from '@mui/material/Grid';

export default function ChartsSection({ byStatus, registrationsByDay }) {
  return (
    <>
      <Grid item xs={12} md={6}>
        <BarChartByStatus byStatus={byStatus} />
      </Grid>
      <Grid item xs={12} md={6}>
        <LineChartRegistrations registrationsByDay={registrationsByDay} />
      </Grid>
    </>
  );
}
