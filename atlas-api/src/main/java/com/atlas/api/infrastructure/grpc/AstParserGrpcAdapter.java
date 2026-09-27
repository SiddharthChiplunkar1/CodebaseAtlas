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
        
        List<CodeNode> nodes = response.getNodesList().stream()
                .map(n -> CodeNode.builder()
                        // Ensure generated string ID works or we map it differently.
                        // Assuming Python returns standard string, but our CodeNode wants a nodeKey.
                        .repoId(UUID.fromString(repoId))
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
                
        List<CodeEdge> edges = response.getEdgesList().stream()
                .map(e -> CodeEdge.builder()
                        .repoId(UUID.fromString(repoId))
                        // We will resolve UUIDs of from/to later in the batch job.
                        // For now we could store string references. 
                        // But domain expects UUIDs. This implies edge resolution happens after node insertion.
                        .edgeType(EdgeType.valueOf(e.getEdgeType().toUpperCase()))
                        .build())
                .collect(Collectors.toList());

        return ParseResult.builder()
                .codeNodes(nodes)
                .codeEdges(edges)
                .build();
    }
}
