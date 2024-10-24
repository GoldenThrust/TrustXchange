import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Box, Rating } from '@mui/material';
import { X, Star, DollarSign } from 'lucide-react'; // Import Lucide icons
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';

export default function ReviewPopup({ open, handleClose, onSubmit, exchangeId }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle className="flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="mr-2" />
          Review Transaction
        </div>
        <Button onClick={handleClose}>
          <X className="text-gray-600 hover:text-gray-900" />
        </Button>
      </DialogTitle>
      <DialogContent>
        <div >
          <span className='font-bold'>Exchange ID: </span> {exchangeId}
        </div>
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating
                  {...field}
                  value={Number(field.value)}
                  icon={<Star className="text-yellow-500" />}
                  onChange={(e, newValue) => field.onChange(newValue)}
                />
                <span className="ml-3">{field.value || 0} Stars</span>
              </Box>
            )}
          />

          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Add a comment"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Enter your feedback here..."
                margin="normal"
              />
            )}
          />

          <DialogActions>
            <Button type="submit" color='primary' variant="contained">
              Submit Review
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

ReviewPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  exchangeId: PropTypes.string,
}