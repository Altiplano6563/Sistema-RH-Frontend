# Sistema de RH Online - Frontend

Este diretório contém o código fonte do frontend do Sistema de RH Online, uma aplicação web completa para gestão de equipes e recursos humanos.

## Estrutura do Projeto

```
frontend/
├── public/              # Arquivos públicos estáticos
├── src/                 # Código fonte principal
│   ├── assets/          # Imagens, ícones e outros recursos
│   ├── components/      # Componentes reutilizáveis
│   ├── contexts/        # Contextos React para gerenciamento de estado
│   ├── hooks/           # Hooks personalizados
│   ├── layouts/         # Layouts de página
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços de API e utilitários
│   ├── styles/          # Estilos globais e temas
│   ├── utils/           # Funções utilitárias
│   ├── App.jsx          # Componente principal
│   └── index.js         # Ponto de entrada
├── .env                 # Variáveis de ambiente
├── package.json         # Dependências e scripts
└── README.md            # Documentação
```

## Tecnologias Utilizadas

- **React**: Biblioteca para construção de interfaces
- **React Router**: Navegação entre páginas
- **Axios**: Cliente HTTP para comunicação com a API
- **Chart.js**: Biblioteca para criação de gráficos
- **React Hook Form**: Gerenciamento de formulários
- **Styled Components**: Estilização de componentes
- **React Query**: Gerenciamento de estado do servidor

## Funcionalidades

- **Dashboard Interativo**: Visualização de métricas e indicadores
- **Gestão de Colaboradores**: Cadastro, edição e visualização
- **Departamentos e Cargos**: Gerenciamento da estrutura organizacional
- **Movimentações**: Promoções, transferências e ajustes salariais
- **Relatórios**: Exportação de dados e análises

## Integração com Backend

O frontend se comunica com o backend através de uma API RESTful documentada, utilizando autenticação JWT para garantir a segurança dos dados.

## Responsividade

A interface é totalmente responsiva, adaptando-se a diferentes tamanhos de tela e dispositivos, desde desktops até smartphones.

## Acessibilidade

O sistema segue as melhores práticas de acessibilidade, garantindo que seja utilizável por pessoas com diferentes necessidades.
