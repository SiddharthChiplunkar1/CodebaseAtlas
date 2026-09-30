package com.atlas.api.infrastructure.batch.step;

import com.atlas.api.domain.model.CodeNode;
import com.atlas.api.domain.port.out.CodeNodeRepository;
import com.atlas.api.domain.port.out.EmbeddingPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmbedNodesTasklet implements Tasklet {

    private final EmbeddingPort embeddingPort;
    private final CodeNodeRepository nodeRepository;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        String repoIdStr = (String) chunkContext.getStepContext().getJobParameters().get("repoId");
        UUID repoId = UUID.fromString(repoIdStr);

        // Load nodes directly from DB (ParseAstTasklet persisted them already)
        List<CodeNode> nodes = nodeRepository.findByRepoId(repoId);

        if (nodes.isEmpty()) {
            log.info("No nodes to embed for repoId {}.", repoId);
            return RepeatStatus.FINISHED;
        }

        log.info("Sending {} nodes to AI service for embedding...", nodes.size());
        embeddingPort.embedNodes(repoId, nodes);
        log.info("Embedding step completed.");

        return RepeatStatus.FINISHED;
    }
}
