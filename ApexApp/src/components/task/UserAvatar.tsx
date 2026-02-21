/**
 * UserAvatar Component
 * Displays user avatar with initials or profile image
 */

import React from 'react';
import { Avatar, Tooltip } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { getUserDisplayName, getUserInitials } from '../../utils/taskUtils';

interface UserAvatarProps {
  fullName?: string;
  email?: string;
  profileImageUrl?: string;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  fullName, 
  email, 
  profileImageUrl,
  size = 'medium',
  showTooltip = true
}) => {
  const displayName = getUserDisplayName(fullName, email);
  const initials = getUserInitials(fullName, email);

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, fontSize: '0.875rem' };
      case 'large':
        return { width: 56, height: 56, fontSize: '1.25rem' };
      case 'medium':
      default:
        return { width: 40, height: 40, fontSize: '1rem' };
    }
  };

  const avatar = (
    <Avatar
      src={profileImageUrl}
      alt={displayName}
      sx={{
        ...getSize(),
        bgcolor: 'primary.main',
        fontWeight: 600,
      }}
    >
      {!profileImageUrl && (initials !== '?' ? initials : <PersonIcon />)}
    </Avatar>
  );

  if (showTooltip) {
    return (
      <Tooltip title={displayName} arrow>
        {avatar}
      </Tooltip>
    );
  }

  return avatar;
};

export default UserAvatar;
