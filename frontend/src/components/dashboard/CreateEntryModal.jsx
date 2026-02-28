import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export const createEntrySchema = z
  .object({
    totalPlayers: z.number().min(0),
    activePlayers: z.number().min(0),
    avgPlaytimeMinutes: z.number().min(0),
    avgScore: z.number().min(0),
  })
  .refine((data) => data.activePlayers <= data.totalPlayers, {
    message: 'Active players must be less than or equal to total players',
    path: ['activePlayers'],
  });

const schema = createEntrySchema;

const defaultValues = {
  totalPlayers: 0,
  activePlayers: 0,
  avgPlaytimeMinutes: 0,
  avgScore: 0,
};

export default function CreateEntryModal({ open, onClose, onSubmit }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>Create analytics entry</DialogTitle>
      <form
        onSubmit={handleSubmit((data) => {
          onSubmit(data).then(() => handleClose());
        })}
      >
        <DialogContent>
          <TextField
            margin="dense"
            label="Total players"
            type="number"
            fullWidth
            {...register('totalPlayers', { valueAsNumber: true })}
            error={!!errors.totalPlayers}
            helperText={errors.totalPlayers?.message}
          />
          <TextField
            margin="dense"
            label="Active players"
            type="number"
            fullWidth
            {...register('activePlayers', { valueAsNumber: true })}
            error={!!errors.activePlayers}
            helperText={errors.activePlayers?.message}
          />
          <TextField
            margin="dense"
            label="Avg playtime (minutes)"
            type="number"
            fullWidth
            {...register('avgPlaytimeMinutes', { valueAsNumber: true })}
            error={!!errors.avgPlaytimeMinutes}
            helperText={errors.avgPlaytimeMinutes?.message}
          />
          <TextField
            margin="dense"
            label="Avg score"
            type="number"
            fullWidth
            {...register('avgScore', { valueAsNumber: true })}
            error={!!errors.avgScore}
            helperText={errors.avgScore?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
