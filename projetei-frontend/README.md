# Projetaí - Aplicação Frontend (React)

![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)
![dnd-kit](https://img.shields.io/badge/@dnd--kit-core-blue)

Esta é a aplicação frontend para o gerenciador de projetos "Projetaí". É uma **Single Page Application (SPA)** construída com React que consome a API backend (Java/Spring Boot), oferecendo uma experiência de usuário rica e interativa para o gerenciamento de projetos e tarefas.

## Sobre o Projeto

Este projeto é a interface visual do Projetaí. Ele foi construído para ser rápido, reativo e fácil de manter, utilizando ferramentas modernas do ecossistema JavaScript. O objetivo é consumir a API REST para fornecer funcionalidades de CRUD (Criar, Ler, Atualizar, Deletar) de forma intuitiva para o usuário.

A arquitetura foca na separação de responsabilidades:
* **Pages**: Controlam o carregamento de dados e a lógica de negócios daquela "tela" (`Dashboard.jsx`, `ProjectView.jsx`).
* **Components**: Componentes de UI reutilizáveis que recebem dados via props e gerenciam seu próprio estado interno quando necessário (ex: modais, cards).
* **Services**: Isola toda a comunicação HTTP com o backend (`apiService.js`).
* **Utils**: Isola lógicas auxiliares, como a persistência em `localStorage` (`myProjects.js`) e a gestão do Modo Desenvolvedor (`devMode.js`).

## Funcionalidades Principais

* **Quadro Kanban Interativo**: Visualização de tarefas (A Fazer, Em Andamento, Concluído) com funcionalidade **Drag-and-Drop (DnD)** para mudança de status, utilizando `@dnd-kit`.
    * **Regras de Checklist**: O DnD para "Concluído" só é permitido se a tarefa não tiver checklist ou se todos os itens estiverem marcados. Para "A Fazer", só é permitido se não tiver checklist ou se *nem todos* os itens estiverem marcados.
* **"Meus Projetos"**: Persistência local (`localStorage`) dos projetos favoritos do usuário, sendo a visualização padrão do Dashboard.
* **Busca Inteligente no Header**:
    * **Por Código**: A busca por um código de projeto (ex: `PRJ-123`) abre o `ProjectDetailModal` em modo "lookup", permitindo visualizar detalhes e adicionar aos "Meus Projetos".
    * **Por Nome**: Filtra dinamicamente a lista de projetos visível no `Dashboard`.
* **Modo Desenvolvedor**: Um modo oculto (ativado por uma senha no campo de busca) que permite visualizar "Todos os Projetos" no Dashboard, além de "Meus Projetos". Controlado por `devMode.js`.
* **CRUD Completo**: Além de projetos e tarefas, o usuário pode gerenciar **Checklists** e **Comentários** dentro de cada tarefa através do `TaskDetailModal`, com edição "in-loco" (inline).
* **Sincronização via Eventos**: O estado da aplicação é atualizado através de eventos customizados (`window.dispatchEvent`), garantindo que diferentes partes da UI reajam a mudanças (ex: `projects:changed`, `devmode:changed`, `ui:toast`).
* **Modais Reutilizáveis**: Componentes como `ConfirmModal.jsx` são usados para ações destrutivas (excluir projeto/tarefa), garantindo consistência.

## Tecnologias e Bibliotecas Utilizadas

* **React (v19+)**: Biblioteca principal para a construção da UI.
* **Vite (v7+)**: Ferramenta de build e servidor de desenvolvimento.
* **JavaScript (ES6+) & JSX**: Linguagem base.
* **`react-router-dom` (v7+)**: Gerenciamento de rotas (`/` e `/projects/:code`).
* **`@dnd-kit/core` & `@dnd-kit/sortable`**: Bibliotecas para Drag-and-Drop.
* **`react-icons`**: Biblioteca para ícones (ex: `FaPencilAlt`).
* **CSS Puro**: Estilização feita com CSS modularizado por componente.

## Como Executar o Projeto Localmente

**Pré-requisitos:**
* [Node.js](https://nodejs.org/) (versão LTS recomendada)
* A **API Backend do Projetaí** deve estar em execução (verifique a URL no `.env`).

**Passos:**
1.  Clone o repositório (se ainda não o fez).
2.  Navegue até a pasta do projeto no terminal:
    ```sh
    cd projetei-frontend
    ```
3.  Instale as dependências:
    ```sh
    npm install
    ```
4.  Crie ou configure o arquivo `.env` (veja a seção abaixo).
5.  Inicie o servidor de desenvolvimento:
    ```sh
    npm run dev
    ```
6.  Abra o navegador no endereço indicado (geralmente `http://localhost:5173`).

## 🔧 Configuração do Ambiente (`.env`)

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo, ajustando os valores conforme necessário:

```dotenv
# Endereço base da API backend (sem /api no final)
VITE_API_URL=http://localhost:8081

# Senha para ativar o Modo Desenvolvedor na busca do Header
# Deixe em branco ("") para desativar em produção.
VITE_DEV_PASS=dev:on
```

* **`VITE_API_URL`**: URL base onde a API backend está rodando. O `apiService.js` adicionará `/api` automaticamente.
* **`VITE_DEV_PASS`**: Uma "senha" secreta. Ao digitar exatamente esta string no campo de busca do Header, o Modo Desenvolvedor é ativado, permitindo ver "Todos os Projetos". Digitar `dev:off` desativa o modo.

## Estrutura de Pastas e Arquivos

```
projetei-frontend/
├── src/
│   ├── components/            # Componentes de UI reutilizáveis
│   │   ├── ConfirmModal.jsx     # Modal genérico para confirmações
│   │   ├── Header.jsx           # Barra de navegação superior e busca
│   │   ├── KanbanColumn.jsx     # Coluna do quadro Kanban (A Fazer, etc.)
│   │   ├── NewProjectModal.jsx  # Modal para criar novo projeto
│   │   ├── ProjectCard.jsx      # Card de projeto exibido no Dashboard
│   │   ├── ProjectDetailModal.jsx # Modal para ver/editar detalhes do PROJETO
│   │   ├── QuickAddTask.jsx     # Componente inline para adicionar tarefa na coluna "A Fazer"
│   │   ├── TaskCard.jsx         # Card de tarefa exibido no Kanban (arrastável)
│   │   └── TaskDetailModal.jsx  # Modal complexo para ver/editar detalhes da TAREFA
│   │
│   ├── pages/                 # Componentes que representam as "telas" principais
│   │   ├── Dashboard.jsx        # Tela inicial com a grade de projetos
│   │   └── ProjectView.jsx      # Tela de visualização de um projeto (Kanban)
│   │
│   ├── services/              # Lógica de comunicação com a API
│   │   └── apiService.js        # Centraliza todas as chamadas `fetch`
│   │
│   ├── utils/                 # Funções utilitárias auxiliares
│   │   ├── devMode.js           # Lógica para ativar/desativar o Modo Desenvolvedor
│   │   └── myProjects.js        # Funções para gerenciar "Meus Projetos" no localStorage
│   │
│   ├── App.jsx                # Componente raiz (estrutura principal, rotas, modais globais)
│   ├── index.css              # Estilos CSS globais
│   └── main.jsx               # Ponto de entrada da aplicação React (renderiza o App)
│
├── .env                     # Arquivo de configuração de ambiente (NÃO versionar dados sensíveis!)
├── .env.example             # Exemplo de como o .env deve ser
├── .gitignore               # Arquivos/pastas ignorados pelo Git
├── eslint.config.js         # Configuração do ESLint (qualidade de código)
├── index.html               # Template HTML base da SPA
├── package.json             # Definição do projeto, dependências e scripts NPM
├── package-lock.json        # Lockfile das dependências
├── README.md                # Este arquivo
└── vite.config.js           # Configuração do Vite (build tool)
```

## Descrição dos Arquivos e Fluxos Principais

* **`main.jsx`**: Inicializa o React, monta o `` no DOM e configura o `BrowserRouter` do `react-router-dom`.
* **`App.jsx`**: Componente "pai" de toda a aplicação.
    * Renderiza o `
`.
    * Define as rotas usando `` e `` (`/` para `Dashboard`, `/projects/:code` para `ProjectView`).
    * Gerencia o estado da lista completa de projetos (`projects`) buscada da API.
    * Controla a abertura do `NewProjectModal` e do `ProjectDetailModal` quando acionado pela busca por código (modo 'lookup').
    * Ouve eventos globais como `projects:changed` para recarregar a lista de projetos.
* **`services/apiService.js`**: Abstrai todas as interações com a API backend. Exporta funções como `fetchProjects`, `createProject`, `updateTaskStatus`, etc., tratando a URL base, headers JSON e erros HTTP.
* **`utils/myProjects.js`**: Contém a lógica para ler, adicionar e remover projetos do `localStorage` (chave `projetei.myProjects`). Dispara o evento `projects:changed` após modificações para que a UI (ex: `Dashboard`) possa reagir.
* **`utils/devMode.js`**: Gerencia o estado do Modo Desenvolvedor (lendo/escrevendo em `localStorage` na chave `projetei.devMode`) e dispara o evento `devmode:changed`.
* **`pages/Dashboard.jsx`**:
    * Recebe a lista `projects` do `App.jsx`.
    * Usa `myProjects.js` e `devMode.js` para filtrar quais projetos exibir (`Meus Projetos` vs. `Todos`).
    * Filtra localmente por nome quando o `Header` dispara o evento `dashboard:search-name`.
    * Renderiza um grid de `ProjectCard`s.
* **`pages/ProjectView.jsx`**:
    * Usa o `useParams` para pegar o `:projectCode` da URL.
    * Busca os dados completos do projeto (incluindo tarefas) via `fetchProjectByCode`.
    * Organiza as tarefas nas colunas (`KanbanColumn`).
    * Configura o `DndContext` e implementa a lógica `handleDragEnd` para atualizar o status da tarefa (chamando `updateTaskStatus`), respeitando as regras do checklist.
    * Controla a abertura do `TaskDetailModal` quando um `TaskCard` é clicado.
    * Controla a abertura do `ProjectDetailModal` (modo 'normal') quando o evento `project:open-details` é disparado pelo `Header`.
* **`components/Header.jsx`**:
    * Exibe o título e botões de navegação (`Voltar`, `Meus Projetos`).
    * Na `Dashboard`, exibe o botão `+ Novo Projeto` e o formulário de busca.
        * A busca verifica se o termo parece um código; se sim, chama `fetchProjectByCode` e dispara `project:open-modal` (ouvido pelo `App.jsx`) para abrir o `ProjectDetailModal` em modo 'lookup'.
        * Se não parece código, dispara `dashboard:search-name` (ouvido pelo `Dashboard.jsx`) para filtro local.
        * Tenta ativar/desativar o Modo Dev com `tryActivateDevMode`.
    * Na `ProjectView`, exibe o código do projeto atual e um botão para abrir `ProjectDetailModal` (disparando `project:open-details`, ouvido pela `ProjectView.jsx`).
* **`components/TaskDetailModal.jsx`**: Modal rico para exibir e editar uma tarefa.
    * Permite edição in-loco de título, descrição, data e prioridade.
    * Gerencia o CRUD completo de itens do Checklist.
    * Gerencia o CRUD completo de Comentários (lembrando o nome do autor no `localStorage`).
    * Inclui botão para excluir a tarefa (usando `ConfirmModal`).
* **`components/ProjectDetailModal.jsx`**: Modal para detalhes do projeto. Opera em dois modos:
    * **`normal`**: Aberto de dentro da `ProjectView`. Permite editar nome, descrição, data e excluir o projeto (com `ConfirmModal`).
    * **`lookup`**: Aberto pela busca por código no `Header` (via `App.jsx`). Não permite edição ou exclusão, mas oferece um botão para "Adicionar aos Meus Projetos".
* **`components/ConfirmModal.jsx`**: Componente genérico para exibir uma caixa de diálogo de confirmação antes de ações destrutivas.

## Fluxo de Dados e Comunicação

* **Hierarquia:** `App` -> `Dashboard`/`ProjectView` -> `KanbanColumn`/`ProjectCard` -> `TaskCard`.
* **Props Drilling:** Dados fluem principalmente de cima para baixo via props (ex: `App` passa `projects` para `Dashboard`).
* **Estado Local:** Componentes gerenciam seu próprio estado quando necessário (ex: `TaskDetailModal` controla qual campo está sendo editado).
* **Elevação de Estado:** A lista principal de projetos (`projects`) é gerenciada no `App.jsx` pois é necessária em múltiplos locais.
* **Comunicação entre Componentes Desacoplados:** Eventos customizados (`window.dispatchEvent` e `window.addEventListener`) são usados para comunicação "lateral" ou "de baixo para cima" sem acoplar os componentes diretamente. Exemplos:
    * `myProjects.js` dispara `projects:changed` -> `App.jsx` e `Dashboard.jsx` ouvem para atualizar.
    * `Header.jsx` dispara `dashboard:search-name` -> `Dashboard.jsx` ouve para filtrar.
    * `Header.jsx` dispara `project:open-modal` -> `App.jsx` ouve para abrir o modal de detalhes.
    * `devMode.js` dispara `devmode:changed` -> `Dashboard.jsx` ouve para mudar a visualização.
* **Persistência:** `localStorage` é usado para:
    * `projetei.myProjects`: Lista de IDs/códigos dos projetos favoritos.
    * `projetei.devMode`: Flag (`'1'`) indicando se o Modo Dev está ativo.
    * `commentAuthorName`: Lembrar o último nome usado ao comentar.