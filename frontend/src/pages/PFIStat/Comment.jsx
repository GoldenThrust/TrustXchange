import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import PropTypes from 'prop-types';


export default function Comment({ open, onClose, pfiName, reviews }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center', color: '#2c3e50' }}>
                {pfiName} Comments
            </DialogTitle>
            <DialogContent dividers sx={{ padding: '16px' }}>
                {reviews && reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                        review.comment &&
                        <Box
                            key={idx}
                            sx={{
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: '#f9f9f9',
                                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                                marginBottom: '16px'
                            }}
                        >
                            <Typography variant="body1" sx={{ fontWeight: '500', marginBottom: '4px', color: '#34495e' }}>
                                {review.comment}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                                Rating: {review.rating}/5
                            </Typography>
                        </Box>
                    ))
                ) : (
                    <Typography component="div" className="text-gray-500" sx={{ textAlign: 'center', color: '#95a5a6', padding: '20px 0' }}>
                        No comments available.
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', paddingBottom: '16px' }}>
                <Button onClick={onClose} variant="contained" color="primary" sx={{ padding: '8px 24px' }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}


Comment.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    pfiName: PropTypes.string.isRequired,
    reviews: PropTypes.arrayOf(PropTypes.object),
}