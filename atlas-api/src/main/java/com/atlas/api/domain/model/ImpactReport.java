package com.atlas.api.domain.model;

import java.util.UUID;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@Builder 
@AllArgsConstructor 
@NoArgsConstructor 
public class ImpactReport {
    private UUID targetNodeId;
    private Set<UUID> directCallers;
    private Set<UUID> indirectCallers;
    private Set<UUID> affectedTests;
    private Set<UUID> affectedApiRoutes;
}
