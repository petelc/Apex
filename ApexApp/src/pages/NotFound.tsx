import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home } from '@mui/icons-material';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <title>404 - Page Not Found | APEX</title>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2E5090 0%, #1E3A6F 100%)',
        }}
      >
        <Container maxWidth="sm">
          <Box textAlign="center" color="white">
            <Typography variant="h1" fontWeight={900} gutterBottom>
              404
            </Typography>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Page Not Found
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              The page you're looking for doesn't exist or has been moved.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              onClick={() => navigate('/dashboard')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
