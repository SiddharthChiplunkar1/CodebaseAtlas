package com.atlas.api.infrastructure.batch.step;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PersistGraphTasklet implements Tasklet {

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        // Persistence is handled directly in ParseAstTasklet to avoid Spring Batch
        // ExecutionContext serialization failures with large ParseResult objects.
        log.info("PersistGraphStep: data already persisted in ParseAstStep. Continuing.");
        return RepeatStatus.FINISHED;
    }
}
