import { useMemo } from 'react';
import Box from '@mui/material/Box';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

export default function LineChartRegistrations({ registrationsByDay = [] }) {
  const data = useMemo(() => {
    const labels = registrationsByDay.map((d) => d.date);
    const values = registrationsByDay.map((d) => d.count ?? 0);
    return {
      labels,
      datasets: [
        {
          label: 'Registrations',
          data: values,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
        },
      ],
    };
  }, [registrationsByDay]);

  if (!registrationsByDay.length) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary', minHeight: 120 }}>
        No registration data
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: { xs: 220, sm: 260 } }}>
      <Line options={OPTIONS} data={data} />
    </Box>
  );
}
