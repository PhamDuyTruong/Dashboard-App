import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const COLS = [
  { id: 'id', label: 'ID' },
  { id: 'totalPlayers', label: 'Total Players' },
  { id: 'activePlayers', label: 'Active' },
  { id: 'avgPlaytimeMinutes', label: 'Avg Playtime (min)' },
  { id: 'avgScore', label: 'Avg Score' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Created' },
  { id: 'updatedAt', label: 'Last modified' },
];

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'success', variant: 'filled' },
  inactive: { label: 'Inactive', color: 'warning', variant: 'filled' },
  banned: { label: 'Banned', color: 'error', variant: 'filled' },
};

function StatusTags({ byStatus }) {
  if (!byStatus || typeof byStatus !== 'object') return null;
  const tags = [];
  if (Number(byStatus.active) > 0) tags.push({ key: 'active', ...STATUS_CONFIG.active });
  if (Number(byStatus.inactive) > 0) tags.push({ key: 'inactive', ...STATUS_CONFIG.inactive });
  if (Number(byStatus.banned) > 0) tags.push({ key: 'banned', ...STATUS_CONFIG.banned });
  if (tags.length === 0) return <Box component="span" sx={{ color: 'text.secondary' }}>—</Box>;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {tags.map(({ key, label, color, variant }) => (
        <Chip key={key} label={label} color={color} variant={variant} size="small" />
      ))}
    </Box>
  );
}

const SELECT_MENU_PROPS = {
  PaperProps: {
    sx: {
      maxHeight: 'min(280px, 50vh)',
      overflow: 'auto',
    },
  },
  disableScrollLock: true,
};

export default function AnalyticsTable({
  data = [],
  page,
  limit,
  totalCount,
  onPageChange,
  onLimitChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy = 'updatedAt',
  sortOrder = 'desc',
  onSortChange,
  isRefetching = false,
}) {
  const theme = useTheme();
  const isSmallViewport = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumViewport = useMediaQuery(theme.breakpoints.down('md'));
  const pageNum = Math.max(1, page || 1);
  const limitNum = limit || 10;
  const skeletonRows = Math.min(limitNum, 10);

  const rowsPerPageOptions = useMemo(() => {
    const base = isSmallViewport ? [5, 10] : isMediumViewport ? [5, 10, 25] : [5, 10, 25, 50];
    const withCurrent = base.includes(limitNum) ? base : [...base, limitNum].sort((a, b) => a - b);
    return withCurrent;
  }, [isSmallViewport, isMediumViewport, limitNum]);

  const paginationSelectMenuProps = useMemo(
    () => ({
      PaperProps: {
        sx: {
          maxHeight: isSmallViewport ? 'min(35vh, 200px)' : 'min(40vh, 240px)',
          maxWidth: 'min(220px, 92vw)',
          overflowY: 'scroll',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        },
      },
      MenuListProps: {
        sx: { maxHeight: 'inherit', overflow: 'auto' },
      },
      anchorOrigin: { vertical: 'top', horizontal: 'left' },
      transformOrigin: { vertical: 'bottom', horizontal: 'left' },
      disableScrollLock: true,
    }),
    [isSmallViewport]
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          label="Search"
          value={search ?? ''}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 200 } }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter ?? ''}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 120 } }}
          SelectProps={{ MenuProps: SELECT_MENU_PROPS }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="banned">Banned</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Sort by"
          value={sortBy}
          onChange={(e) => onSortChange && onSortChange(e.target.value, sortOrder)}
          sx={{ minWidth: { xs: '100%', sm: 160 } }}
          SelectProps={{ MenuProps: SELECT_MENU_PROPS }}
        >
          <MenuItem value="createdAt">Created</MenuItem>
          <MenuItem value="updatedAt">Last modified</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Order"
          value={sortOrder}
          onChange={(e) => onSortChange && onSortChange(sortBy, e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 120 } }}
          SelectProps={{ MenuProps: SELECT_MENU_PROPS }}
        >
          <MenuItem value="desc">Newest first</MenuItem>
          <MenuItem value="asc">Oldest first</MenuItem>
        </TextField>
      </Box>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              {COLS.map((c) => (
                <TableCell key={c.id}>{c.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isRefetching ? (
              Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                <TableRow key={`skeleton-${rowIdx}`}>
                  {COLS.map((c) => (
                    <TableCell key={c.id}>
                      <Skeleton variant="text" width={c.id === 'id' ? '60%' : '80%'} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              data.map((row, idx) => (
                <TableRow key={row.id || idx}>
                  {COLS.map((c) => (
                    <TableCell key={c.id}>
                      {c.id === 'status' ? (
                        <StatusTags byStatus={row.byStatus} />
                      ) : (c.id === 'createdAt' || c.id === 'updatedAt') && row[c.id] ? (
                        row[c.id].slice(0, 19).replace('T', ' ')
                      ) : (
                        row[c.id]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount ?? 0}
        page={Math.max(0, pageNum - 1)}
        onPageChange={(_, p) => onPageChange(p + 1)}
        rowsPerPage={limitNum}
        onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={rowsPerPageOptions}
        SelectProps={{ MenuProps: paginationSelectMenuProps }}
      />
    </Box>
  );
}
