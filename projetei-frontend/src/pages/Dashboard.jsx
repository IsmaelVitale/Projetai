import ProjectCard from '../components/ProjectCard.jsx';
import './Dashboard.css';

// O Dashboard agora é um componente mais "burro".
// Ele apenas recebe os 'projects' via props e os renderiza.
function Dashboard({ projects }) {
    return (
        <div className="dashboard-container">
            {projects.length > 0 ? (
                <div className="projects-grid">
                    {projects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <p>Nenhum projeto encontrado. Clique em "+ Novo Projeto" para começar.</p>
            )}
        </div>
    );
}

export default Dashboard;