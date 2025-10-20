import { useEffect, useMemo, useRef, useState } from 'react';
import ProjectCard from '../components/ProjectCard.jsx';
import { isDevMode } from '../devMode';
import './Dashboard.css';

const MY_KEY = 'projetei.myProjects';

function looksLikeCode(q) {
    const v = String(q || '').trim();
    if (!v) return false;
    if (/\s/.test(v)) return false;
    return /^[A-Za-z0-9_-]{4,}$/.test(v);
}

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
    const [devMode, setDevMode] = useState(isDevMode());
    const [filterMode, setFilterMode] = useState('mine'); // padrão = mine
    const [myVersion, setMyVersion] = useState(0);
    const [searchName, setSearchName] = useState('');
    const [refreshTick, setRefreshTick] = useState(0);


    const lastToastQ = useRef('');

    useEffect(() => {
        const onDev = () => {
            setDevMode(isDevMode());
            if (!isDevMode()) setFilterMode('mine'); // ao sair do dev, volta para 'mine'
        };
        window.addEventListener('devmode:changed', onDev);
        return () => window.removeEventListener('devmode:changed', onDev);
    }, []);

    useEffect(() => {
        const showMine = () => setFilterMode('mine');
        window.addEventListener('dashboard:show-mine', showMine);
        return () => window.removeEventListener('dashboard:show-mine', showMine);
    }, []);

    useEffect(() => {
        const onSearchByName = (e) => {
            const q = String(e.detail?.q ?? '');
            setSearchName(q);
        };
        window.addEventListener('dashboard:search-name', onSearchByName);
        return () => window.removeEventListener('dashboard:search-name', onSearchByName);
    }, []);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === MY_KEY) setMyVersion((v) => v + 1);
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    useEffect(() => {
        const bump = () => setMyVersion((v) => v + 1);
        window.addEventListener('projects:changed', bump);
        return () => window.removeEventListener('projects:changed', bump);
    }, []);

    useEffect(() => {
        const onDev = () => {
            setDevMode(isDevMode());
            setFilterMode('mine');  // já tinha
            setSearchName('');      // <— NOVO: limpa busca que podia esconder sua lista
            setRefreshTick(t => t + 1); // <— NOVO: força recomputar memo
        };
        window.addEventListener('devmode:changed', onDev);
        return () => window.removeEventListener('devmode:changed', onDev);
    }, []);

    useEffect(() => {
        const onRefresh = () => setRefreshTick(t => t + 1);
        window.addEventListener('dashboard:refresh', onRefresh);
        return () => window.removeEventListener('dashboard:refresh', onRefresh);
    }, []);



    const totalCount = projects?.length ?? 0;

    const mineCount = useMemo(() => {
        const keys = readMyProjectsKeys();
        return (projects || []).filter(
            (p) => keys.has(String(p?.code ?? '')) || keys.has(String(p?.id ?? ''))
        ).length;
    }, [projects, myVersion]);

    // Fora do dev, o modo efetivo é sempre 'mine'
    const effectiveMode = devMode ? filterMode : 'mine';

    const visibleProjects = useMemo(() => {
        let list = projects || [];

        if (effectiveMode === 'mine') {
            const keys = readMyProjectsKeys();
            list = list.filter(
                (p) => keys.has(String(p?.code ?? '')) || keys.has(String(p?.id ?? ''))
            );
        }

        const q = String(searchName || '').trim();
        if (q && !looksLikeCode(q)) {
            const ql = q.toLowerCase();
            list = list.filter((p) => String(p?.name ?? '').toLowerCase().includes(ql));
        }

        return list;
    }, [projects, effectiveMode, searchName, myVersion, refreshTick]);

    // Toast quando a busca por NOME não encontra nada
    useEffect(() => {
        const q = String(searchName || '').trim();
        if (!q) {
            lastToastQ.current = '';
            return;
        }
        if (looksLikeCode(q)) {
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
            {/* Controles — aparecem só no modo dev */}
            {devMode && (
                <div className="dashboard-controls">
                    <div className="filters">
                        <button
                            type="button"
                            className={`filter-btn ${effectiveMode === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterMode('all')}
                            aria-pressed={effectiveMode === 'all'}
                        >
                            Todos ({totalCount})
                        </button>
                        <button
                            type="button"
                            className={`filter-btn ${effectiveMode === 'mine' ? 'active' : ''}`}
                            onClick={() => setFilterMode('mine')}
                            aria-pressed={effectiveMode === 'mine'}
                        >
                            Meus Projetos ({mineCount})
                        </button>
                    </div>
                </div>
            )}

            {visibleProjects.length > 0 ? (
                <div className="projects-grid">
                    {visibleProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <p className="dash-empty">
                    {effectiveMode === 'mine'
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
