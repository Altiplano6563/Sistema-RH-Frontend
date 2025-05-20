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
import { positionService } from '../../services/api';
import { toast } from 'react-toastify';

const PositionList = () => {
  const navigate = useNavigate();
  
  // Estados para armazenar dados e controles
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState(null);
  const [deletingPosition, setDeletingPosition] = useState(false);
  
  // Buscar cargos ao carregar a página ou mudar filtros/paginação
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        
        // Preparar parâmetros de busca
        const params = {
          page,
          limit: 10,
          search: searchTerm
        };
        
        // Buscar cargos com filtros
        const response = await positionService.getPositions(params);
        
        setPositions(response.data.cargos);
        setTotalPages(response.data.totalPages);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar cargos:', err);
        setError('Não foi possível carregar a lista de cargos. Tente novamente mais tarde.');
        toast.error('Erro ao carregar cargos');
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [page, searchTerm]);

  // Navegar para página de criação de cargo
  const handleAddPosition = () => {
    navigate('/positions/new');
  };

  // Navegar para página de edição de cargo
  const handleEditPosition = (id) => {
    navigate(`/positions/${id}/edit`);
  };

  // Abrir diálogo de confirmação de exclusão
  const handleDeleteClick = (position) => {
    setPositionToDelete(position);
    setOpenDeleteDialog(true);
  };

  // Fechar diálogo de confirmação de exclusão
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setPositionToDelete(null);
  };

  // Excluir cargo
  const handleDeleteConfirm = async () => {
    if (!positionToDelete) return;
    
    try {
      setDeletingPosition(true);
      await positionService.deletePosition(positionToDelete.id);
      
      // Atualizar lista após exclusão
      setPositions(positions.filter(pos => pos.id !== positionToDelete.id));
      
      toast.success('Cargo excluído com sucesso');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Erro ao excluir cargo:', error);
      toast.error('Erro ao excluir cargo');
    } finally {
      setDeletingPosition(false);
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
        <Typography variant="h4">Cargos</Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddPosition}
        >
          Novo Cargo
        </Button>
      </Box>
      
      {/* Barra de busca */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar cargos..."
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
      
      {/* Lista de cargos */}
      {!loading && positions.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum cargo encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tente ajustar a busca ou adicione um novo cargo.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {positions.map((position) => (
            <Grid item xs={12} sm={6} md={4} key={position.id}>
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
                      {position.nome}
                    </Typography>
                    
                    <Box>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditPosition(position.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(position)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {position.descricao || 'Sem descrição'}
                  </Typography>
                  
                  <Box mt={2}>
                    <Typography variant="body2">
                      <strong>Nível:</strong> {position.nivel || 'Não definido'}
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Faixa Salarial:</strong> {
                        position.salarioMinimo && position.salarioMaximo
                          ? `R$ ${position.salarioMinimo.toLocaleString('pt-BR')} - R$ ${position.salarioMaximo.toLocaleString('pt-BR')}`
                          : 'Não definida'
                      }
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Colaboradores:</strong> {position.totalColaboradores || 0}
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
            Tem certeza que deseja excluir o cargo <strong>{positionToDelete?.nome}</strong>?
            Esta ação não pode ser desfeita.
          </Typography>
          
          {positionToDelete?.totalColaboradores > 0 && (
            <Typography color="error" sx={{ mt: 2 }}>
              Atenção: Este cargo possui {positionToDelete.totalColaboradores} colaboradores vinculados.
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
            disabled={deletingPosition}
          >
            {deletingPosition ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PositionList;
