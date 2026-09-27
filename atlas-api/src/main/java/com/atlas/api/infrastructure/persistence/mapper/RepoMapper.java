package com.atlas.api.infrastructure.persistence.mapper;

import com.atlas.api.domain.model.Repo;
import com.atlas.api.infrastructure.persistence.entity.RepoEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RepoMapper {
    Repo toDomain(RepoEntity entity);
    RepoEntity toEntity(Repo domain);
}
