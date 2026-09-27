package com.atlas.api.web.controller;

import com.atlas.api.domain.port.in.SearchCodeUseCase;
import com.atlas.api.web.dto.request.SearchRequest;
import com.atlas.api.web.dto.response.SearchResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/repos/{repoId}/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchCodeUseCase searchCodeUseCase;

    @PostMapping
    public ResponseEntity<List<SearchResponse>> search(@PathVariable UUID repoId, @Valid @RequestBody SearchRequest request) {
        var results = searchCodeUseCase.search(repoId, request.getQuery());

        List<SearchResponse> responseList = results.stream().map(result -> SearchResponse.builder()
                .nodeId(result.getNodeId())
                .nodeName(result.getName())
                .nodeType(result.getType())
                .filePath(null)
                .score(result.getScore())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }
}
