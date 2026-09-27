package com.atlas.api.web.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class RepoResponse {
    private UUID id;
    private String githubId;
    private String owner;
    private String name;
    private String fullName;
    private String status;
    private Instant createdAt;
}
