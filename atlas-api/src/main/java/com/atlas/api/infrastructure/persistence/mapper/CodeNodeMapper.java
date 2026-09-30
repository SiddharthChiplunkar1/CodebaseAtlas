package com.atlas.api.infrastructure.persistence.mapper;

import com.atlas.api.domain.model.CodeNode;
import com.atlas.api.infrastructure.persistence.entity.CodeNodeEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CodeNodeMapper {
    @Mapping(source = "repoEntity.id", target = "repoId")
    CodeNode toDomain(CodeNodeEntity entity);

    @Mapping(source = "repoId", target = "repoEntity.id")
    @Mapping(target = "createdAt", ignore = true)
    CodeNodeEntity toEntity(CodeNode domain);
}
