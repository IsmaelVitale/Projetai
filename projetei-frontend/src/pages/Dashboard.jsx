import { useEffect, useMemo, useRef, useState } from 'react';
import ProjectCard from '../components/ProjectCard.jsx';
import './Dashboard.css';

const MY_KEY = 'projetei.myProjects';

function looksLikeCode(q) {
    const v = String(q || '').trim();
    if (!v) return false;
    if (/\s/.test(v)) return false;
    return /^[A-Za-z0-9_-]{4,}$/.test(v);
}

/** Lê do localStorage e devolve um Set com codes/ids salvos pelo usuário */
function readMyProjectsKeys() {
    try {
        const raw = localStorage.getItem(MY_KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw);
        const keys = arr
            .map((p) => String(p?.code ?? p?.id ?? '').trim())
            .filter(Boolean);
        return new Set(keys);
    } catch {
        return new Set();
    }
}

export default function Dashboard({ projects }) {
    const [filterMode, setFilterMode] = useState('all'); // 'all' | 'mine'
    const [myVersion, setMyVersion] = useState(0);       // força re-render ao mudar localStorage
    const [searchName, setSearchName] = useState('');    // busca por NOME (vinda do Header)

    // Para não repetir toast na mesma consulta
    const lastToastQ = useRef('');

    // 1) Botão “Meus Projetos” no Header
    useEffect(() => {
        const showMine = () => setFilterMode('mine');
        window.addEventListener('dashboard:show-mine', showMine);
        return () => window.removeEventListener('dashboard:show-mine', showMine);
    }, []);

    // 2) Busca por NOME enviada pelo Header (tempo real)
    useEffect(() => {
        const onSearchByName = (e) => {
            const q = String(e.detail?.q ?? '');
            setSearchName(q);
            // NÃO alteramos filterMode aqui (respeita o modo atual do usuário)
        };
        window.addEventListener('dashboard:search-name', onSearchByName);
        return () => window.removeEventListener('dashboard:search-name', onSearchByName);
    }, []);

    // 3) Mudanças no localStorage (ex.: adicionar/remover “Meus Projetos”)
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === MY_KEY) setMyVersion((v) => v + 1);
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // 4) Qualquer lugar do app que disparar projects:changed
    useEffect(() => {
        const bump = () => setMyVersion((v) => v + 1);
        window.addEventListener('projects:changed', bump);
        return () => window.removeEventListener('projects:changed', bump);
    }, []);

    // Contagens
    const totalCount = projects?.length ?? 0;

    const mineCount = useMemo(() => {
        const keys = readMyProjectsKeys();
        return (projects || []).filter(
            (p) => keys.has(String(p?.code ?? '')) || keys.has(String(p?.id ?? ''))
        ).length;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projects, myVersion]);

    // Filtro em memória
    const visibleProjects = useMemo(() => {
        let list = projects || [];

        // “Meus Projetos”
        if (filterMode === 'mine') {
            const keys = readMyProjectsKeys();
            list = list.filter(
                (p) => keys.has(String(p?.code ?? '')) || keys.has(String(p?.id ?? ''))
            );
        }

        // Busca por NOME (quando houver)
        const q = String(searchName || '').trim();
        if (q && !looksLikeCode(q)) {
            const ql = q.toLowerCase();
            list = list.filter((p) => String(p?.name ?? '').toLowerCase().includes(ql));
        }

        return list;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projects, filterMode, searchName, myVersion]);

    // Toast quando a busca por NOME não encontra nada
    useEffect(() => {
        const q = String(searchName || '').trim();
        if (!q) {
            lastToastQ.current = '';
            return;
        }
        if (looksLikeCode(q)) {
            // caso "código" é tratado no Header (submit)
            lastToastQ.current = '';
            return;
        }
        if (visibleProjects.length === 0 && lastToastQ.current !== q) {
            lastToastQ.current = q;
            window.dispatchEvent(
                new CustomEvent('ui:toast', { detail: { message: 'Esse projeto não existe.' } })
            );
        }
    }, [searchName, visibleProjects.length]);

    return (
        <div className="dashboard-container">
            {/* Controles superiores */}
            <div className="dashboard-controls">
                <div className="filters">
                    <button
                        type="button"
                        className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterMode('all')}
                        aria-pressed={filterMode === 'all'}
                    >
                        Todos ({totalCount})
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${filterMode === 'mine' ? 'active' : ''}`}
                        onClick={() => setFilterMode('mine')}
                        aria-pressed={filterMode === 'mine'}
                    >
                        Meus Projetos ({mineCount})
                    </button>
                </div>
            </div>

            {visibleProjects.length > 0 ? (
                <div className="projects-grid">
                    {visibleProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <p className="dash-empty">
                    {filterMode === 'mine'
                        ? (searchName
                            ? 'Nenhum projeto dos seus favoritos corresponde à busca.'
                            : 'Você ainda não adicionou projetos aos seus favoritos.')
                        : (searchName
                            ? 'Nenhum projeto corresponde à busca.'
                            : 'Nenhum projeto encontrado.')}
                </p>
            )}
        </div>
    );
}
