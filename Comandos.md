ssh -i "C:\Users\ismaelgov\OneDrive - Inditex\estudo\Chaves\1\ssh-key-2025-10-21.key" opc@163.176.150.158

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
Environment="SPRING_DATASOURCE_PASSWORD=senha-aqui"

# Reinicia o servico se ele falhar
Restart=always

[Install]
WantedBy=multi-user.target

# Recarrega o systemd para ler o novo arquivo
sudo systemctl daemon-reload

# Habilita o servico (para iniciar no boot)
sudo systemctl enable projetei.service

# Inicia o servico
sudo systemctl start projetei.servic

# verificar
sudo systemctl status projetei.service