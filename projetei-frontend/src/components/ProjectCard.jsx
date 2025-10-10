import './ProjectCard.css';
import { Link } from 'react-router-dom'; // 1. Importe o Link

function ProjectCard({ project }) {
    const description = project.description || "Este projeto não possui descrição.";
    const progress = 0;

    // 2. Envolvemos todo o card em um componente Link
    return (
        <Link to={`/projects/${project.code}`} className="project-card-link">
            <div className="project-card">
                <div className="card-header">
                    <h3>{project.name}</h3>
                    <span>{project.code}</span>
                </div>
                <p className="card-description">{description}</p>
                <div className="card-footer">
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default ProjectCard;