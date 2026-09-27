package com.atlas.api.infrastructure.batch.job;

import com.atlas.api.infrastructure.batch.step.CloneRepoTasklet;
import com.atlas.api.infrastructure.batch.step.EmbedNodesTasklet;
import com.atlas.api.infrastructure.batch.step.ParseAstTasklet;
import com.atlas.api.infrastructure.batch.step.PersistGraphTasklet;
import com.atlas.api.infrastructure.batch.step.UpdateStatusTasklet;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@RequiredArgsConstructor
public class RepoIndexingJobConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;

    private final CloneRepoTasklet cloneRepoTasklet;
    private final ParseAstTasklet parseAstTasklet;
    private final PersistGraphTasklet persistGraphTasklet;
    private final EmbedNodesTasklet embedNodesTasklet;
    private final UpdateStatusTasklet updateStatusTasklet;

    @Bean
    public Job repoIndexingJob() {
        return new JobBuilder("repoIndexingJob", jobRepository)
                .start(cloneRepoStep())
                .next(parseAstStep())
                .next(persistGraphStep())
                .next(embedNodesStep())
                .next(updateStatusStep())
                .build();
    }

    @Bean
    public Step cloneRepoStep() {
        return new StepBuilder("cloneRepoStep", jobRepository)
                .tasklet(cloneRepoTasklet, transactionManager)
                .build();
    }

    @Bean
    public Step parseAstStep() {
        return new StepBuilder("parseAstStep", jobRepository)
                .tasklet(parseAstTasklet, transactionManager)
                .build();
    }

    @Bean
    public Step persistGraphStep() {
        return new StepBuilder("persistGraphStep", jobRepository)
                .tasklet(persistGraphTasklet, transactionManager)
                .build();
    }

    @Bean
    public Step embedNodesStep() {
        return new StepBuilder("embedNodesStep", jobRepository)
                .tasklet(embedNodesTasklet, transactionManager)
                .build();
    }

    @Bean
    public Step updateStatusStep() {
        return new StepBuilder("updateStatusStep", jobRepository)
                .tasklet(updateStatusTasklet, transactionManager)
                .build();
    }
}
