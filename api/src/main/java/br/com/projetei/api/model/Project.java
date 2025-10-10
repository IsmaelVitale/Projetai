package br.com.projetei.api.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

// @Entity: Anotação mais importante. Diz ao JPA que esta classe representa uma tabela no banco de dados.
@Entity
// @Table: Permite especificar o nome exato da tabela. É uma boa prática usar nomes no plural para tabelas.
@Table(name = "projects")
public class Project {

    // @Id: Marca este campo como a chave primária (Primary Key) da tabela.
    @Id
    // @GeneratedValue: Configura como a chave primária será gerada.
    // GenerationType.IDENTITY: Delega ao banco de dados a tarefa de gerar o ID (auto_increment).
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @Column: Permite customizar a coluna, como o nome, se pode ser nula, etc.
    // Se não especificado, o JPA usa o nome do atributo como nome da coluna.
    @Column(nullable = false)
    private String name;

    private LocalDate dueDate;

    @Column(unique = true, nullable = false)
    private String code; // Código universal para acesso ao projeto

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Task> tasks;
    // Construtor vazio é exigido pelo JPA
    public Project() {
    }

    // Getters e Setters são necessários para que o JPA possa ler e escrever nos atributos
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getCode() {
        return code;
    }
    public void setCode(String code) {
        this.code = code;
    }

    public List<Task> getTasks() {
        return tasks;
    }
    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}