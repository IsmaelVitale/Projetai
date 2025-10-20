// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewProjectModal from './components/NewProjectModal.jsx';
import ProjectView from './pages/ProjectView.jsx';
import ProjectDetailModal from './components/ProjectDetailModal.jsx';
import { fetchProjects, createProject } from './services/apiService.js';
import { saveToMyProjects } from './utils/myProjects.js';


function App() {
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal acionado pela busca no Header (modo "lookup")
    const [lookupOpen, setLookupOpen] = useState(false);
    const [lookupProject, setLookupProject] = useState(null);
    const [lookupMode, setLookupMode] = useState('normal'); // 'lookup' | 'normal'

    const location = useLocation();
    const isProjectView = location.pathname.startsWith('/projects/');
    const projectCodeMatch = location.pathname.match(/\/projects\/(.*)/);
    const projectCode = projectCodeMatch ? projectCodeMatch[1] : null;

    const loadProjects = () => {
        fetchProjects().then((data) => setProjects(data));
    };

    useEffect(() => {
        loadProjects();
    }, []);

    // Sincronismo global já existente
    useEffect(() => {
        const onChanged = () => loadProjects();
        const onPageShow = () => loadProjects();
        const onVisibility = () => {
            if (document.visibilityState === 'visible') loadProjects();
        };

        window.addEventListener('projects:changed', onChanged);
        window.addEventListener('pageshow', onPageShow);
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            window.removeEventListener('projects:changed', onChanged);
            window.removeEventListener('pageshow', onPageShow);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);

    // Ouve a busca do Header por CÓDIGO e abre o ProjectDetailModal em "lookup"
    useEffect(() => {
        const openFromSearch = (e) => {
            const detail = e.detail || {};
            setLookupProject(detail.project || null);
            setLookupMode(detail.mode || 'lookup');
            setLookupOpen(true);
        };
        window.addEventListener('project:open-modal', openFromSearch);
        return () => window.removeEventListener('project:open-modal', openFromSearch);
    }, []);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSaveProject = async (projectData) => {
        const newProject = await createProject(projectData);
        if (newProject) {
            handleCloseModal();
            loadProjects();
            saveToMyProjects(newProject);
        } else {
            alert('Não foi possível criar o projeto.');
        }
    };

    return (
        <div>
            <Header
                onNewProjectClick={handleOpenModal}
                isProjectView={isProjectView}
                projectCode={projectCode}
            />

            <main>
                <Routes>
                    <Route path="/" element={<Dashboard projects={projects} />} />
                    <Route path="/projects/:projectCode" element={<ProjectView />} />
                </Routes>
            </main>

            {isModalOpen && (
                <NewProjectModal onClose={handleCloseModal} onSave={handleSaveProject} />
            )}

            {/* Modal aberto via busca por CÓDIGO no Header */}
            {lookupOpen && lookupProject && (
                <ProjectDetailModal
                    project={lookupProject}
                    mode={lookupMode} // 'lookup' => mostra "Adicionar aos Meus" e "Cancelar", oculta "Excluir"
                    onClose={() => setLookupOpen(false)}
                    onProjectUpdated={(updated) => {
                        setLookupProject(updated);
                        window.dispatchEvent(new Event('projects:changed'));
                        loadProjects();
                    }}
                    onProjectDeleted={() => {
                        setLookupOpen(false);
                        setLookupProject(null);
                        window.dispatchEvent(new Event('projects:changed'));
                        loadProjects();
                    }}
                />
            )}
        </div>
    );
}

export default App;
