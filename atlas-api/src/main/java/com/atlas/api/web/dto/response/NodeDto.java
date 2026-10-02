package com.atlas.api.web.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class NodeDto {
    private UUID id;
    private String name;
    private String type;
    private String filePath;
    private String language;
    private Integer startLine;
    private Integer endLine;
}
