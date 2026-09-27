package com.atlas.api.infrastructure.persistence.repository;

import com.atlas.api.infrastructure.persistence.entity.CodeEdgeEntity;
import com.atlas.api.domain.enums.EdgeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CodeEdgeJpaRepository extends JpaRepository<CodeEdgeEntity, UUID> {
    List<CodeEdgeEntity> findByRepoEntity_IdAndEdgeType(UUID repoId, EdgeType edgeType);
    List<CodeEdgeEntity> findByRepoEntity_Id(UUID repoId);
}
