import { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <title>Login - APEX</title>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A1929 0%, #132F4C 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(74, 144, 226, 0.1) 0%, transparent 50%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 80% 80%, rgba(124, 77, 255, 0.08) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(19, 47, 76, 0.9)',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <CardContent sx={{ p: 5 }}>
              {/* Logo */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  component="img"
                  src="/apex-logo.svg"
                  alt="APEX Logo"
                  sx={{
                    width: 64,
                    height: 64,
                    margin: '0 auto',
                    mb: 2,
                    filter: 'drop-shadow(0 8px 24px rgba(74, 144, 226, 0.3))',
                  }}
                />
                <Typography variant="h4" fontWeight={900} gutterBottom>
                  APEX
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Project Management Platform
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #4A90E2 0%, #2E5090 100%)',
                    boxShadow: '0 4px 16px rgba(74, 144, 226, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6BA4EC 0%, #4A90E2 100%)',
                      boxShadow: '0 6px 20px rgba(74, 144, 226, 0.4)',
                    },
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Demo Credentials */}
              <Box sx={{ mt: 2, p: 0.5, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2 }} justifyItems={'flex-end'}>
                <Box sx={{ p: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => navigate('/forgot-password')}
                    sx={{ mt: 1 }}
                  >
                    <Lock fontSize="small" /> 
                    <Typography variant="overline" gutterBottom sx={{ display: 'block', mt: 1 }}>
                      Forgot Password?
                    </Typography>
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Footer */}
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            display="block"
            sx={{ mt: 3, position: 'relative', zIndex: 1 }}
          >
            © {new Date().getFullYear()} APEX. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
