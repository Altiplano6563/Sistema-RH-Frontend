import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import jwt_decode from 'jwt-decode';

// Criar contexto de autenticação
export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
          setLoading(false);
          return;
        }
        
        // Verificar se o token está expirado
        const decodedToken = jwt_decode(accessToken);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expirado, tentar refresh
          await refreshToken();
        } else {
          // Token válido, carregar dados do usuário
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // Se não tiver dados do usuário, buscar do servidor
            const response = await api.get('/auth/check');
            setUser(response.data.data);
            localStorage.setItem('user', JSON.stringify(response.data.data));
          }
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        // Limpar dados de autenticação em caso de erro
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Função para fazer login
  const login = useCallback(async (email, senha) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, senha });
      const { accessToken, refreshToken, user } = response.data.data;
      
      // Armazenar tokens e dados do usuário
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Configurar token no cabeçalho das requisições
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;
      
      setUser(user);
      return user;
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(err.response?.data?.message || 'Erro ao fazer login');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para fazer logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Chamar endpoint de logout para invalidar o token no servidor
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      // Limpar dados de autenticação
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Remover token do cabeçalho das requisições
      delete api.defaults.headers.Authorization;
      
      setUser(null);
      setLoading(false);
    }
  }, []);

  // Função para atualizar tokens
  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      // Atualizar tokens no localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      // Configurar token no cabeçalho das requisições
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar token:', err);
      
      // Limpar dados de autenticação em caso de erro
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setUser(null);
      
      return false;
    }
  }, []);

  // Verificar se o usuário está autenticado
  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  // Verificar se o usuário tem determinada permissão
  const hasPermission = useCallback((requiredRoles) => {
    if (!user) return false;
    
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    
    return requiredRoles.includes(user.perfil);
  }, [user]);

  // Contexto de autenticação
  const authContext = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    isAuthenticated,
    hasPermission
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
