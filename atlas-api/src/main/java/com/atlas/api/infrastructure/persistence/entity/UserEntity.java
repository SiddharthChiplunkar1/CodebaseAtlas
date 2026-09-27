package com.atlas.api.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
public class UserEntity {
    @Id
    private UUID id;

    private String githubId;
    private String username;
    private String email;
    private String avatarUrl;
    private String accessToken;
}
