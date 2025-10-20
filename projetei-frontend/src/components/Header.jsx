import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchProjectByCode } from '../services/apiService';
import { tryActivateDevMode } from '../devMode';

function looksLikeCode(q) {
    const v = String(q || '').trim();
    if (!v) return false;
    if (/\s/.test(v)) return false;
    return /^[A-Za-z0-9_-]{4,}$/.test(v);
}

function Header({ onNewProjectClick, isProjectView, projectCode }) {
    const navigate = useNavigate();

    // Busca
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);

    // Toast
    const [toastMsg, setToastMsg] = useState('');
    const [toastOpen, setToastOpen] = useState(false);
    const showToast = (msg) => {
        setToastMsg(msg);
        setToastOpen(true);
        window.clearTimeout((showToast)._t);
        (showToast)._t = window.setTimeout(() => setToastOpen(false), 2500);
    };

    // Ouve toasts globais
    useEffect(() => {
        const onToast = (e) => {
            const message = e.detail?.message || e.detail || 'Esse projeto não existe.';
            showToast(message);
        };
        window.addEventListener('ui:toast', onToast);
        return () => window.removeEventListener('ui:toast', onToast);
    }, []);

    const goBack = () => {
        const ref = document.referrer || '';
        let sameOrigin = false;
        try { sameOrigin = ref && new URL(ref).origin === window.location.origin; } catch {}
        if (sameOrigin && window.history.length > 1) navigate(-1);
        else navigate('/');
    };

    const goMyProjects = () => {
        navigate('/');
        window.dispatchEvent(new Event('dashboard:show-mine'));
    };

    const openProjectDetails = () => {
        window.dispatchEvent(new Event('project:open-details'));
    };

    // Busca por nome em tempo real
    const handleChange = (e) => {
        const q = e.target.value;
        setQuery(q);
        window.dispatchEvent(new CustomEvent('dashboard:search-name', { detail: { q } }));
    };

    // Submit: antes de tudo, tenta ativar/desativar MODO DEV; depois trata código
    const handleSearch = async (e) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;

        // 1) Modo Dev (senha ou "dev:off")
        const toggled = tryActivateDevMode(q);
        if (toggled) {
            setQuery('');
            return; // não prossegue para busca
        }

        // 2) Código → abre modal
        if (looksLikeCode(q)) {
            try {
                setSearching(true);
                const found = await fetchProjectByCode(q);
                if (!found) {
                    showToast('Esse projeto não existe.');
                    return;
                }
                window.dispatchEvent(
                    new CustomEvent('project:open-modal', { detail: { project: found, mode: 'lookup' } })
                );
            } catch (err) {
                console.error('Erro ao buscar projeto por código:', err);
                showToast('Não foi possível buscar o projeto.');
            } finally {
                setSearching(false);
            }
        }
        // Observação: busca por NOME já é tempo real; submit não faz nada nesse caso.
    };

    return (
        <header className="app-header">
            <div className="header-content">
                {/* ESQUERDA */}
                <div className="header-left">
                    <Link to="/" className="header-title-link">
                        <h2>Projetaí</h2>
                    </Link>

                    <button type="button" className="header-action-btn" onClick={goBack} title="Voltar">
                        ← Voltar
                    </button>

                    <button type="button" className="header-action-btn" onClick={goMyProjects} title="Meus Projetos">
                        Meus Projetos
                    </button>

                    {isProjectView && projectCode && (
                        <div className="project-code-wrap">
                            <span className="header-project-code">{projectCode}</span>
                            <button
                                type="button"
                                className="icon-btn"
                                title="Copiar código"
                                aria-label="Copiar código do projeto"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(projectCode);
                                        window.dispatchEvent(new CustomEvent('ui:toast', { detail: { message: 'Código copiado!' } }));
                                    } catch {
                                        window.dispatchEvent(new CustomEvent('ui:toast', { detail: { message: 'Não foi possível copiar.' } }));
                                    }
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M9 3h9a2 2 0 0 1 2 2v9" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                    <rect x="3" y="7" width="14" height="14" rx="2" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* DIREITA */}
                <div className="header-right">
                    {isProjectView ? (
                        <button type="button" onClick={openProjectDetails} className="header-action-btn">
                            Ver Detalhes do Projeto
                        </button>
                    ) : (
                        <>
                            <button type="button" onClick={onNewProjectClick} className="header-action-btn primary">
                                + Novo Projeto
                            </button>

                            <form className="header-search" onSubmit={handleSearch} role="search" aria-label="Buscar projetos">
                                <input
                                    type="search"
                                    placeholder="Buscar por código ou nome…"
                                    value={query}
                                    onChange={handleChange}
                                    aria-label="Buscar projetos por código ou nome"
                                />
                                <button type="submit" className="header-action-btn" disabled={searching}>
                                    {searching ? 'Buscando…' : 'Buscar'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Toast */}
            <div className={`toast ${toastOpen ? 'show' : ''}`} role="status" aria-live="polite">
                {toastMsg}
            </div>
        </header>
    );
}

export default Header;
