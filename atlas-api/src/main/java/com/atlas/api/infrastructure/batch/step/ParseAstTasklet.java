package com.atlas.api.infrastructure.batch.step;

import com.atlas.api.domain.dtos.out.ParseResult;
import com.atlas.api.domain.port.out.AstParserPort;
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

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        String repoId = (String) chunkContext.getStepContext().getJobParameters().get("repoId");
        String repoPath = (String) chunkContext.getStepContext().getStepExecution().getJobExecution()
                .getExecutionContext().get("repoPath");

        log.info("Parsing AST for repoId {} at path {}", repoId, repoPath);

        ParseResult result = astParserPort.parseRepository(repoId, repoPath);
        
        log.info("Parsing completed. Found {} nodes and {} edges.", 
            result.getCodeNodes().size(), result.getCodeEdges().size());

        // Store result in execution context for next steps
        chunkContext.getStepContext().getStepExecution().getJobExecution()
                .getExecutionContext().put("parseResult", result);

        return RepeatStatus.FINISHED;
    }
}
