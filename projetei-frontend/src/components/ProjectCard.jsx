import './ProjectCard.css';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ConfirmModal from './ConfirmModal.jsx';

const MY_KEY = 'projetei.myProjects';

function calcCounts(project) {
    const tasks = Array.isArray(project?.tasks) ? project.tasks : [];
    const total = tasks.length;
    const done = tasks.filter(t => String(t?.status).toUpperCase() === 'DONE').length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    return { total, done, percent };
}

function readMyProjects() {
    try {
        const raw = localStorage.getItem(MY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function isInMyProjects(project) {
    const arr = readMyProjects();
    const code = String(project?.code ?? '').trim();
    const id = String(project?.id ?? '').trim();
    return arr.some(p =>
        String(p?.code ?? '').trim() === code ||
        (code === '' && String(p?.id ?? '').trim() === id)
    );
}

export default function ProjectCard({ project }) {
    const description = project.description || 'Este projeto não possui descrição.';
    const code = project?.code ?? '';
    const linkTo = `/projects/${encodeURIComponent(code || String(project?.id ?? ''))}`;
    const { total, done, percent } = calcCounts(project);

    const [isMine, setIsMine] = useState(isInMyProjects(project));
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        const refresh = () => setIsMine(isInMyProjects(project));
        window.addEventListener('projects:changed', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('projects:changed', refresh);
            window.removeEventListener('storage', refresh);
        };
    }, [project]);

    // Copiar código (sem navegar)
    const handleCopyCode = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (!code) throw new Error('No code');
            await navigator.clipboard.writeText(code);
            window.dispatchEvent(new CustomEvent('ui:toast', { detail: { message: 'Código copiado!' } }));
        } catch {
            window.dispatchEvent(new CustomEvent('ui:toast', { detail: { message: 'Não foi possível copiar.' } }));
        }
    };

    // Abrir modal de confirmação (sem navegar)
    const openRemoveConfirm = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmOpen(true);
    };

    // Remover dos “Meus Projetos” após confirmar
    const doRemoveMine = () => {
        const arr = readMyProjects();
        const newArr = arr.filter(p => {
            const pc = String(p?.code ?? '').trim();
            const pid = String(p?.id ?? '').trim();
            const codeMatch = pc && pc === String(project?.code ?? '').trim();
            const idMatch = !pc && pid && pid === String(project?.id ?? '').trim();
            return !(codeMatch || idMatch);
        });
        localStorage.setItem(MY_KEY, JSON.stringify(newArr));
        window.dispatchEvent(new Event('projects:changed'));
        window.dispatchEvent(new CustomEvent('ui:toast', { detail: { message: 'Removido dos seus projetos.' } }));
        setConfirmOpen(false);
    };

    return (
        <>
            <Link to={linkTo} className="project-card-link">
                <div className="project-card" role="group" aria-label={`Projeto ${project?.name ?? ''}`}>
                    {/* Header: título à esquerda; código + copiar (+ lixeira) à direita */}
                    <div className="card-header">
                        <h3>{project.name || 'Projeto sem nome'}</h3>

                        {(code || isMine) && (
                            <div className="card-code">
                                {code && (
                                    <>
                                        <span className="code-pill" title="Código do projeto">{code}</span>
                                        <button
                                            type="button"
                                            className="icon-btn"
                                            aria-label="Copiar código do projeto"
                                            title="Copiar código"
                                            onClick={handleCopyCode}
                                        >
                                            {/* ícone “duas páginas” */}
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                <path d="M9 3h9a2 2 0 0 1 2 2v9" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                                <rect x="3" y="7" width="14" height="14" rx="2" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </>
                                )}

                                {/* Lixeira: só aparece quando está em “Meus Projetos” */}
                                {isMine && (
                                    <button
                                        type="button"
                                        className="icon-btn"
                                        aria-label="Remover dos meus projetos"
                                        title="Remover dos meus projetos"
                                        onClick={openRemoveConfirm}
                                    >
                                        {/* ícone lixeira */}
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M3 6h18" stroke="#e11d48" strokeWidth="1.6" strokeLinecap="round"/>
                                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#e11d48" strokeWidth="1.6" strokeLinecap="round"/>
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#e11d48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M10 11v6M14 11v6" stroke="#e11d48" strokeWidth="1.6" strokeLinecap="round"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="card-description">{description}</p>

                    <div className="card-footer">
                        <div className="task-progress" aria-label={`Progresso: ${done} concluídas / ${total} tarefas`}>
                            <div className="task-progress-track">
                                <div className="task-progress-fill" style={{ width: `${percent}%` }} />
                            </div>
                            <div className="task-progress-count">
                                {done}/{total}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Modal de confirmação (fora do Link para não navegar) */}
            <ConfirmModal
                open={confirmOpen}
                title="Remover dos meus projetos?"
                message="Isso apenas remove o projeto da sua lista."
                confirmText="Remover"
                cancelText="Cancelar"
                variant="danger"
                onConfirm={doRemoveMine}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
}
