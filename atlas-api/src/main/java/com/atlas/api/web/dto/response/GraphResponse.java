package com.atlas.api.web.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GraphResponse {
    private List<NodeDto> nodes;
    private List<EdgeDto> edges;
}
