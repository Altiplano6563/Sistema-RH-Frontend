import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField,
  MenuItem,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { employeeService, departmentService, positionService } from '../../services/api';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Esquema de validação com Yup
const validationSchema = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: yup
    .string()
    .email('E-mail inválido')
    .required('E-mail é obrigatório'),
  telefone: yup
    .string()
    .nullable(),
  departamentoId: yup
    .number()
    .nullable()
    .required('Departamento é obrigatório'),
  cargoId: yup
    .number()
    .nullable()
    .required('Cargo é obrigatório'),
  dataAdmissao: yup
    .date()
    .nullable()
    .required('Data de admissão é obrigatória'),
  modalidadeTrabalho: yup
    .string()
    .required('Modalidade de trabalho é obrigatória'),
  cargaHoraria: yup
    .number()
    .nullable()
    .required('Carga horária é obrigatória'),
  salario: yup
    .number()
    .nullable()
    .required('Salário é obrigatório')
    .min(0, 'Salário deve ser maior ou igual a zero'),
});

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Estados para armazenar dados e controles
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [error, setError] = useState(null);
  
  // Formulário com Formik
  const formik = useFormik({
    initialValues: {
      nome: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      genero: 'nao_informado',
      departamentoId: '',
      cargoId: '',
      dataAdmissao: '',
      modalidadeTrabalho: 'presencial',
      cargaHoraria: 220,
      salario: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });
  
  // Buscar dados iniciais (departamentos, cargos e colaborador se for edição)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        
        // Buscar departamentos
        const departmentsResponse = await departmentService.getDepartments();
        setDepartments(departmentsResponse.data.departamentos);
        
        // Buscar cargos
        const positionsResponse = await positionService.getPositions();
        setPositions(positionsResponse.data.cargos);
        
        // Se for modo de edição, buscar dados do colaborador
        if (isEditMode) {
          const employeeResponse = await employeeService.getEmployeeById(id);
          const employee = employeeResponse.data.colaborador;
          
          // Formatar datas para o formato esperado pelo input date
          const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };
          
          // Preencher formulário com dados do colaborador
          formik.setValues({
            nome: employee.nome || '',
            email: employee.email || '',
            telefone: employee.telefone || '',
            dataNascimento: formatDate(employee.dataNascimento),
            genero: employee.genero || 'nao_informado',
            departamentoId: employee.departamentoId || '',
            cargoId: employee.cargoId || '',
            dataAdmissao: formatDate(employee.dataAdmissao),
            modalidadeTrabalho: employee.modalidadeTrabalho || 'presencial',
            cargaHoraria: employee.cargaHoraria || 220,
            salario: employee.salario || '',
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados iniciais:', err);
        setError('Não foi possível carregar os dados necessários. Tente novamente mais tarde.');
        toast.error('Erro ao carregar dados');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditMode]);

  // Enviar formulário
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      if (isEditMode) {
        // Atualizar colaborador existente
        await employeeService.updateEmployee(id, values);
        toast.success('Colaborador atualizado com sucesso');
      } else {
        // Criar novo colaborador
        await employeeService.createEmployee(values);
        toast.success('Colaborador criado com sucesso');
      }
      
      // Voltar para a lista de colaboradores
      navigate('/employees');
    } catch (err) {
      console.error('Erro ao salvar colaborador:', err);
      toast.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} colaborador`);
    } finally {
      setLoading(false);
    }
  };

  // Voltar para a página anterior
  const handleBack = () => {
    navigate(isEditMode ? `/employees/${id}` : '/employees');
  };

  // Renderizar indicador de carregamento inicial
  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Voltar
        </Button>
        
        <Typography variant="h4">
          {isEditMode ? 'Editar Colaborador' : 'Novo Colaborador'}
        </Typography>
        
        <Box width={100} /> {/* Espaço para manter o título centralizado */}
      </Box>
      
      {/* Mensagem de erro */}
      {error && (
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      
      {/* Formulário */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <form onSubmit={formik.handleSubmit}>
          <Typography variant="h6" gutterBottom>Informações Pessoais</Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="nome"
                name="nome"
                label="Nome Completo"
                value={formik.values.nome}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nome && Boolean(formik.errors.nome)}
                helperText={formik.touched.nome && formik.errors.nome}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="E-mail"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="telefone"
                name="telefone"
                label="Telefone"
                value={formik.values.telefone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.telefone && Boolean(formik.errors.telefone)}
                helperText={formik.touched.telefone && formik.errors.telefone}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="dataNascimento"
                name="dataNascimento"
                label="Data de Nascimento"
                type="date"
                value={formik.values.dataNascimento}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.dataNascimento && Boolean(formik.errors.dataNascimento)}
                helperText={formik.touched.dataNascimento && formik.errors.dataNascimento}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="genero-label">Gênero</InputLabel>
                <Select
                  labelId="genero-label"
                  id="genero"
                  name="genero"
                  value={formik.values.genero}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Gênero"
                >
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="feminino">Feminino</MenuItem>
                  <MenuItem value="outro">Outro</MenuItem>
                  <MenuItem value="nao_informado">Prefiro não informar</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>Informações Profissionais</Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                error={formik.touched.departamentoId && Boolean(formik.errors.departamentoId)}
              >
                <InputLabel id="departamento-label">Departamento</InputLabel>
                <Select
                  labelId="departamento-label"
                  id="departamentoId"
                  name="departamentoId"
                  value={formik.values.departamentoId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Departamento"
                  required
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.nome}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.departamentoId && formik.errors.departamentoId && (
                  <FormHelperText>{formik.errors.departamentoId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                error={formik.touched.cargoId && Boolean(formik.errors.cargoId)}
              >
                <InputLabel id="cargo-label">Cargo</InputLabel>
                <Select
                  labelId="cargo-label"
                  id="cargoId"
                  name="cargoId"
                  value={formik.values.cargoId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Cargo"
                  required
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos.id} value={pos.id}>
                      {pos.nome}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.cargoId && formik.errors.cargoId && (
                  <FormHelperText>{formik.errors.cargoId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="dataAdmissao"
                name="dataAdmissao"
                label="Data de Admissão"
                type="date"
                value={formik.values.dataAdmissao}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.dataAdmissao && Boolean(formik.errors.dataAdmissao)}
                helperText={formik.touched.dataAdmissao && formik.errors.dataAdmissao}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="modalidade-label">Modalidade de Trabalho</InputLabel>
                <Select
                  labelId="modalidade-label"
                  id="modalidadeTrabalho"
                  name="modalidadeTrabalho"
                  value={formik.values.modalidadeTrabalho}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Modalidade de Trabalho"
                  required
                >
                  <MenuItem value="presencial">Presencial</MenuItem>
                  <MenuItem value="hibrido">Híbrido</MenuItem>
                  <MenuItem value="remoto">Remoto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="cargaHoraria"
                name="cargaHoraria"
                label="Carga Horária (horas/mês)"
                type="number"
                value={formik.values.cargaHoraria}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cargaHoraria && Boolean(formik.errors.cargaHoraria)}
                helperText={formik.touched.cargaHoraria && formik.errors.cargaHoraria}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="salario"
                name="salario"
                label="Salário (R$)"
                type="number"
                value={formik.values.salario}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.salario && Boolean(formik.errors.salario)}
                helperText={formik.touched.salario && formik.errors.salario}
                required
                InputProps={{ inputProps: { min: 0, step: "0.01" } }}
              />
            </Grid>
          </Grid>
          
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EmployeeForm;
