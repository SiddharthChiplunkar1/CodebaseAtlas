package com.atlas.api.infrastructure.persistence.entity;

import com.atlas.api.domain.enums.Type;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "code_nodes")
@Getter
@Setter
public class CodeNodeEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repo_id")
    private RepoEntity repoEntity;

    private String nodeKey;
    private String name;

    @Enumerated(EnumType.STRING)
    private Type type;

    private String filePath;
    private Integer startLine;
    private Integer endLine;
    private String language;
    private String signature;
    
    private Instant createdAt;
}
