import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { FolderOpen, PlayArrow } from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { projectApi } from '@/api/projects';
import { getErrorMessage } from '@/api/client';
import type { Project } from '@/types/project';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await projectApi.start(id);
      await loadProjects();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='60vh'
        >
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  return (
    <>
      <title>Projects - APEX</title>
      <AppLayout>
        <Box
          display='flex'
          flexDirection={'column'}
          justifyContent='space-between'
          alignItems='flex-start'
          mb={3}
        >
          <Typography variant='h4' fontWeight={700} gutterBottom>
            Projects
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage active projects and tasks
          </Typography>
        </Box>

        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
              <Card
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent>
                  <Box display='flex' alignItems='flex-start' mb={2}>
                    <FolderOpen color='primary' sx={{ mr: 1 }} />
                    <Box flex={1}>
                      <Typography variant='h6' fontWeight={600} gutterBottom>
                        {project.name}
                      </Typography>
                      <StatusBadge status={project.status} size='small' />
                    </Box>
                  </Box>

                  <Typography variant='body2' color='text.secondary' mb={2}>
                    {project.description}
                  </Typography>

                  <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {project.createdByUser?.fullName?.[0] || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          {project.createdByUser?.fullName || 'Unknown User'}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {project.createdByUser?.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant='caption' color='text.secondary'>
                      {format(new Date(project.createdDate), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions>
                  {project.status === 'Planning' && (
                    <Button
                      size='small'
                      startIcon={<PlayArrow />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStart(project.id);
                      }}
                    >
                      Start Project
                    </Button>
                  )}
                  <Button
                    size='small'
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}/tasks`);
                    }}
                  >
                    View Tasks
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {projects.length === 0 && (
          <Box textAlign='center' py={8}>
            <Typography variant='h6' color='text.secondary'>
              No projects yet
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Convert approved project requests to create projects
            </Typography>
          </Box>
        )}
      </AppLayout>
    </>
  );
}
