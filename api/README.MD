# Projetaí - API Backend

![Java](https://img.shields.io/badge/Java-17-blue.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)
![Maven](https://img.shields.io/badge/Maven-3.9-orange.svg)

API RESTful para o gerenciador de projetos "Projetaí", desenvolvida com Spring Boot. Esta API serve como o backend central para todas as operações de gerenciamento de projetos, tarefas, checklists e comentários.

## Sobre o Projeto

A ideia do Projetaí é fornecer uma ferramenta de gerenciamento de projetos simples e intuitiva. Esta API foi construída para ser a espinha dorsal do sistema, oferecendo uma arquitetura robusta, segura e escalável para suportar não apenas a aplicação web principal, mas também futuras integrações com aplicativos mobile ou outros serviços.

O fluxo principal do MVP (Mínimo Produto Viável) permite que usuários acessem projetos através de um código único, sem a necessidade de um cadastro formal, facilitando a colaboração rápida.

## Tecnologias Utilizadas

Este projeto foi construído utilizando um conjunto de tecnologias modernas e consolidadas no mercado de desenvolvimento Java:

* **Java 17 (LTS):** Versão de longo suporte do Java, garantindo estabilidade e performance.
* **Spring Boot:** Framework principal para a criação da API, facilitando a configuração e o desenvolvimento.
* **Spring Data JPA & Hibernate:** Para o mapeamento objeto-relacional (ORM) e a camada de persistência com o banco de dados.
* **MySQL:** Banco de dados relacional para o armazenamento persistente dos dados.
* **Maven:** Ferramenta de gerenciamento de dependências e build do projeto.
* **Springdoc OpenAPI (Swagger):** Para a geração automática de documentação da API de forma interativa.
* **Spring Security (Planejado):** Módulo para implementação de autenticação (via JWT) e autorização.

## Arquitetura

A API segue o padrão arquitetural em camadas **Controller-Service-Repository**, promovendo uma clara separação de responsabilidades:

* **`Controller`**: Camada de entrada da API. Responsável por expor os endpoints REST, receber as requisições HTTP e retornar as respostas.
* **`Service`**: Camada de lógica de negócio. Orquestra as operações, aplica regras de negócio e gerencia as transações.
* **`Repository`**: Camada de acesso a dados. Abstrai a comunicação com o banco de dados, utilizando as interfaces do Spring Data JPA.
* **`Model (Entities)`**: Representação das tabelas do banco de dados como objetos Java.
* **`DTOs (Data Transfer Objects)`**: Objetos simples utilizados como "contrato" para transferir dados entre o cliente e a API, evitando a exposição direta das entidades.

### Estrutura de Pastas

```
src/main/java/br/com/projetei/api
├── controller/      # Controladores REST (a porta de entrada)
├── dto/             # Data Transfer Objects (o contrato da API)
├── model/           # Entidades JPA (o espelho do banco de dados)
│   └── enums/       # Enumerações (Status, Prioridade)
├── repository/      # Interfaces do Spring Data JPA (acesso ao banco)
├── service/         # Classes de serviço (a lógica de negócio)
└── ApiApplication.java  # Classe principal da aplicação
```

## Pré-requisitos

Antes de executar o projeto, garanta que você tem os seguintes softwares instalados:
* JDK 17 ou superior
* Maven 3.6 ou superior
* MySQL 8.0 ou superior

## Como Executar o Projeto

1.  **Clone o repositório:**
    ```sh
    git clone [URL_DO_SEU_REPOSITORIO]
    ```

2.  **Crie o Banco de Dados:**
    * No seu cliente MySQL, execute o comando:
        ```sql
        CREATE DATABASE projetei_db;
        ```

3.  **Configure a Conexão:**
    * Navegue até `src/main/resources/application.properties`.
    * Altere os campos `spring.datasource.username` e `spring.datasource.password` com suas credenciais do MySQL.

4.  **Execute a Aplicação:**
    * Você pode executar a classe `ApiApplication.java` diretamente pela sua IDE (IntelliJ).
    * Ou, via terminal, na raiz do projeto, execute:
        ```sh
        mvn spring-boot:run
        ```
    A aplicação estará rodando em `http://localhost:8081`.

## Documentação da API (Swagger)

Com a aplicação em execução, a documentação completa e interativa da API pode ser acessada através dos seguintes links:

* **Swagger UI (Interface Gráfica):** [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
* **OpenAPI JSON (Nível de Máquina):** [http://localhost:8081/v3/api-docs](http://localhost:8081/v3/api-docs)

---
Feito por [ISMAEL GIUSEPPE]