import { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiClient } from '@/api/client';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  userName: string;
  onUploadSuccess: (imageUrl: string) => void;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  userName,
  onUploadSuccess,
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, or GIF.');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/users/me/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.profileImageUrl;
      onUploadSuccess(imageUrl);
      setPreview(null);
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
      setError(
        err.response?.data?.error || 'Failed to upload profile picture'
      );
      setPreview(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveClick = () => {
    // For now, just clear the preview
    // In a full implementation, you'd call a delete endpoint
    setPreview(null);
    setError(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const displayImage = preview || currentImageUrl;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={displayImage}
            alt={userName}
            sx={{
              width: 120,
              height: 120,
              fontSize: '2.5rem',
              bgcolor: 'primary.main',
            }}
          >
            {!displayImage && getInitials(userName)}
          </Avatar>

          {uploading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '50%',
              }}
            >
              <CircularProgress size={40} sx={{ color: 'white' }} />
            </Box>
          )}

          {displayImage && !uploading && (
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'error.light' },
              }}
              onClick={handleRemoveClick}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        <Button
          variant="outlined"
          startIcon={<PhotoCameraIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {displayImage ? 'Change Picture' : 'Upload Picture'}
        </Button>

        <Typography variant="caption" color="text.secondary" align="center">
          JPEG, PNG, or GIF. Max 5MB.
        </Typography>
      </Box>
    </Box>
  );
}
