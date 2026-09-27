package com.atlas.api.domain.model;

import java.util.UUID;
import com.atlas.api.domain.enums.EdgeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor 
@NoArgsConstructor 
public class CodeEdge {
    private UUID id;
    private UUID repoId;
    private UUID fromNodeId;
    private UUID toNodeId;
    private EdgeType edgeType;
}
