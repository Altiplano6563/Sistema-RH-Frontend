import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { 
  Container, Grid, Paper, Typography, Box, 
  CircularProgress, Card, CardContent, Divider,
  Tabs, Tab, Button
} from '@mui/material';
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';

// Cores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const { loadDashboardData, dashboardData, loading, errors } = useData();
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar dados do dashboard ao montar o componente
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Função para atualizar dados do dashboard
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Função para alternar entre abas
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Renderizar estado de carregamento
  if (loading.dashboard && !dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Renderizar mensagem de erro
  if (errors.dashboard && !dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Erro ao carregar dados do dashboard
          </Typography>
          <Typography variant="body2">{errors.dashboard}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2, alignSelf: 'flex-start' }}
            onClick={handleRefresh}
          >
            Tentar novamente
          </Button>
        </Paper>
      </Container>
    );
  }

  // Dados para os gráficos
  const departmentData = dashboardData?.departmentDistribution || [];
  const workModeData = dashboardData?.workModeDistribution || [];
  const workloadData = dashboardData?.workloadDistribution || [];
  const movementHistory = dashboardData?.movementHistory?.data || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Cabeçalho */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? <CircularProgress size={24} /> : 'Atualizar Dados'}
        </Button>
      </Box>

      {/* Cards de resumo */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Colaboradores
              </Typography>
              <Typography variant="h4">
                {dashboardData?.summary?.totalEmployees || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Departamentos
              </Typography>
              <Typography variant="h4">
                {dashboardData?.summary?.departmentsCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cargos
              </Typography>
              <Typography variant="h4">
                {dashboardData?.summary?.positionsCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Movimentações Recentes
              </Typography>
              <Typography variant="h4">
                {dashboardData?.summary?.recentMovements || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Abas para diferentes visualizações */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Distribuição" />
          <Tab label="Movimentações" />
          <Tab label="Análise Salarial" />
        </Tabs>
      </Paper>

      {/* Conteúdo das abas */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Distribuição por Departamento */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Distribuição por Departamento
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="nome"
                    label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} colaboradores`, props.payload.nome]} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Distribuição por Modalidade de Trabalho */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Modalidade de Trabalho
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={workModeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="nome"
                    label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {workModeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} colaboradores`, props.payload.nome]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Distribuição por Carga Horária */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Distribuição por Carga Horária
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={workloadData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} colaboradores`, 'Quantidade']} />
                  <Legend />
                  <Bar dataKey="count" name="Colaboradores" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Histórico de Movimentações */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Histórico de Movimentações
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={movementHistory}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="data.promocao" name="Promoção" stroke="#8884d8" />
                  <Line type="monotone" dataKey="data.transferencia" name="Transferência" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="data.merito" name="Mérito" stroke="#ffc658" />
                  <Line type="monotone" dataKey="data.equiparacao" name="Equiparação" stroke="#ff8042" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Tipos de Movimentações */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tipos de Movimentações
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={movementHistory}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="data.total" name="Total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Análise Salarial */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Média Salarial por Departamento
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={dashboardData?.salaryAnalysis?.byDepartment || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                  <Legend />
                  <Bar dataKey="mediaSalario" name="Média Salarial" fill="#8884d8" />
                  <Bar dataKey="minSalario" name="Mínimo" fill="#82ca9d" />
                  <Bar dataKey="maxSalario" name="Máximo" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;
