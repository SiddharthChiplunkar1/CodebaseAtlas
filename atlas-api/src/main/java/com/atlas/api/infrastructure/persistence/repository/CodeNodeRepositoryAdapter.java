package com.atlas.api.infrastructure.persistence.repository;

import com.atlas.api.domain.enums.Type;
import com.atlas.api.domain.model.CodeNode;
import com.atlas.api.domain.port.out.CodeNodeRepository;
import com.atlas.api.infrastructure.persistence.mapper.CodeNodeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CodeNodeRepositoryAdapter implements CodeNodeRepository {

    private final CodeNodeJpaRepository jpaRepository;
    private final CodeNodeMapper mapper;

    @Override
    public void saveAll(List<CodeNode> nodes) {
        var entities = nodes.stream().map(mapper::toEntity).collect(Collectors.toList());
        jpaRepository.saveAll(entities);
    }

    @Override
    public List<CodeNode> findByRepoId(UUID repoId) {
        return jpaRepository.findByRepoEntity_Id(repoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<CodeNode> findByRepoIdAndType(UUID repoId, Type type) {
        return jpaRepository.findByRepoEntity_IdAndType(repoId, type).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
