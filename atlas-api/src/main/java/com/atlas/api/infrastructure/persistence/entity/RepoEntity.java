package com.atlas.api.infrastructure.persistence.entity;

import com.atlas.api.domain.enums.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "repos")
@Getter
@Setter
public class RepoEntity {
    @Id
    private UUID id;
    
    private String githubId;
    private String owner;
    private String name;
    private String fullName;
    private String cloneUrl;
    private String description;
    
    @Enumerated(EnumType.STRING)
    private Status status;
    
    private Instant createdAt;
    private Instant updatedAt;
}
