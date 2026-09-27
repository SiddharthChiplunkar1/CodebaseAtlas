package com.atlas.api.web.controller;

import com.atlas.api.domain.dtos.in.ConnectRepoCommand;
import com.atlas.api.domain.model.Repo;
import com.atlas.api.domain.port.in.ConnectRepoUseCase;
import com.atlas.api.web.dto.request.ConnectRepoRequest;
import com.atlas.api.web.dto.response.RepoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/repos")
@RequiredArgsConstructor
public class RepoController {

    private final ConnectRepoUseCase connectRepoUseCase;

    @PostMapping
    public ResponseEntity<RepoResponse> connectRepo(@Valid @RequestBody ConnectRepoRequest request) {
        ConnectRepoCommand command = ConnectRepoCommand.builder()
                .fullName(request.getFullName())
                .accessToken(request.getAccessToken())
                .build();

        Repo repo = connectRepoUseCase.connect(command);

        RepoResponse response = RepoResponse.builder()
                .id(repo.getId())
                .githubId(repo.getGithubId())
                .owner(repo.getOwner())
                .name(repo.getName())
                .fullName(repo.getFullName())
                .status(repo.getStatus().name())
                .createdAt(repo.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }
}
