package com.atlas.api.domain.model;

import com.atlas.api.domain.enums.Status;
import java.util.UUID;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor 
@NoArgsConstructor
public class Repo{
    private UUID id;
    private String githubId;
    private String owner;
    private String name;
    private String fullName;
    private String cloneUrl;
    private Status status;
    private Instant createdAt;
}