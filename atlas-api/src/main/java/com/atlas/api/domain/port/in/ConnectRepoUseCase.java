package com.atlas.api.domain.port.in;

import com.atlas.api.domain.dtos.in.ConnectRepoCommand;
import com.atlas.api.domain.model.Repo;

public interface ConnectRepoUseCase {
    Repo connect(ConnectRepoCommand cmd);
}
