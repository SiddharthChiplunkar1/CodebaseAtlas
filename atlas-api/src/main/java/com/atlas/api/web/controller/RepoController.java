package com.atlas.api.web.controller;

import com.atlas.api.domain.dtos.in.ConnectRepoCommand;
import com.atlas.api.domain.model.Repo;
import com.atlas.api.domain.port.in.ConnectRepoUseCase;
import com.atlas.api.domain.port.out.RepoRepository;
import com.atlas.api.web.dto.request.ConnectRepoRequest;
import com.atlas.api.web.dto.response.RepoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/repos")
@RequiredArgsConstructor
public class RepoController {

    private final ConnectRepoUseCase connectRepoUseCase;
    private final RepoRepository repoRepository;

    @GetMapping
    public ResponseEntity<java.util.List<RepoResponse>> listRepos() {
        return ResponseEntity.ok(repoRepository.findAll().stream()
                .map(this::toResponse)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepoResponse> getRepo(@PathVariable UUID id) {
        return repoRepository.findById(id)
                .map(repo -> ResponseEntity.ok(toResponse(repo)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RepoResponse> connectRepo(@Valid @RequestBody ConnectRepoRequest request) {
        ConnectRepoCommand command = ConnectRepoCommand.builder()
                .fullName(request.getFullName())
                .accessToken(request.getAccessToken())
                .build();

        Repo repo = connectRepoUseCase.connect(command);

        return ResponseEntity.ok(toResponse(repo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepo(@PathVariable UUID id) {
        if (repoRepository.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        repoRepository.delete(id);
        return ResponseEntity.noContent().build();
    }

    private RepoResponse toResponse(Repo repo) {
        return RepoResponse.builder()
                .id(repo.getId())
                .githubId(repo.getGithubId())
                .owner(repo.getOwner())
                .name(repo.getName())
                .fullName(repo.getFullName())
                .status(repo.getStatus() == null ? null : repo.getStatus().name())
                .createdAt(repo.getCreatedAt())
                .build();
    }
}
