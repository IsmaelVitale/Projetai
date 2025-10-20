import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import {
    fetchProjectByCode,
    fetchTaskById,
    updateTaskStatus,
    updateTask,
    addChecklistItemToTask,
    updateChecklistItem,
    deleteChecklistItem,
    addCommentToTask,
    updateComment,
    deleteComment,
    addTaskToProject,
} from '../services/apiService';

import KanbanColumn from '../components/KanbanColumn.jsx';
import TaskDetailModal from '../components/TaskDetailModal.jsx';
import TaskCard from '../components/TaskCard.jsx';
import QuickAddTask from '../components/QuickAddTask.jsx';
// Novo modal de projeto (será enviado em seguida)
import ProjectDetailModal from '../components/ProjectDetailModal.jsx';

import './ProjectView.css';

function ProjectView() {
    const { projectCode } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedTask, setSelectedTask] = useState(null);
    const [activeTask, setActiveTask] = useState(null);

    // Modal de detalhes do PROJETO
    const [showProjectModal, setShowProjectModal] = useState(false);

    // Quick add
    const [creatingQuick, setCreatingQuick] = useState(false);
    const quickAddApi = useRef(null);

    // Sensores DnD
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    // --- Carregar projeto por código ---
    const loadProject = () => {
        setLoading(true);
        fetchProjectByCode(projectCode)
            .then((data) => {
                setProject(data);
            })
            .catch((error) => {
                console.error('Erro ao buscar projeto:', error);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProject();
    }, [projectCode]);

    // Mantém modal de tarefa sincronizado quando o objeto project muda
    useEffect(() => {
        if (project && selectedTask) {
            const updatedTask = project.tasks?.find((t) => t.id === selectedTask.id);
            if (updatedTask) setSelectedTask(updatedTask);
        }
    }, [project]); // eslint-disable-line react-hooks/exhaustive-deps

    // Permitir que o Header abra o modal via CustomEvent (sem mexer no App)
    useEffect(() => {
        const open = () => setShowProjectModal(true);
        window.addEventListener('project:open-details', open);
        return () => window.removeEventListener('project:open-details', open);
    }, []);

    // ----- Helpers: ordenação por data -----
    const byDueDate = (a, b) => {
        const ap = a?.dueDate ? Date.parse(a.dueDate) : NaN;
        const bp = b?.dueDate ? Date.parse(b.dueDate) : NaN;
        const aHas = !Number.isNaN(ap);
        const bHas = !Number.isNaN(bp);
        if (aHas && bHas) return ap - bp;
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        return (a.id ?? 0) - (b.id ?? 0);
    };
    const sortTasks = (list) => [...list].sort(byDueDate);

    // ----- Helpers: checklist e regras de status -----
    const getChecklistCounts = (task) => {
        const list = task?.checklist ?? task?.checklistItems ?? [];
        const total = Array.isArray(list) ? list.length : 0;
        const done = list.filter((i) =>
            i?.checked === true ||
            i?.completed === true ||
            i?.isCompleted === true ||
            i?.done === true ||
            String(i?.status ?? '').toUpperCase() === 'DONE' ||
            String(i?.status ?? '').toUpperCase() === 'COMPLETED'
        ).length;
        return { done, total };
    };

    const canMoveTo = (task, newStatus) => {
        const { done, total } = getChecklistCounts(task);
        const hasChecklist = total > 0;
        const allChecked = hasChecklist && done === total;

        if (newStatus === 'DONE') return !hasChecklist || allChecked;   // DONE: sem checklist OU todos marcados
        if (newStatus === 'TODO') return !hasChecklist || !allChecked;  // TODO: sem checklist OU NÃO todos marcados
        if (newStatus === 'DOING') return true;                         // DOING: sempre pode
        return false;
    };

    // ----- Quick Add -----
    const handleNewTaskClick = () => {
        // abre o QuickAdd
        quickAddApi.current?.open?.();
        // rola a coluna TODO pro topo (se quiser)
        document.getElementById('col-TODO')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const handleQuickCreate = async ({ title }) => {
        if (!project?.id) return;
        try {
            setCreatingQuick(true);
            const payload = { title, status: 'TODO', priority: 'MEDIUM' };
            const created = await addTaskToProject(project.id, payload);
            // anexa e o sort por data cuida da posição
            setProject((prev) => ({ ...prev, tasks: [...(prev.tasks || []), created] }));
        } catch (err) {
            console.error('Erro ao criar tarefa:', err);
            alert('Não foi possível criar a tarefa.');
        } finally {
            setCreatingQuick(false);
        }
    };

    // ----- DnD -----
    const handleDragStart = (event) => {
        const { active } = event;
        const task = project.tasks.find((t) => String(t.id) === String(active.id));
        setActiveTask(task);
    };

    const handleDragEnd = async (event) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const taskId = String(active.id);
        const overId = String(over.id);

        const task = project.tasks.find((t) => String(t.id) === taskId);
        if (!task) return;

        const overTask = project.tasks.find((t) => String(t.id) === overId);
        const newStatus = overTask ? overTask.status : overId;
        if (task.status === newStatus) return;

        // Regras
        if (!canMoveTo(task, newStatus)) {
            if (newStatus === 'DONE') {
                alert('Para concluir, complete todos os itens do checklist (ou remova o checklist).');
            } else if (newStatus === 'TODO') {
                alert('Não é possível voltar para "A Fazer" quando todos os itens do checklist estão concluídos.');
            }
            return;
        }

        // Otimista
        setProject((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) => (String(t.id) === taskId ? { ...t, status: newStatus } : t)),
        }));

        try {
            await updateTaskStatus(taskId, newStatus); // endpoint dedicado
            const fresh = await fetchTaskById(taskId);
            setProject((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) => (String(t.id) === taskId ? fresh : t)),
            }));
            if (selectedTask?.id && String(selectedTask.id) === taskId) setSelectedTask(fresh);
        } catch (err) {
            console.error('Falha ao atualizar o status:', err);
            alert('Não foi possível atualizar o status. O quadro será recarregado.');
            loadProject();
        }
    };

    // ----- Interações do modal de TAREFA -----
    const handleCardClick = async (task) => {
        try {
            const fullTaskData = await fetchTaskById(task.id);
            setSelectedTask(fullTaskData);
        } catch (err) {
            console.error('Falha ao buscar tarefa completa, abrindo com dados locais:', err);
            setSelectedTask(task);
        }
    };

    const handleCloseModal = () => setSelectedTask(null);

    const handleTaskUpdate = async (taskId, taskData) => {
        const updatedTask = await updateTask(taskId, taskData);
        if (updatedTask) {
            setSelectedTask(updatedTask);
            setProject((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
            }));
        } else {
            alert('Falha ao atualizar a tarefa.');
        }
    };

    const handleTaskDeleted = (taskId) => {
        setSelectedTask(null);
        setProject((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }));
    };

    // Checklist
    const handleChecklistItemAdd = async (itemData) => {
        if (!selectedTask) return;
        const newItem = await addChecklistItemToTask(selectedTask.id, itemData);
        if (newItem) {
            const updated = await fetchTaskById(selectedTask.id);
            setSelectedTask(updated);
            setProject((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
            }));
        }
    };

    const handleChecklistItemUpdate = async (itemId, updateData) => {
        if (!selectedTask) return;
        await updateChecklistItem(itemId, updateData);
        const updated = await fetchTaskById(selectedTask.id);
        setSelectedTask(updated);
        setProject((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
        }));
    };

    const handleChecklistItemDelete = async (itemId) => {
        if (!selectedTask) return;
        const success = await deleteChecklistItem(itemId);
        if (success) {
            const updated = await fetchTaskById(selectedTask.id);
            setSelectedTask(updated);
            setProject((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
            }));
        }
    };

    // Comentários
    const handleCommentAdd = async (commentData) => {
        if (!selectedTask) return;
        const newComment = await addCommentToTask(selectedTask.id, commentData);
        if (newComment) {
            const updated = await fetchTaskById(selectedTask.id);
            setSelectedTask(updated);
            setProject((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
            }));
        }
    };

    const handleCommentUpdate = async (commentId, commentData) => {
        if (!selectedTask) return;
        const updatedComment = await updateComment(commentId, commentData);
        if (updatedComment) {
            const updated = await fetchTaskById(selectedTask.id);
            setSelectedTask(updated);
            setProject((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
            }));
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!selectedTask) return;
        const success = await deleteComment(commentId);
        if (success) {
            const updated = await fetchTaskById(selectedTask.id);
            setSelectedTask(updated);
            setProject((prev) => ({
                ...prev,
                tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
            }));
        }
    };

    // --- Render ---
    if (loading) return <div className="loading-message">Carregando projeto...</div>;
    if (!project) return <div className="error-message">Projeto não encontrado.</div>;

    const tasks = project.tasks || [];
    const todoTasks = sortTasks(tasks.filter((task) => task.status === 'TODO'));
    const doingTasks = sortTasks(tasks.filter((task) => task.status === 'DOING'));
    const doneTasks = sortTasks(tasks.filter((task) => task.status === 'DONE'));

    const todoTaskIds = todoTasks.map((t) => String(t.id));
    const doingTaskIds = doingTasks.map((t) => String(t.id));
    const doneTaskIds = doneTasks.map((t) => String(t.id));

    return (
        <div className="project-view-container">
            {/* Header de página (somente título/descrição agora) */}
            <header className="project-header">
                <h1>{project.name}</h1>
                <p className="project-description">
                    {project.description || 'Este projeto não possui uma descrição.'}
                </p>
                {/* Removido o botão "Ver Detalhes do Projeto" daqui — agora vem do Header global */}
            </header>

            <div className="kanban-controls">
                <button onClick={handleNewTaskClick} className="new-task-btn">+ Nova Tarefa</button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-board">
                    <KanbanColumn
                        title="A Fazer"
                        tasks={todoTasks}
                        taskIds={todoTaskIds}
                        columnId="TODO"
                        onCardClick={handleCardClick}
                    >
                        <QuickAddTask
                            onCreate={handleQuickCreate}
                            creating={creatingQuick}
                            expose={(api) => (quickAddApi.current = api)}
                        />
                    </KanbanColumn>

                    <KanbanColumn
                        title="Em Andamento"
                        tasks={doingTasks}
                        taskIds={doingTaskIds}
                        columnId="DOING"
                        onCardClick={handleCardClick}
                    />

                    <KanbanColumn
                        title="Concluído"
                        tasks={doneTasks}
                        taskIds={doneTaskIds}
                        columnId="DONE"
                        onCardClick={handleCardClick}
                    />
                </div>

                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
                </DragOverlay>
            </DndContext>

            {/* Modal da tarefa */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={handleCloseModal}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDeleted={handleTaskDeleted}
                    onCommentAdd={handleCommentAdd}
                    onCommentDelete={handleCommentDelete}
                    onChecklistItemUpdate={handleChecklistItemUpdate}
                    onChecklistItemAdd={handleChecklistItemAdd}
                    onChecklistItemDelete={handleChecklistItemDelete}
                    onCommentUpdate={handleCommentUpdate}
                />
            )}

            {/* Modal do projeto (novo) */}
            {showProjectModal && (
                <ProjectDetailModal
                    project={project}
                    onClose={() => setShowProjectModal(false)}
                    onProjectUpdated={(updated) => setProject((prev) => ({ ...prev, ...updated }))}
                    onProjectDeleted={() => {
                        // comportamento simples: volta para home após exclusão
                        window.location.href = '/';
                    }}
                />
            )}
        </div>
    );
}

export default ProjectView;
