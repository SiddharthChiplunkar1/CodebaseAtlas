package com.atlas.api.infrastructure.persistence.repository;

import com.atlas.api.infrastructure.persistence.entity.RepoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RepoJpaRepository extends JpaRepository<RepoEntity, UUID> {
}
