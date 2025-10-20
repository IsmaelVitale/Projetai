import './ProjectCard.css';
import { Link } from 'react-router-dom';

function calcCounts(project) {
    const tasks = Array.isArray(project?.tasks) ? project.tasks : [];
    const total = tasks.length;
    const done = tasks.filter(t => String(t?.status).toUpperCase() === 'DONE').length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    return { total, done, percent };
}

export default function ProjectCard({ project }) {
    const description = project.description || 'Este projeto não possui descrição.';
    const code = project?.code ?? '';
    const linkTo = `/projects/${encodeURIComponent(code || String(project?.id ?? ''))}`;
    const { total, done, percent } = calcCounts(project);

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

    return (
        <Link to={linkTo} className="project-card-link">
            <div className="project-card" role="group" aria-label={`Projeto ${project?.name ?? ''}`}>
                {/* Header: título à esquerda, código + copiar à direita */}
                <div className="card-header">
                    <h3>{project.name || 'Projeto sem nome'}</h3>

                    {code && (
                        <div className="card-code">
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
                        </div>
                    )}
                </div>

                <p className="card-description">{description}</p>

                {/* Rodapé com progresso no mesmo formato do TaskCard */}
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
    );
}
