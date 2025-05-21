import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Criar contexto de dados
export const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  // Estados para armazenar dados
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [movements, setMovements] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Estados para controle de carregamento e erros
  const [loading, setLoading] = useState({
    employees: false,
    departments: false,
    positions: false,
    movements: false,
    dashboard: false
  });
  const [errors, setErrors] = useState({
    employees: null,
    departments: null,
    positions: null,
    movements: null,
    dashboard: null
  });

  // Função para carregar colaboradores
  const loadEmployees = useCallback(async (filters = {}) => {
    try {
      setLoading(prev => ({ ...prev, employees: true }));
      setErrors(prev => ({ ...prev, employees: null }));
      
      const response = await api.get('/employees', { params: filters });
      setEmployees(response.data.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      setErrors(prev => ({ 
        ...prev, 
        employees: error.response?.data?.message || 'Erro ao carregar colaboradores' 
      }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  }, []);

  // Função para carregar departamentos
  const loadDepartments = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, departments: true }));
      setErrors(prev => ({ ...prev, departments: null }));
      
      const response = await api.get('/departments');
      setDepartments(response.data.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      setErrors(prev => ({ 
        ...prev, 
        departments: error.response?.data?.message || 'Erro ao carregar departamentos' 
      }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, departments: false }));
    }
  }, []);

  // Função para carregar cargos
  const loadPositions = useCallback(async (departmentId = null) => {
    try {
      setLoading(prev => ({ ...prev, positions: true }));
      setErrors(prev => ({ ...prev, positions: null }));
      
      const params = departmentId ? { departamentoId: departmentId } : {};
      const response = await api.get('/positions', { params });
      setPositions(response.data.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
      setErrors(prev => ({ 
        ...prev, 
        positions: error.response?.data?.message || 'Erro ao carregar cargos' 
      }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, positions: false }));
    }
  }, []);

  // Função para carregar movimentações
  const loadMovements = useCallback(async (filters = {}) => {
    try {
      setLoading(prev => ({ ...prev, movements: true }));
      setErrors(prev => ({ ...prev, movements: null }));
      
      const response = await api.get('/movements', { params: filters });
      setMovements(response.data.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
      setErrors(prev => ({ 
        ...prev, 
        movements: error.response?.data?.message || 'Erro ao carregar movimentações' 
      }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, movements: false }));
    }
  }, []);

  // Função para carregar dados do dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      setErrors(prev => ({ ...prev, dashboard: null }));
      
      // Carregar resumo do dashboard
      const summaryResponse = await api.get('/dashboard/summary');
      
      // Carregar distribuições específicas
      const [
        departmentResponse,
        positionResponse,
        workModeResponse,
        workloadResponse,
        movementHistoryResponse
      ] = await Promise.all([
        api.get('/dashboard/department-distribution'),
        api.get('/dashboard/position-distribution'),
        api.get('/dashboard/workmode-distribution'),
        api.get('/dashboard/workload-distribution'),
        api.get('/dashboard/movement-history')
      ]);
      
      // Consolidar dados do dashboard
      const dashboardData = {
        summary: summaryResponse.data.data,
        departmentDistribution: departmentResponse.data.data,
        positionDistribution: positionResponse.data.data,
        workModeDistribution: workModeResponse.data.data,
        workloadDistribution: workloadResponse.data.data,
        movementHistory: movementHistoryResponse.data.data
      };
      
      setDashboardData(dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setErrors(prev => ({ 
        ...prev, 
        dashboard: error.response?.data?.message || 'Erro ao carregar dados do dashboard' 
      }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  }, []);

  // Função para criar colaborador
  const createEmployee = useCallback(async (employeeData) => {
    try {
      const response = await api.post('/employees', employeeData);
      
      // Atualizar lista de colaboradores
      setEmployees(prev => [...prev, response.data.data]);
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar colaborador:', error);
      throw error;
    }
  }, []);

  // Função para atualizar colaborador
  const updateEmployee = useCallback(async (id, employeeData) => {
    try {
      const response = await api.put(`/employees/${id}`, employeeData);
      
      // Atualizar lista de colaboradores
      setEmployees(prev => 
        prev.map(emp => emp.id === id ? response.data.data : emp)
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      throw error;
    }
  }, []);

  // Função para criar departamento
  const createDepartment = useCallback(async (departmentData) => {
    try {
      const response = await api.post('/departments', departmentData);
      
      // Atualizar lista de departamentos
      setDepartments(prev => [...prev, response.data.data]);
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar departamento:', error);
      throw error;
    }
  }, []);

  // Função para criar cargo
  const createPosition = useCallback(async (positionData) => {
    try {
      const response = await api.post('/positions', positionData);
      
      // Atualizar lista de cargos
      setPositions(prev => [...prev, response.data.data]);
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      throw error;
    }
  }, []);

  // Função para criar movimentação
  const createMovement = useCallback(async (movementData) => {
    try {
      const response = await api.post('/movements', movementData);
      
      // Atualizar lista de movimentações
      setMovements(prev => [...prev, response.data.data]);
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      throw error;
    }
  }, []);

  // Função para aprovar movimentação
  const approveMovement = useCallback(async (id) => {
    try {
      const response = await api.post(`/movements/${id}/approve`);
      
      // Atualizar lista de movimentações
      setMovements(prev => 
        prev.map(mov => mov.id === id ? response.data.data : mov)
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao aprovar movimentação:', error);
      throw error;
    }
  }, []);

  // Função para rejeitar movimentação
  const rejectMovement = useCallback(async (id, motivoRejeicao) => {
    try {
      const response = await api.post(`/movements/${id}/reject`, { motivoRejeicao });
      
      // Atualizar lista de movimentações
      setMovements(prev => 
        prev.map(mov => mov.id === id ? response.data.data : mov)
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao rejeitar movimentação:', error);
      throw error;
    }
  }, []);

  // Função para exportar relatório de colaboradores
  const exportEmployeeReport = useCallback(async (filters = {}, format = 'csv') => {
    try {
      const response = await api.get('/reports/employees', { 
        params: { ...filters, format },
        responseType: 'blob'
      });
      
      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Definir nome do arquivo
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'colaboradores.csv';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      throw error;
    }
  }, []);

  // Contexto de dados
  const dataContext = {
    // Dados
    employees,
    departments,
    positions,
    movements,
    dashboardData,
    
    // Estado de carregamento
    loading,
    errors,
    
    // Funções para carregar dados
    loadEmployees,
    loadDepartments,
    loadPositions,
    loadMovements,
    loadDashboardData,
    
    // Funções para manipular dados
    createEmployee,
    updateEmployee,
    createDepartment,
    createPosition,
    createMovement,
    approveMovement,
    rejectMovement,
    
    // Funções para exportação
    exportEmployeeReport
  };

  return (
    <DataContext.Provider value={dataContext}>
      {children}
    </DataContext.Provider>
  );
};

// Hook personalizado para usar o contexto de dados
export const useData = () => {
  const context = React.useContext(DataContext);
  
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  
  return context;
};
