import './TaskCard.css';
import { FaRegCalendarAlt, FaAlignLeft, FaCheckSquare } from 'react-icons/fa';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const priorityMap = {
    LOW: { label: 'Baixa', color: '#3b82f6', icon: '↓' },
    MEDIUM: { label: 'Média', color: '#f97316', icon: '•' },
    HIGH: { label: 'Alta', color: '#ef4444', icon: '↑' },
};

function TaskCard({ task, onCardClick, isOverlay }) {
    const priority = priorityMap[task.priority] || priorityMap.MEDIUM;
    const totalChecklistItems = task.checklist?.length || 0;
    const completedChecklistItems = task.checklist?.filter(item => item.checked).length || 0;
    const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }) : null;

    // --- [CORREÇÃO DEFINITIVA] ---
    // O ID passado para o `useSortable` é explicitamente convertido para string.
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const cardClasses = `task-card ${isOverlay ? 'is-overlay' : ''}`;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cardClasses}
        >
            <div onClick={() => !isDragging && onCardClick && onCardClick(task)} style={{ cursor: 'pointer' }}>
                <h4>{task.title}</h4>

                <div className="task-details">
                    <span className="priority-tag" style={{ backgroundColor: priority.color }}>
                        {priority.icon} {priority.label}
                    </span>
                    {totalChecklistItems > 0 && (
                        <span className="checklist-progress">
                            <FaCheckSquare /> {completedChecklistItems}/{totalChecklistItems}
                        </span>
                    )}
                </div>

                <div className="task-extra-details">
                    {formattedDate && (
                        <span className="detail-item">
                            <FaRegCalendarAlt /> {formattedDate}
                        </span>
                    )}
                    {task.description && (
                        <span className="detail-item description-preview">
                            <FaAlignLeft /> {task.description}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TaskCard;

