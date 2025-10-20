// src/services/apiService.js
const API_BASE =
    (import.meta?.env?.VITE_API_URL || 'http://localhost:8081') + '/api';

async function http(path, { method = 'GET', body, headers } = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        // Tenta extrair mensagem do backend
        let msg = res.statusText;
        try {
            const data = await res.json();
            msg = data?.message || data?.error || msg;
        } catch {
            // ignora
        }
        throw new Error(`HTTP ${res.status} - ${msg}`);
    }

    // 204 No Content
    if (res.status === 204) return null;

    // JSON
    return res.json();
}

/* ===================== Projects ===================== */
export function fetchProjects() {
    return http('/projects');
}

export function fetchProjectByCode(code) {
    return http(`/projects/by-code/${encodeURIComponent(code)}`);
}

export function createProject(payload) {
    // payload: { name, dueDate, description? }
    return http('/projects', { method: 'POST', body: payload });
}

// Buscar projeto por ID (além de by-code)
export function fetchProjectById(projectId) {
    return http(`/projects/${projectId}`, { method: 'GET' });
}

// Atualizar projeto (nome, descrição, dueDate)
export function updateProject(projectId, data) {
    // data pode conter: { name, description, dueDate }
    return http(`/projects/${projectId}`, { method: 'PATCH', body: data });
}

// Excluir projeto
export function deleteProject(projectId) {
    return http(`/projects/${projectId}`, { method: 'DELETE' });
}


/* (Opcional) tarefas do projeto, se o backend expõe */
export function fetchTasksByProject(projectId) {
    return http(`/projects/${projectId}/tasks`);
}

/* ===================== Tasks ===================== */
export function fetchTaskById(taskId) {
    return http(`/tasks/${taskId}`);
}

export function updateTask(taskId, patch) {
    return http(`/tasks/${taskId}`, { method: 'PATCH', body: patch });
}

export function deleteTask(taskId) {
    return http(`/tasks/${taskId}`, { method: 'DELETE' });
}

/* Atualizar status (a partir do DnD) */
export function updateTaskStatus(taskId, newStatus) {
    // Se seu backend aceita PATCH direto: { status }
    // return updateTask(taskId, { status: newStatus });
    // Caso exista um endpoint dedicado (/tasks/{id}/status), troque aqui:
    return http(`/tasks/${taskId}/status`, { method:'PATCH', body:{ status:newStatus } });
}

/* ===================== Checklist ===================== */
export function addChecklistItemToTask(taskId, item) {
    // item: { text }
    return http(`/tasks/${taskId}/checklist-items`, { method: 'POST', body: item });
}

export function updateChecklistItem(itemId, patch) {
    return http(`/checklist-items/${itemId}`, { method: 'PATCH', body: patch });
}

export function deleteChecklistItem(itemId) {
    return http(`/checklist-items/${itemId}`, { method: 'DELETE' });
}

/* ===================== Comments ===================== */
export function addCommentToTask(taskId, comment) {
    // comment: { text, authorName? }
    return http(`/tasks/${taskId}/comments`, { method: 'POST', body: comment });
}

export function updateComment(commentId, patch) {
    return http(`/comments/${commentId}`, { method: 'PATCH', body: patch });
}

export function deleteComment(commentId) {
    return http(`/comments/${commentId}`, { method: 'DELETE' });
}
export function addTaskToProject(projectId, taskData) {
    // taskData pode ter: { title, description?, dueDate?, priority?, status? }
    return http(`/projects/${projectId}/tasks`, {
        method: 'POST',
        body: taskData,
    });
}