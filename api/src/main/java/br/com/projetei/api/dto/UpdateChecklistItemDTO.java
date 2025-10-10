package br.com.projetei.api.dto;

public class UpdateChecklistItemDTO {
    private String text;
    private Boolean checked; // Renomeado de "isChecked" para "checked"

    // Getters e Setters
    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }

    // O getter para um campo 'checked' é 'isChecked()'
    public Boolean isChecked() {
        return checked;
    }
    // O setter para um campo 'checked' é 'setChecked()'
    public void setChecked(Boolean checked) {
        this.checked = checked;
    }
}