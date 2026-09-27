package com.atlas.api.infrastructure.batch.step;

import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;

@Slf4j
@Component
public class CloneRepoTasklet implements Tasklet {

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        String cloneUrl = (String) chunkContext.getStepContext().getJobParameters().get("cloneUrl");
        String repoId = (String) chunkContext.getStepContext().getJobParameters().get("repoId");

        if (cloneUrl == null || repoId == null) {
            throw new IllegalArgumentException("cloneUrl and repoId are required");
        }

        // Temp dir for the repo
        Path targetDir = Path.of(System.getProperty("java.io.tmpdir"), "atlas-repos", repoId);
        
        // Clean up if it exists
        if (Files.exists(targetDir)) {
            log.info("Directory {} already exists. Cleaning up before clone...", targetDir);
            try (var paths = Files.walk(targetDir)) {
                paths.sorted(Comparator.reverseOrder())
                     .map(Path::toFile)
                     .forEach(File::delete);
            }
        }

        log.info("Cloning {} to {}", cloneUrl, targetDir);
        ProcessBuilder builder = new ProcessBuilder("git", "clone", cloneUrl, targetDir.toString());
        builder.redirectErrorStream(true);
        Process process = builder.start();
        int exitCode = process.waitFor();
        
        if (exitCode != 0) {
            String output = new String(process.getInputStream().readAllBytes());
            log.error("Git clone failed with exit code {}: {}", exitCode, output);
            throw new RuntimeException("Git clone failed");
        }

        log.info("Git clone successful.");
        
        // Pass the path to the next step
        chunkContext.getStepContext().getStepExecution().getJobExecution()
                .getExecutionContext().put("repoPath", targetDir.toString());

        return RepeatStatus.FINISHED;
    }
}
