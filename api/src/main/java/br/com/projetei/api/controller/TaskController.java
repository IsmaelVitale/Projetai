package br.com.projetei.api.controller;

import br.com.projetei.api.dto.CreateChecklistItemDTO;
import br.com.projetei.api.model.ChecklistItem;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;
import br.com.projetei.api.dto.CommentDTO;
import br.com.projetei.api.model.Comment;
import br.com.projetei.api.service.CommentService;
import org.springframework.web.bind.annotation.*;
import br.com.projetei.api.model.Task;
import br.com.projetei.api.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import br.com.projetei.api.dto.UpdateTaskDTO;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import br.com.projetei.api.dto.UpdateTaskStatusDTO;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tarefas", description = "Endpoints para gerenciamento de tarefas")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskService taskService;
    private final CommentService commentService; // 1. Nova injeção


    public TaskController(TaskService taskService, CommentService commentService) {
        this.taskService = taskService;
        this.commentService = commentService;
    }

    @Operation(summary = "Busca uma tarefa por ID", description = "Retorna uma única tarefa baseada na sua chave primária.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tarefa encontrada com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Task.class))),
            @ApiResponse(responseCode = "404", description = "Tarefa não encontrada para o ID informado")
    })
    @GetMapping("/{taskId}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long taskId) {
        Task task = taskService.findTaskById(taskId);
        return ResponseEntity.ok(task);
    }

    @Operation(summary = "Exclui uma tarefa", description = "Exclui uma tarefa existente com base no seu ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Tarefa excluída com sucesso"),
            @ApiResponse(responseCode = "404", description = "Tarefa não encontrada para o ID informado")
    })
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(summary = "Adiciona um novo comentário a uma tarefa", description = "Cria um novo comentário e o associa a uma tarefa existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Comentário criado e associado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Comment.class))),
            @ApiResponse(responseCode = "404", description = "Tarefa não encontrada para o ID informado")
    })
    @PostMapping("/{taskId}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable Long taskId, @RequestBody CommentDTO commentDto) {
        Comment createdComment = commentService.addCommentToTask(taskId, commentDto);
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    @Operation(summary = "Adiciona um novo item de checklist a uma tarefa", description = "Cria um novo item de checklist e o associa a uma tarefa existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Item de checklist criado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChecklistItem.class))),
            @ApiResponse(responseCode = "404", description = "Tarefa não encontrada para o ID informado")
    })
    @PostMapping("/{taskId}/checklist-items")
    public ResponseEntity<ChecklistItem> addChecklistItem(
            @PathVariable Long taskId,
            @RequestBody CreateChecklistItemDTO dto) {
        ChecklistItem createdItem = taskService.addChecklistItemToTask(taskId, dto);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }

    @Operation(summary = "Atualiza uma tarefa existente", description = "Atualiza parcialmente uma tarefa (título, descrição, data de entrega, prioridade) com base no seu ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tarefa atualizada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Task.class))),
            @ApiResponse(responseCode = "404", description = "Tarefa não encontrada para o ID informado")
    })
    @PatchMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long taskId,
            @RequestBody UpdateTaskDTO dto) {
        Task updatedTask = taskService.updateTask(taskId, dto);
        return ResponseEntity.ok(updatedTask);
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<Task> updateStatus(
            @PathVariable Long taskId,
            @RequestBody UpdateTaskStatusDTO dto) {
        Task updatedTask = taskService.updateTaskStatus(taskId, dto);
        return ResponseEntity.ok(updatedTask);
    }
}