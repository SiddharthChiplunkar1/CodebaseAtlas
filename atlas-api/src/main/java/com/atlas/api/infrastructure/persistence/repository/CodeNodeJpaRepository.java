package com.atlas.api.infrastructure.persistence.repository;

import com.atlas.api.infrastructure.persistence.entity.CodeNodeEntity;
import com.atlas.api.domain.enums.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CodeNodeJpaRepository extends JpaRepository<CodeNodeEntity, UUID> {
    List<CodeNodeEntity> findByRepoEntity_Id(UUID repoId);
    List<CodeNodeEntity> findByRepoEntity_IdAndType(UUID repoId, Type type);
}
