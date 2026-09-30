package com.atlas.api.infrastructure.persistence.mapper;

import com.atlas.api.domain.model.Repo;
import com.atlas.api.infrastructure.persistence.entity.RepoEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RepoMapper {
    Repo toDomain(RepoEntity entity);

    @Mapping(target = "description", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    RepoEntity toEntity(Repo domain);
}
