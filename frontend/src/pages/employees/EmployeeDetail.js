import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Grid, Paper, Typography, Box, 
  CircularProgress, Button, TextField, MenuItem,
  Divider, Tabs, Tab, Card, CardContent
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, 
  TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente para detalhes do colaborador
const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    loadEmployees, loadDepartments, loadPositions, loadMovements,
    employees, departments, positions, movements,
    loading, errors, updateEmployee, createMovement
  } = useData();
  
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [movementForm, setMovementForm] = useState({
    tipo: '',
    dataEfetivacao: format(new Date(), 'yyyy-MM-dd'),
    motivo: '',
    observacoes: '',
    valorNovo: {}
  });

  // Carregar dados necessários
  useEffect(() => {
    const fetchData = async () => {
      // Carregar departamentos e cargos para os selects
      await loadDepartments();
      await loadPositions();
      
      // Carregar colaborador específico se não estiver na lista
      if (employees.length === 0 || !employees.find(emp => emp.id === id)) {
        await loadEmployees();
      }
      
      // Carregar movimentações do colaborador
      await loadMovements({ colaboradorId: id });
    };
    
    fetchData();
  }, [id, loadDepartments, loadPositions, loadEmployees, loadMovements, employees]);

  // Atualizar colaborador quando a lista mudar
  useEffect(() => {
    const currentEmployee = employees.find(emp => emp.id === id);
    if (currentEmployee) {
      setEmployee(currentEmployee);
      setFormData(currentEmployee);
    }
  }, [id, employees]);

  // Função para alternar entre abas
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Função para alternar modo de edição
  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setFormData(employee);
    }
  };

  // Função para atualizar dados do formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função para salvar alterações
  const handleSave = async () => {
    try {
      await updateEmployee(id, formData);
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      // Tratar erro
    }
  };

  // Função para atualizar dados do formulário de movimentação
  const handleMovementFormChange = (e) => {
    const { name, value } = e.target;
    setMovementForm(prev => ({ ...prev, [name]: value }));
  };

  // Função para atualizar valores específicos da movimentação
  const handleMovementValueChange = (e) => {
    const { name, value } = e.target;
    setMovementForm(prev => ({
      ...prev,
      valorNovo: { ...prev.valorNovo, [name]: value }
    }));
  };

  // Função para criar movimentação
  const handleCreateMovement = async () => {
    try {
      // Preparar dados da movimentação
      const movementData = {
        ...movementForm,
        colaboradorId: id,
        valorAnterior: {}
      };
      
      // Definir valores anteriores com base no tipo de movimentação
      switch (movementForm.tipo) {
        case 'promocao':
          movementData.valorAnterior = {
            cargoId: employee.cargoId,
            salario: employee.salario
          };
          break;
        case 'transferencia':
          movementData.valorAnterior = {
            departamentoId: employee.departamentoId
          };
          break;
        case 'merito':
        case 'equiparacao':
          movementData.valorAnterior = {
            salario: employee.salario
          };
          break;
        case 'modalidade':
          movementData.valorAnterior = {
            modalidadeTrabalho: employee.modalidadeTrabalho
          };
          break;
        case 'cargaHoraria':
          movementData.valorAnterior = {
            cargaHoraria: employee.cargaHoraria
          };
          break;
        default:
          break;
      }
      
      await createMovement(movementData);
      
      // Limpar formulário
      setMovementForm({
        tipo: '',
        dataEfetivacao: format(new Date(), 'yyyy-MM-dd'),
        motivo: '',
        observacoes: '',
        valorNovo: {}
      });
      
      // Recarregar movimentações
      await loadMovements({ colaboradorId: id });
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      // Tratar erro
    }
  };

  // Renderizar estado de carregamento
  if (loading.employees && !employee) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Renderizar mensagem de erro
  if (errors.employees && !employee) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Erro ao carregar dados do colaborador
          </Typography>
          <Typography variant="body2">{errors.employees}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2, alignSelf: 'flex-start' }}
            onClick={() => navigate('/employees')}
          >
            Voltar para lista
          </Button>
        </Paper>
      </Container>
    );
  }

  // Renderizar mensagem se colaborador não for encontrado
  if (!employee) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Colaborador não encontrado
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2, alignSelf: 'flex-start' }}
            onClick={() => navigate('/employees')}
          >
            Voltar para lista
          </Button>
        </Paper>
      </Container>
    );
  }

  // Encontrar departamento e cargo do colaborador
  const department = departments.find(dept => dept.id === employee.departamentoId);
  const position = positions.find(pos => pos.id === employee.cargoId);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Cabeçalho */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {employee.nome}
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            sx={{ mr: 2 }}
            onClick={() => navigate('/employees')}
          >
            Voltar
          </Button>
          <Button 
            variant="contained" 
            color={editMode ? "secondary" : "primary"}
            onClick={handleEditToggle}
          >
            {editMode ? "Cancelar" : "Editar"}
          </Button>
          {editMode && (
            <Button 
              variant="contained" 
              color="success" 
              sx={{ ml: 2 }}
              onClick={handleSave}
            >
              Salvar
            </Button>
          )}
        </Box>
      </Box>

      {/* Abas para diferentes visualizações */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Dados Pessoais" />
          <Tab label="Dados Profissionais" />
          <Tab label="Movimentações" />
        </Tabs>
      </Paper>

      {/* Conteúdo das abas */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dados Pessoais
          </Typography>
          <Grid container spacing={3}>
            {editMode ? (
              // Formulário de edição
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="nome"
                    value={formData.nome || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="CPF"
                    name="cpf"
                    value={formData.cpf || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data de Nascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Gênero"
                    name="genero"
                    value={formData.genero || 'nao_informado'}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value="masculino">Masculino</MenuItem>
                    <MenuItem value="feminino">Feminino</MenuItem>
                    <MenuItem value="outro">Outro</MenuItem>
                    <MenuItem value="nao_informado">Não Informado</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="telefone"
                    value={formData.telefone || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
              </>
            ) : (
              // Visualização de dados
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Nome</Typography>
                  <Typography variant="body1">{employee.nome}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Email</Typography>
                  <Typography variant="body1">{employee.email}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">CPF</Typography>
                  <Typography variant="body1">{employee.cpf}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Data de Nascimento</Typography>
                  <Typography variant="body1">
                    {employee.dataNascimento ? format(new Date(employee.dataNascimento), 'dd/MM/yyyy') : 'Não informado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Gênero</Typography>
                  <Typography variant="body1">
                    {employee.genero === 'masculino' ? 'Masculino' : 
                     employee.genero === 'feminino' ? 'Feminino' : 
                     employee.genero === 'outro' ? 'Outro' : 'Não informado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Telefone</Typography>
                  <Typography variant="body1">{employee.telefone || 'Não informado'}</Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dados Profissionais
          </Typography>
          <Grid container spacing={3}>
            {editMode ? (
              // Formulário de edição
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Departamento"
                    name="departamentoId"
                    value={formData.departamentoId || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Cargo"
                    name="cargoId"
                    value={formData.cargoId || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                  >
                    {positions.map(pos => (
                      <MenuItem key={pos.id} value={pos.id}>
                        {pos.nome} - {pos.nivel}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Salário"
                    name="salario"
                    type="number"
                    value={formData.salario || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                    InputProps={{
                      startAdornment: <Box component="span" mr={1}>R$</Box>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data de Admissão"
                    name="dataAdmissao"
                    type="date"
                    value={formData.dataAdmissao || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Modalidade de Trabalho"
                    name="modalidadeTrabalho"
                    value={formData.modalidadeTrabalho || 'presencial'}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value="presencial">Presencial</MenuItem>
                    <MenuItem value="hibrido">Híbrido</MenuItem>
                    <MenuItem value="remoto">Remoto</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Carga Horária"
                    name="cargaHoraria"
                    value={formData.cargaHoraria || 220}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value={150}>150h</MenuItem>
                    <MenuItem value={180}>180h</MenuItem>
                    <MenuItem value={200}>200h</MenuItem>
                    <MenuItem value={220}>220h</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={formData.status || 'ativo'}
                    onChange={handleFormChange}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value="ativo">Ativo</MenuItem>
                    <MenuItem value="inativo">Inativo</MenuItem>
                    <MenuItem value="afastado">Afastado</MenuItem>
                    <MenuItem value="ferias">Férias</MenuItem>
                  </TextField>
                </Grid>
              </>
            ) : (
              // Visualização de dados
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Departamento</Typography>
                  <Typography variant="body1">{department?.nome || 'Não informado'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Cargo</Typography>
                  <Typography variant="body1">
                    {position ? `${position.nome} - ${position.nivel}` : 'Não informado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Salário</Typography>
                  <Typography variant="body1">
                    {employee.salario ? `R$ ${parseFloat(employee.salario).toFixed(2)}` : 'Não informado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Data de Admissão</Typography>
                  <Typography variant="body1">
                    {employee.dataAdmissao ? format(new Date(employee.dataAdmissao), 'dd/MM/yyyy') : 'Não informado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Modalidade de Trabalho</Typography>
                  <Typography variant="body1">
                    {employee.modalidadeTrabalho === 'presencial' ? 'Presencial' : 
                     employee.modalidadeTrabalho === 'hibrido' ? 'Híbrido' : 
                     employee.modalidadeTrabalho === 'remoto' ? 'Remoto' : 'Não informado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Carga Horária</Typography>
                  <Typography variant="body1">{employee.cargaHoraria}h</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Status</Typography>
                  <Typography variant="body1">
                    {employee.status === 'ativo' ? 'Ativo' : 
                     employee.status === 'inativo' ? 'Inativo' : 
                     employee.status === 'afastado' ? 'Afastado' : 
                     employee.status === 'ferias' ? 'Férias' : 'Não informado'}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      )}

      {activeTab === 2 && (
        <>
          {/* Formulário para nova movimentação */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Nova Movimentação
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de Movimentação"
                  name="tipo"
                  value={movementForm.tipo}
                  onChange={handleMovementFormChange}
                  variant="outlined"
                  margin="normal"
                >
                  <MenuItem value="promocao">Promoção</MenuItem>
                  <MenuItem value="transferencia">Transferência</MenuItem>
                  <MenuItem value="merito">Mérito</MenuItem>
                  <MenuItem value="equiparacao">Equiparação Salarial</MenuItem>
                  <MenuItem value="modalidade">Mudança de Modalidade</MenuItem>
                  <MenuItem value="cargaHoraria">Mudança de Carga Horária</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Efetivação"
                  name="dataEfetivacao"
                  type="date"
                  value={movementForm.dataEfetivacao}
                  onChange={handleMovementFormChange}
                  variant="outlined"
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              {/* Campos específicos por tipo de movimentação */}
              {movementForm.tipo === 'promocao' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Novo Cargo"
                      name="cargoId"
                      value={movementForm.valorNovo.cargoId || ''}
                      onChange={handleMovementValueChange}
                      variant="outlined"
                      margin="normal"
                    >
                      {positions.map(pos => (
                        <MenuItem key={pos.id} value={pos.id}>
                          {pos.nome} - {pos.nivel}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Novo Salário"
                      name="salario"
                      type="number"
                      value={movementForm.valorNovo.salario || ''}
                      onChange={handleMovementValueChange}
                      variant="outlined"
                      margin="normal"
                      InputProps={{
                        startAdornment: <Box component="span" mr={1}>R$</Box>
                      }}
                    />
                  </Grid>
                </>
              )}
              
              {movementForm.tipo === 'transferencia' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Novo Departamento"
                    name="departamentoId"
                    value={movementForm.valorNovo.departamentoId || ''}
                    onChange={handleMovementValueChange}
                    variant="outlined"
                    margin="normal"
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              
              {(movementForm.tipo === 'merito' || movementForm.tipo === 'equiparacao') && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Novo Salário"
                    name="salario"
                    type="number"
                    value={movementForm.valorNovo.salario || ''}
                    onChange={handleMovementValueChange}
                    variant="outlined"
                    margin="normal"
                    InputProps={{
                      startAdornment: <Box component="span" mr={1}>R$</Box>
                    }}
                  />
                </Grid>
              )}
              
              {movementForm.tipo === 'modalidade' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Nova Modalidade"
                    name="modalidadeTrabalho"
                    value={movementForm.valorNovo.modalidadeTrabalho || ''}
                    onChange={handleMovementValueChange}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value="presencial">Presencial</MenuItem>
                    <MenuItem value="hibrido">Híbrido</MenuItem>
                    <MenuItem value="remoto">Remoto</MenuItem>
                  </TextField>
                </Grid>
              )}
              
              {movementForm.tipo === 'cargaHoraria' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Nova Carga Horária"
                    name="cargaHoraria"
                    value={movementForm.valorNovo.cargaHoraria || ''}
                    onChange={handleMovementValueChange}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value={150}>150h</MenuItem>
                    <MenuItem value={180}>180h</MenuItem>
                    <MenuItem value={200}>200h</MenuItem>
                    <MenuItem value={220}>220h</MenuItem>
                  </TextField>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Motivo"
                  name="motivo"
                  value={movementForm.motivo}
                  onChange={handleMovementFormChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  name="observacoes"
                  value={movementForm.observacoes}
                  onChange={handleMovementFormChange}
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleCreateMovement}
                  disabled={!movementForm.tipo || !movementForm.motivo}
                >
                  Criar Movimentação
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Timeline de movimentações */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Histórico de Movimentações
            </Typography>
            
            {loading.movements ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : movements.length > 0 ? (
              <Timeline position="alternate">
                {movements.map((movement) => (
                  <TimelineItem key={movement.id}>
                    <TimelineOppositeContent color="text.secondary">
                      {format(new Date(movement.dataEfetivacao), 'dd/MM/yyyy', { locale: ptBR })}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={
                        movement.status === 'aprovado' ? 'success' :
                        movement.status === 'rejeitado' ? 'error' : 'primary'
                      } />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">
                            {movement.tipo === 'promocao' ? 'Promoção' :
                             movement.tipo === 'transferencia' ? 'Transferência' :
                             movement.tipo === 'merito' ? 'Mérito' :
                             movement.tipo === 'equiparacao' ? 'Equiparação Salarial' :
                             movement.tipo === 'modalidade' ? 'Mudança de Modalidade' :
                             movement.tipo === 'cargaHoraria' ? 'Mudança de Carga Horária' : 
                             movement.tipo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {movement.motivo}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2">
                            Status: {
                              movement.status === 'aprovado' ? 'Aprovado' :
                              movement.status === 'rejeitado' ? 'Rejeitado' : 'Pendente'
                            }
                          </Typography>
                          {movement.observacoes && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Observações: {movement.observacoes}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 3 }}>
                Nenhuma movimentação encontrada para este colaborador.
              </Typography>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
};

export default EmployeeDetail;
