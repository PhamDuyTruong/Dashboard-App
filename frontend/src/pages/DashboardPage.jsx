import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getAnalytics, getAnalyticsSummary, postAnalyticsEntry } from '../api/analytics';
import { useSocketRefresh } from '../hooks/useSocket';
import StatCard from '../components/dashboard/StatCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import AnalyticsTable from '../components/dashboard/AnalyticsTable';
import CreateEntryModal from '../components/dashboard/CreateEntryModal';
import StatCardSkeleton from '../components/skeletons/StatCardSkeleton';
import ChartSkeleton from '../components/skeletons/ChartSkeleton';
import TableSkeleton from '../components/skeletons/TableSkeleton';

const ChartsSection = lazy(() => import('../components/dashboard/ChartsSection'));

const SUMMARY_KEY = ['analytics', 'summary'];
const LIST_KEY = (params) => ['analytics', 'list', params];
const LIST_MIN_DELAY_MS = 1500;

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const listHasLoadedOnce = useRef(false);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // Default: newest first so new entries appear at top
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [activityEvents, setActivityEvents] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const listParams = {
    page,
    limit,
    search: searchDebounced || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
  };
  // Query key must include sortBy/sortOrder as primitives so changing sort triggers refetch
  const { data: listData, isLoading: listLoading, isFetching: listFetching } = useQuery({
    queryKey: ['analytics', 'list', page, limit, searchDebounced ?? '', statusFilter ?? '', sortBy, sortOrder],
    queryFn: async () => {
      const start = Date.now();
      const data = await getAnalytics(listParams);
      if (listHasLoadedOnce.current) {
        const elapsed = Date.now() - start;
        if (elapsed < LIST_MIN_DELAY_MS) {
          await new Promise((r) => setTimeout(r, LIST_MIN_DELAY_MS - elapsed));
        }
      } else {
        listHasLoadedOnce.current = true;
      }
      return data;
    },
  });
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: getAnalyticsSummary,
  });

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
    queryClient.invalidateQueries({ queryKey: ['analytics', 'list'] });
  }, [queryClient]);

  useSocketRefresh(refetch);

  const handleSubmitEntry = async (body) => {
    try {
      const entry = await postAnalyticsEntry({
        ...body,
        byStatus: { active: 1, inactive: 0, banned: 0 },
        registrationsByDay: [],
      });
      setActivityEvents((prev) => [
        { message: `New entry: ${entry.id}`, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);
      setSnackbar({ open: true, message: 'Entry created', severity: 'success' });
      refetch();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.error || 'Failed to create entry', severity: 'error' });
      throw err;
    }
  };

  const items = listData?.items ?? [];
  const totalCount = listData?.totalCount ?? 0;
  const summaryData = summary || listData?.summary;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Dashboard
        </Typography>
        <Button variant="contained" onClick={() => setModalOpen(true)} sx={{ flexShrink: 0 }}>
          Create
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {summaryLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <StatCardSkeleton />
              </Grid>
            ))}
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total players" value={summaryData?.totalPlayers ?? '-'} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Active players" value={summaryData?.activePlayers ?? '-'} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Avg playtime (min)" value={summaryData?.avgPlaytimeMinutes ?? '-'} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Avg score" value={summaryData?.avgScore ?? '-'} />
            </Grid>
          </>
        )}

        <Suspense
          fallback={
            <>
              <Grid item xs={12} md={6}>
                <ChartSkeleton />
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartSkeleton />
              </Grid>
            </>
          }
        >
          {summaryLoading ? (
            <>
              <Grid item xs={12} md={6}>
                <ChartSkeleton />
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartSkeleton />
              </Grid>
            </>
          ) : (
            <ChartsSection
              byStatus={summaryData?.byStatus}
              registrationsByDay={summaryData?.registrationsByDay}
            />
          )}
        </Suspense>

        <Grid item xs={12} lg={8} sx={{ minWidth: 0 }}>
          {listLoading ? (
            <TableSkeleton />
          ) : (
            <AnalyticsTable
              data={items}
              page={page}
              limit={limit}
              totalCount={totalCount}
              onPageChange={setPage}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={(s) => { setStatusFilter(s); setPage(1); }}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(by, order) => {
                setSortBy(by);
                setSortOrder(order);
                setPage(1);
              }}
              isRefetching={listFetching}
            />
          )}
        </Grid>
        <Grid item xs={12} lg={4} sx={{ minWidth: 0 }}>
          <ActivityFeed events={activityEvents} />
        </Grid>
      </Grid>

      <CreateEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitEntry}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
