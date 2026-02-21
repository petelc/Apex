import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';


const drawerWidth = '45%';

export const SideDrawer = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box role="presentation" onClick={onClose} onKeyDown={onClose} sx={{ p: 2 }}>
        {children}
      </Box>
    </Drawer>
  );
};