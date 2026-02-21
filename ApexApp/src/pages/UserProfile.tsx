import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { usersApi } from '@/api/users';
import type { User } from '@/api/users';
import ProfileForm from '@/components/user/ProfileForm';
import ChangePasswordDialog from '@/components/user/ChangePasswordDialog';
import ProfilePictureUpload from '@/components/user/ProfilePictureUpload';
import { AppLayout } from '@/components/layout/AppLayout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserProfile() {
  const [currentTab, setCurrentTab] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await usersApi.getCurrentUser();
      setUser(userData);
    } catch (err: any) {
      console.error('Error loading user profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleProfilePictureUpload = (imageUrl: string) => {
    if (user) {
      setUser({ ...user, profileImageUrl: imageUrl });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity='error'>{error || 'User not found'}</Alert>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <title>My Profile</title>
      <Box sx={{ p: 3 }}>
        {/* <Typography variant='h4' gutterBottom>
          My Profile
        </Typography> */}

        <Card>
          <CardContent>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label='Profile Information' />
              <Tab label='Security' />
            </Tabs>

            <TabPanel value={currentTab} index={0}>
              <Grid container spacing={4}>
                {/* Profile Picture */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ProfilePictureUpload
                      currentImageUrl={user.profileImageUrl}
                      userName={
                        user.fullName || `${user.firstName} ${user.lastName}`
                      }
                      onUploadSuccess={handleProfilePictureUpload}
                    />
                  </Box>
                </Grid>

                {/* Profile Form */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <ProfileForm
                    user={user}
                    onUpdate={(updatedUser) => setUser(updatedUser)}
                  />

                  <Divider sx={{ my: 3 }} />

                  {/* Department & Roles Section */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant='h6' gutterBottom>
                      Organization Details
                    </Typography>

                    {/* Department */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        gutterBottom
                      >
                        <strong>Department:</strong>
                      </Typography>
                      {user.departmentName ? (
                        <Chip
                          label={user.departmentName}
                          icon={<BusinessIcon />}
                          color='primary'
                          variant='outlined'
                        />
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          Not assigned to a department
                        </Typography>
                      )}
                    </Box>

                    {/* Roles */}
                    <Box>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        gutterBottom
                      >
                        <strong>Roles:</strong>
                      </Typography>
                      {user.roles && user.roles.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {user.roles.map((role) => (
                            <Chip
                              key={role}
                              label={role}
                              size='small'
                              color='secondary'
                              variant='outlined'
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          No roles assigned
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              <Box>
                <Typography variant='h6' gutterBottom>
                  Password
                </Typography>
                <Typography variant='body2' color='text.secondary' paragraph>
                  Change your password to keep your account secure.
                </Typography>
                <Box>
                  <button
                    onClick={() => setPasswordDialogOpen(true)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Change Password
                  </button>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Typography variant='h6' gutterBottom>
                  Account Information
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  <strong>Account Status:</strong>{' '}
                  {user.isActive ? 'Active' : 'Inactive'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  <strong>Account Created:</strong>{' '}
                  {new Date(
                    user.createdDate || user.createdAt,
                  ).toLocaleDateString()}
                </Typography>
                {user.lastLoginDate && (
                  <Typography variant='body2' color='text.secondary'>
                    <strong>Last Login:</strong>{' '}
                    {new Date(user.lastLoginDate).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </TabPanel>
          </CardContent>
        </Card>

        <ChangePasswordDialog
          open={passwordDialogOpen}
          onClose={() => setPasswordDialogOpen(false)}
        />
      </Box>
    </AppLayout>
  );
}
