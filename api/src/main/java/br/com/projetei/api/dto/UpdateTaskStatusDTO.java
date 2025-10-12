package br.com.projetei.api.dto;

import br.com.projetei.api.model.enums.TaskStatus;

public class UpdateTaskStatusDTO {

    private TaskStatus status;

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }
}