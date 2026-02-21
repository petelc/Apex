import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BusinessIcon from '@mui/icons-material/Business';
import type { User } from '@/api/users';

interface UserListTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onAssignDepartment?: (user: User) => void;
}

export default function UserListTable({
  users,
  onEditUser,
  onAssignDepartment,
}: UserListTableProps) {
  if (users.length === 0) {
    return (
      <Typography
        variant='body2'
        color='text.secondary'
        align='center'
        sx={{ py: 4 }}
      >
        No users found
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant='outlined'>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell align='center'>Status</TableCell>
            <TableCell align='center'>Last Login</TableCell>
            <TableCell align='center'>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.userId}
              sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
            >
              <TableCell>
                <Typography variant='body2' fontWeight='medium'>
                  {user.fullName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant='body2' color='text.secondary'>
                  {user.email}
                </Typography>
              </TableCell>
              <TableCell>
                {user.departmentName ? (
                  <Chip
                    label={user.departmentName}
                    size='small'
                    icon={<BusinessIcon />}
                    variant='outlined'
                  />
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant='body2' color='text.secondary'>
                  —
                </Typography>
              </TableCell>
              <TableCell>
                <Stack direction='row' spacing={0.5} flexWrap='wrap'>
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        size='small'
                        color='primary'
                        variant='outlined'
                      />
                    ))
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      No roles
                    </Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell align='center'>
                {user.isActive ? (
                  <Tooltip title='Active'>
                    <CheckCircleIcon color='success' fontSize='small' />
                  </Tooltip>
                ) : (
                  <Tooltip title='Inactive'>
                    <CancelIcon color='error' fontSize='small' />
                  </Tooltip>
                )}
              </TableCell>
              <TableCell align='center'>
                <Typography variant='body2' color='text.secondary'>
                  {user.lastLoginDate
                    ? new Date(user.lastLoginDate).toLocaleDateString()
                    : 'Never'}
                </Typography>
              </TableCell>
              <TableCell align='center'>
                {onAssignDepartment && (
                  <Tooltip title='Assign Department'>
                    <IconButton
                      size='small'
                      onClick={() => onAssignDepartment(user)}
                      color='default'
                      sx={{ mr: 0.5 }}
                    >
                      <BusinessIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title='Edit User'>
                  <IconButton
                    size='small'
                    onClick={() => onEditUser(user)}
                    color='primary'
                  >
                    <EditIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
