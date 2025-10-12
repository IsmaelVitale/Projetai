import {useState, useEffect, useRef} from 'react';
import { useParams } from 'react-router-dom';

// --- [DND-KIT] 1. IMPORTAÇÕES NECESSÁRIAS ---
// DndContext: Gerencia o estado de arrastar e soltar.
// DragOverlay: Cria um "fantasma" do item arrastado para uma experiência fluida.
// closestCenter: Algoritmo de detecção de colisão.
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';


import {
    fetchProjectByCode,
    updateChecklistItem,
    fetchTaskById,
    addTaskToProject,
    addCommentToTask,
    deleteComment,
    updateTask,
    addChecklistItemToTask,
    deleteChecklistItem,
    updateComment,
    updateTaskStatus

} from '../services/apiService';
import QuickAddTask from '../components/QuickAddTask.jsx';
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

    const [creatingQuick, setCreatingQuick] = useState(false);
    const quickAddApi = useRef(null);

    const handleQuickCreate = async ({ title }) => {
        if (!project?.id) return;
        try {
            setCreatingQuick(true);
            const payload = {
                title,
                status: 'TODO',     // cai direto na coluna "A Fazer"
                priority: 'MEDIUM', // default
            };
            const created = await addTaskToProject(project.id, payload);

            // Atualiza board otimistamente com a resposta da API
            setProject(prev => ({ ...prev, tasks: [...(prev.tasks || []), created] }));



        } catch (err) {
            console.error('Erro ao criar tarefa:', err);
            alert('Não foi possível criar a tarefa.');
        } finally {
            setCreatingQuick(false);
        }
    };

    const handleNewTaskClick = () => {
        quickAddApi.current?.open();
        // (opcional) rolar a coluna até o topo
        document.getElementById('col-TODO')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };


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

    const handleDragEnd = async (event) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const taskId = String(active.id);
        const overId = String(over.id);

        const task = project.tasks.find(t => String(t.id) === taskId);
        if (!task) return;

        // Se soltou em cima de um CARD, a coluna é a do card; se soltou na COLUNA, overId já é o status
        const overTask = project.tasks.find(t => String(t.id) === overId);
        const newStatus = overTask ? overTask.status : overId; // "TODO" | "DOING" | "DONE"

        if (task.status === newStatus) return;

        // 🔒 Regras de negócio
        if (!canMoveTo(task, newStatus)) {
            if (newStatus === 'DONE') {
                alert('Para concluir, complete todos os itens do checklist (ou remova o checklist).');
            } else if (newStatus === 'TODO') {
                alert('Não é possível voltar para "A Fazer" quando todos os itens do checklist estão concluídos.');
            }
            return;
        }


        // ✅ Atualização otimista
        setProject(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => String(t.id) === taskId ? { ...t, status: newStatus } : t),
        }));

        try {
            // 🔗 Persiste no backend (endpoint novo)
            const saved = await updateTaskStatus(taskId, newStatus);

            // 🔄 Sincroniza a tarefa com o backend (caso backend ajuste algo)
            // Se o endpoint já retorna a Task completa, você pode usar `saved`.
            const fresh = await fetchTaskById(taskId);
            setProject(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => String(t.id) === taskId ? fresh : t),
            }));
            if (selectedTask?.id && String(selectedTask.id) === taskId) {
                setSelectedTask(fresh);
            }
        } catch (err) {
            // Se o backend bloquear pelas regras, retornar 409 é o ideal
            if (err?.status === 409) {
                alert('Movimentação inválida de acordo com as regras do checklist.');
            } else {
                alert('Não foi possível atualizar o status. O quadro será recarregado.');
            }
            loadProject(); // rollback seguro
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    // Função para lidar com o clique em um card de tarefa, abrindo o modal
    const handleCardClick = async (task) => {
        try {
            const fullTaskData = await fetchTaskById(task.id);
            setSelectedTask(fullTaskData);
        } catch (err) {
            console.error('Falha ao buscar tarefa completa, abrindo com dados locais:', err);
            // Fallback: abre o modal com o que já temos (parcial), melhor do que não abrir
            setSelectedTask(task);
        }
    };

    // Função para fechar o modal
    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    // Função para atualizar os dados da tarefa (título, descrição, etc.)
    const handleTaskUpdate = async (taskId, taskData) => {
        const updatedTask = await updateTask(taskId, taskData);
        if (updatedTask) {
            setSelectedTask(updatedTask);
            setProject(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
            }));
        } else {
            alert('Falha ao atualizar a tarefa.');
        }
    };

    const handleTaskDeleted = (taskId) => {
        setSelectedTask(null); // fecha o modal
        setProject(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== taskId)
        }));
    };



    // Função para adicionar item ao checklist
    const handleChecklistItemAdd = async (itemData) => {
        if (!selectedTask) return;
        const newItem = await addChecklistItemToTask(selectedTask.id, itemData);
        if (newItem) {
            const updated = await fetchTaskById(selectedTask.id);
            setSelectedTask(updated);
            setProject(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === updated.id ? updated : t)
            }));
        }
    };

    const handleChecklistItemUpdate = async (itemId, updateData) => {
        if (!selectedTask) return;
        await updateChecklistItem(itemId, updateData);
        const updated = await fetchTaskById(selectedTask.id);
        setSelectedTask(updated);
        setProject(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === updated.id ? updated : t)
        }));
    };


    // Função para deletar item do checklist
    const handleChecklistItemDelete = async (itemId) => {
        if (!selectedTask) return;
        const success = await deleteChecklistItem(itemId);
        if (success) {
            const updated = await fetchTaskById(selectedTask.id);
            setSelectedTask(updated);
            setProject(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === updated.id ? updated : t)
            }));
        }
    };

    const handleCommentAdd = async (commentData) => {
        if (!selectedTask) return;
        const newComment = await addCommentToTask(selectedTask.id, commentData);
        if (newComment) {
            const updated = await fetchTaskById(selectedTask.id);
            setSelectedTask(updated);
            setProject(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === updated.id ? updated : t)
            }));
        }
    };

    // Função para atualizar um comentário
    const handleCommentUpdate = async (commentId, commentData) => {
        if (!selectedTask) return;
        const updatedComment = await updateComment(commentId, commentData);
        if (updatedComment) {
            const updated = await fetchTaskById(selectedTask.id);
            setSelectedTask(updated);
            setProject(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === updated.id ? updated : t)
            }));
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!selectedTask) return;
        const success = await deleteComment(commentId);
        if (success) {
            const updated = await fetchTaskById(selectedTask.id);
            setSelectedTask(updated);
            setProject(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === updated.id ? updated : t)
            }));
        }
    };

    // Conta itens de checklist concluídos/total (compatível com seu backend)
    const getChecklistCounts = (task) => {
        const list = task?.checklist ?? task?.checklistItems ?? [];
        const total = Array.isArray(list) ? list.length : 0;
        const done  = list.filter(i =>
            i?.checked === true ||
            i?.completed === true ||
            i?.isCompleted === true ||
            i?.done === true ||
            String(i?.status ?? '').toUpperCase() === 'DONE' ||
            String(i?.status ?? '').toUpperCase() === 'COMPLETED'
        ).length;
        return { done, total };
    };

    // Valida se pode mover para newStatus de acordo com o checklist
    const canMoveTo = (task, newStatus) => {
        const list = task?.checklist ?? task?.checklistItems ?? [];
        const total = Array.isArray(list) ? list.length : 0;
        const done  = list.filter(i =>
            i?.checked === true ||
            i?.completed === true ||
            i?.isCompleted === true ||
            i?.done === true ||
            String(i?.status ?? '').toUpperCase() === 'DONE' ||
            String(i?.status ?? '').toUpperCase() === 'COMPLETED'
        ).length;

        const hasChecklist = total > 0;
        const allChecked   = hasChecklist && done === total;

        if (newStatus === 'DONE')  return !hasChecklist || allChecked; // DONE: sem checklist OU todos marcados
        if (newStatus === 'TODO')  return !hasChecklist || !allChecked; // TODO: sem checklist OU NÃO todos marcados (↩️ ajuste aqui)
        if (newStatus === 'DOING') return true;                        // DOING: sempre pode

        return false;
    };



    const handleViewDetailsClick = () => alert('Modal "Detalhes do Projeto" a ser implementado.');

    if (loading) {
        return <div className="loading-message">Carregando projeto...</div>;
    }
    if (!project) {
        return <div className="error-message">Projeto não encontrado.</div>;
    }

    // helper: data mais antiga primeiro; sem data vai pro final
    const byDueDate = (a, b) => {
        const ap = a?.dueDate ? Date.parse(a.dueDate) : NaN;
        const bp = b?.dueDate ? Date.parse(b.dueDate) : NaN;
        const aHas = !Number.isNaN(ap);
        const bHas = !Number.isNaN(bp);
        if (aHas && bHas) return ap - bp;
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        return (a.id ?? 0) - (b.id ?? 0); // desempate estável
    };

    const sortTasks = (list) => [...list].sort(byDueDate);

    const tasks = project.tasks || [];
    const todoTasks = sortTasks(tasks.filter(t => t.status === 'TODO'));
    const doingTasks = sortTasks(tasks.filter(t => t.status === 'DOING'));
    const doneTasks  = sortTasks(tasks.filter(t => t.status === 'DONE'));


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
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-board">
                    {/* Passamos os IDs pré-calculados para cada coluna */}
                    <KanbanColumn
                        title="A Fazer"
                        tasks={todoTasks}
                        taskIds={todoTaskIds}
                        columnId="TODO"
                        onCardClick={handleCardClick}
                    >
                        <div id="quickadd-todo">
                            <QuickAddTask
                                onCreate={handleQuickCreate}
                                creating={creatingQuick}
                                expose={(api) => (quickAddApi.current = api)}
                            />
                        </div>
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
                    {activeTask ? <TaskCard task={activeTask} isOverlay={true} /> : null}
                </DragOverlay>
            </DndContext>
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
        </div>
    );
}

export default ProjectView;
