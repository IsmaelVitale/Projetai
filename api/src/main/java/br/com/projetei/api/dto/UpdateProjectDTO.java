package br.com.projetei.api.dto;

import java.time.LocalDate;

public class UpdateProjectDTO {
    private String name;
    private String description;
    private LocalDate dueDate;

    // Getters e Setters para todos os campos
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}