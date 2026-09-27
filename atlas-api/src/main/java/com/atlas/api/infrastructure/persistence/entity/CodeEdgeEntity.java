package com.atlas.api.infrastructure.persistence.entity;

import com.atlas.api.domain.enums.EdgeType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "code_edges")
@Getter
@Setter
public class CodeEdgeEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repo_id")
    private RepoEntity repoEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_node")
    private CodeNodeEntity fromNode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_node")
    private CodeNodeEntity toNode;

    @Enumerated(EnumType.STRING)
    @Column(name = "edge_type")
    private EdgeType edgeType;
}
