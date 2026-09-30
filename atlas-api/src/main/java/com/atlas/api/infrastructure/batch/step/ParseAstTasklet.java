package com.atlas.api.infrastructure.batch.step;

import com.atlas.api.domain.dtos.out.ParseResult;
import com.atlas.api.domain.port.out.AstParserPort;
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
public class ParseAstTasklet implements Tasklet {

    private final AstParserPort astParserPort;
    private final CodeNodeRepository nodeRepository;
    private final CodeEdgeRepository edgeRepository;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        String repoId = (String) chunkContext.getStepContext().getJobParameters().get("repoId");
        String repoPath = (String) chunkContext.getStepContext().getStepExecution().getJobExecution()
                .getExecutionContext().get("repoPath");

        log.info("Parsing AST for repoId {} at path {}", repoId, repoPath);

        ParseResult result = astParserPort.parseRepository(repoId, repoPath);

        log.info("Parsing completed. Found {} nodes and {} edges.",
            result.getCodeNodes().size(), result.getCodeEdges().size());

        // Persist immediately — do NOT put into ExecutionContext (too large for Batch serialization)
        log.info("Persisting {} nodes to database...", result.getCodeNodes().size());
        nodeRepository.saveAll(result.getCodeNodes());

        log.info("Persisting {} edges to database...", result.getCodeEdges().size());
        edgeRepository.saveAll(result.getCodeEdges());

        log.info("Graph persistence completed.");

        return RepeatStatus.FINISHED;
    }
}
