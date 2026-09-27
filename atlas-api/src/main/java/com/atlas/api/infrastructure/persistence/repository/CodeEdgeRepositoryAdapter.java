package com.atlas.api.infrastructure.persistence.repository;

import com.atlas.api.domain.enums.EdgeType;
import com.atlas.api.domain.model.CodeEdge;
import com.atlas.api.domain.port.out.CodeEdgeRepository;
import com.atlas.api.infrastructure.persistence.mapper.CodeEdgeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CodeEdgeRepositoryAdapter implements CodeEdgeRepository {

    private final CodeEdgeJpaRepository jpaRepository;
    private final CodeEdgeMapper mapper;

    @Override
    public void saveAll(List<CodeEdge> edges) {
        var entities = edges.stream().map(mapper::toEntity).collect(Collectors.toList());
        jpaRepository.saveAll(entities);
    }

    @Override
    public List<CodeEdge> findByRepoIdAndEdgeType(UUID repoId, EdgeType edgeType) {
        return jpaRepository.findByRepoEntity_IdAndEdgeType(repoId, edgeType).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<CodeEdge> findByRepoId(UUID repoId) {
        return jpaRepository.findByRepoEntity_Id(repoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
