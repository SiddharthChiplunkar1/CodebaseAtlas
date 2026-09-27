package com.atlas.api.infrastructure.grpc;

import com.atlas.api.domain.dtos.out.LlmRequest;
import com.atlas.api.domain.port.out.LlmPort;
import com.atlas.api.grpc.AtlasProto;
import com.atlas.api.grpc.LlmQueryServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
public class LlmGrpcAdapter implements LlmPort {

    @GrpcClient("atlas-ai")
    private LlmQueryServiceGrpc.LlmQueryServiceBlockingStub llmStub;

    @Override
    public void streamAnswer(LlmRequest req, Consumer<String> tokenSink) {
        AtlasProto.LlmRequest grpcRequest = AtlasProto.LlmRequest.newBuilder()
                .setRepoId(req.getRepoId().toString())
                .setQuestion(req.getQuestion())
                .addAllContextNodeIds(req.getContextNodeIds().stream()
                        .map(UUID::toString)
                        .collect(Collectors.toList()))
                .build();

        Iterator<AtlasProto.LlmChunk> responseStream = llmStub.queryWithContext(grpcRequest);

        while (responseStream.hasNext()) {
            AtlasProto.LlmChunk chunk = responseStream.next();
            if (chunk.getToken() != null && !chunk.getToken().isEmpty()) {
                tokenSink.accept(chunk.getToken());
            }
            if (chunk.getIsFinal()) {
                break;
            }
        }
    }
}
