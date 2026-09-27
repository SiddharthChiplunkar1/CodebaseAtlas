package com.atlas.api.domain.dtos.in;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@Builder 
@NoArgsConstructor
@AllArgsConstructor
public class ConnectRepoCommand {
    private String fullName;
    private String accessToken;
}
