import { useState, useEffect } from 'react';
import './TaskDetailModal.css';
import { FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';
import {deleteTask} from "../services/apiService.js";
import ConfirmModal from './ConfirmModal.jsx';


const priorityLabels = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta'
};

function TaskDetailModal({
                             task,
                             onClose,
                             onTaskUpdate,
                             onCommentAdd,
                             onCommentDelete,
                             onChecklistItemUpdate,
                             onChecklistItemAdd,
                             onChecklistItemDelete,
                             onCommentUpdate,
                             onTaskDeleted
                         }) {

    // Estados para os campos principais da tarefa (usados na edição)
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('MEDIUM');

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);


    // Estados para os formulários de adição
    const [newCommentText, setNewCommentText] = useState('');
    const [newChecklistItemText, setNewChecklistItemText] = useState('');

    // Estados para controlar o "modo de edição" de cada campo
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');

    // Inicializa com o valor salvo no localStorage ou vazio
    const [authorName, setAuthorName] = useState(localStorage.getItem('commentAuthorName') || '');

    // Efeito para popular o formulário com os dados da tarefa quando o modal é aberto ou a tarefa muda
    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setDueDate((task.dueDate || '').slice(0, 10));
            setPriority(task.priority || 'MEDIUM');
        }
    }, [task]);

    if (!task) {
        return null;
    }

    const handleDeleteClick = () => setConfirmOpen(true);

    const confirmDelete = async () => {
        try {
            setDeleting(true);
            await deleteTask(task.id);
            onTaskDeleted?.(task.id);           // fecha modal e remove da lista (via ProjectView)
        } catch (err) {
            console.error('Erro ao deletar tarefa:', err);
            window.dispatchEvent(new CustomEvent('ui:toast', {
                detail: { message: 'Não foi possível excluir a tarefa.' }
            }));
        } finally {
            setDeleting(false);
            setConfirmOpen(false);
        }
    };



    const handleCommentSubmit = (e) => {
        e.preventDefault();
        const trimmedName = authorName.trim();
        const trimmedText = newCommentText.trim();

        if (!trimmedText || !trimmedName) {
            alert("Por favor, preencha seu nome e o comentário.");
            return;
        }

        onCommentAdd({ text: trimmedText, authorName: trimmedName });
        localStorage.setItem('commentAuthorName', trimmedName);
        setNewCommentText('');
    };

    const handleChecklistSubmit = (e) => {
        e.preventDefault();
        if (!newChecklistItemText.trim()) return;
        onChecklistItemAdd({ text: newChecklistItemText });
        setNewChecklistItemText('');
    };

    // Funções para a edição in-loco
    const handleEditClick = (field, value) => {
        setEditingField(field);
        setTempValue(value);
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setTempValue('');
    };

    const handleSave = () => {
        if (!editingField) return;

        if (editingField.startsWith('comment-')) {
            const commentId = editingField.split('-')[1];
            onCommentUpdate(commentId, { text: tempValue });
        } else if (editingField.startsWith('checklistItem-')) {
            const itemId = editingField.split('-')[1];
            onChecklistItemUpdate(itemId, { text: tempValue });
        } else {
            onTaskUpdate(task.id, { [editingField]: tempValue });
        }
        handleCancelEdit();
    };


    // Função para renderizar um campo que pode ser editado
    const renderEditableField = (field, label, value, inputType = 'input') => {
        const isEditing = editingField === field;

        return (
            // <<< ALTERAÇÃO ESTRUTURAL 1: `label` agora é o cabeçalho escuro
            <div className="detail-group">
                <div className="detail-header">
                    <label>{label}</label>
                </div>
                {/* <<< ALTERAÇÃO ESTRUTURAL 2: Conteúdo dentro do `detail-content` claro */}
                <div className="detail-content">
                    <div className="editable-field">
                        {isEditing ? (
                            <>
                                {inputType === 'textarea' ? (
                                    <textarea
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } if (e.key === 'Escape') { handleCancelEdit(); } }}
                                    />
                                ) : (
                                    <input
                                        type={inputType}
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancelEdit(); }}
                                    />
                                )}
                                <button onClick={handleSave} className="action-btn save-btn"><FaCheck /></button>
                                <button onClick={handleCancelEdit} className="action-btn cancel-btn"><FaTimes /></button>
                            </>
                        ) : (
                            <>
                                <p className="editable-text">{value || `Nenhum(a) ${label.toLowerCase()} definido(a)`}</p>
                                <button onClick={() => handleEditClick(field, value)} className="action-btn edit-btn"><FaPencilAlt /></button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (

        <>
            <div className="modal-backdrop" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        {editingField === 'title' ? (
                            <div className="editable-field">
                                <input
                                    type="text"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => { if (e.key === 'Enter') { handleSave(); } if (e.key === 'Escape') { handleCancelEdit(); } }}
                                    className="modal-title-input"
                                />
                                <button onClick={handleSave} className="action-btn save-btn"><FaCheck /></button>
                                <button onClick={handleCancelEdit} className="action-btn cancel-btn"><FaTimes /></button>
                            </div>
                        ) : (
                            <div className="editable-field">
                                <h3 className="editable-text">
                                    {task.title}
                                </h3>
                                <button onClick={() => handleEditClick('title', task.title)} className="action-btn edit-btn"><FaPencilAlt /></button>
                            </div>
                        )}
                        <button onClick={onClose} className="close-btn">&times;</button>
                    </div>

                    <div className="modal-body">
                        <div className="task-details-section">
                            {renderEditableField('description', 'Descrição', description, 'textarea')}
                            <div className="detail-grid">
                                {renderEditableField('dueDate', 'Data de Entrega', dueDate, 'date')}
                                {/* O div do 'detail-group' já estava aqui, a estrutura interna que precisava de ajuste */}
                                <div className="detail-group">
                                    <div className="detail-header">
                                        <label>Prioridade</label>
                                    </div>
                                    <div className="detail-content">
                                        <div className="editable-field">
                                            {editingField === 'priority' ? (
                                                <>
                                                    <select
                                                        className="priority-select"
                                                        value={tempValue}
                                                        onChange={(e) => setTempValue(e.target.value)}
                                                        onBlur={handleSave}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { handleSave(); } if (e.key === 'Escape') { handleCancelEdit(); } }}
                                                        autoFocus
                                                    >
                                                        <option value="LOW">Baixa</option>
                                                        <option value="MEDIUM">Média</option>
                                                        <option value="HIGH">Alta</option>
                                                    </select>
                                                    <button onClick={handleSave} className="action-btn save-btn"><FaCheck /></button>
                                                    <button onClick={handleCancelEdit} className="action-btn cancel-btn"><FaTimes /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="editable-text">
                                                        {priorityLabels[priority] || 'Não definida'}
                                                    </p>
                                                    <button onClick={() => handleEditClick('priority', priority)} className="action-btn edit-btn"><FaPencilAlt /></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="checklist-section detail-group">
                            <div className="detail-header">
                                <label>Checklist</label>
                            </div>
                            {/* <<< NOVA DIV ADICIONADA AQUI */}
                            <div className="detail-content">
                                <div className="checklist-list">
                                    {task.checklist && task.checklist.map(item => {
                                        const isEditingItem = editingField === `checklistItem-${item.id}`;
                                        return (
                                            <div key={item.id} className="checklist-item-view">
                                                <input
                                                    type="checkbox"
                                                    checked={item.checked}
                                                    onChange={() => onChecklistItemUpdate(item.id, { checked: !item.checked })}
                                                />
                                                {isEditingItem ? (
                                                    <>
                                                        <input
                                                            type="text" value={tempValue}
                                                            onChange={(e) => setTempValue(e.target.value)}
                                                            className="checklist-edit-input" autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleSave();
                                                                }
                                                                if (e.key === 'Escape') handleCancelEdit();
                                                            }}
                                                        />
                                                        <button onClick={handleSave} className="action-btn save-btn"><FaCheck /></button>
                                                        <button onClick={handleCancelEdit} className="action-btn cancel-btn"><FaTimes /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <label className={item.checked ? 'checked' : ''}>{item.text}</label>
                                                        <div className="item-actions">
                                                            <button onClick={() => handleEditClick(`checklistItem-${item.id}`, item.text)} className="action-btn edit-btn"><FaPencilAlt /></button>
                                                            <button onClick={() => onChecklistItemDelete(item.id)} className="action-btn delete-item-btn">×</button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <form onSubmit={handleChecklistSubmit} className="add-item-form">
                                    <input
                                        type="text"
                                        placeholder="Adicionar item ao checklist..."
                                        value={newChecklistItemText}
                                        onChange={(e) => setNewChecklistItemText(e.target.value)}
                                    />
                                    <button type="submit">+</button>
                                </form>
                            </div>
                        </div>

                        <div className="comments-section">
                            <label>Comentários</label>
                            <div className="comments-list">
                                {task.comments && task.comments.map(comment => {
                                    const isEditingComment = editingField === `comment-${comment.id}`;
                                    return (
                                        <div key={comment.id} className="comment">
                                            <div className="comment-header">
                                                <strong>{comment.authorName}</strong>
                                                <span className="comment-date">{new Date(comment.createdAt).toLocaleString('pt-BR')}</span>
                                            </div>
                                            {isEditingComment ? (
                                                <div className="comment-edit-form">
                                                    <textarea value={tempValue} onChange={(e) => setTempValue(e.target.value)} autoFocus />
                                                    <div className="comment-edit-actions">
                                                        <button onClick={handleCancelEdit} className="btn btn-secondary btn-sm">Cancelar</button>
                                                        <button onClick={handleSave} className="btn btn-primary btn-sm">Salvar</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="comment-body">
                                                    <p>{comment.text}</p>
                                                    <div className="comment-actions">
                                                        <button onClick={() => handleEditClick(`comment-${comment.id}`, comment.text)} className="action-btn edit-btn"><FaPencilAlt /></button>
                                                        <button onClick={() => onCommentDelete(comment.id)} className="action-btn delete-item-btn">×</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {(!task.comments || task.comments.length === 0) && (
                                    <p className="no-comments">Nenhum comentário ainda.</p>
                                )}
                            </div>

                            {/* --- [CORREÇÃO] Formulário de comentário completo --- */}
                            <form onSubmit={handleCommentSubmit} className="comment-form">
                                <div className="form-group author-input-group">
                                    <label htmlFor="comment-author">Seu Nome:</label>
                                    <input
                                        type="text"
                                        id="comment-author"
                                        value={authorName}
                                        onChange={(e) => setAuthorName(e.target.value)}
                                        placeholder="Digite seu nome"
                                        required
                                    />
                                </div>
                                <textarea
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="Adicionar um comentário..."
                                    required
                                />
                                <button type="submit" className="btn btn-primary">Enviar</button>
                            </form>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="danger-btn" onClick={handleDeleteClick}>
                            🗑 Excluir Tarefa
                        </button>
                    </div>

                </div>
            </div>

            <ConfirmModal
                open={confirmOpen}
                title="Excluir tarefa?"
                message="Esta ação não pode ser desfeita. A tarefa e seus dados serão removidos."
                confirmText={deleting ? 'Excluindo…' : 'Excluir'}
                cancelText="Cancelar"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
}

export default TaskDetailModal;

