package com.atlas.api.web.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class ImpactReportResponse {
    private UUID targetNodeId;
    private Set<UUID> directCallers;
    private Set<UUID> indirectCallers;
    private Set<UUID> affectedTests;
    private Set<UUID> affectedApiRoutes;
}
