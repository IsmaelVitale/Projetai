package br.com.projetei.api.controller;

import br.com.projetei.api.dto.UpdateChecklistItemDTO;
import br.com.projetei.api.model.ChecklistItem;
import br.com.projetei.api.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checklist-items")
@Tag(name = "Itens de Checklist", description = "Endpoints para gerenciar itens de checklist individuais")
@CrossOrigin(origins = "http://localhost:5173")
public class ChecklistItemController {

    private final TaskService taskService;

    public ChecklistItemController(TaskService taskService) {
        this.taskService = taskService;
    }

    @Operation(summary = "Atualiza um item de checklist", description = "Atualiza parcialmente um item de checklist (texto e/ou status). A atualização do status 'checked' recalcula automaticamente o status da tarefa pai.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item atualizado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChecklistItem.class))),
            @ApiResponse(responseCode = "404", description = "Item de checklist não encontrado para o ID informado")
    })
    @PatchMapping("/{itemId}")
    public ResponseEntity<ChecklistItem> updateChecklistItem(
            @Parameter(description = "ID do item de checklist a ser atualizado") @PathVariable Long itemId,
            @RequestBody UpdateChecklistItemDTO dto) {
        ChecklistItem updatedItem = taskService.updateChecklistItem(itemId, dto);
        return ResponseEntity.ok(updatedItem);
    }

    @Operation(summary = "Exclui um item de checklist", description = "Exclui um item de checklist. A exclusão recalcula automaticamente o status da tarefa pai.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Item de checklist excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Item de checklist não encontrado para o ID informado")
    })
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteChecklistItem(
            @Parameter(description = "ID do item de checklist a ser excluído") @PathVariable Long itemId) {
        taskService.deleteChecklistItem(itemId);
        return ResponseEntity.noContent().build();
    }
}