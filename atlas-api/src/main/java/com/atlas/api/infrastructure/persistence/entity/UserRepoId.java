package com.atlas.api.infrastructure.persistence.entity;

import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@EqualsAndHashCode
public class UserRepoId implements Serializable {
    private UUID userId;
    private UUID repoId;
}
