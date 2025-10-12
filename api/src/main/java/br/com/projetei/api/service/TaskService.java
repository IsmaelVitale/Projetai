package br.com.projetei.api.service;

import br.com.projetei.api.dto.UpdateTaskDTO;
import br.com.projetei.api.dto.CreateChecklistItemDTO;
import br.com.projetei.api.dto.UpdateChecklistItemDTO;
import br.com.projetei.api.model.ChecklistItem;
import br.com.projetei.api.model.Project;
import br.com.projetei.api.model.Task;
import br.com.projetei.api.model.enums.TaskPriority;
import br.com.projetei.api.model.enums.TaskStatus;
import br.com.projetei.api.repository.ChecklistItemRepository;
import br.com.projetei.api.repository.ProjectRepository;
import br.com.projetei.api.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.projetei.api.dto.UpdateTaskStatusDTO;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ChecklistItemRepository checklistItemRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, ChecklistItemRepository checklistItemRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.checklistItemRepository = checklistItemRepository;
    }

    public Task createTask(Long projectId, Task task) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado com o ID: " + projectId));
        task.setProject(project);
        task.setStatus(TaskStatus.TODO);
        task.setPriority(TaskPriority.MEDIUM); // Definindo um valor padrão
        return taskRepository.save(task);
    }

    public List<Task> findAllByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    @Transactional
    public ChecklistItem updateChecklistItem(Long checklistItemId, UpdateChecklistItemDTO dto) {
        ChecklistItem item = checklistItemRepository.findById(checklistItemId)
                .orElseThrow(() -> new EntityNotFoundException("Item de checklist não encontrado com o ID: " + checklistItemId));

        if (dto.getText() != null) {
            item.setText(dto.getText());
        }

        // --- A CORREÇÃO ESTÁ AQUI ---
        if (dto.isChecked() != null) { // Altere de getIsChecked() para isChecked()
            item.setChecked(dto.isChecked()); // Altere de getIsChecked() para isChecked()
        }

        recalculateTaskStatus(item.getTask());

        return item;
    }

    private void recalculateTaskStatus(Task task) {
        List<ChecklistItem> checklist = task.getChecklist();
        if (checklist == null || checklist.isEmpty()) {
            return;
        }

        long totalItems = checklist.size();
        long checkedItems = checklist.stream().filter(ChecklistItem::isChecked).count();

        TaskStatus newStatus;
        if (checkedItems == 0) {
            newStatus = TaskStatus.TODO;
        } else if (checkedItems == totalItems) {
            newStatus = TaskStatus.DONE;
        } else {
            newStatus = TaskStatus.DOING;
        }

        if (task.getStatus() != newStatus) {
            task.setStatus(newStatus);
            // A linha .save() também foi removida daqui.
        }
    }

    public Task findTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa não encontrada com o ID: " + taskId));
    }

    public void deleteTask(Long taskId) {
        // É uma boa prática verificar se o recurso existe antes de tentar deletá-lo.
        if (!taskRepository.existsById(taskId)) {
            // Se não existir, lançamos a mesma exceção de "não encontrado".
            throw new EntityNotFoundException("Tarefa não encontrada com o ID: " + taskId);
        }
        // O JpaRepository nos dá este método de graça para deletar pelo ID.
        taskRepository.deleteById(taskId);
    }

    // ... (dentro da classe TaskService)

    @Transactional
    public void deleteChecklistItem(Long itemId) {
        // 1. Busca o item para garantir que ele existe e para pegar a tarefa pai.
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item de checklist não encontrado com o ID: " + itemId));
        Task parentTask = item.getTask();

        // 2. Deleta o item.
        checklistItemRepository.delete(item);
        checklistItemRepository.flush(); // Força a execução do DELETE no banco imediatamente.

        // 3. Recarrega a tarefa pai do banco para garantir que estamos com a lista de checklists 100% atualizada.
        Task updatedParentTask = taskRepository.findById(parentTask.getId())
                .orElseThrow(() -> new EntityNotFoundException("Tarefa pai não encontrada após exclusão do item. ID: " + parentTask.getId()));

        // 4. Agora recalcula o status com os dados mais recentes.
        recalculateTaskStatus(updatedParentTask);
    }

    @Transactional
    public ChecklistItem addChecklistItemToTask(Long taskId, CreateChecklistItemDTO dto) {
        // 1. Busca a tarefa pai para garantir que ela existe.
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa não encontrada com o ID: " + taskId));

        // 2. Cria a nova entidade ChecklistItem a partir do DTO.
        ChecklistItem newItem = new ChecklistItem();
        newItem.setText(dto.getText());
        newItem.setChecked(false); // Regra de negócio: um novo item sempre começa como não marcado.
        newItem.setTask(task); // Associa o novo item à sua tarefa pai.

        // 3. Salva o novo item no banco de dados.
        return checklistItemRepository.save(newItem);
    }
    @Transactional
    public Task updateTask(Long taskId, UpdateTaskDTO dto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa não encontrada com o ID: " + taskId));

        // Lógica de atualização parcial
        if (dto.getDueDate() != null) {
            task.setDueDate(dto.getDueDate());
        }
        if (dto.getPriority() != null) {
            task.setPriority(dto.getPriority());
        }

        if (dto.getDescription() != null) {
            task.setDescription(dto.getDescription());
        }

        if (dto.getTitle() != null) {
            task.setTitle(dto.getTitle());
        }

        // A anotação @Transactional cuida de salvar as alterações.
        return task;
    }

    @Transactional
    public Task updateTaskStatus(Long taskId, UpdateTaskStatusDTO dto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa não encontrada com o ID: " + taskId));

        task.setStatus(dto.getStatus());

        // A anotação @Transactional garante que a mudança será salva.
        return task;
    }
}