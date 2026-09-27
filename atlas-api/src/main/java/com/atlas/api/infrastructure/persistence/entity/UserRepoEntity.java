package com.atlas.api.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_repos")
@Getter
@Setter
public class UserRepoEntity {
    @EmbeddedId
    private UserRepoId id;

    private String role; // OWNER or VIEWER
}
