package com.atlas.api.domain.dtos.in;

import com.atlas.api.domain.model.CodeNode;
import com.atlas.api.domain.model.CodeEdge;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@Builder
@NoArgsConstructor
@AllArgsConstructor 
public class GraphData {
    private List<CodeNode> codeNodes;
    private List<CodeEdge> codeEdges;
}