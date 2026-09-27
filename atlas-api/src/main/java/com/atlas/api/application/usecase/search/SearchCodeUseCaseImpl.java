package com.atlas.api.application.usecase.search;

import com.atlas.api.domain.dtos.in.SearchResult;
import com.atlas.api.domain.port.in.SearchCodeUseCase;
import com.atlas.api.domain.port.out.EmbeddingPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchCodeUseCaseImpl implements SearchCodeUseCase {

    private final EmbeddingPort embeddingPort;

    @Override
    public List<SearchResult> search(UUID repoId, String query) {
        log.info("Searching repo {} for query: {}", repoId, query);
        // Default topK to 20 as requested in issues list
        return embeddingPort.searchSimilar(repoId, query, 20);
    }
}
