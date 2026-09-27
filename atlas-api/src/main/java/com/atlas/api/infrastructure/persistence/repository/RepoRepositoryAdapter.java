package com.atlas.api.infrastructure.persistence.repository;

import com.atlas.api.domain.model.Repo;
import com.atlas.api.domain.port.out.RepoRepository;
import com.atlas.api.infrastructure.persistence.mapper.RepoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RepoRepositoryAdapter implements RepoRepository {

    private final RepoJpaRepository jpaRepository;
    private final RepoMapper mapper;

    @Override
    public Repo save(Repo repo) {
        var entity = mapper.toEntity(repo);
        var saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Repo> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Repo> findAll() {
        return jpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(UUID id) {
        jpaRepository.deleteById(id);
    }
}
