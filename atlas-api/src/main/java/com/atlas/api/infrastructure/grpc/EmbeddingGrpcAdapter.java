package com.atlas.api.infrastructure.grpc;

import com.atlas.api.domain.dtos.in.SearchResult;
import com.atlas.api.domain.model.CodeNode;
import com.atlas.api.domain.port.out.EmbeddingPort;
import com.atlas.api.grpc.AtlasProto;
import com.atlas.api.grpc.EmbeddingServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmbeddingGrpcAdapter implements EmbeddingPort {

    @GrpcClient("atlas-ai")
    private EmbeddingServiceGrpc.EmbeddingServiceBlockingStub embeddingStub;

    @Override
    public void embedNodes(UUID repoId, List<CodeNode> nodes) {
        List<AtlasProto.EmbedItem> items = nodes.stream()
                .map(n -> AtlasProto.EmbedItem.newBuilder()
                        .setNodeId(n.getId().toString())
                        .setText(n.getType() + " " + n.getName() + ":\n" + n.getSignature())
                        .build())
                .collect(Collectors.toList());

        AtlasProto.EmbedRequest request = AtlasProto.EmbedRequest.newBuilder()
                .setRepoId(repoId.toString())
                .addAllItems(items)
                .build();

        AtlasProto.EmbedResponse response = embeddingStub.embedNodes(request);
        if (!response.getSuccess()) {
            throw new RuntimeException("Failed to embed nodes: " + response.getErrorMessage());
        }
    }

    @Override
    public List<SearchResult> searchSimilar(UUID repoId, String query, int limit) {
        AtlasProto.SearchRequest request = AtlasProto.SearchRequest.newBuilder()
                .setRepoId(repoId.toString())
                .setQuery(query)
                .setTopK(limit)
                .build();

        AtlasProto.SearchResponse response = embeddingStub.searchSimilar(request);

        return response.getResultsList().stream()
                .map(r -> SearchResult.builder()
                        .nodeId(UUID.fromString(r.getNodeId()))
                        .name(r.getNodeName())
                        .type(r.getNodeType())
                        .score((double) r.getScore())
                        .build())
                .collect(Collectors.toList());
    }
}
