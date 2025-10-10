package br.com.projetei.api.dto;

import br.com.projetei.api.model.enums.TaskPriority;
import java.time.LocalDate;

public class UpdateTaskDTO {
    private LocalDate dueDate;
    private TaskPriority priority;
    private String description;
    private String title;

    // Getters e Setters
    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}