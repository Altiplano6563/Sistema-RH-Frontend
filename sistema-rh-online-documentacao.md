# Documentação do Sistema de RH Online

## Visão Geral

O Sistema de RH Online é uma plataforma completa para gestão de equipes, desenvolvida para atender às necessidades de empresas que precisam gerenciar colaboradores, departamentos, cargos e movimentações de forma integrada e dinâmica.

## Arquitetura

O sistema foi desenvolvido com uma arquitetura moderna e escalável:

### Backend
- **Tecnologia**: Node.js com Express
- **Banco de Dados**: PostgreSQL (produção) / SQLite (desenvolvimento)
- **Autenticação**: JWT com refresh tokens
- **Multitenancy**: Isolamento completo de dados entre empresas

### Frontend
- **Tecnologia**: React.js
- **Estilização**: CSS modular
- **Componentes**: Dashboard interativo, formulários dinâmicos, visualizações gráficas

## Funcionalidades Principais

### Gestão de Colaboradores
- Cadastro completo com informações pessoais e profissionais
- Histórico de movimentações (promoções, transferências, etc.)
- Visualização de dados por departamento, cargo, modalidade de trabalho

### Dashboard Dinâmico
- Métricas de headcount por departamento e cargo
- Distribuição por modalidade de trabalho (presencial, híbrido, remoto)
- Distribuição por carga horária (150h, 180h, 200h, 220h)
- Análise salarial por departamento e cargo

### Movimentações
- Registro de promoções, transferências, mérito e equiparação salarial
- Fluxo de aprovação com histórico
- Relatórios de movimentações por período

### Segurança e Conformidade
- Autenticação segura com JWT
- Multitenancy para isolamento de dados
- Conformidade com LGPD

## Instruções de Instalação

### Requisitos
- Node.js 16.x ou superior
- PostgreSQL 12.x ou superior
- NPM ou Yarn

### Backend

1. Navegue até o diretório do backend:
```
cd sistema-rh-online/backend
```

2. Instale as dependências:
```
npm install
```

3. Configure as variáveis de ambiente (crie um arquivo .env):
```
NODE_ENV=production
PORT=3001
DB_HOST=seu-host-postgresql
DB_PORT=5432
DB_NAME=sistema_rh
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_SSL=true
JWT_SECRET=sua-chave-secreta
JWT_REFRESH_SECRET=sua-chave-refresh-secreta
CORS_ORIGIN=https://seu-frontend-url.com
```

4. Inicie o servidor:
```
npm start
```

### Frontend

1. Navegue até o diretório do frontend:
```
cd sistema-rh-online/frontend
```

2. Instale as dependências:
```
npm install
```

3. Configure a URL da API (edite o arquivo src/services/api.js):
```javascript
const API_URL = 'https://seu-backend-url.com';
```

4. Construa a aplicação para produção:
```
npm run build
```

5. Sirva os arquivos estáticos com um servidor web (exemplo com serve):
```
npx serve -s build
```

## Estrutura do Banco de Dados

O sistema utiliza os seguintes modelos principais:

- **Tenant**: Representa uma empresa/organização no sistema multitenancy
- **User**: Usuários do sistema com diferentes níveis de acesso
- **Employee**: Colaboradores com informações pessoais e profissionais
- **Department**: Departamentos da empresa
- **Position**: Cargos disponíveis na empresa
- **Movement**: Movimentações de colaboradores (promoções, transferências, etc.)

## Manutenção e Suporte

### Backup do Banco de Dados

Para realizar backup do PostgreSQL:
```
pg_dump -U seu-usuario -h seu-host -d sistema_rh > backup.sql
```

### Restauração do Banco de Dados

Para restaurar o backup:
```
psql -U seu-usuario -h seu-host -d sistema_rh < backup.sql
```

## Considerações de Segurança

- Mantenha as chaves JWT secretas e seguras
- Utilize HTTPS para todas as comunicações
- Implemente políticas de senha fortes
- Realize backups regulares do banco de dados
- Mantenha o sistema atualizado com as últimas correções de segurança

## Próximos Passos e Evolução

O sistema pode ser expandido com:

1. Módulo de recrutamento e seleção
2. Integração com folha de pagamento
3. Avaliações de desempenho
4. Gestão de benefícios
5. Controle de ponto e banco de horas
6. Aplicativo móvel para acesso em qualquer lugar
