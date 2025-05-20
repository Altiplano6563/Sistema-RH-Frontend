import React from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// Largura da barra lateral
const drawerWidth = 260;

// Componente estilizado para o conteúdo principal
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      padding: theme.spacing(2),
      width: '100%',
    },
  }),
);

// Layout principal da aplicação
const MainLayout = () => {
  // Estado para controlar a abertura/fechamento da barra lateral
  const [open, setOpen] = React.useState(true);

  // Função para alternar a barra lateral
  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Barra de navegação superior */}
      <Navbar open={open} toggleDrawer={toggleDrawer} drawerWidth={drawerWidth} />
      
      {/* Barra lateral */}
      <Sidebar open={open} toggleDrawer={toggleDrawer} drawerWidth={drawerWidth} />
      
      {/* Conteúdo principal */}
      <Main open={open}>
        {/* Espaço para a barra de navegação */}
        <Box component="div" sx={{ height: { xs: 56, sm: 64 } }} />
        
        {/* Conteúdo das páginas (via Outlet do React Router) */}
        <Box sx={{ py: 2 }}>
          <Outlet />
        </Box>
      </Main>
    </Box>
  );
};

export default MainLayout;
