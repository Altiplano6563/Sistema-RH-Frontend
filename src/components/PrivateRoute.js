import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Componente para rotas privadas que requerem autenticação
const PrivateRoute = ({ children, requiredPermissions = [] }) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  // Mostrar indicador de carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se houver permissões requeridas, verificar se o usuário tem acesso
  if (requiredPermissions.length > 0 && !hasPermission(requiredPermissions)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se estiver autenticado e tiver permissão, renderizar o conteúdo
  return children || <Outlet />;
};

export default PrivateRoute;
