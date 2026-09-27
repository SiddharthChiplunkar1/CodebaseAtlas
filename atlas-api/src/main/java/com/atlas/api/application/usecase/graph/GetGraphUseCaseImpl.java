package com.atlas.api.application.usecase.graph;

import com.atlas.api.domain.dtos.in.GraphData;
import com.atlas.api.domain.model.CodeEdge;
import com.atlas.api.domain.model.CodeNode;
import com.atlas.api.domain.port.in.GetGraphUseCase;
import com.atlas.api.domain.port.out.CodeEdgeRepository;
import com.atlas.api.domain.port.out.CodeNodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetGraphUseCaseImpl implements GetGraphUseCase {

    private final CodeNodeRepository codeNodeRepository;
    private final CodeEdgeRepository codeEdgeRepository;

    @Override
    @Transactional(readOnly = true)
    public GraphData getGraph(UUID repoId) {
        log.info("Fetching graph data for repoId {}", repoId);

        List<CodeNode> nodes = codeNodeRepository.findByRepoId(repoId);
        List<CodeEdge> edges = codeEdgeRepository.findByRepoId(repoId);

        return GraphData.builder()
                .codeNodes(nodes)
                .codeEdges(edges)
                .build();
    }
}
