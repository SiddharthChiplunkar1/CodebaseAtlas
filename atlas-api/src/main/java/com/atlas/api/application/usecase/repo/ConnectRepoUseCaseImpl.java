package com.atlas.api.application.usecase.repo;

import com.atlas.api.domain.dtos.in.ConnectRepoCommand;
import com.atlas.api.domain.enums.Status;
import com.atlas.api.domain.model.Repo;
import com.atlas.api.domain.port.in.ConnectRepoUseCase;
import com.atlas.api.domain.port.out.RepoRepository;
import com.atlas.api.infrastructure.github.GitHubAdapter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kohsuke.github.GHRepository;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConnectRepoUseCaseImpl implements ConnectRepoUseCase {

    private final GitHubAdapter gitHubAdapter;
    private final RepoRepository repoRepository;
    private final JobLauncher jobLauncher;
    private final Job repoIndexingJob;
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    @Override
    public Repo connect(ConnectRepoCommand cmd) {
        log.info("Connecting repo: {}", cmd.getFullName());
        
        GHRepository ghRepo = gitHubAdapter.getRepoByFullName(cmd.getFullName(), cmd.getAccessToken());

        Repo repo = Repo.builder()
                .id(UUID.randomUUID())
                .githubId(String.valueOf(ghRepo.getId()))
                .owner(ghRepo.getOwnerName())
                .name(ghRepo.getName())
                .fullName(ghRepo.getFullName())
                .cloneUrl(ghRepo.getHttpTransportUrl())
                .status(Status.PENDING)
                .createdAt(Instant.now())
                .build();

        Repo savedRepo = repoRepository.save(repo);

        executorService.submit(() -> {
            try {
                JobParameters params = new JobParametersBuilder()
                        .addString("repoId", savedRepo.getId().toString())
                        .addString("cloneUrl", savedRepo.getCloneUrl())
                        .addLong("time", System.currentTimeMillis()) // to ensure uniqueness
                        .toJobParameters();
                
                log.info("Launching indexing job for repo {}", savedRepo.getId());
                jobLauncher.run(repoIndexingJob, params);
            } catch (Exception e) {
                log.error("Failed to launch indexing job for repo {}", savedRepo.getId(), e);
                // In a real app we might want to update status to FAILED here
                try {
                    savedRepo.setStatus(Status.FAILED);
                    repoRepository.save(savedRepo);
                } catch(Exception innerE) {
                    log.error("Failed to update status to FAILED", innerE);
                }
            }
        });

        return savedRepo;
    }
}
