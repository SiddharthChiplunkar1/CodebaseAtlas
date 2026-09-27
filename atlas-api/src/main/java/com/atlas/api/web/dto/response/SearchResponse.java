package com.atlas.api.web.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class SearchResponse {
    private UUID nodeId;
    private String nodeName;
    private String nodeType;
    private String filePath;
    private Double score;
}
