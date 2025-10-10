package br.com.projetei.api.dto;

public class CommentDTO {
    private String text;
    private String authorName;

    // Getters e Setters
    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }
    public String getAuthorName() {
        return authorName;
    }
    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }
}