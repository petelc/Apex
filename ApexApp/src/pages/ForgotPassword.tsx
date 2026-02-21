import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  CircularProgress,
  Paper,
} from '@mui/material';
import { ArrowBack, Email } from '@mui/icons-material';
import { authApi } from '@/api/auth';
import { getErrorMessage } from '@/api/client';

/**
 * Forgot Password Page
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await authApi.forgotPassword(email);
      
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box textAlign="center" mb={3}>
                <Email sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Check Your Email
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If an account exists with {email}, you will receive a password reset link shortly.
                </Typography>
              </Box>

              <Alert severity="success" sx={{ mb: 3 }}>
                <strong>Email Sent!</strong> Please check your inbox and spam folder.
                The reset link will expire in 1 hour.
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setSuccess(false)}
                >
                  Send Another Link
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <title>Forgot Password - APEX</title>
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              {/* Back Button */}
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/login')}
                sx={{ mb: 3 }}
              >
                Back to Login
              </Button>

              {/* Header */}
              <Box textAlign="center" mb={4}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Forgot Password?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    autoFocus
                    disabled={loading}
                    placeholder="your.email@company.com"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </Box>
              </form>

              {/* Security Note */}
              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: 'info.light',
                  color: 'info.contrastText',
                }}
              >
                <Typography variant="caption">
                  <strong>Security Note:</strong> For your protection, we won't confirm whether 
                  this email exists in our system. If the email is registered, you'll receive 
                  a reset link within a few minutes.
                </Typography>
              </Paper>

              {/* Help Text */}
              <Box textAlign="center" mt={3}>
                <Typography variant="body2" color="text.secondary">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  );
}
