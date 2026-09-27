package com.atlas.api.domain.port.in;

import com.atlas.api.domain.dtos.in.SearchResult;
import java.util.List;
import java.util.UUID;

public interface SearchCodeUseCase {
    List<SearchResult> search(UUID repoId, String query);
}
