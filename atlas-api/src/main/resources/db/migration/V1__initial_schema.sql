CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE repos (
    id UUID PRIMARY KEY,
    github_id VARCHAR(255),
    owner VARCHAR(255),
    name VARCHAR(255),
    full_name VARCHAR(255),
    description TEXT,
    clone_url VARCHAR(255),
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE code_nodes (
    id UUID PRIMARY KEY,
    repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
    node_key VARCHAR(512),
    name VARCHAR(255),
    type VARCHAR(50),
    file_path TEXT,
    start_line INTEGER,
    end_line INTEGER,
    language VARCHAR(50),
    signature TEXT,
    embedding vector(384),
    created_at TIMESTAMP,
    UNIQUE (repo_id, node_key)
);

CREATE INDEX ON code_nodes USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE code_edges (
    id UUID PRIMARY KEY,
    repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
    from_node UUID REFERENCES code_nodes(id) ON DELETE CASCADE,
    to_node UUID REFERENCES code_nodes(id) ON DELETE CASCADE,
    edge_type VARCHAR(50)
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    github_id VARCHAR(255),
    username VARCHAR(255),
    email VARCHAR(255),
    avatar_url TEXT,
    access_token TEXT
);

CREATE TABLE user_repos (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
    role VARCHAR(50),
    PRIMARY KEY (user_id, repo_id)
);
