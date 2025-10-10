import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewProjectModal from './components/NewProjectModal.jsx';
import ProjectView from './pages/ProjectView.jsx';
import { fetchProjects, createProject } from './services/apiService.js';

function App() {
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation(); // Hook para obter informações da rota atual

    // Verifica se estamos na página de visualização de um projeto
    const isProjectView = location.pathname.startsWith('/projects/');

    // Extrai o código do projeto da URL, se estiver na página do projeto
    const projectCodeMatch = location.pathname.match(/\/projects\/(.*)/);
    const projectCode = projectCodeMatch ? projectCodeMatch[1] : null;

    const loadProjects = () => {
        fetchProjects().then(data => {
            setProjects(data);
        });
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSaveProject = async (projectData) => {
        const newProject = await createProject(projectData);
        if (newProject) {
            handleCloseModal();
            loadProjects();
        } else {
            alert('Não foi possível criar o projeto.');
        }
    };

    // Funções placeholder para os novos botões (serão implementadas depois)
    const handleEditProjectClick = () => {
        alert('Abrir modal para editar projeto (a ser implementado)');
    };

    return (
        <div>
            {/* Passa as novas props para o Header */}
            <Header
                onNewProjectClick={handleOpenModal}
                onEditProjectClick={handleEditProjectClick}
                isProjectView={isProjectView}
                projectCode={projectCode}
            />
            <main>
                <Routes>
                    <Route path="/" element={<Dashboard projects={projects} />} />
                    <Route path="/projects/:projectCode" element={<ProjectView />} />
                </Routes>
            </main>
            {isModalOpen && <NewProjectModal onClose={handleCloseModal} onSave={handleSaveProject} />}
        </div>
    )
}

export default App;
