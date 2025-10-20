import { useState } from 'react';
import './TaskDetailModal.css';
import { FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { updateProject, deleteProject } from '../services/apiService';

const MY_KEY = 'projetei.myProjects';

function isoForDateInput(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// salva no localStorage de forma idempotente
function saveToMyProjects(project) {
    try {
        const raw = localStorage.getItem(MY_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        const key = String(project?.code ?? project?.id ?? '').trim();
        if (!key) return;

        const exists = arr.some(
            (p) => String(p?.code ?? p?.id ?? '').trim().toLowerCase() === key.toLowerCase()
        );
        if (!exists) {
            arr.push({
                code: project.code ?? null,
                id: project.id ?? null,
                name: project.name ?? '',
                savedAt: Date.now(),
            });
            localStorage.setItem(MY_KEY, JSON.stringify(arr));
            // Notifica UI para atualizar contagens/filtros
            window.dispatchEvent(new Event('projects:changed'));
            window.dispatchEvent(new StorageEvent('storage', { key: MY_KEY }));
        }
    } catch (e) {
        console.error('Falha ao salvar nos Meus Projetos:', e);
    }
}

export default function ProjectDetailModal({
                                               project,
                                               onClose,
                                               onProjectUpdated,
                                               onProjectDeleted,
                                               mode = 'normal', // 'normal' | 'lookup'
                                           }) {
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const isLookup = mode === 'lookup';

    if (!project) return null;

    const handleEditClick = (field, value) => {
        setEditingField(field);
        setTempValue(field === 'dueDate' ? isoForDateInput(value) : (value ?? ''));
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setTempValue('');
    };

    const handleSave = async () => {
        if (!editingField) return;
        try {
            const payload = {};
            if (editingField === 'name') payload.name = String(tempValue).trim();
            if (editingField === 'description') payload.description = tempValue;
            if (editingField === 'dueDate') payload.dueDate = tempValue || null;

            const updated = await updateProject(project.id, payload);
            onProjectUpdated?.(updated);
            window.dispatchEvent(new Event('projects:changed'));
        } catch (err) {
            console.error('Erro ao atualizar projeto:', err);
            alert('Não foi possível salvar as alterações.');
        } finally {
            handleCancelEdit();
        }
    };

    const handleDelete = async () => {
        const ok = window.confirm(
            'Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.'
        );
        if (!ok) return;
        try {
            await deleteProject(project.id);
            onProjectDeleted?.();
            window.dispatchEvent(new Event('projects:changed'));
        } catch (err) {
            console.error('Erro ao excluir projeto:', err);
            alert('Não foi possível excluir o projeto.');
        }
    };

    const handleAddToMine = () => {
        saveToMyProjects(project);
        onClose?.(); // fecha o modal após adicionar
    };

    const renderEditableField = (field, label, value, inputType = 'input') => {
        const isEditing = editingField === field;
        return (
            <div className="detail-group">
                <div className="detail-header">
                    <label>{label}</label>
                </div>
                <div className="detail-content">
                    <div className="editable-field">
                        {isEditing ? (
                            <>
                                {inputType === 'textarea' ? (
                                    <textarea
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSave();
                                            }
                                            if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                    />
                                ) : (
                                    <input
                                        type={inputType}
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSave();
                                            if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                    />
                                )}
                                <button onClick={handleSave} className="action-btn save-btn">
                                    <FaCheck />
                                </button>
                                <button onClick={handleCancelEdit} className="action-btn cancel-btn">
                                    <FaTimes />
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="editable-text">
                                    {value ? String(value) : `Nenhum(a) ${label.toLowerCase()} definido(a)`}
                                </p>
                                <button
                                    onClick={() => handleEditClick(field, value)}
                                    className="action-btn edit-btn"
                                >
                                    <FaPencilAlt />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const stop = (e) => e.stopPropagation();

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" role="dialog" aria-modal="true" onClick={stop}>
                {/* Header */}
                <div className="modal-header">
                    {editingField === 'name' ? (
                        <div className="editable-field">
                            <input
                                type="text"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                autoFocus
                                className="modal-title-input"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                    if (e.key === 'Escape') handleCancelEdit();
                                }}
                            />
                            <button onClick={handleSave} className="action-btn save-btn">
                                <FaCheck />
                            </button>
                            <button onClick={handleCancelEdit} className="action-btn cancel-btn">
                                <FaTimes />
                            </button>
                        </div>
                    ) : (
                        <div className="editable-field">
                            <h3 className="editable-text">{project.name || 'Projeto sem nome'}</h3>
                            <button
                                onClick={() => handleEditClick('name', project.name)}
                                className="action-btn edit-btn"
                            >
                                <FaPencilAlt />
                            </button>
                        </div>
                    )}
                    <button className="close-btn" onClick={onClose} aria-label="Fechar">
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <div className="detail-grid">
                        {renderEditableField('dueDate', 'Data de Entrega', isoForDateInput(project.dueDate), 'date')}

                        {/* Código do projeto: somente leitura */}
                        <div className="detail-group">
                            <div className="detail-header">
                                <label>Código do Projeto</label>
                            </div>
                            <div className="detail-content">
                                <div className="editable-field">
                                    <p className="editable-text">{project.code || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {renderEditableField('description', 'Descrição', project.description, 'textarea')}
                </div>

                {/* Footer */}
                <div className="modal-footer" style={{ gap: 8 }}>
                    {isLookup ? (
                        <>
                            <button type="button" className="header-action-btn" onClick={onClose}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="header-action-btn primary"
                                onClick={handleAddToMine}
                            >
                                Adicionar aos Meus Projetos
                            </button>
                        </>
                    ) : (
                        <button className="danger-btn" onClick={handleDelete}>
                            🗑 Excluir Projeto
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
