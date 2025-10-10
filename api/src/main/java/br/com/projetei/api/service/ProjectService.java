package br.com.projetei.api.service;

import br.com.projetei.api.dto.UpdateProjectDTO;
import org.springframework.transaction.annotation.Transactional;
import br.com.projetei.api.model.Project;
import br.com.projetei.api.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

// @Service: Anotação que marca esta classe como um componente de serviço.
// O Spring irá gerenciá-la e permitirá que seja injetada em outras classes (como no nosso Controller).
@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    // Injetamos o Repository no Service, pois o Service precisa dele para falar com o banco.
    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public Project createProject(Project project) {
        // LÓGICA DE NEGÓCIO: Gerar o código único antes de salvar.
        String uniqueCode = UUID.randomUUID().toString().substring(0, 8);
        project.setCode(uniqueCode);

        // Delega ao repositório a tarefa de salvar o projeto no banco de dados.
        return projectRepository.save(project);
    }

    public List<Project> findAllProjects() {
        // Simplesmente chama o método findAll() que o JpaRepository nos dá de graça.
        // Ele busca todas as entradas da tabela 'projects' e as retorna como uma lista.
        return projectRepository.findAll();
    }

    public Project findProjectById(Long projectId) {
        // Usamos o mesmo padrão robusto de antes:
        // Tenta encontrar pelo ID. Se não achar, lança uma exceção.
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado com o ID: " + projectId));
    }

    public Project findProjectByCode(String code) {
        return projectRepository.findByCode(code)
                .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado com o Código: " + code));
    }
    public void deleteProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new EntityNotFoundException("Projeto não encontrado com o ID: " + projectId);
        }
        projectRepository.deleteById(projectId);
    }

    @Transactional
    public Project updateProject(Long projectId, UpdateProjectDTO dto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado com o ID: " + projectId));

        // Lógica de atualização parcial: só atualiza se um novo valor foi enviado.
        if (dto.getName() != null) {
            project.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            project.setDescription(dto.getDescription());
        }
        if (dto.getDueDate() != null) {
            project.setDueDate(dto.getDueDate());
        }

        // A anotação @Transactional garante que o JPA salvará as alterações.
        return project;
    }

}