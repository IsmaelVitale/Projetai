package br.com.projetei.api.service;

import br.com.projetei.api.dto.CommentDTO;
import br.com.projetei.api.dto.UpdateCommentDTO;
import br.com.projetei.api.model.Comment;
import br.com.projetei.api.model.Task;
import br.com.projetei.api.repository.CommentRepository;
import br.com.projetei.api.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;

    public CommentService(CommentRepository commentRepository, TaskRepository taskRepository) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public Comment addCommentToTask(Long taskId, CommentDTO commentDto) {
        // 1. Busca a tarefa à qual o comentário pertencerá.
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa não encontrada com o ID: " + taskId));

        // 2. Cria uma nova entidade Comment a partir dos dados do DTO.
        Comment newComment = new Comment();
        newComment.setText(commentDto.getText());
        newComment.setAuthorName(commentDto.getAuthorName());
        newComment.setCreatedAt(LocalDateTime.now()); // Pega a data e hora exatas do momento da criação.
        newComment.setTask(task); // Faz a associação com a tarefa.

        // 3. Salva o novo comentário no banco.
        return commentRepository.save(newComment);
    }

    public void deleteComment(Long commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new EntityNotFoundException("Comentário não encontrado com o ID: " + commentId);
        }
        commentRepository.deleteById(commentId);
    }

    @Transactional
    public Comment updateComment(Long commentId, UpdateCommentDTO dto) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comentário não encontrado com o ID: " + commentId));

        // Aplica a alteração a partir do DTO
        comment.setText(dto.getText());

        // Como o método é @Transactional, a alteração será salva automaticamente.
        // Mas podemos usar o save() para retornar o objeto atualizado.
        return commentRepository.save(comment);
    }
}