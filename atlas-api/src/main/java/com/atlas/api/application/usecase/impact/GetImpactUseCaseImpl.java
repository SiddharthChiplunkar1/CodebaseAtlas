package com.atlas.api.application.usecase.impact;

import com.atlas.api.domain.enums.EdgeType;
import com.atlas.api.domain.enums.Type;
import com.atlas.api.domain.model.CodeEdge;
import com.atlas.api.domain.model.CodeNode;
import com.atlas.api.domain.model.ImpactReport;
import com.atlas.api.domain.port.in.GetImpactUseCase;
import com.atlas.api.domain.port.out.CodeEdgeRepository;
import com.atlas.api.domain.port.out.CodeNodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jgrapht.Graph;
import org.jgrapht.graph.DirectedMultigraph;
import org.jgrapht.traverse.BreadthFirstIterator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetImpactUseCaseImpl implements GetImpactUseCase {

    private final CodeNodeRepository codeNodeRepository;
    private final CodeEdgeRepository codeEdgeRepository;

    @Override
    @Transactional(readOnly = true)
    public ImpactReport getImpact(UUID repoId, UUID nodeId) {
        log.info("Calculating impact for node {} in repo {}", nodeId, repoId);

        List<CodeNode> nodes = codeNodeRepository.findByRepoId(repoId);
        List<CodeEdge> edges = codeEdgeRepository.findByRepoIdAndEdgeType(repoId, EdgeType.CALLS);

        Map<UUID, CodeNode> nodeMap = nodes.stream()
                .collect(Collectors.toMap(CodeNode::getId, Function.identity()));

        if (!nodeMap.containsKey(nodeId)) {
            throw new IllegalArgumentException("Target node not found in repository");
        }

        // Build a reverse graph where edges point from callee to caller
        // This makes traversing "who calls me" easier.
        Graph<UUID, CodeEdge> reverseGraph = new DirectedMultigraph<>(CodeEdge.class);

        for (CodeNode node : nodes) {
            reverseGraph.addVertex(node.getId());
        }

        for (CodeEdge edge : edges) {
            // Note: edge goes FROM caller TO callee.
            // In reverse graph, edge goes FROM callee TO caller
            reverseGraph.addEdge(edge.getToNodeId(), edge.getFromNodeId(), edge);
        }

        Set<UUID> directCallers = new HashSet<>();
        Set<UUID> indirectCallers = new HashSet<>();
        Set<UUID> affectedTests = new HashSet<>();
        Set<UUID> affectedApiRoutes = new HashSet<>();

        // Get direct callers
        if (reverseGraph.containsVertex(nodeId)) {
            for (CodeEdge outgoingEdge : reverseGraph.outgoingEdgesOf(nodeId)) {
                directCallers.add(reverseGraph.getEdgeTarget(outgoingEdge));
            }
        }

        // Use BFS to find all descendants in the reverse graph (i.e. all transitive callers)
        BreadthFirstIterator<UUID, CodeEdge> bfs = new BreadthFirstIterator<>(reverseGraph, nodeId);
        while (bfs.hasNext()) {
            UUID current = bfs.next();
            if (current.equals(nodeId)) {
                continue;
            }

            if (!directCallers.contains(current)) {
                indirectCallers.add(current);
            }

            CodeNode currentNode = nodeMap.get(current);
            if (currentNode != null) {
                if (currentNode.getType() == Type.TEST) {
                    affectedTests.add(current);
                } else if (currentNode.getType() == Type.ROUTE) {
                    affectedApiRoutes.add(current);
                }
            }
        }

        return ImpactReport.builder()
                .targetNodeId(nodeId)
                .directCallers(directCallers)
                .indirectCallers(indirectCallers)
                .affectedTests(affectedTests)
                .affectedApiRoutes(affectedApiRoutes)
                .build();
    }
}
