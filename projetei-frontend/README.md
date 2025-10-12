# Projetaí - Aplicação Frontend (React)

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)

Esta é a aplicação frontend para o gerenciador de projetos "Projetaí". É uma **Single Page Application (SPA)** construída com React que consome a API backend que desenvolvemos, oferecendo uma experiência de usuário rica e interativa para o gerenciamento de projetos e tarefas.

## Sobre o Projeto

Este projeto é a interface visual do Projetaí. Ele foi construído do zero utilizando ferramentas modernas do ecossistema JavaScript para ser rápido, reativo e fácil de manter. O objetivo é consumir a API REST do Projetaí para fornecer todas as funcionalidades de CRUD (Criar, Ler, Atualizar, Deletar) de forma intuitiva para o usuário, em um layout inspirado no esboço de design.

## Tecnologias e Bibliotecas Principais

* **React:** Biblioteca principal para a construção da interface de usuário de forma componentizada e declarativa.
* **Vite:** Ferramenta de build moderna e ultrarrápida que provê o servidor de desenvolvimento com Hot Module Replacement (HMR) e otimiza o projeto para produção.
* **JavaScript (ES6+) & JSX:** Linguagem base do projeto, utilizando a sintaxe JSX para descrever a UI de forma mais expressiva.
* **`react-router-dom`:** Biblioteca para gerenciamento de rotas no lado do cliente, permitindo a navegação entre "páginas" (como o Dashboard e a visão de um projeto específico) sem recarregar o site.
* **`react-icons`:** Biblioteca para a utilização de ícones populares (Font Awesome, etc.) como componentes React.
* **CSS Moderno:** Estilização feita com CSS puro, utilizando conceitos como Flexbox e Grid para criar layouts responsivos.

## Como Executar o Projeto Localmente

**Pré-requisitos:**
* [Node.js](https://nodejs.org/) (versão LTS recomendada)
* A **API Backend do Projetaí** deve estar em execução (geralmente em `http://localhost:8081`).

**Passos:**
1.  Navegue até a pasta do projeto no terminal:
    ```sh
    cd projetei-frontend
    ```
2.  Instale as dependências (só precisa fazer isso na primeira vez):
    ```sh
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```sh
    npm run dev
    ```
4.  Abra o navegador no endereço fornecido (geralmente `http://localhost:5173`).

## 🔧 Configuração do ambiente front-end

O projeto utiliza **Vite** e permite configurar o endereço base da API via variável de ambiente.

### 📁 Arquivo `.env`

Crie um arquivo `.env` na raiz do projeto (no mesmo nível do `package.json`) com o seguinte conteúdo:

```bash
VITE_API_URL=http://localhost:8081


## Estrutura de Pastas e Arquivos

O projeto está organizado dentro da pasta `src/` para separar claramente as responsabilidades de cada parte do código.

```
projetei-frontend/
├── public/              # Arquivos estáticos (ícones, etc.)
├── src/
│   ├── components/      # Componentes de UI reutilizáveis
│   │   ├── Header.jsx
│   │   ├── KanbanColumn.jsx
│   │   ├── NewProjectModal.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── TaskCard.jsx
│   │   └── TaskDetailModal.jsx
│   │
│   ├── pages/           # Componentes que representam "páginas" inteiras
│   │   ├── Dashboard.jsx
│   │   └── ProjectView.jsx
│   │
│   ├── services/        # Módulo de comunicação com a API Backend
│   │   └── apiService.js
│   │
│   ├── App.jsx          # Componente raiz que organiza o layout principal
│   ├── index.css        # Estilos globais
│   └── main.jsx         # Ponto de entrada da aplicação, onde o React é iniciado
│
├── index.html           # O único arquivo HTML da aplicação (template)
└── package.json         # O "pom.xml" do frontend: define dependências e scripts
```

### Descrição dos Arquivos Principais

* **`main.jsx`**: É o primeiro arquivo a ser executado. Ele "injeta" a aplicação React no `index.html` e configura o roteador (`BrowserRouter`).
* **`App.jsx`**: É o componente principal. Ele renderiza o layout comum a todas as páginas (como o `Header`) e gerencia estados globais, como a lista de projetos e a visibilidade dos modais.
* **`services/apiService.js`**: Centraliza todas as chamadas `fetch` para o nosso backend Spring Boot. Isola a lógica de comunicação de rede.
* **`pages/Dashboard.jsx`**: A página inicial (`/`). Busca a lista de projetos através do `App.jsx` e a exibe em uma grade de `ProjectCard`s.
* **`pages/ProjectView.jsx`**: A página de detalhes de um projeto (`/projects/:projectCode`). Busca os dados de um projeto específico e renderiza o quadro Kanban com as tarefas.
* **`components/ProjectCard.jsx`**: Um card que exibe as informações resumidas de um projeto. É um `Link` que leva para a `ProjectView`.
* **`components/KanbanColumn.jsx`**: Uma das três colunas do quadro Kanban ("A Fazer", "Em Andamento", "Concluído").
* **`components/TaskCard.jsx`**: Um card que exibe as informações resumidas de uma tarefa. Ao ser clicado, abre o `TaskDetailModal`.
* **`components/NewProjectModal.jsx`**: O modal com o formulário para criar um novo projeto.
* **`components/TaskDetailModal.jsx`**: O modal complexo para visualizar e editar todos os detalhes de uma tarefa, incluindo seu checklist e comentários, com lógica de edição in-loco.

## Fluxo de Dados e Arquitetura do Frontend

* **Componentização:** A UI é quebrada em pequenos componentes independentes e reutilizáveis.
* **Estado (State):** Usamos o hook `useState` para criar "memórias" nos componentes. Quando um estado muda (ex: a lista de projetos é atualizada), o React automaticamente redesenha a parte da tela que depende daquele estado.
* **Efeitos (Effects):** Usamos o hook `useEffect` para executar lógicas que interagem com o "mundo exterior", como fazer a chamada inicial para a API para buscar os dados quando uma página carrega.
* **Props:** Os dados fluem de "cima para baixo", dos componentes pais para os filhos, através de propriedades (`props`).
* **"Lifting State Up" (Elevar o Estado):** Para componentes "irmãos" se comunicarem (ex: o `Header` precisa atualizar o `Dashboard`), a lógica e o estado são elevados para o componente pai mais próximo, o `App.jsx`.
* **Roteamento:** O `react-router-dom` gerencia qual componente de `pages/` é exibido com base na URL, sem recarregar a página, criando a experiência de uma SPA.