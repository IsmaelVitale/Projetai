import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// --- [DND-KIT] 1. IMPORTAÇÕES NECESSÁRIAS ---
// DndContext: Gerencia o estado de arrastar e soltar.
// DragOverlay: Cria um "fantasma" do item arrastado para uma experiência fluida.
// closestCenter: Algoritmo de detecção de colisão.
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';

import {
    fetchProjectByCode,
    updateChecklistItem,
    fetchTaskById,
    addCommentToTask,
    deleteComment,
    updateTask,
    addChecklistItemToTask,
    deleteChecklistItem,
    updateComment,
    updateTaskStatus
} from '../services/apiService';
import KanbanColumn from '../components/KanbanColumn.jsx';
import TaskDetailModal from '../components/TaskDetailModal.jsx';
// Adicionamos o TaskCard aqui para usá-lo no DragOverlay
import TaskCard from '../components/TaskCard.jsx';
import './ProjectView.css';

function ProjectView() {
    const { projectCode } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

    // --- [DND-KIT] ALTERAÇÃO: Estado para o card ativo ---
    // Guarda a informação da tarefa que está sendo arrastada para usar no DragOverlay.
    const [activeTask, setActiveTask] = useState(null);

    // Função para carregar/recarregar os dados completos do projeto
    const loadProject = () => {
        fetchProjectByCode(projectCode)
            .then(data => {
                setProject(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erro ao buscar projeto:", error);
                setLoading(false);
            });
    };

    // Efeito para carregar o projeto na primeira vez ou quando o código na URL muda
    useEffect(() => {
        loadProject();
    }, [projectCode]);

    useEffect(() => {
        if (project && selectedTask) {
            const updatedTask = project.tasks.find(task => task.id === selectedTask.id);
            if (updatedTask) {
                setSelectedTask(updatedTask);
            }
        }
    }, [project]);

    // --- [CORREÇÃO DEFINITIVA] ---
    // A função handleDragStart agora encontra a tarefa e a armazena no estado 'activeTask'.
    const handleDragStart = (event) => {
        const { active } = event;
        const task = project.tasks.find(t => t.id.toString() === active.id.toString());
        setActiveTask(task);
    };

// --- [CORREÇÃO DEFINITIVA] ---
    // A função handleDragEnd foi refinada para garantir a comparação correta dos IDs como strings.
    const handleDragEnd = (event) => {
        setActiveTask(null);
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id.toString();
        const newStatus = over.id.toString();
        const task = project.tasks.find(t => t.id.toString() === taskId);

        if (task && task.status === newStatus) return;

        setProject(prevProject => {
            const updatedTasks = prevProject.tasks.map(t => {
                if (t.id.toString() === taskId) {
                    return { ...t, status: newStatus };
                }
                return t;
            });
            return { ...prevProject, tasks: updatedTasks };
        });

        updateTaskStatus(taskId, newStatus).catch(error => {
            console.error("Falha ao atualizar a tarefa:", error);
            loadProject();
            alert("Não foi possível mover a tarefa. Tente novamente.");
        });
    };


    // Função para lidar com a atualização de um item de checklist
    const handleChecklistItemUpdate = async (itemId, updateData) => {
        await updateChecklistItem(itemId, updateData);
        loadProject();
    };

    // Função para lidar com o clique em um card de tarefa, abrindo o modal
    const handleCardClick = (task) => {
        fetchTaskById(task.id).then(fullTaskData => {
            setSelectedTask(fullTaskData);
        });
    };

    // Função para fechar o modal
    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    // Função para adicionar um novo comentário
    const handleCommentAdd = async (commentData) => {
        if (!selectedTask) return;
        const newComment = await addCommentToTask(selectedTask.id, commentData);
        if (newComment) {
            handleCardClick(selectedTask);
        }
    };

    // Função para deletar um comentário
    const handleCommentDelete = async (commentId) => {
        if (!selectedTask) return;
        const success = await deleteComment(commentId);
        if (success) {
            handleCardClick(selectedTask);
        }
    };

    // Função para atualizar os dados da tarefa (título, descrição, etc.)
    const handleTaskUpdate = async (taskId, taskData) => {
        const updatedTask = await updateTask(taskId, taskData);
        if (updatedTask) {
            handleCardClick(updatedTask);
            loadProject();
        } else {
            alert('Falha ao atualizar a tarefa.');
        }
    };

    // Função para adicionar item ao checklist
    const handleChecklistItemAdd = async (itemData) => {
        if (!selectedTask) return;
        const newItem = await addChecklistItemToTask(selectedTask.id, itemData);
        if (newItem) {
            handleCardClick(selectedTask);
        }
    };

    // Função para deletar item do checklist
    const handleChecklistItemDelete = async (itemId) => {
        if (!selectedTask) return;
        const success = await deleteChecklistItem(itemId);
        if (success) {
            handleCardClick(selectedTask);
        }
    };

    // Função para atualizar um comentário
    const handleCommentUpdate = async (commentId, commentData) => {
        if (!selectedTask) return;
        const updatedComment = await updateComment(commentId, commentData);
        if (updatedComment) {
            handleCardClick(selectedTask);
        }
    };

    const handleViewDetailsClick = () => alert('Modal "Detalhes do Projeto" a ser implementado.');

    const handleNewTaskClick = () => {
        alert('Abrir modal para criar nova tarefa (a ser implementado)');
    };

    if (loading) {
        return <div className="loading-message">Carregando projeto...</div>;
    }
    if (!project) {
        return <div className="error-message">Projeto não encontrado.</div>;
    }

    const tasks = project.tasks || [];
    const todoTasks = tasks.filter(task => task.status === 'TODO');
    const doingTasks = tasks.filter(task => task.status === 'DOING');
    const doneTasks = tasks.filter(task => task.status === 'DONE');

    // --- [CORREÇÃO DEFINITIVA] ---
    // Criamos arrays de IDs (como strings) para passar para cada KanbanColumn.
    // Isso garante que o SortableContext receba os dados no formato exato que ele espera.
    const todoTaskIds = todoTasks.map(t => t.id.toString());
    const doingTaskIds = doingTasks.map(t => t.id.toString());
    const doneTaskIds = doneTasks.map(t => t.id.toString());

    return (
        <div className="project-view-container">
            <header className="project-header">
                <h1>{project.name}</h1>
                <p className="project-description">{project.description || "Este projeto não possui uma descrição."}</p>
                <div className="project-actions">
                    <button onClick={handleViewDetailsClick} className="details-btn">Ver Detalhes do Projeto</button>
                </div>
            </header>
            <div className="kanban-controls">
                <button onClick={handleNewTaskClick} className="new-task-btn">+ Nova Tarefa</button>
            </div>
            <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="kanban-board">
                    {/* Passamos os IDs pré-calculados para cada coluna */}
                    <KanbanColumn title="A Fazer" tasks={todoTasks} taskIds={todoTaskIds} columnId="TODO" onCardClick={handleCardClick} />
                    <KanbanColumn title="Em Andamento" tasks={doingTasks} taskIds={doingTaskIds} columnId="DOING" onCardClick={handleCardClick} />
                    <KanbanColumn title="Concluído" tasks={doneTasks} taskIds={doneTaskIds} columnId="DONE" onCardClick={handleCardClick} />
                </div>
                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} isOverlay={true} /> : null}
                </DragOverlay>
            </DndContext>
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={handleCloseModal}
                    onTaskUpdate={handleTaskUpdate}
                    onCommentAdd={handleCommentAdd}
                    onCommentDelete={handleCommentDelete}
                    onChecklistItemUpdate={handleChecklistItemUpdate}
                    onChecklistItemAdd={handleChecklistItemAdd}
                    onChecklistItemDelete={handleChecklistItemDelete}
                    onCommentUpdate={handleCommentUpdate}
                />
            )}
        </div>
    );
}

export default ProjectView;
