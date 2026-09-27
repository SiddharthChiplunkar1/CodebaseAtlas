package com.atlas.api.web.controller;

import com.atlas.api.domain.model.ImpactReport;
import com.atlas.api.domain.port.in.GetImpactUseCase;
import com.atlas.api.web.dto.response.ImpactReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/repos/{repoId}/impact")
@RequiredArgsConstructor
public class ImpactController {

    private final GetImpactUseCase getImpactUseCase;

    @GetMapping("/{nodeId}")
    public ResponseEntity<ImpactReportResponse> getImpact(@PathVariable UUID repoId, @PathVariable UUID nodeId) {
        ImpactReport report = getImpactUseCase.getImpact(repoId, nodeId);

        ImpactReportResponse response = ImpactReportResponse.builder()
                .targetNodeId(report.getTargetNodeId())
                .directCallers(report.getDirectCallers())
                .indirectCallers(report.getIndirectCallers())
                .affectedTests(report.getAffectedTests())
                .affectedApiRoutes(report.getAffectedApiRoutes())
                .build();

        return ResponseEntity.ok(response);
    }
}
