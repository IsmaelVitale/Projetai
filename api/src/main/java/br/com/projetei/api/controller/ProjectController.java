package br.com.projetei.api.controller;

import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.projetei.api.dto.UpdateProjectDTO;
import org.springframework.web.bind.annotation.PatchMapping;
import br.com.projetei.api.model.Project;
import br.com.projetei.api.model.Task; // Adicione esta importação
import br.com.projetei.api.service.ProjectService;
import br.com.projetei.api.service.TaskService; // Adicione esta importação
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; // Verifique se esta importação está aqui

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projetos", description = "Endpoints para gerenciamento de projetos")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    private final ProjectService projectService;
    private final TaskService taskService; // 1. Adicionamos a referência ao TaskService

    // 2. Atualizamos o construtor para receber ambos os serviços
    public ProjectController(ProjectService projectService, TaskService taskService) {
        this.projectService = projectService;
        this.taskService = taskService;
    }

    // --- Endpoints de Projeto ---

    @Operation(summary = "Cria um novo projeto", description = "Cria um novo projeto com base nos dados fornecidos no corpo da requisição.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Projeto criado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Project.class))),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos")
    })
    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        Project createdProject = projectService.createProject(project);
        return new ResponseEntity<>(createdProject, HttpStatus.CREATED);
    }

    @Operation(summary = "Lista todos os projetos", description = "Retorna uma lista com todos os projetos cadastrados no banco de dados.")
    @ApiResponse(responseCode = "200", description = "Operação bem-sucedida",
            content = @Content(mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = Project.class))))
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.findAllProjects();
        return ResponseEntity.ok(projects);
    }

    // --- Endpoint de Tarefa ---

    // 3. Adicionamos o novo endpoint para criar tarefas

    @Operation(summary = "Adiciona uma nova tarefa a um projeto", description = "Cria uma nova tarefa e a associa a um projeto existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tarefa criada e associada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Task.class))),
            @ApiResponse(responseCode = "404", description = "Projeto não encontrado para o ID informado")
    })
    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<Task> addTaskToProject(
            @PathVariable Long projectId,
            @RequestBody Task task) {
        Task createdTask = taskService.createTask(projectId, task);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @Operation(summary = "Lista as tarefas de um projeto", description = "Retorna uma lista de todas as tarefas associadas a um projeto específico, identificado pelo seu ID.")
    @ApiResponse(responseCode = "200", description = "Operação bem-sucedida",
            content = @Content(mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = Task.class))))
    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<List<Task>> getTasksByProjectId(@PathVariable Long projectId) {
        List<Task> tasks = taskService.findAllByProjectId(projectId);
        return ResponseEntity.ok(tasks);
    }

    @Operation(summary = "Busca um projeto por ID", description = "Retorna um único projeto baseado na sua chave primária.")
    @ApiResponse(responseCode = "200", description = "Projeto encontrado com sucesso",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = Project.class)))
    @ApiResponse(responseCode = "404", description = "Projeto não encontrado para o ID informado")
    @GetMapping("/{projectId}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long projectId) {
        Project project = projectService.findProjectById(projectId);
        return ResponseEntity.ok(project);
    }

    @Operation(summary = "Busca um projeto pelo seu código único", description = "Retorna um único projeto baseado no seu código de acesso.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Projeto encontrado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Project.class))),
            @ApiResponse(responseCode = "404", description = "Projeto não encontrado para o Código informado")
    })
    @GetMapping("/by-code/{code}")
    public ResponseEntity<Project> getProjectByCode(@PathVariable String code) {
        Project project = projectService.findProjectByCode(code);
        return ResponseEntity.ok(project);
    }

    @Operation(summary = "Exclui um projeto", description = "Exclui um projeto e todos os seus dados associados (tarefas, etc.) com base no seu ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Projeto excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Projeto não encontrado para o ID informado")
    })
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Atualiza um projeto existente", description = "Atualiza parcialmente um projeto (nome, descrição, data de entrega) com base no seu ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Projeto atualizado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Project.class))),
            @ApiResponse(responseCode = "404", description = "Projeto não encontrado para o ID informado")
    })
    @PatchMapping("/{projectId}")
    public ResponseEntity<Project> updateProject(
            @PathVariable Long projectId,
            @RequestBody UpdateProjectDTO dto) {
        Project updatedProject = projectService.updateProject(projectId, dto);
        return ResponseEntity.ok(updatedProject);
    }
}