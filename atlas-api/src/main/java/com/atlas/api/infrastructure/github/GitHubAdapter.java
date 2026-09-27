package com.atlas.api.infrastructure.github;

import lombok.extern.slf4j.Slf4j;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GitHub;
import org.kohsuke.github.GitHubBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class GitHubAdapter {

    private final String globalApiToken;

    public GitHubAdapter(@Value("${atlas.github.api-token:}") String globalApiToken) {
        this.globalApiToken = globalApiToken;
    }

    /**
     * Gets a GitHub client. Uses the provided token if available, otherwise falls back
     * to the globally configured token.
     */
    private GitHub getClient(String token) throws IOException {
        String activeToken = (token != null && !token.isBlank()) ? token : globalApiToken;
        if (activeToken == null || activeToken.isBlank()) {
            return GitHub.connectAnonymously();
        }
        return new GitHubBuilder().withOAuthToken(activeToken).build();
    }

    public GHRepository getRepo(String owner, String name, String token) {
        try {
            GitHub github = getClient(token);
            return github.getRepository(owner + "/" + name);
        } catch (IOException e) {
            log.error("Failed to fetch repository metadata for {}/{}", owner, name, e);
            throw new RuntimeException("Failed to fetch repository from GitHub", e);
        }
    }

    public GHRepository getRepoByFullName(String fullName, String token) {
        try {
            GitHub github = getClient(token);
            return github.getRepository(fullName);
        } catch (IOException e) {
            log.error("Failed to fetch repository metadata for {}", fullName, e);
            throw new RuntimeException("Failed to fetch repository from GitHub: " + fullName, e);
        }
    }

    public String getUserLogin(String accessToken) {
        try {
            GitHub github = new GitHubBuilder().withOAuthToken(accessToken).build();
            return github.getMyself().getLogin();
        } catch (IOException e) {
            log.error("Failed to get user login for token", e);
            throw new RuntimeException("Invalid GitHub token", e);
        }
    }
}
