package com.atlas.api.infrastructure.persistence.mapper;

import com.atlas.api.domain.model.CodeEdge;
import com.atlas.api.infrastructure.persistence.entity.CodeEdgeEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CodeEdgeMapper {
    @Mapping(source = "repoEntity.id", target = "repoId")
    @Mapping(source = "fromNode.id", target = "fromNodeId")
    @Mapping(source = "toNode.id", target = "toNodeId")
    CodeEdge toDomain(CodeEdgeEntity entity);

    @Mapping(source = "repoId", target = "repoEntity.id")
    @Mapping(source = "fromNodeId", target = "fromNode.id")
    @Mapping(source = "toNodeId", target = "toNode.id")
    CodeEdgeEntity toEntity(CodeEdge domain);
}
