package com.atlas.api.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConnectRepoRequest {
    @NotBlank(message = "fullName is required")
    private String fullName;
    private String accessToken;
}
