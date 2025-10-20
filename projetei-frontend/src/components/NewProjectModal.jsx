import { useState } from 'react';
import './NewProjectModal.css';

const MY_KEY = 'projetei.myProjects';

function readMyProjects() {
    try {
        const raw = localStorage.getItem(MY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveToMyProjects(project) {
    try {
        const arr = readMyProjects();

        const code = String(project?.code ?? '').trim();
        const id   = String(project?.id ?? '').trim();
        const name = String(project?.name ?? '');

        // evita duplicados (por code; se não tiver code, usa id)
        const exists = arr.some(p =>
            (code && String(p?.code ?? '').trim() === code) ||
            (!code && id && String(p?.id ?? '').trim() === id)
        );
        if (exists) return;

        arr.push({ code, id, name });
        localStorage.setItem(MY_KEY, JSON.stringify(arr));

        // avisa a UI a atualizar imediatamente
        window.dispatchEvent(new Event('projects:changed'));
    } catch {
        // se der algum erro de storage, só ignora pra não travar criação
    }
}

function NewProjectModal({ onClose, onSave }) {
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!onSave) return;
        try {
            setSubmitting(true);
            // onSave deve criar o projeto na API e (idealmente) retornar o objeto criado
            const created = await onSave({ name, dueDate });

            // Se o caller retornar o projeto criado, salvamos em "Meus Projetos"
            if (created && (created.id || created.code)) {
                saveToMyProjects(created);
                window.dispatchEvent(new CustomEvent('ui:toast', {
                    detail: { message: 'Projeto criado e salvo nos seus projetos.' }
                }));
            }

            // fecha o modal (se o App também fechar, não tem problema)
            onClose?.();
        } catch (err) {
            console.error('Falha ao criar projeto:', err);
            window.dispatchEvent(new CustomEvent('ui:toast', {
                detail: { message: 'Não foi possível criar o projeto.' }
            }));
        } finally {
            setSubmitting(false);
        }
    };

    const closeOnBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose?.();
    };

    return (
        <div className="modal-backdrop" onClick={closeOnBackdrop}>
            <div
                className="modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 id="modal-title">Novo Projeto</h3>
                    <button onClick={onClose} className="close-btn" aria-label="Fechar">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="project-name">Nome do Projeto</label>
                        <input
                            id="project-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="project-dueDate">Data de Entrega</label>
                        <input
                            id="project-dueDate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Criando…' : 'Criar Projeto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewProjectModal;
