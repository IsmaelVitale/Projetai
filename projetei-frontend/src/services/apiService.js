const API_BASE_URL = 'http://localhost:8081/api';

// Função para buscar todos os projetos
export const fetchProjects = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        if (!response.ok) {
            throw new Error('Falha ao buscar projetos da API');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro no serviço de API:", error);
        return []; // Em caso de erro, retorna uma lista vazia para não quebrar a aplicação.
    }
};

export const createProject = async (projectData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        });

        if (!response.ok) {
            throw new Error('Falha ao criar o projeto');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao criar projeto:", error);
        return null; // Retorna nulo em caso de erro
    }
};

export const fetchProjectByCode = async (code) => {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/by-code/${code}`);
        if (!response.ok) {
            throw new Error('Projeto não encontrado');
        }
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar projeto por código:", error);
        return null; // Retorna nulo se o projeto não for encontrado ou der erro
    }
};

export const updateChecklistItem = async (itemId, updateData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/checklist-items/${itemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            // Agora enviamos um objeto genérico com os dados a serem atualizados
            body: JSON.stringify(updateData),
        });
        if (!response.ok) {
            throw new Error('Falha ao atualizar o item de checklist');
        }
        return await response.json();
    } catch (error) {
        console.error("Erro ao atualizar item de checklist:", error);
        return null;
    }
};

export const fetchTaskById = async (taskId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
        if (!response.ok) {
            throw new Error('Tarefa não encontrada');
        }
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar tarefa por ID:", error);
        return null;
    }
};

export const addCommentToTask = async (taskId, commentData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commentData),
        });
        if (!response.ok) {
            throw new Error('Falha ao adicionar comentário');
        }
        return await response.json();
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        return null;
    }
};

export const deleteComment = async (commentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Falha ao deletar comentário');
        }
        return true; // Retorna sucesso
    } catch (error) {
        console.error("Erro ao deletar comentário:", error);
        return false; // Retorna falha
    }
};

export const updateTask = async (taskId, taskData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        });
        if (!response.ok) {
            throw new Error('Falha ao atualizar a tarefa');
        }
        return await response.json();
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        return null;
    }
};

export const addChecklistItemToTask = async (taskId, itemData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/checklist-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
        });
        if (!response.ok) {
            throw new Error('Falha ao adicionar item ao checklist');
        }
        return await response.json();
    } catch (error) {
        console.error("Erro ao adicionar item ao checklist:", error);
        return null;
    }
};

export const deleteChecklistItem = async (itemId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/checklist-items/${itemId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Falha ao deletar o item do checklist');
        }
        return true; // Retorna sucesso
    } catch (error) {
        console.error("Erro ao deletar item do checklist:", error);
        return false;
    }
};

export const updateComment = async (commentId, commentData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commentData),
        });
        if (!response.ok) {
            throw new Error('Falha ao atualizar o comentário');
        }
        return await response.json();
    } catch (error) {
        console.error("Erro ao atualizar comentário:", error);
        return null;
    }
};

export const updateTaskStatus = async (taskId, newStatus) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            throw new Error('Falha ao atualizar o status da tarefa');
        }
        return await response.json();
    } catch (error) {
        console.error("Erro ao atualizar status da tarefa:", error);
        return null;
    }
};
