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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { departmentService } from '../../services/api';
import { toast } from 'react-toastify';

const DepartmentList = () => {
  const navigate = useNavigate();
  
  // Estados para armazenar dados e controles
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [deletingDepartment, setDeletingDepartment] = useState(false);
  
  // Buscar departamentos ao carregar a página ou mudar filtros/paginação
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        
        // Preparar parâmetros de busca
        const params = {
          page,
          limit: 10,
          search: searchTerm
        };
        
        // Buscar departamentos com filtros
        const response = await departmentService.getDepartments(params);
        
        setDepartments(response.data.departamentos);
        setTotalPages(response.data.totalPages);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar departamentos:', err);
        setError('Não foi possível carregar a lista de departamentos. Tente novamente mais tarde.');
        toast.error('Erro ao carregar departamentos');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [page, searchTerm]);

  // Navegar para página de criação de departamento
  const handleAddDepartment = () => {
    navigate('/departments/new');
  };

  // Navegar para página de edição de departamento
  const handleEditDepartment = (id) => {
    navigate(`/departments/${id}/edit`);
  };

  // Abrir diálogo de confirmação de exclusão
  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setOpenDeleteDialog(true);
  };

  // Fechar diálogo de confirmação de exclusão
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDepartmentToDelete(null);
  };

  // Excluir departamento
  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;
    
    try {
      setDeletingDepartment(true);
      await departmentService.deleteDepartment(departmentToDelete.id);
      
      // Atualizar lista após exclusão
      setDepartments(departments.filter(dept => dept.id !== departmentToDelete.id));
      
      toast.success('Departamento excluído com sucesso');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Erro ao excluir departamento:', error);
      toast.error('Erro ao excluir departamento');
    } finally {
      setDeletingDepartment(false);
    }
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
        <Typography variant="h4">Departamentos</Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDepartment}
        >
          Novo Departamento
        </Button>
      </Box>
      
      {/* Barra de busca */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar departamentos..."
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
      </Paper>
      
      {/* Mensagem de erro */}
      {error && (
        <Box mb={3}>
          <Typography color="error" variant="body1">{error}</Typography>
        </Box>
      )}
      
      {/* Lista de departamentos */}
      {!loading && departments.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum departamento encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tente ajustar a busca ou adicione um novo departamento.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {departments.map((department) => (
            <Grid item xs={12} sm={6} md={4} key={department.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" gutterBottom>
                      {department.nome}
                    </Typography>
                    
                    <Box>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditDepartment(department.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(department)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {department.descricao || 'Sem descrição'}
                  </Typography>
                  
                  <Box mt={2}>
                    <Typography variant="body2">
                      <strong>Gerente:</strong> {department.gerente?.nome || 'Não atribuído'}
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Colaboradores:</strong> {department.totalColaboradores || 0}
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
      
      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o departamento <strong>{departmentToDelete?.nome}</strong>?
            Esta ação não pode ser desfeita.
          </Typography>
          
          {departmentToDelete?.totalColaboradores > 0 && (
            <Typography color="error" sx={{ mt: 2 }}>
              Atenção: Este departamento possui {departmentToDelete.totalColaboradores} colaboradores vinculados.
              A exclusão pode afetar esses registros.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deletingDepartment}
          >
            {deletingDepartment ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentList;
