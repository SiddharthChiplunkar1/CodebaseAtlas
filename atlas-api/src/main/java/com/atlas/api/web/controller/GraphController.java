package com.atlas.api.web.controller;

import com.atlas.api.domain.dtos.in.GraphData;
import com.atlas.api.domain.port.in.GetGraphUseCase;
import com.atlas.api.web.dto.response.EdgeDto;
import com.atlas.api.web.dto.response.GraphResponse;
import com.atlas.api.web.dto.response.NodeDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/repos/{repoId}/graph")
@RequiredArgsConstructor
public class GraphController {

    private final GetGraphUseCase getGraphUseCase;

    @GetMapping
    public ResponseEntity<GraphResponse> getGraph(@PathVariable UUID repoId) {
        GraphData data = getGraphUseCase.getGraph(repoId);

        GraphResponse response = GraphResponse.builder()
                .nodes(data.getCodeNodes().stream().map(node -> NodeDto.builder()
                        .id(node.getId())
                        .name(node.getName())
                        .type(node.getType().name())
                        .filePath(node.getFilePath())
                        .language(node.getLanguage())
                        .build()).collect(Collectors.toList()))
                .edges(data.getCodeEdges().stream().map(edge -> EdgeDto.builder()
                        .source(edge.getFromNodeId())
                        .target(edge.getToNodeId())
                        .edgeType(edge.getEdgeType().name())
                        .build()).collect(Collectors.toList()))
                .build();

        return ResponseEntity.ok(response);
    }
}
