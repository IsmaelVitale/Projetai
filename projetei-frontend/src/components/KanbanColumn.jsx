import TaskCard from './TaskCard.jsx';
import './KanbanColumn.css';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

// --- [CORREÇÃO DEFINITIVA] ---
// O componente agora recebe 'taskIds' como uma prop separada.
function KanbanColumn({ title, tasks, taskIds, columnId, onCardClick }) {

    const { setNodeRef } = useDroppable({ id: columnId });

    return (
        <div className="kanban-column">
            <h3 className="column-title">{title}</h3>

            {/* --- [CORREÇÃO DEFINITIVA] --- */}
            {/* O `SortableContext` agora usa a lista de IDs (strings) que recebeu via props. */}
            <SortableContext id={columnId} items={taskIds} strategy={verticalListSortingStrategy}>
                <div ref={setNodeRef} className="column-content">
                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onCardClick={onCardClick}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

export default KanbanColumn;

