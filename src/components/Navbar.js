import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Barra de navegação estilizada
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'drawerWidth',
})(({ theme, open, drawerWidth }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Navbar = ({ open, toggleDrawer, drawerWidth }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estado para o menu de usuário
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  
  // Abrir menu de usuário
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Fechar menu de usuário
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Navegar para o perfil
  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };
  
  // Fazer logout
  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  return (
    <StyledAppBar position="fixed" open={open} drawerWidth={drawerWidth}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="abrir menu"
          onClick={toggleDrawer}
          edge="start"
          sx={{
            marginRight: 2,
            ...(open && { display: 'none' }),
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Sistema RH Online
        </Typography>
        
        {/* Ícone de notificações */}
        <IconButton color="inherit" sx={{ mr: 2 }}>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        {/* Avatar e menu do usuário */}
        <IconButton
          onClick={handleMenuOpen}
          color="inherit"
          aria-controls={openMenu ? 'user-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openMenu ? 'true' : undefined}
        >
          {user?.nome ? (
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user.nome.charAt(0).toUpperCase()}
            </Avatar>
          ) : (
            <AccountCircleIcon />
          )}
        </IconButton>
        
        {/* Menu de usuário */}
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'user-button',
          }}
        >
          <MenuItem onClick={handleProfileClick}>Meu Perfil</MenuItem>
          <MenuItem onClick={handleLogout}>Sair</MenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;
