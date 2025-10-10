package br.com.projetei.api.controller;

import br.com.projetei.api.dto.UpdateCommentDTO;
import br.com.projetei.api.model.Comment;
import br.com.projetei.api.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@Tag(name = "Comentários", description = "Endpoints para gerenciar comentários individuais")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @Operation(summary = "Atualiza um comentário existente", description = "Atualiza o texto de um comentário com base no seu ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comentário atualizado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Comment.class))),
            @ApiResponse(responseCode = "404", description = "Comentário não encontrado para o ID informado")
    })
    @PatchMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @Parameter(description = "ID do comentário a ser atualizado") @PathVariable Long commentId,
            @RequestBody UpdateCommentDTO dto) {
        Comment updatedComment = commentService.updateComment(commentId, dto);
        return ResponseEntity.ok(updatedComment);
    }

    @Operation(summary = "Exclui um comentário", description = "Exclui um comentário existente com base no seu ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Comentário excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Comentário não encontrado para o ID informado")
    })
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @Parameter(description = "ID do comentário a ser excluído") @PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}