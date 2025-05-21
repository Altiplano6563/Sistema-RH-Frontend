import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, Box, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Drawer estilizado
const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'drawerWidth' })(
  ({ theme, open, drawerWidth }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

// Item de menu estilizado
const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  ...(active && {
    backgroundColor: theme.palette.action.selected,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Sidebar = ({ open, toggleDrawer, drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  
  // Verificar se um caminho está ativo
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // Navegar para uma rota
  const navigateTo = (path) => {
    navigate(path);
  };
  
  // Itens do menu principal
  const mainMenuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      permissions: [],
    },
    {
      text: 'Colaboradores',
      icon: <PeopleIcon />,
      path: '/employees',
      permissions: [],
    },
    {
      text: 'Departamentos',
      icon: <BusinessIcon />,
      path: '/departments',
      permissions: ['admin', 'rh'],
    },
    {
      text: 'Cargos',
      icon: <WorkIcon />,
      path: '/positions',
      permissions: ['admin', 'rh'],
    },
    {
      text: 'Movimentações',
      icon: <CompareArrowsIcon />,
      path: '/movements',
      permissions: [],
    },
  ];
  
  // Itens do menu de configurações
  const configMenuItems = [
    {
      text: 'Configurações',
      icon: <SettingsIcon />,
      path: '/settings',
      permissions: ['admin'],
    },
  ];

  return (
    <StyledDrawer
      variant="permanent"
      open={open}
      drawerWidth={drawerWidth}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 8px',
          ...(!open && { display: 'none' }),
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      
      {/* Menu principal */}
      <List component="nav" sx={{ px: 2, pt: 2 }}>
        {mainMenuItems.map((item) => (
          // Mostrar item apenas se o usuário tiver permissão
          (item.permissions.length === 0 || hasPermission(item.permissions)) && (
            <Tooltip
              key={item.text}
              title={!open ? item.text : ''}
              placement="right"
              arrow
            >
              <StyledListItem
                button
                active={isActive(item.path) ? 1 : 0}
                onClick={() => navigateTo(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </StyledListItem>
            </Tooltip>
          )
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Menu de configurações */}
      <List component="nav" sx={{ px: 2 }}>
        {configMenuItems.map((item) => (
          // Mostrar item apenas se o usuário tiver permissão
          (item.permissions.length === 0 || hasPermission(item.permissions)) && (
            <Tooltip
              key={item.text}
              title={!open ? item.text : ''}
              placement="right"
              arrow
            >
              <StyledListItem
                button
                active={isActive(item.path) ? 1 : 0}
                onClick={() => navigateTo(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </StyledListItem>
            </Tooltip>
          )
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
