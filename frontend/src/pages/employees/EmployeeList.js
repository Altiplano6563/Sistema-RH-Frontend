import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField, 
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { employeeService } from '../../services/api';
import { toast } from 'react-toastify';

const EmployeeList = () => {
  const navigate = useNavigate();
  
  // Estados para armazenar dados e controles
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openFilters, setOpenFilters] = useState(false);
  const [filters, setFilters] = useState({
    departamento: '',
    cargo: '',
    modalidadeTrabalho: ''
  });
  
  // Buscar colaboradores ao carregar a página ou mudar filtros/paginação
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        
        // Preparar parâmetros de busca
        const params = {
          page,
          limit: 10,
          search: searchTerm,
          ...filters
        };
        
        // Buscar colaboradores com filtros
        const response = await employeeService.getEmployees(params);
        
        setEmployees(response.data.colaboradores);
        setTotalPages(response.data.totalPages);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar colaboradores:', err);
        setError('Não foi possível carregar a lista de colaboradores. Tente novamente mais tarde.');
        toast.error('Erro ao carregar colaboradores');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [page, searchTerm, filters]);

  // Navegar para página de detalhes do colaborador
  const handleViewEmployee = (id) => {
    navigate(`/employees/${id}`);
  };

  // Navegar para página de criação de colaborador
  const handleAddEmployee = () => {
    navigate('/employees/new');
  };

  // Atualizar termo de busca
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Voltar para primeira página ao buscar
  };

  // Atualizar página atual
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Abrir/fechar diálogo de filtros
  const toggleFilters = () => {
    setOpenFilters(!openFilters);
  };

  // Atualizar filtros
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Aplicar filtros
  const applyFilters = () => {
    setPage(1); // Voltar para primeira página ao filtrar
    setOpenFilters(false);
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      departamento: '',
      cargo: '',
      modalidadeTrabalho: ''
    });
    setPage(1);
    setOpenFilters(false);
  };

  // Exportar dados para CSV
  const handleExport = async () => {
    try {
      // Implementar exportação de dados
      toast.info('Exportando dados...');
      
      // Aqui seria implementada a lógica de exportação
      // Simulando um delay para demonstração
      setTimeout(() => {
        toast.success('Dados exportados com sucesso!');
      }, 1500);
    } catch (error) {
      toast.error('Erro ao exportar dados');
    }
  };

  // Renderizar indicador de carregamento
  if (loading && page === 1) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Colaboradores</Typography>
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddEmployee}
            sx={{ mr: 1 }}
          >
            Novo Colaborador
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            Exportar
          </Button>
        </Box>
      </Box>
      
      {/* Barra de busca e filtros */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar colaboradores..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={toggleFilters}
              sx={{ ml: 1 }}
            >
              Filtros
              {Object.values(filters).some(v => v !== '') && (
                <Chip 
                  size="small" 
                  label={Object.values(filters).filter(v => v !== '').length} 
                  color="primary" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Mensagem de erro */}
      {error && (
        <Box mb={3}>
          <Typography color="error" variant="body1">{error}</Typography>
        </Box>
      )}
      
      {/* Lista de colaboradores */}
      {!loading && employees.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum colaborador encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tente ajustar os filtros ou adicione um novo colaborador.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {employees.map((employee) => (
            <Grid item xs={12} sm={6} md={4} key={employee.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleViewEmployee(employee.id)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mr: 2,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}
                    >
                      {employee.nome.charAt(0).toUpperCase()}
                    </Box>
                    <Box>
                      <Typography variant="h6" noWrap>{employee.nome}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {employee.cargo?.nome || 'Sem cargo'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Departamento:</strong> {employee.departamento?.nome || 'Não atribuído'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>E-mail:</strong> {employee.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Modalidade:</strong> {
                        {
                          'presencial': 'Presencial',
                          'hibrido': 'Híbrido',
                          'remoto': 'Remoto'
                        }[employee.modalidadeTrabalho] || employee.modalidadeTrabalho
                      }
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Paginação */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
      
      {/* Diálogo de filtros */}
      <Dialog open={openFilters} onClose={toggleFilters} maxWidth="sm" fullWidth>
        <DialogTitle>Filtros</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Departamento"
                name="departamento"
                value={filters.departamento}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cargo"
                name="cargo"
                value={filters.cargo}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Modalidade de Trabalho"
                name="modalidadeTrabalho"
                value={filters.modalidadeTrabalho}
                onChange={handleFilterChange}
                select
                SelectProps={{ native: true }}
                variant="outlined"
                size="small"
              >
                <option value="">Todas</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
                <option value="remoto">Remoto</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearFilters} color="inherit">
            Limpar
          </Button>
          <Button onClick={applyFilters} variant="contained" color="primary">
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;
