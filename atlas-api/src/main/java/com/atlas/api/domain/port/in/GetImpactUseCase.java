package com.atlas.api.domain.port.in;

import com.atlas.api.domain.model.ImpactReport;
import java.util.UUID;

public interface GetImpactUseCase {
    ImpactReport getImpact(UUID repoId, UUID nodeId);
}
