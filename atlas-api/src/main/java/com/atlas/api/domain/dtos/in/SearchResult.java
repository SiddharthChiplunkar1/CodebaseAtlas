package com.atlas.api.domain.dtos.in;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@Builder 
@NoArgsConstructor
@AllArgsConstructor
public class SearchResult {
    private UUID nodeId;
    private String name;
    private String type;
    private Double score;
}
