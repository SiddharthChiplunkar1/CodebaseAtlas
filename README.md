# Codebase Atlas 

> An AI-powered code intelligence platform — the map your codebase never had.

## Architecture

```
atlas-frontend/     Next.js 14 — graph visualization & UI
atlas-api/          Spring Boot 3 — REST API, gRPC client, impact analysis
atlas-ai/           Python — gRPC AI service (AST parsing, embeddings, LLM)
proto/              Shared protobuf contracts
```

## Hexagonal Architecture (atlas-api)

```
web/          → Adapters In  (controllers, DTOs, WebSocket)
application/  → Use Cases    (orchestration)
domain/       → Core         (models, port interfaces)
infrastructure/ → Adapters Out (persistence, gRPC, GitHub, cache)
```

## Getting Started

```bash
cp .env.example .env
docker-compose up --build
```
