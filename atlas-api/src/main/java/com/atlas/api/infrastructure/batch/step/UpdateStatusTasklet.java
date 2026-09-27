package com.atlas.api.infrastructure.batch.step;

import com.atlas.api.domain.model.Repo;
import com.atlas.api.domain.port.out.RepoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

import com.atlas.api.domain.enums.Status;

@Slf4j
@Component
@RequiredArgsConstructor
public class UpdateStatusTasklet implements Tasklet {

    private final RepoRepository repoRepository;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        String repoIdStr = (String) chunkContext.getStepContext().getJobParameters().get("repoId");
        UUID repoId = UUID.fromString(repoIdStr);

        log.info("Updating repo status to READY for repoId {}", repoId);
        
        Repo repo = repoRepository.findById(repoId)
                .orElseThrow(() -> new IllegalStateException("Repo not found: " + repoId));
        
        repo.setStatus(Status.READY);
        repoRepository.save(repo);

        log.info("Repo status updated successfully.");

        return RepeatStatus.FINISHED;
    }
}
