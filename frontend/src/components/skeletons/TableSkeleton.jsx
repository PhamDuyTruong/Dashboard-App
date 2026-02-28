import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const ROWS = 8;
const COLS = 6;

export default function TableSkeleton() {
  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Skeleton variant="rectangular" sx={{ width: { xs: '100%', sm: 200 }, height: 40 }} />
        <Skeleton variant="rectangular" sx={{ width: { xs: '100%', sm: 120 }, height: 40 }} />
      </Box>
      <Paper sx={{ overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {Array.from({ length: COLS }).map((_, i) => (
                <TableCell key={i}>
                  <Skeleton variant="text" width={i === 0 ? 80 : 60} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: ROWS }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {Array.from({ length: COLS }).map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton variant="text" width={`${70 + colIdx * 5}%`} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', py: 1 }}>
        <Skeleton variant="rectangular" width={400} height={36} />
      </Box>
    </Box>
  );
}
