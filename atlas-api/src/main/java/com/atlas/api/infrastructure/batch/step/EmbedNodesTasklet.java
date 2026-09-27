package com.atlas.api.infrastructure.batch.step;

import com.atlas.api.domain.dtos.out.ParseResult;
import com.atlas.api.domain.port.out.EmbeddingPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmbedNodesTasklet implements Tasklet {

    private final EmbeddingPort embeddingPort;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        String repoIdStr = (String) chunkContext.getStepContext().getJobParameters().get("repoId");
        UUID repoId = UUID.fromString(repoIdStr);
        
        ParseResult result = (ParseResult) chunkContext.getStepContext().getStepExecution().getJobExecution()
                .getExecutionContext().get("parseResult");

        if (result == null || result.getCodeNodes().isEmpty()) {
            log.info("No nodes to embed.");
            return RepeatStatus.FINISHED;
        }

        log.info("Sending {} nodes to AI service for embedding...", result.getCodeNodes().size());
        embeddingPort.embedNodes(repoId, result.getCodeNodes());
        log.info("Embedding step completed.");

        return RepeatStatus.FINISHED;
    }
}
