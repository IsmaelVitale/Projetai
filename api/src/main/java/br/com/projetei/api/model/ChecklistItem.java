package br.com.projetei.api.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "checklist_items")
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String text;

    // --- CORREÇÃO AQUI ---
    // Renomeamos o campo de "isChecked" para "checked" para seguir a convenção Java Beans.
    @Column(name = "is_checked")
    private boolean checked = false;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    @JsonBackReference
    private Task task;

    // Getters e Setters (agora corretos para o campo 'checked')
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    // --- CORREÇÃO AQUI ---
    // O getter para um campo 'checked' é 'isChecked()'
    public boolean isChecked() { return checked; }
    // O setter para um campo 'checked' é 'setChecked()'
    public void setChecked(boolean checked) { this.checked = checked; }

    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
}