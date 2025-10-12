import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './TaskCard.css';

// --- Helpers ----------------------------------------------------

function formatDate(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        try { return new Date(String(iso).slice(0, 10)).toLocaleDateString('pt-BR'); }
        catch { return String(iso); }
    }
    return d.toLocaleDateString('pt-BR');
}

// Aceita vários formatos vindos do backend e normaliza
function normalizePriority(value) {
    if (!value) return { cls: 'none', label: '—' };
    const raw = String(value).trim().toUpperCase();
    if (['HIGH', 'ALTA'].includes(raw))   return { cls: 'high',   label: 'Alta' };
    if (['MEDIUM', 'MEDIA', 'MÉDIA'].includes(raw)) return { cls: 'medium', label: 'Média' };
    if (['LOW', 'BAIXA'].includes(raw))   return { cls: 'low',    label: 'Baixa' };
    return { cls: 'none', label: String(value) }; // fallback: mostra o que veio
}

function getChecklistCounts(task) {
    const list = task?.checklistItems ?? task?.checklist ?? [];
    const total = Array.isArray(list) ? list.length : 0;

    const done = list.filter(i =>
        i?.checked === true ||
        i?.completed === true ||
        i?.isCompleted === true ||
        i?.done === true ||
        String(i?.status ?? '').toUpperCase() === 'DONE' ||
        String(i?.status ?? '').toUpperCase() === 'COMPLETED'
    ).length;

    return { done, total };
}


// Calcula o progresso do checklist de forma defensiva
function calcChecklistProgress(task) {
    const list = task?.checklistItems ?? task?.checklist ?? [];

    // Se o backend já manda agregados, use-os
    const totalAgg = task?.checklistTotal ?? task?.checklistCount ?? null;
    const doneAgg = task?.checklistCompleted ?? task?.checklistDone ?? null;

    if (Number.isFinite(totalAgg) && Number.isFinite(doneAgg) && totalAgg > 0) {
        return Math.round((doneAgg / totalAgg) * 100);
    }

    // Caso clássico: array de itens
    if (Array.isArray(list) && list.length > 0) {
        const done = list.filter(i =>
            i?.checked === true ||               // <- seu backend usa isso
            i?.completed === true ||
            i?.isCompleted === true ||
            i?.done === true ||
            String(i?.status ?? '').toUpperCase() === 'DONE' ||
            String(i?.status ?? '').toUpperCase() === 'COMPLETED'
        ).length;
        return Math.round((done / list.length) * 100);
    }

    return 0;
}


// --- Component --------------------------------------------------

export default function TaskCard({ task, onCardClick, isOverlay = false }) {
    const id = String(task.id);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    const due = formatDate(task.dueDate);
    const { cls: priorityCls, label: priorityLabel } = normalizePriority(task.priority);
    const progress = calcChecklistProgress(task);
    const { done, total } = getChecklistCounts(task);


    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`task-card${isOverlay ? ' is-overlay' : ''}`}
            onClick={() => onCardClick?.(task)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCardClick?.(task);
                }
            }}
            {...attributes}
            {...listeners}
            role="button"
            tabIndex={0}
        >
            <div className="task-title">{task.title || task.name || 'Tarefa'}</div>

            <div className="task-meta">
                <span className={`priority ${priorityCls}`}>{priorityLabel}</span>
                {due && <span className="due">{due}</span>}
            </div>

            {task.description && (
                <div className="description-preview">
                    {String(task.description).length > 160
                        ? String(task.description).slice(0, 160) + '…'
                        : task.description}
                </div>
            )}

            <div className="task-progress">
                <div className="task-progress-track">
                    <div className="task-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="task-progress-count">
                    {done}/{total}
                </div>
            </div>

        </div>
    );
}
