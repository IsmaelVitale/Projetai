import { useState } from 'react';
import './NewProjectModal.css';

function NewProjectModal({ onClose, onSave }) {
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        // --- A CORREÇÃO ESTÁ AQUI ---
        // Agora, chamamos a função onSave que recebemos via props,
        // passando um objeto com os dados do nosso formulário (name e dueDate).
        onSave({ name, dueDate });

        // A função onClose() não é mais chamada aqui, pois o App.jsx
        // já cuida de fechar o modal após o sucesso da criação.
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 id="modal-title">Novo Projeto</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
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
                        <button type="submit" className="btn btn-primary">
                            Criar Projeto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewProjectModal;