import { SortableContext } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard.jsx';
import './KanbanColumn.css';

export default function KanbanColumn({ title, columnId, tasks, taskIds, onCardClick, children }) {
    const { setNodeRef, isOver } = useDroppable({ id: columnId });

    return (
        <section className="kanban-column" id={`col-${columnId}`}>
            <header className="kanban-column-header">
                <h3>{title}</h3>
            </header>

            {/* Quick Add no topo (só ocupa espaço quando estiver aberto) */}
            {children && <div className="kanban-quickadd-slot">{children}</div>}

            {/* Dropzone */}
            <div ref={setNodeRef} className={`kanban-dropzone${isOver ? ' is-over' : ''}`}>
                <SortableContext items={taskIds}>
                    <div className="kanban-cards">
                        {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} onCardClick={onCardClick} />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </section>
    );
}
