import './Header.css';
import { Link } from 'react-router-dom';

// O Header agora recebe mais props para controlar o que é exibido
function Header({ onNewProjectClick, onEditProjectClick, isProjectView, projectCode }) {
    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-left">
                    {/* O título agora é um link para a home */}
                    <Link to="/" className="header-title-link">
                        <h2>Projetaí</h2>
                    </Link>
                    {/* Exibe o código do projeto se estivermos na ProjectView */}
                    {isProjectView && projectCode && (
                        <span className="header-project-code">{projectCode}</span>
                    )}
                </div>

                <div className="header-right">
                    {/* Renderização condicional do botão */}
                    {isProjectView ? (
                        <button type="button" onClick={onEditProjectClick} className="header-action-btn">
                            Editar Projeto
                        </button>
                    ) : (
                        <button type="button" onClick={onNewProjectClick} className="header-action-btn primary">
                            + Novo Projeto
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
