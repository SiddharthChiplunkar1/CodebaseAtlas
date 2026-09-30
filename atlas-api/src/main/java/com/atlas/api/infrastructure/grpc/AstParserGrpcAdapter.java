package com.atlas.api.infrastructure.grpc;

import com.atlas.api.domain.dtos.out.ParseResult;
import com.atlas.api.domain.model.CodeEdge;
import com.atlas.api.domain.model.CodeNode;
import com.atlas.api.domain.enums.EdgeType;
import com.atlas.api.domain.enums.Type;
import com.atlas.api.domain.port.out.AstParserPort;
import com.atlas.api.grpc.AstParserServiceGrpc;
import com.atlas.api.grpc.AtlasProto;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AstParserGrpcAdapter implements AstParserPort {

    @GrpcClient("atlas-ai")
    private AstParserServiceGrpc.AstParserServiceBlockingStub parserStub;

    @Override
    public ParseResult parseRepository(String repoId, String repoPath) {
        AtlasProto.ParseRequest request = AtlasProto.ParseRequest.newBuilder()
                .setRepoId(repoId)
                .setRepoPath(repoPath)
                .build();
                
        AtlasProto.ParseResponse response = parserStub.parseRepository(request);
        
        UUID repositoryId = UUID.fromString(repoId);
        List<CodeNode> nodes = response.getNodesList().stream()
                .map(n -> CodeNode.builder()
                        .id(toUuid(n.getId()))
                        .repoId(repositoryId)
                        .nodeKey(n.getId())
                        .name(n.getName())
                        .type(Type.valueOf(n.getType().toUpperCase()))
                        .filePath(n.getFilePath())
                        .startLine(n.getStartLine())
                        .endLine(n.getEndLine())
                        .language(n.getLanguage())
                        .signature(n.getSignature())
                        .build())
                .collect(Collectors.toList());

        Map<String, UUID> nodeIds = nodes.stream()
                .collect(Collectors.toMap(CodeNode::getNodeKey, CodeNode::getId));
                
        List<CodeEdge> edges = response.getEdgesList().stream()
                .map(e -> {
                    UUID from = nodeIds.get(e.getFromId());
                    UUID to = nodeIds.get(e.getToId());
                    if (from == null || to == null) {
                        throw new IllegalStateException("Parser returned an edge to an unknown node: "
                                + e.getFromId() + " -> " + e.getToId());
                    }
                    return CodeEdge.builder()
                            .id(toUuid(repoId + "::" + e.getFromId() + "::" + e.getToId() + "::" + e.getEdgeType()))
                            .repoId(repositoryId)
                            .fromNodeId(from)
                            .toNodeId(to)
                            .edgeType(EdgeType.valueOf(e.getEdgeType().toUpperCase()))
                            .build();
                })
                .collect(Collectors.toList());

        return ParseResult.builder()
                .codeNodes(nodes)
                .codeEdges(edges)
                .build();
    }

    private static UUID toUuid(String value) {
        return UUID.nameUUIDFromBytes(value.getBytes(StandardCharsets.UTF_8));
    }
}
