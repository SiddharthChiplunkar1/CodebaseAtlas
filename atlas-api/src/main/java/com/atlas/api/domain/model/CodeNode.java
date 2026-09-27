package com.atlas.api.domain.model;

import java.util.UUID;
import com.atlas.api.domain.enums.Type;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor 
@NoArgsConstructor 
public class CodeNode {
    private UUID id;
    private UUID repoId;
    private String nodeKey;
    private String name;
    private Type type;
    private String filePath;
    private Integer startLine;
    private Integer endLine;
    private String language;
    private String signature;
}
