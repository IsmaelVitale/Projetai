# --- Estágio 1: Build (Construir o .jar) ---
# Usamos uma imagem que já tem Maven e Java 17
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o pom.xml primeiro para aproveitar o cache do Docker
COPY pom.xml .
# Baixa as dependências
RUN mvn dependency:go-offline

# Copia o resto do código-fonte
COPY src/ src/

# Roda o build (igual ao que fizemos localmente, pulando os testes)
RUN mvn clean package -DskipTests

# --- Estágio 2: Run (Executar o .jar) ---
# Usamos uma imagem leve que só tem o Java 17 para rodar (JRE)
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copia o .jar que foi criado no Estágio 1
# O 'api-*.jar' pega o seu .jar independente da versão
COPY --from=build /app/target/api-*.jar app.jar

# Expõe a porta 8081 (a mesma do seu application.properties)
EXPOSE 8081

# Comando final para iniciar sua aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]