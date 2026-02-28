import { useMemo } from 'react';
import Box from '@mui/material/Box';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: { position: 'top' },
  },
  scales: {
    y: { beginAtZero: true },
  },
};

export default function BarChartByStatus({ byStatus = {} }) {
  const data = useMemo(() => {
    const labels = ['active', 'inactive', 'banned'];
    const values = labels.map((k) => Number(byStatus[k]) || 0);
    return {
      labels,
      datasets: [
        {
          label: 'Count',
          data: values,
          backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        },
      ],
    };
  }, [byStatus?.active, byStatus?.inactive, byStatus?.banned]);

  return (
    <Box sx={{ width: '100%', minHeight: { xs: 220, sm: 260 } }}>
      <Bar options={OPTIONS} data={data} />
    </Box>
  );
}
