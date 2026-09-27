package com.atlas.api.domain.model;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor 
@NoArgsConstructor 
public class User {
    private UUID id;
    private String githubId;
    private String userName;
    private String email;
    private String avatarUrl;    
}
