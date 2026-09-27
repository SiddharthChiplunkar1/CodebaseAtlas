package com.atlas.api.web.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class EdgeDto {
    private UUID source;
    private UUID target;
    private String edgeType;
}
