import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import { movementService } from '../../services/api';
import { toast } from 'react-toastify';

// Componente para exibir lista de movimentações
const MovementList = () => {
  const navigate = useNavigate();
  
  // Estados para armazenar dados e controles
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  
  // Buscar movimentações ao carregar a página
  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        
        // Buscar movimentações
        const response = await movementService.getMovements();
        setMovements(response.data.movimentacoes);
        
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar movimentações:', err);
        setError('Não foi possível carregar a lista de movimentações. Tente novamente mais tarde.');
        toast.error('Erro ao carregar movimentações');
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  // Abrir diálogo de detalhes
  const handleOpenDetail = (movement) => {
    setSelectedMovement(movement);
    setOpenDetailDialog(true);
  };

  // Fechar diálogo de detalhes
  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setSelectedMovement(null);
  };

  // Renderizar indicador de carregamento
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Renderizar mensagem de erro
  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Paper>
    );
  }

  // Renderizar mensagem se não houver movimentações
  if (movements.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Nenhuma movimentação registrada
        </Typography>
      </Paper>
    );
  }

  // Função para obter cor do chip com base no tipo de movimentação
  const getChipColor = (tipo) => {
    switch (tipo) {
      case 'promocao':
        return 'success';
      case 'transferencia':
        return 'primary';
      case 'ajuste_salarial':
        return 'warning';
      case 'mudanca_modalidade':
        return 'info';
      default:
        return 'default';
    }
  };

  // Função para obter texto do tipo de movimentação
  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'promocao':
        return 'Promoção';
      case 'transferencia':
        return 'Transferência';
      case 'ajuste_salarial':
        return 'Ajuste Salarial';
      case 'mudanca_modalidade':
        return 'Mudança de Modalidade';
      default:
        return tipo;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Histórico de Movimentações</Typography>
      
      <Grid container spacing={3}>
        {movements.map((movement) => (
          <Grid item xs={12} sm={6} md={4} key={movement.id}>
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
              onClick={() => handleOpenDetail(movement)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip 
                    label={getTipoText(movement.tipo)} 
                    color={getChipColor(movement.tipo)} 
                    size="small" 
                  />
                  
                  <Typography variant="body2" color="text.secondary">
                    {new Date(movement.dataMovimentacao).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
                
                <Typography variant="h6" noWrap>
                  {movement.colaborador?.nome || 'Colaborador não encontrado'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {movement.descricao || 'Sem descrição'}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Box mt={1}>
                  {movement.tipo === 'promocao' && (
                    <>
                      <Typography variant="body2">
                        <strong>De:</strong> {movement.cargoAnterior?.nome || 'Não informado'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Para:</strong> {movement.cargoNovo?.nome || 'Não informado'}
                      </Typography>
                    </>
                  )}
                  
                  {movement.tipo === 'transferencia' && (
                    <>
                      <Typography variant="body2">
                        <strong>De:</strong> {movement.departamentoAnterior?.nome || 'Não informado'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Para:</strong> {movement.departamentoNovo?.nome || 'Não informado'}
                      </Typography>
                    </>
                  )}
                  
                  {movement.tipo === 'ajuste_salarial' && (
                    <>
                      <Typography variant="body2">
                        <strong>De:</strong> {movement.salarioAnterior ? `R$ ${movement.salarioAnterior.toLocaleString('pt-BR')}` : 'Não informado'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Para:</strong> {movement.salarioNovo ? `R$ ${movement.salarioNovo.toLocaleString('pt-BR')}` : 'Não informado'}
                      </Typography>
                    </>
                  )}
                  
                  {movement.tipo === 'mudanca_modalidade' && (
                    <>
                      <Typography variant="body2">
                        <strong>De:</strong> {
                          {
                            'presencial': 'Presencial',
                            'hibrido': 'Híbrido',
                            'remoto': 'Remoto'
                          }[movement.modalidadeAnterior] || movement.modalidadeAnterior || 'Não informada'
                        }
                      </Typography>
                      <Typography variant="body2">
                        <strong>Para:</strong> {
                          {
                            'presencial': 'Presencial',
                            'hibrido': 'Híbrido',
                            'remoto': 'Remoto'
                          }[movement.modalidadeNova] || movement.modalidadeNova || 'Não informada'
                        }
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Diálogo de detalhes da movimentação */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
      >
        {selectedMovement && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Chip 
                  label={getTipoText(selectedMovement.tipo)} 
                  color={getChipColor(selectedMovement.tipo)} 
                  size="small" 
                  sx={{ mr: 2 }}
                />
                Detalhes da Movimentação
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Colaborador" 
                    secondary={selectedMovement.colaborador?.nome || 'Não informado'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Data" 
                    secondary={new Date(selectedMovement.dataMovimentacao).toLocaleDateString('pt-BR')} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Departamento" 
                    secondary={
                      selectedMovement.tipo === 'transferencia'
                        ? `${selectedMovement.departamentoAnterior?.nome || 'Não informado'} → ${selectedMovement.departamentoNovo?.nome || 'Não informado'}`
                        : selectedMovement.departamento?.nome || 'Não informado'
                    } 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <WorkIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Cargo" 
                    secondary={
                      selectedMovement.tipo === 'promocao'
                        ? `${selectedMovement.cargoAnterior?.nome || 'Não informado'} → ${selectedMovement.cargoNovo?.nome || 'Não informado'}`
                        : selectedMovement.cargo?.nome || 'Não informado'
                    } 
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Detalhes da Alteração
              </Typography>
              
              {selectedMovement.tipo === 'ajuste_salarial' && (
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Salário Anterior:</strong> {selectedMovement.salarioAnterior ? `R$ ${selectedMovement.salarioAnterior.toLocaleString('pt-BR')}` : 'Não informado'}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Novo Salário:</strong> {selectedMovement.salarioNovo ? `R$ ${selectedMovement.salarioNovo.toLocaleString('pt-BR')}` : 'Não informado'}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Variação:</strong> {
                      selectedMovement.salarioAnterior && selectedMovement.salarioNovo
                        ? `${(((selectedMovement.salarioNovo - selectedMovement.salarioAnterior) / selectedMovement.salarioAnterior) * 100).toFixed(2)}%`
                        : 'Não calculável'
                    }
                  </Typography>
                </Box>
              )}
              
              {selectedMovement.tipo === 'mudanca_modalidade' && (
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Modalidade Anterior:</strong> {
                      {
                        'presencial': 'Presencial',
                        'hibrido': 'Híbrido',
                        'remoto': 'Remoto'
                      }[selectedMovement.modalidadeAnterior] || selectedMovement.modalidadeAnterior || 'Não informada'
                    }
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Nova Modalidade:</strong> {
                      {
                        'presencial': 'Presencial',
                        'hibrido': 'Híbrido',
                        'remoto': 'Remoto'
                      }[selectedMovement.modalidadeNova] || selectedMovement.modalidadeNova || 'Não informada'
                    }
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Observações
              </Typography>
              
              <Typography variant="body1" sx={{ pl: 2 }}>
                {selectedMovement.observacoes || 'Nenhuma observação registrada.'}
              </Typography>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDetail} color="primary">
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MovementList;
