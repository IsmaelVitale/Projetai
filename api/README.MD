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

## Arquitetura

A API segue o padrão arquitetural em camadas **Controller-Service-Repository**, promovendo uma clara separação de responsabilidades:

* **`Controller`**: Camada de entrada da API. Responsável por expor os endpoints REST, receber as requisições HTTP e retornar as respostas.
* **`Service`**: Camada de lógica de negócio. Orquestra as operações, aplica regras de negócio e gerencia as transações.
* **`Repository`**: Camada de acesso a dados. Abstrai a comunicação com o banco de dados, utilizando as interfaces do Spring Data JPA.
* **`Model (Entities)`**: Representação das tabelas do banco de dados como objetos Java.
* **`DTOs (Data Transfer Objects)`**: Objetos simples utilizados como "contrato" para transferir dados entre o cliente e a API, evitando a exposição direta das entidades.

### Estrutura de Pastas

src/main/java/br/com/projetei/api
├── controller/      # Controladores REST (a porta de entrada)
├── dto/             # Data Transfer Objects (o contrato da API)
├── model/           # Entidades JPA (o espelho do banco de dados)
│   └── enums/       # Enumerações (Status, Prioridade)
├── repository/      # Interfaces do Spring Data JPA (acesso ao banco)
├── service/         # Classes de serviço (a lógica de negócio)
└── ApiApplication.java  # Classe principal da aplicação


## Como Executar o Projeto

### Execução Local (Desenvolvimento)

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
    * Navegue até `src/test/resources/application.properties`.
    * Altere os campos `spring.datasource.username` e `spring.datasource.password` com suas credenciais do MySQL.

4.  **Execute a Aplicação:**
    * Você pode executar a classe `ApiApplication.java` diretamente pela sua IDE.
    * Ou, via terminal, na raiz do projeto, execute:
        ```sh
        mvn spring-boot:run
        ```
    A aplicação estará rodando em `http://localhost:8081`.

### Deploy em Produção (Oracle Cloud Infrastructure)

Este guia resume os passos para implantar a API em uma VM (Compute Instance) na OCI com Oracle Linux.

1.  **Infraestrutura OCI:**
    * Crie uma **VCN** com uma **Sub-rede Pública** e um **Gateway de Internet**.
    * Configure a **Tabela de Roteamento** da sub-rede pública com uma rota para o Gateway de Internet (Destino: `0.0.0.0/0`).
    * Configure a **Security List** (Firewall) da VCN para liberar as portas de entrada (Ingress Rules):
        * `TCP` porta `22` (Origem: `0.0.0.0/0`) - Para acesso SSH.
        * `TCP` porta `8081` (Origem: `0.0.0.0/0`) - Para a API Spring Boot.

2.  **Configuração da VM (Servidor):**
    * Conecte-se à VM via SSH.
    * Desative o firewall interno da VM (se necessário):
        ```sh
        sudo systemctl stop firewalld
        sudo systemctl disable firewalld
        ```
    * Instale as dependências:
        ```sh
        sudo yum update -y
        sudo yum install java-17-openjdk-devel -y
        sudo yum install maven -y
        sudo yum install mysql-server -y
        ```
    * Inicie o MySQL:
        ```sh
        sudo systemctl start mysqld
        sudo systemctl enable mysqld
        ```

3.  **Configuração do Banco de Dados (na VM):**
    * Acesse o console do MySQL: `sudo mysql`
    * Execute os seguintes comandos SQL:
        ```sql
        CREATE DATABASE projetei_db;
        CREATE USER 'projetei_user'@'localhost' IDENTIFIED BY 'SuaSenhaForteAqui';
        GRANT ALL PRIVILEGES ON projetei_db.* TO 'projetei_user'@'localhost';
        FLUSH PRIVILEGES;
        exit;
        ```

4.  **Build do Projeto (na VM):**
    * Faça o upload do código-fonte do projeto (ex: `api.zip`) para a VM via `scp`.
    * Descompacte e acesse a pasta:
        ```sh
        unzip api.zip
        cd api
        ```
    * Execute o build do Maven (pulando os testes que falham no deploy):
        ```sh
        sudo mvn clean install -Dmaven.test.skip=true
        ```


5.  **Configurar o Serviço (Systemd):**
    * Para garantir que a API rode 24/7 e inicie com o boot, crie um serviço `systemd`:
        ```sh
        sudo nano /etc/systemd/system/projetei.service
        ```
    * Cole o seguinte conteúdo (substitua a senha):
        ```ini
        [Unit]
        Description=Projetei API Backend Service
        After=network.target mysqld.service

        [Service]
        User=opc
        WorkingDirectory=/home/opc/api
        ExecStart=/usr/bin/java -jar /home/opc/api/target/api-0.0.1-SNAPSHOT.jar
        SuccessExitStatus=143
        
        # Variáveis de ambiente para o banco de dados
        Environment="SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/projetei_db?useTimezone=true&serverTimezone=UTC"
        Environment="SPRING_DATASOURCE_USERNAME=projetei_user"
        Environment="SPRING_DATASOURCE_PASSWORD=SuaSenhaForteAqui"
        
        # Reinicia o servico se ele falhar
        Restart=always

        [Install]
        WantedBy=multi-user.target
        ```
    * Recarregue, habilite e inicie o serviço:
        ```sh
        sudo systemctl daemon-reload
        sudo systemctl enable projetei.service
        sudo systemctl start projetei.service
        ```
    * Verifique o status: `sudo systemctl status projetei.service`

## Documentação da API (Swagger)

Com a aplicação em execução, a documentação completa e interativa da API pode ser acessada:

### Ambiente Local
* **Swagger UI (Interface Gráfica):** [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
* **OpenAPI JSON (Nível de Máquina):** [http://localhost:8081/v3/api-docs](http://localhost:8081/v3/api-docs)

### Ambiente de Produção (OCI)
* **Swagger UI (Interface Gráfica):** [http://163.176.150.158:8081/swagger-ui.html](http://163.176.150.158:8081/swagger-ui.html)
* **OpenAPI JSON (Nível de Máquina):** [http://163.176.150.158:8081/v3/api-docs](http://163.176.150.158:8081/v3/api-docs)

---
Feito por [ISMAEL GIUSEPPE]