package com.atlas.api.infrastructure.batch.step;

import com.atlas.api.domain.dtos.out.ParseResult;
import com.atlas.api.domain.port.out.CodeEdgeRepository;
import com.atlas.api.domain.port.out.CodeNodeRepository;
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

    private final CodeNodeRepository nodeRepository;
    private final CodeEdgeRepository edgeRepository;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        ParseResult result = (ParseResult) chunkContext.getStepContext().getStepExecution().getJobExecution()
                .getExecutionContext().get("parseResult");

        if (result == null) {
            throw new IllegalStateException("ParseResult not found in ExecutionContext");
        }

        log.info("Persisting {} nodes to database...", result.getCodeNodes().size());
        nodeRepository.saveAll(result.getCodeNodes());

        log.info("Persisting {} edges to database...", result.getCodeEdges().size());
        edgeRepository.saveAll(result.getCodeEdges());

        log.info("Graph persistence completed.");

        return RepeatStatus.FINISHED;
    }
}
