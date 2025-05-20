import axios from 'axios';

// Criar instância do axios com configurações base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros e refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Se o erro for 401 (Não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;
      
      try {
        // Tentar renovar o token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Se não houver refresh token, redirecionar para login
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Chamar endpoint de refresh token
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          { refreshToken }
        );
        
        // Atualizar tokens no localStorage
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Refazer a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Se falhar o refresh, limpar tokens e redirecionar para login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  // Registrar nova empresa e usuário admin
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  // Login de usuário
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    const { accessToken, refreshToken, user } = response.data.data;
    
    // Armazenar tokens e dados do usuário
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },
  
  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } finally {
      // Limpar dados de autenticação
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
  
  // Verificar autenticação
  checkAuth: async () => {
    const response = await api.get('/auth/check');
    return response.data;
  },
  
  // Obter usuário atual do localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Verificar se usuário está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  }
};

// Serviços de colaboradores
export const employeeService = {
  // Listar colaboradores com filtros e paginação
  getEmployees: async (params) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },
  
  // Obter colaborador por ID
  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  
  // Criar novo colaborador
  createEmployee: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },
  
  // Atualizar colaborador
  updateEmployee: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },
  
  // Remover colaborador
  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};

// Serviços de departamentos
export const departmentService = {
  // Listar departamentos
  getDepartments: async (params) => {
    const response = await api.get('/departments', { params });
    return response.data;
  },
  
  // Obter departamento por ID
  getDepartmentById: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },
  
  // Criar novo departamento
  createDepartment: async (data) => {
    const response = await api.post('/departments', data);
    return response.data;
  },
  
  // Atualizar departamento
  updateDepartment: async (id, data) => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },
  
  // Remover departamento
  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  }
};

// Serviços de cargos
export const positionService = {
  // Listar cargos
  getPositions: async (params) => {
    const response = await api.get('/positions', { params });
    return response.data;
  },
  
  // Obter cargo por ID
  getPositionById: async (id) => {
    const response = await api.get(`/positions/${id}`);
    return response.data;
  },
  
  // Criar novo cargo
  createPosition: async (data) => {
    const response = await api.post('/positions', data);
    return response.data;
  },
  
  // Atualizar cargo
  updatePosition: async (id, data) => {
    const response = await api.put(`/positions/${id}`, data);
    return response.data;
  },
  
  // Remover cargo
  deletePosition: async (id) => {
    const response = await api.delete(`/positions/${id}`);
    return response.data;
  }
};

// Serviços de movimentações
export const movementService = {
  // Listar movimentações
  getMovements: async (params) => {
    const response = await api.get('/movements', { params });
    return response.data;
  },
  
  // Obter movimentação por ID
  getMovementById: async (id) => {
    const response = await api.get(`/movements/${id}`);
    return response.data;
  },
  
  // Criar nova movimentação
  createMovement: async (data) => {
    const response = await api.post('/movements', data);
    return response.data;
  },
  
  // Aprovar movimentação
  approveMovement: async (id) => {
    const response = await api.post(`/movements/${id}/approve`);
    return response.data;
  },
  
  // Rejeitar movimentação
  rejectMovement: async (id, motivoRejeicao) => {
    const response = await api.post(`/movements/${id}/reject`, { motivoRejeicao });
    return response.data;
  }
};

// Serviços de dashboard
export const dashboardService = {
  // Obter estatísticas gerais
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  // Obter distribuição por departamento
  getDepartmentDistribution: async () => {
    const response = await api.get('/dashboard/department-distribution');
    return response.data;
  },
  
  // Obter distribuição por cargo
  getPositionDistribution: async () => {
    const response = await api.get('/dashboard/position-distribution');
    return response.data;
  },
  
  // Obter distribuição por modalidade de trabalho
  getWorkModeDistribution: async () => {
    const response = await api.get('/dashboard/workmode-distribution');
    return response.data;
  },
  
  // Obter distribuição por carga horária
  getWorkloadDistribution: async () => {
    const response = await api.get('/dashboard/workload-distribution');
    return response.data;
  },
  
  // Obter histórico de movimentações
  getMovementHistory: async (meses = 12) => {
    const response = await api.get('/dashboard/movement-history', { params: { meses } });
    return response.data;
  },
  
  // Obter análise salarial
  getSalaryAnalysis: async () => {
    const response = await api.get('/dashboard/salary-analysis');
    return response.data;
  }
};

export default api;
