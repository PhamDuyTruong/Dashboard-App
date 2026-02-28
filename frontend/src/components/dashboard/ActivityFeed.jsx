import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';

const MAX_ITEMS = 10;

export default function ActivityFeed({ events = [] }) {
  const list = Array.isArray(events) ? events.slice(0, MAX_ITEMS) : [];
  return (
    <Paper sx={{ p: 2, height: { xs: 'auto', lg: 'fit-content' }, maxHeight: { lg: 400 }, overflow: 'auto' }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Recent activity
      </Typography>
      <List dense disablePadding>
        {list.length === 0 ? (
          <ListItem>
            <ListItemText secondary="No recent events" />
          </ListItem>
        ) : (
          list.map((ev, i) => (
            <ListItem key={i} disablePadding>
              <ListItemText primary={ev.message || ev.type} secondary={ev.time} />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}
