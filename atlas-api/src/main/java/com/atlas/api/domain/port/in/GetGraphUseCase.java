package com.atlas.api.domain.port.in;

import com.atlas.api.domain.dtos.in.GraphData;
import java.util.UUID;

public interface GetGraphUseCase {
    GraphData getGraph(UUID repoId);
}
